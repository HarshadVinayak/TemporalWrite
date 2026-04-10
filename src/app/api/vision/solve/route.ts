import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { image, era } = await req.json();

    const eraContext = era === 1 
      ? "medieval chronicler (Past)" 
      : era === 2 
        ? "Victorian engineer (Present)" 
        : "cybernetic AI (Future)";

    const prompt = `Identify the English grammar question in this image. 
Return a JSON object with:
- 'question': The text of the question.
- 'options': An array of 4 multiple-choice options.
- 'correctIndex': The index of the correct answer (0-3).
- 'explanation': A 1-sentence explanation of why it's correct in the tone of a ${eraContext}.

Format the output as ONLY JSON.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] } }
          ]
        }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Lens Solve Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
