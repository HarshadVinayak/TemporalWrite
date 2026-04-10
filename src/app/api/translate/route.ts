import { NextResponse } from 'next/server';
import { askOpenRouter } from '@/lib/ai-orchestrator';

const SYSTEM_TRANSLATOR = 'You are an expert copywriter, historian, and grammarian. Return ONLY valid JSON with no markdown fences.';

export async function POST(req: Request) {
  try {
    const { sentence } = await req.json();

    if (!sentence) {
      return NextResponse.json({ error: 'Sentence is required' }, { status: 400 });
    }

    const prompt = `
Transform this sentence into exactly three stylistic versions. Return ONLY valid JSON.

Input: "${sentence}"

Rules:
- "era1" (Past / 1st-grade simple): Very simple words a child understands. Short sentences. No jargon.
- "era2" (Present / Professional): Clear, crisp, standard professional English. Suitable for a business email.
- "era3" (Future / Academic-Rhetorical): Highly academic, complex syntax, precise scholarly vocabulary. Could appear in a doctoral thesis or Supreme Court brief.

JSON shape (no markdown, no extra keys):
{"era1":"...","era2":"...","era3":"..."}
`.trim();

    const rawResponse = await askOpenRouter(prompt, SYSTEM_TRANSLATOR, 400);

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI returned non-JSON format.');
    }

    const translations = JSON.parse(jsonMatch[0]);

    if (!translations.era1 || !translations.era2 || !translations.era3) {
      throw new Error('Incomplete translation response.');
    }

    return NextResponse.json(translations);
  } catch (error: any) {
    console.error('Translate API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
