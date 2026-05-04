import { NextResponse } from 'next/server';
import { Sandbox } from '@e2b/code-interpreter';
import { db } from '@/lib/db';
import { project, githubConnection } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-check';

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 1. Fetch Project Details
    const proj = await db.select().from(project).where(
      and(eq(project.id, projectId), eq(project.userId, session.user.id))
    ).limit(1);

    if (proj.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const currentProject = proj[0];

    // 2. Fetch GitHub Token
    const githubConn = await db.select().from(githubConnection).where(
      eq(githubConnection.userId, session.user.id)
    ).limit(1);

    if (githubConn.length === 0) {
      return NextResponse.json({ error: 'GitHub connection not found' }, { status: 400 });
    }

    const token = githubConn[0].accessToken;

    if (!process.env.E2B_API_KEY) {
      return NextResponse.json({ error: 'E2B_API_KEY is missing' }, { status: 500 });
    }

    // 3. Initialize Sandbox
    // Note: We use the default environment. 
    // timeoutMs: 1 hour (3600000 ms) so the user can keep working.
    const sandbox = await Sandbox.create({
      apiKey: process.env.E2B_API_KEY,
      timeoutMs: 3600000, 
    });

    // 4. Clone Repository
    // The format is https://oauth2:<token>@github.com/<repo>.git
    const repoUrl = `https://oauth2:${token}@github.com/${currentProject.repoFullName}.git`;
    
    // We run the clone command via the Sandbox process
    const cloneResult = await sandbox.commands.run(
      `git clone ${repoUrl} /home/user/workspace && cd /home/user/workspace`
    );

    if (cloneResult.exitCode !== 0) {
      console.error('Clone failed:', cloneResult.stderr);
      await sandbox.kill();
      return NextResponse.json({ 
        error: 'Failed to clone repository', 
        details: cloneResult.stderr 
      }, { status: 500 });
    }

    let previewUrl = null;

    if (currentProject.framework === 'nextjs') {
      // Install dependencies (this might take a while, frontend should show "installing dependencies...")
      await sandbox.commands.run('cd /home/user/workspace && npm install');
      
      // Start dev server in the background
      await sandbox.commands.run('cd /home/user/workspace && npm run dev', { background: true });
      
      previewUrl = `https://${sandbox.getHost(3000)}`;
      
      // Save the subdomain and preview URL to the project so middleware can route it
      const subdomainStr = currentProject.name.toLowerCase().replace(/[^a-z0-9-]/g, '');
      await db.update(project)
        .set({ 
          domain: previewUrl,
          subdomain: subdomainStr
        })
        .where(eq(project.id, projectId));
    }

    // Return the sandbox ID to the frontend
    return NextResponse.json({
      success: true,
      sandboxId: sandbox.sandboxId,
      previewUrl,
      logs: {
        stdout: [cloneResult.stdout],
        stderr: [cloneResult.stderr]
      }
    });

  } catch (error: any) {
    console.error('Sandbox init error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize sandbox' },
      { status: 500 }
    );
  }
}
