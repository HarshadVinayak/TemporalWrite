import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { era, topic } = await req.json();

    const eraContext = era === 1 
      ? "Era 1 (Grades 1-5): Focus on simple subject-verb agreement, basic nouns, and foundational punctuation." 
      : era === 2 
        ? "Era 2 (Grades 6-12): Focus on compound/complex sentences, varying tenses, and academic vocabulary." 
        : "Era 3 (College+): Focus on advanced rhetoric, complex conditionals, stylistic nuances, and sophisticated syntax.";

    const prompt = `You are the Chronos Exam Hall Superintendent.
Generate 10 Multiple Choice Questions (MCQs) for the following context:
${eraContext}
Topic: ${topic || 'General Grammar'}

Each question must have:
1. A clear 'question' text.
2. 4 'options' as a string array.
3. A 'correctIndex' (0-3).
4. An 'explanation' (Librarian's Note) explaining why the correct answer is right and why others are wrong.

Format the output as a JSON array of objects.
OUTPUT ONLY THE JSON.

Example:
[
  {
    "question": "Which of these is a complete sentence?",
    "options": ["Running fast.", "The cat sat.", "In the house.", "Blue sky."],
    "correctIndex": 1,
    "explanation": "'The cat sat.' contains both a subject and a verb, forming a independent clause."
  }
]`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it:free', // Using gemma-3 as requested (or current available)
        messages: [
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' } // Ensure JSON output
      })
    });

    const data = await res.json();
    const content = data.choices[0].message.content;
    
    // Defensive parsing for JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('AI failed to return JSON array.');
    
    const questions = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Exam Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
