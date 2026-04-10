import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/ai-orchestrator';

export async function POST(req: Request) {
  try {
    const { history, currentEra, currentGrade } = await req.json();

    const prompt = `
Generate 5 "Bonus Nodes" for a grammar learning RPG. 
Context: The user is in Era ${currentEra} (Grade ${currentGrade}).
User's Recent Mistakes (Chrono-Log): 
${JSON.stringify(history)}

Based on these mistakes, generate 5 challenging, thematic grammar exercises.
Format: Return ONLY a JSON array of objects.

Object Schema:
{
  "id": "gen_node_[random]",
  "type": "WordBank" | "Transformer" | "ErrorSpotter",
  "prompt": "Instruction for the user",
  "era": ${currentEra},
  "topic": "Categorical topic",
  "sentence": "If WordBank: The sentence with ___ for blank",
  "options": ["opt1", "opt2"] or [],
  "correctAnswer": "str",
  "explanation": "A short standard explanation",
  "originalSentence": "If Transformer: the sentence to change",
  "targetStructure": "If Transformer: the goal",
  "sentenceWithErrors": "If ErrorSpotter: sentence with mistake"
}

Ensure the difficulty matches Grade ${currentGrade}. If Era 3, make them highly academic.
Return ONLY the minified JSON array.
`.trim();

    const rawResponse = await generateContent(prompt);

    const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI returned non-JSON array format.');
    }

    const bonusNodes = JSON.parse(jsonMatch[0]);

    return NextResponse.json(bonusNodes);
  } catch (error: any) {
    console.error('Temporal Gen API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
