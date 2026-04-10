import { NextResponse } from 'next/server';
import { analyzeVoiceStrict } from '@/lib/ai-orchestrator';

export async function POST(req: Request) {
  try {
    const { transcript, era, strictness, target } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // If no target provided, do a simpler grammar-only check
    const targetSentence = target || transcript;

    const rawResponse = await analyzeVoiceStrict(transcript, targetSentence, era ?? 1, strictness ?? 70);

    // Parse JSON defensively
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI returned non-JSON format.');
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      corrected: result.corrected || transcript,
      explanation: result.explanation || '',
      score: result.score ?? 100,
      isCorrect: result.isCorrect ?? true,
      phoneticIssues: result.phoneticIssues ?? [],
    });
  } catch (error: any) {
    console.error('Analyze Voice API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
