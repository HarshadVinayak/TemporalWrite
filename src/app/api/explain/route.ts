import { NextResponse } from 'next/server';
import { askOpenRouter } from '@/lib/ai-orchestrator';

export async function POST(req: Request) {
  try {
    const { era, question, userAnswer, correctAnswer } = await req.json();

    if (!question || !correctAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const persona = era === 1 ? 'Storyteller' : era === 2 ? 'Editor' : 'Professor';

    const prompt = `
You are acting as a ${persona} (Era ${era}) explaining a grammar correction.

Question: "${question}"
User's incorrect answer: "${userAnswer}"
Correct answer: "${correctAnswer}"

${era === 3
  ? `Provide a deep, academic explanation. Name the specific grammar rule (e.g., "Subjunctive Mood," "Pluperfect Aspect"). Explain WHY the rule exists linguistically. Use precise terminology. Maximum 120 words.`
  : `Briefly explain why "${correctAnswer}" is correct and why "${userAnswer}" is wrong. Be encouraging and clear. Maximum 80 words.`
}
`.trim();

    const explanation = await askOpenRouter(prompt, undefined, era === 3 ? 250 : 150);

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error('Explain API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
