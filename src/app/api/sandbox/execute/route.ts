import { NextResponse } from 'next/server';
import { Sandbox } from '@e2b/code-interpreter';

export async function POST(request: Request) {
  try {
    const { code, sandboxId } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Check for API key
    if (!process.env.E2B_API_KEY) {
      return NextResponse.json(
        { error: 'E2B_API_KEY is not configured in environment variables' },
        { status: 500 }
      );
    }

    // Initialize or connect to the E2B sandbox
    let sandbox;
    let isReused = false;

    if (sandboxId) {
      sandbox = await Sandbox.connect(sandboxId);
      isReused = true;
    } else {
      sandbox = await Sandbox.create({
        apiKey: process.env.E2B_API_KEY,
      });
    }

    try {
      // Execute the python code
      const execution = await sandbox.runCode(code);
      
      // Return the results
      return NextResponse.json({
        success: true,
        results: execution.results, // Display rich outputs if any
        logs: execution.logs,       // stdout and stderr (arrays of strings)
        error: execution.error,     // Execution error
      });
    } finally {
      // Ensure the sandbox is always closed to prevent lingering instances if it was newly created
      if (!isReused) {
        await sandbox.kill();
      } else {
        // Ping to keep alive
        await sandbox.setTimeout(3600000);
      }
    }
  } catch (error: any) {
    console.error('Sandbox execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute code' },
      { status: 500 }
    );
  }
}
