/**
 * TemporalWrite AI Orchestrator — Dual-Engine Brain
 *
 * Engine 1 (Groq)       → Voice Lab, instant feedback (llama-3.1-70b-versatile)
 * Engine 2 (OpenRouter) → Deep explanations, Era 3 content (claude-3.5-sonnet / auto)
 *
 * Failover: If primary engine fails, falls back to the other engine automatically.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const GROQ_PRIMARY_MODEL = 'llama-3.1-70b-versatile';
const GROQ_FALLBACK_MODELS = ['llama3-8b-8192', 'gemma2-9b-it'];

const OPENROUTER_PRIMARY_MODEL = 'anthropic/claude-3.5-sonnet';
const OPENROUTER_FREE_MODELS = [
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-3-12b-it:free',
  'openrouter/free',
];

const SYSTEM_VOICE = 'You are Chronos AI powering a Voice Lab. Be extremely concise. Return ONLY valid JSON.';
const SYSTEM_DEEP  = 'You are Chronos AI — an elite English grammar professor. Your explanations are academic, deeply insightful, and encouraging. You cite linguistic rules by name when appropriate.';
const SYSTEM_GEN   = 'You are Chronos AI — a content architect generating grammar exercises. Return ONLY minified valid JSON arrays.';

// Helper to get keys from env, supporting both standard and legacy VITE_ prefixes for transition
function getAIKey(name: string): string {
  const key = process.env[name] || process.env[`VITE_${name}`];
  if (!key) {
    // In production (Cloud Functions), we expect these from Secret Manager
    if (process.env.NODE_ENV === 'production') {
       console.error(`[CRITICAL] Missing ${name} in production secrets.`);
    }
    throw new Error(`${name} missing from environment/secrets.`);
  }
  return key;
}

// ──────────────────────────────────────────── helpers ───

async function groqCall(
  messages: { role: string; content: string }[],
  maxTokens: number,
  model = GROQ_PRIMARY_MODEL
): Promise<string> {
  const key = getAIKey('GROQ_API_KEY');

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.3 }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function openRouterCall(
  messages: { role: string; content: string }[],
  maxTokens: number,
  model = OPENROUTER_PRIMARY_MODEL
): Promise<string> {
  const key = getAIKey('OPENROUTER_API_KEY');

  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://temporalwrite.app',
      'X-Title': 'TemporalWrite',
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.7 }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ──────────────────────────────────── public orchestrators ───

/**
 * FAST PATH — Groq for voice/immediate feedback.
 * Falls back to OpenRouter free → OpenRouter primary on failure.
 */
export async function askGroq(
  prompt: string,
  systemPrompt = SYSTEM_VOICE,
  maxTokens = 256
): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: prompt },
  ];

  // 1. Try primary Groq model
  try {
    return await groqCall(messages, maxTokens, GROQ_PRIMARY_MODEL);
  } catch (e) {
    console.warn('[Orchestrator] Groq primary failed:', (e as Error).message);
  }

  // 2. Try Groq fallback models
  for (const model of GROQ_FALLBACK_MODELS) {
    try {
      return await groqCall(messages, maxTokens, model);
    } catch (e) {
      console.warn(`[Orchestrator] Groq ${model} failed:`, (e as Error).message);
    }
  }

  // 3. Fall back to OpenRouter free models
  for (const model of OPENROUTER_FREE_MODELS) {
    try {
      return await openRouterCall(messages, maxTokens, model);
    } catch (e) {
      console.warn(`[Orchestrator] OpenRouter ${model} failed:`, (e as Error).message);
    }
  }

  throw new Error('All AI engines are unavailable. Please try again shortly.');
}

/**
 * DEEP PATH — OpenRouter for rich explanations & content generation.
 * Falls back to Groq on failure.
 */
export async function askOpenRouter(
  prompt: string,
  systemPrompt = SYSTEM_DEEP,
  maxTokens = 512
): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: prompt },
  ];

  // 1. Try OpenRouter primary (Claude 3.5 Sonnet)
  try {
    return await openRouterCall(messages, maxTokens, OPENROUTER_PRIMARY_MODEL);
  } catch (e) {
    console.warn('[Orchestrator] OpenRouter primary failed:', (e as Error).message);
  }

  // 2. Try free OpenRouter models
  for (const model of OPENROUTER_FREE_MODELS) {
    try {
      return await openRouterCall(messages, maxTokens, model);
    } catch (e) {
      console.warn(`[Orchestrator] OpenRouter ${model} failed:`, (e as Error).message);
    }
  }

  // 3. Fall back to Groq
  try {
    return await groqCall(messages, maxTokens, GROQ_PRIMARY_MODEL);
  } catch (e) {
    console.warn('[Orchestrator] Groq fallback failed:', (e as Error).message);
  }

  throw new Error('All AI engines are unavailable. Please try again shortly.');
}

/**
 * CONTENT GENERATION — for Infinite Era Nodes.
 * Uses OpenRouter deep model for quality, Groq as fallback.
 */
export async function generateContent(
  prompt: string,
  maxTokens = 1024
): Promise<string> {
  return askOpenRouter(prompt, SYSTEM_GEN, maxTokens);
}

/**
 * VOICE STRICT ANALYSIS — Groq-powered phonetic comparison.
 * Returns raw string (should be JSON).
 */
export async function analyzeVoiceStrict(
  transcript: string,
  target: string,
  era: number,
  strictness: number
): Promise<string> {
  const prompt = `
Target sentence: "${target}"
User spoke: "${transcript}"
Era: ${era} (1=Beginner, 2=Intermediate, 3=Academic)
Strictness: ${strictness}/100

Compare phonetically and grammatically. ${strictness > 70 ? 'Be very strict — penalize even minor pronunciation shifts and misplaced pauses.' : 'Allow minor variations.'}

Return ONLY this JSON (no markdown):
{
  "isCorrect": boolean,
  "score": 0-100,
  "corrected": "corrected sentence",
  "phoneticIssues": ["issue1", "issue2"] or [],
  "explanation": "brief explanation under 60 words"
}`;

  return askGroq(prompt, SYSTEM_VOICE, 300);
}
