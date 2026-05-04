import { NextResponse } from 'next/server';
import { Sandbox } from '@e2b/code-interpreter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sandboxId = searchParams.get('sandboxId');
  const path = searchParams.get('path') || '/home/user/workspace';
  const action = searchParams.get('action') || 'list'; // 'list' or 'read'

  if (!sandboxId) {
    return NextResponse.json({ error: 'Sandbox ID required' }, { status: 400 });
  }

  try {
    const sandbox = await Sandbox.connect(sandboxId);

    if (action === 'read') {
      const content = await sandbox.files.read(path);
      return NextResponse.json({ success: true, content });
    } else {
      const files = await sandbox.files.list(path);
      return NextResponse.json({ success: true, files });
    }
  } catch (error: any) {
    console.error('File API GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { sandboxId, path, content } = await request.json();

    if (!sandboxId || !path || content === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sandbox = await Sandbox.connect(sandboxId);
    await sandbox.files.write(path, content);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('File API POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
