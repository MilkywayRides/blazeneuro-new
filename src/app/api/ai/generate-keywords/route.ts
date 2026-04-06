import { NextRequest, NextResponse } from "next/server";

const AI_MODEL_URL_V2 = process.env.AI_MODEL_URL_V2!;
const AI_API_SECRET = process.env.AI_API_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { title, content, excerpt } = await req.json();

    const response = await fetch(`${AI_MODEL_URL_V2}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_SECRET}`
      },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: `Generate 10-15 SEO keywords for this blog. Return ONLY a JSON array of strings.
Title: ${title}
Excerpt: ${excerpt}
Content: ${content.substring(0, 1500)}`
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error("AI failed");
    
    const data = await response.json();
    const text = data.choices[0].message.content.trim().replace(/```json\n?|\n?```/g, '');
    const keywords = JSON.parse(text);
    
    return NextResponse.json({ keywords });
  } catch (error) {
    console.error("Keyword generation error:", error);
    return NextResponse.json({ keywords: [] });
  }
}
