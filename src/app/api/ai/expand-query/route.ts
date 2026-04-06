import { NextRequest, NextResponse } from "next/server";

const AI_MODEL_URL_V2 = process.env.AI_MODEL_URL_V2!;
const AI_API_SECRET = process.env.AI_API_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    const response = await fetch(`${AI_MODEL_URL_V2}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_SECRET}`
      },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: `Given search query: "${query}". Generate 5-8 related keywords users might search. Include synonyms, variations. Return ONLY a JSON array of strings.`
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Modal AI error:", response.status, errorText);
      return NextResponse.json({ keywords: [] });
    }
    
    const data = await response.json();
    const text = data.choices[0].message.content.trim().replace(/```json\n?|\n?```/g, '');
    const keywords = JSON.parse(text);
    
    return NextResponse.json({ keywords });
  } catch (error) {
    console.error("Query expansion error:", error);
    return NextResponse.json({ keywords: [] });
  }
}
