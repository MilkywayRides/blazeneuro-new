import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { imageUrls } = await req.json();

  if (!imageUrls || imageUrls.length !== 4) {
    return NextResponse.json({ error: '4 images required' }, { status: 400 });
  }

  try {
    // Mock response for now
    const mockModelUrl = `https://via.placeholder.com/512?text=3D+Model`;

    // Uncomment when Modal is deployed:
    // const response = await fetch(`${process.env.MODAL_BOUTIQUE_ENDPOINT}/generate-3d`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ imageUrls })
    // });
    // const data = await response.json();
    
    return NextResponse.json({ modelUrl: mockModelUrl });
  } catch (error) {
    return NextResponse.json({ error: '3D generation failed' }, { status: 500 });
  }
}
