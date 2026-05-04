'use client';

import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Play, Loader2, RefreshCw } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

export default function SandboxPage() {
  const [code, setCode] = useState('print("Hello from E2B Sandbox!")\n');
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#09090b', // dark background matching typical shadcn
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
    
    term.writeln('\x1b[1;32m$ Python Sandbox Initialized\x1b[0m');
    term.writeln('Ready to execute code...\n');

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
    if (!code.trim() || isExecuting) return;

    setIsExecuting(true);
    const term = xtermRef.current;
    
    if (term) {
      term.writeln('\x1b[1;34m> Running execution...\x1b[0m');
    }

    try {
      const response = await fetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
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
      xtermRef.current.writeln('\x1b[1;32m$ Python Sandbox Ready\x1b[0m\n');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-zinc-950 text-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Python Sandbox</h1>
          <p className="text-sm text-zinc-400">Powered by E2B Code Interpreter</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearTerminal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-md bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
            disabled={isExecuting}
          >
            <RefreshCw className="w-4 h-4" />
            Clear Console
          </button>
          <button
            onClick={handleRunCode}
            disabled={isExecuting}
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
        <div className="w-1/2 h-full border-r border-zinc-800">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
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
