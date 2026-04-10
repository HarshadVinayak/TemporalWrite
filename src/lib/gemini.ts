const OPENROUTER_MODELS = [
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-3-4b-it:free',
  'google/gemma-3n-4b-it:free',
  'google/gemma-3n-2b-it:free',
  'google/gemma-3-12b-it:free',
  'openrouter/free'
];

const GROQ_MODELS = [
  'llama3-8b-8192',
  'gemma2-9b-it',
  'mixtral-8x7b-32768'
];

export async function generateChronosResponse(prompt: string, maxTokens: number = 200) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!openRouterKey && !groqKey) {
    throw new Error('No AI configuration found (missing OPENROUTER_API_KEY and GROQ_API_KEY).');
  }

  const systemInstruction = 'You are Chronos AI, the intelligence behind TemporalWrite. Keep your responses engaging but strictly concise (under 150 words).';

  // We'll try OpenRouter first if key is available, picking a random model
  if (openRouterKey) {
    const model = OPENROUTER_MODELS[Math.floor(Math.random() * OPENROUTER_MODELS.length)];
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://temporalwrite.local', // Optional
          'X-Title': 'TemporalWrite', // Optional
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      }
    } catch (e) {
      console.warn(`OpenRouter fetch failed for model ${model}:`, e);
    }
  }

  // Fallback to Groq if OpenRouter fails or key is missing
  if (groqKey) {
    const model = GROQ_MODELS[Math.floor(Math.random() * GROQ_MODELS.length)];
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      } else {
        const errData = await response.text();
        console.warn('Groq returned an error response:', errData);
      }
    } catch (e) {
      console.warn(`Groq fetch failed for model ${model}:`, e);
    }
  }

  throw new Error('All AI providers failed to communicate.');
}
