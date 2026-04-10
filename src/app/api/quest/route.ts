import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { messages, era, questType, targets } = await req.json();

    const systemPrompt = `You are a character in a historical setting for a grammar learning game.
Era: ${era === 1 ? 'Ancient Past (Medieval)' : era === 2 ? 'Industrial Present (19th Century)' : 'Digital Future (Cyberpunk)'}
Quest: ${questType}
Your Personality: Immersion is key. Speak appropriately for your era.
Your Goal: Engage the user in conversation.
WIN CONDITION: The user must successfully use these ${targets.length} grammar targets in their responses: ${targets.join(', ')}.

When the user meets the criteria for a target, briefly acknowledge it in character.
Once ALL targets are met, the user wins.

Response format: Return a JSON object:
{
  "content": "Your character response here...",
  "targetsMet": ["target1", "target2"], // subset of targets achieved so far
  "hasWon": true/false
}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await res.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Quest API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
