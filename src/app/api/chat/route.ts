import { NextRequest } from 'next/server';

// ─── Model Registry ───────────────────────────────────────────────────
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
const OPENROUTER_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
];

// ─── System Prompt (The Chronos Librarian) ────────────────────────────
function buildSystemPrompt(era: number, lastFailed: string | null) {
  const eraName = era === 1 ? 'Past (Grades 1-5)' : era === 2 ? 'Present (Grades 6-12)' : 'Future (College+)';
  let base = `You are the Chronos Librarian, the AI tutor inside TemporalWrite.
Your goal is to help users master English grammar across three Eras: Past (Grades 1-5), Present (Grades 6-12), and Future (College+).
The user is currently in Era: ${eraName}.
Adjust your vocabulary, sentence complexity, and explanations to match this level.
Be warm, encouraging, and concise. Use analogies and examples. Keep responses under 200 words unless the user asks for more detail.
You can also help with:
- /analyze: Analyze the user's recent writing for common mistakes.
- /translate: Rewrite a sentence across all three Era styles.
- /quiz: Generate a quick 3-question grammar quiz based on the current topic.
When the user uses a slash command, respond in the appropriate structured format.`;

  if (lastFailed) {
    base += `\n\nIMPORTANT CONTEXT: The user's most recent failed exercise was: "${lastFailed}". If they ask "why did I get that wrong?" or similar, reference this.`;
  }

  return base;
}

// ─── Groq Streaming Fetch ─────────────────────────────────────────────
async function fetchGroq(
  messages: { role: string; content: string }[],
  model: string,
  signal: AbortSignal
) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 512,
      temperature: 0.7,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err}`);
  }
  return res;
}

// ─── OpenRouter Streaming Fetch ───────────────────────────────────────
async function fetchOpenRouter(
  messages: { role: string; content: string }[],
  model: string,
  signal: AbortSignal
) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://temporalwrite.app',
      'X-Title': 'TemporalWrite',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 512,
      temperature: 0.7,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }
  return res;
}

// ─── SSE Stream Transformer ──────────────────────────────────────────
function createSSEStream(upstreamResponse: Response): ReadableStream<Uint8Array> {
  const reader = upstreamResponse.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(payload);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

// ─── Route Handler ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, engine, era, lastFailed } = await req.json();

    const systemPrompt = buildSystemPrompt(era || 1, lastFailed || null);
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const isGroq = engine === 'groq';
    const primaryModel = isGroq ? GROQ_MODELS[0] : OPENROUTER_MODELS[0];
    const fallbackModel = isGroq ? OPENROUTER_MODELS[0] : GROQ_MODELS[0];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    let usedEngine = engine;

    try {
      // Primary engine
      response = isGroq
        ? await fetchGroq(fullMessages, primaryModel, controller.signal)
        : await fetchOpenRouter(fullMessages, primaryModel, controller.signal);
    } catch (primaryErr: any) {
      console.warn(`Primary engine (${engine}) failed: ${primaryErr.message}. Failing over...`);

      // Failover to the other engine
      usedEngine = isGroq ? 'openrouter' : 'groq';
      response = isGroq
        ? await fetchOpenRouter(fullMessages, fallbackModel, controller.signal)
        : await fetchGroq(fullMessages, fallbackModel, controller.signal);
    }

    clearTimeout(timeout);

    const stream = createSSEStream(response);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Engine-Used': usedEngine,
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'All AI engines failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
