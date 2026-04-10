import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function POST(req: NextRequest) {
  try {
    const { sentence, targetEra } = await req.json();

    const prompt = `You are the Chronos Time-Warp Engine. 
Take the following Era 1 (Grade 1-5) simple sentence: "${sentence}"
Rewrite it into a complex, academic, and sophisticated Era 3 (College+) version of the same concept.

RULES:
- Maintain the original meaning.
- Use advanced vocabulary.
- Use complex sentence structures (subordinate clauses, varied syntax).
- The result should feel like high-level academia or future prose.

Response format: Return only the rewritten sentence. No preamble.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const warped = response.text().trim();

    return NextResponse.json({ warped });
  } catch (error: any) {
    console.error('Warp API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
