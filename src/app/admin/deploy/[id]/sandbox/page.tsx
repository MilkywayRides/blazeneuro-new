'use client';

import React, { useState, useRef, useEffect, use } from 'react';
import Editor from '@monaco-editor/react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Play, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import '@xterm/xterm/css/xterm.css';

export default function ProjectSandboxPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;

  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  
  const [language, setLanguage] = useState<'python' | 'bash'>('python');
  const [code, setCode] = useState('# You are in /home/user/workspace\n# The repository is cloned here.\nimport os\n\nprint("Current directory:", os.getcwd())\nprint("Files:", os.listdir("."))\n');
  const [isExecuting, setIsExecuting] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Initialize Sandbox via API
  useEffect(() => {
    async function initSandbox() {
      try {
        const response = await fetch('/api/sandbox/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Failed to initialize sandbox');
        }

        setSandboxId(data.sandboxId);

        // If terminal is ready, print init logs
        const term = xtermRef.current;
        if (term) {
          if (data.logs?.stdout?.length > 0) {
            data.logs.stdout.forEach((log: string) => {
              if (log) term.writeln(log.replace(/\n/g, '\r\n'));
            });
          }
          if (data.logs?.stderr?.length > 0) {
            data.logs.stderr.forEach((log: string) => {
              if (log) term.writeln(`\x1b[33m${log.replace(/\n/g, '\r\n')}\x1b[0m`);
            });
          }
          term.writeln('\n\x1b[1;32m> Setup complete. Sandbox is ready.\x1b[0m\n');
        }

      } catch (err: any) {
        setInitError(err.message);
      } finally {
        setIsInitializing(false);
      }
    }

    if (projectId) {
      initSandbox();
    }
  }, [projectId]);

  // Initialize Terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#09090b',
        foreground: '#f8fafc',
        cursor: '#f8fafc',
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      cursorBlink: true,
      disableStdin: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();
    
    term.writeln('\x1b[1;34m$ Initializing Sandbox and Cloning Repository...\x1b[0m\n');

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const handleRunCode = async () => {
    if (!code.trim() || isExecuting || !sandboxId) return;

    setIsExecuting(true);
    const term = xtermRef.current;
    
    if (term) {
      term.writeln('\x1b[1;34m> Running execution...\x1b[0m');
    }

    try {
      const response = await fetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, sandboxId, language }),
      });

      const data = await response.json();

      if (term) {
        if (data.error) {
          term.writeln(`\x1b[1;31mError:\x1b[0m`);
          if (typeof data.error === 'string') {
             term.writeln(`\x1b[31m${data.error}\x1b[0m`);
          } else {
             term.writeln(`\x1b[31m${data.error.name}: ${data.error.value}\x1b[0m`);
             if (data.error.traceback) {
                 term.writeln(`\x1b[31m${data.error.traceback}\x1b[0m`);
             }
          }
        } else {
          // Output logs
          if (data.logs?.stdout?.length > 0) {
            data.logs.stdout.forEach((log: string) => {
              term.writeln(log.replace(/\n/g, '\r\n'));
            });
          }
          if (data.logs?.stderr?.length > 0) {
            data.logs.stderr.forEach((log: string) => {
              term.writeln(`\x1b[31m${log.replace(/\n/g, '\r\n')}\x1b[0m`);
            });
          }
          if (data.results?.length > 0) {
            term.writeln(`\x1b[36m[Rich Results Output omitted for terminal]\x1b[0m`);
          }
          
          if (data.logs?.stdout?.length === 0 && data.logs?.stderr?.length === 0 && !data.error) {
             term.writeln('\x1b[30;1m(No output)\x1b[0m');
          }
          term.writeln('\x1b[1;32m> Execution complete\x1b[0m\n');
        }
      }
    } catch (err: any) {
      if (term) {
        term.writeln(`\x1b[1;31mFailed to connect to execution API: ${err.message}\x1b[0m\n`);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClearTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.writeln('\x1b[1;32m$ Sandbox Ready\x1b[0m\n');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-zinc-950 text-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/admin/deploy/${projectId}`} className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold">Project Sandbox</h1>
          </div>
          <p className="text-sm text-zinc-400">Environment initialized with cloned repository</p>
        </div>
        <div className="flex gap-2 items-center">
          {isInitializing && (
            <span className="text-sm text-amber-500 flex items-center gap-2 mr-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Initializing & Cloning...
            </span>
          )}
          {initError && (
            <span className="text-sm text-red-500 mr-4">
              Initialization Failed
            </span>
          )}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-md p-1 mr-4">
            <button
              onClick={() => {
                if (language !== 'python') {
                  setLanguage('python');
                  setCode('# You are in /home/user/workspace\nimport os\n\nprint("Current directory:", os.getcwd()")\n');
                }
              }}
              className={`px-3 py-1.5 text-xs rounded-sm font-medium transition-colors ${language === 'python' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-300'}`}
            >
              Python
            </button>
            <button
              onClick={() => {
                if (language !== 'bash') {
                  setLanguage('bash');
                  setCode('# You are in /home/user/workspace\n# Write shell commands here\n\npwd\nls -la\n');
                }
              }}
              className={`px-3 py-1.5 text-xs rounded-sm font-medium transition-colors ${language === 'bash' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-300'}`}
            >
              Terminal (Bash)
            </button>
          </div>
          <button
            onClick={handleClearTerminal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-md bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
            disabled={isExecuting || isInitializing}
          >
            <RefreshCw className="w-4 h-4" />
            Clear Console
          </button>
          <button
            onClick={handleRunCode}
            disabled={isExecuting || isInitializing || !sandboxId}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Run Code
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden border border-zinc-800 rounded-xl bg-zinc-900/50">
        {/* Editor Pane */}
        <div className="w-1/2 h-full border-r border-zinc-800 relative">
          {isInitializing && (
            <div className="absolute inset-0 z-10 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="font-medium text-zinc-300">Setting up environment...</p>
              </div>
            </div>
          )}
          {initError && (
            <div className="absolute inset-0 z-10 bg-zinc-950/80 flex items-center justify-center p-6 text-center">
              <div className="max-w-md space-y-4">
                <p className="text-red-500 font-medium text-lg">Error initializing sandbox</p>
                <p className="text-zinc-400 text-sm">{initError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          <Editor
            height="100%"
            language={language === 'bash' ? 'shell' : 'python'}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              readOnly: isInitializing || !!initError,
            }}
          />
        </div>

        {/* Terminal Pane */}
        <div className="flex flex-col w-1/2 h-full">
          <div className="px-4 py-2 text-xs font-mono font-medium border-b border-zinc-800 text-zinc-400 bg-zinc-900/80">
            TERMINAL OUTPUT
          </div>
          <div className="flex-1 p-4 bg-[#09090b] overflow-hidden relative">
            <div ref={terminalRef} className="absolute inset-4 overflow-hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
