// ─── Types ──────────────────────────────────────────────────────────────────

export interface VoiceCorrection {
  original: string;
  corrected: string;
  explanation: string;
  isCorrect: boolean;
  // legacy compat
}

export type ErrorType = 'grammar' | 'spelling' | 'pronunciation' | 'none';

export interface WordAudit {
  word: string;
  expected: string;
  errorType: ErrorType;
  closeness: number; // 0–100
}

export interface SpeechAuditResult {
  spokenWords: WordAudit[];
  overallScore: number; // 0-100
  grammarErrors: string[];
  spellingErrors: string[];
  pronunciationErrors: string[];
  isCorrect: boolean;
  correctedSentence: string;
  explanation: string;
}

export interface VoiceChallenge {
  id: string;
  target: string;
  eraHint: string; // explanation for this era
  category: string;
}

// ─── Levenshtein Distance ────────────────────────────────────────────────────

export function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export function wordCloseness(spoken: string, expected: string): number {
  const s = spoken.toLowerCase().trim();
  const e = expected.toLowerCase().trim();
  if (s === e) return 100;
  const maxLen = Math.max(s.length, e.length);
  if (maxLen === 0) return 100;
  const dist = levenshtein(s, e);
  return Math.round(((maxLen - dist) / maxLen) * 100);
}

// ─── Simple Grammar Rules ────────────────────────────────────────────────────

const grammarPatterns: Array<{ pattern: RegExp; fix: (m: string) => string; msg: string }> = [
  { pattern: /\bi is\b/gi, fix: () => 'I am', msg: 'Use "I am" not "I is".' },
  { pattern: /\bhe are\b/gi, fix: () => 'he is', msg: 'Use "he is" not "he are".' },
  { pattern: /\bshe are\b/gi, fix: () => 'she is', msg: 'Use "she is" not "she are".' },
  { pattern: /\bthey is\b/gi, fix: () => 'they are', msg: 'Use "they are" not "they is".' },
  { pattern: /\bgoed\b/gi, fix: () => 'went', msg: '"Go" is irregular — the past tense is "went".' },
  { pattern: /\beated\b/gi, fix: () => 'ate', msg: '"Eat" is irregular — the past tense is "ate".' },
  { pattern: /\bhe go\b/gi, fix: () => 'he goes', msg: 'Third-person singular: "he goes".' },
  { pattern: /\bshe go\b/gi, fix: () => 'she goes', msg: 'Third-person singular: "she goes".' },
  { pattern: /\bwe has\b/gi, fix: () => 'we have', msg: 'Use "we have" not "we has".' },
  { pattern: /\bthey has\b/gi, fix: () => 'they have', msg: 'Use "they have" not "they has".' },
  { pattern: /\ba apple\b/gi, fix: () => 'an apple', msg: 'Use "an" before vowel sounds.' },
  { pattern: /\ba elephant\b/gi, fix: () => 'an elephant', msg: 'Use "an" before vowel sounds.' },
];

// ─── Simple Word Dictionary Check ───────────────────────────────────────────

const commonWords = new Set([
  'the','a','an','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','shall','should','may','might','must','can',
  'could','i','you','he','she','it','we','they','me','him','her','us','them',
  'my','your','his','its','our','their','this','that','these','those','what',
  'which','who','whom','whose','where','when','why','how','and','but','or','nor',
  'for','yet','so','in','on','at','by','from','to','with','as','into','through',
  'during','before','after','above','below','up','down','out','off','over','under',
  'again','then','once','here','there','all','both','each','few','more','most',
  'no','not','only','own','same','than','too','very','just','because','if','while',
  'about','against','between','into','of','than','very','just','want','go','come',
  'know','think','see','look','use','find','give','tell','work','call','try','ask',
  'need','feel','become','leave','put','mean','keep','let','begin','show','hear',
  'play','run','move','live','believe','hold','bring','happen','write','provide',
  'sit','stand','lose','pay','meet','include','continue','set','learn','change',
  'lead','understand','watch','follow','stop','create','speak','read','spend',
  'grow','open','walk','win','offer','remember','love','consider','appear','buy',
  'wait','serve','die','send','expect','build','stay','fall','cut','reach','kill',
  'remain','suggest','raise','pass','sell','require','report','decide','pull',
  'school','year','people','time','hand','place','world','man','woman','child',
  'people','way','day','week','month','life','morning','night','food','home',
  'country','family','city','state','word','thing','matter','point','program',
  'question','government','number','night','area','money','story','fact','month',
  'lot','right','study','book','eye','job','word','business','case','company',
  'group','problem','different','large','important','young','ever','still','even',
  'nice','great','small','large','real','better','best','high','low','old','new',
  'never','much','many','first','last','long','every','number','line','side',
  'get','make','take','know','see','think','come','want','look','use','find',
  'give','tell','work','call','try','ask','seem','feel','leave','put','mean',
  'keep','let','begin','show','hear','play','run','move','live','believe','hold',
  'happened','went','ate','ran','saw','came','took','made','gave','told','knew',
  'thought','left','put','began','showed','heard','played','moved','lived','held',
  'spoken','correct','sentence','grammar','error','pronunciation','target','voice',
  'learn','practice','language','english','speaks','speak','speaking','says','say',
  'said','told','asked','written','writes','writing','reads','reading','listened',
  'listening','teaches','teaching','taught','studied','studying','studies',
]);

function isDictionaryWord(word: string): boolean {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 2) return true; // skip very short
  return commonWords.has(clean);
}

// ─── Era-Specific Explanation ────────────────────────────────────────────────

function eraExplanation(errors: string[], era: number): string {
  if (errors.length === 0) return '';
  const first = errors[0];
  if (era === 1) return `Let's fix this together: ${first}`;
  if (era === 2) return `Grammatical issue detected: ${first}`;
  return `Morphosyntactic irregularity found: ${first} Review your grammar structure thoroughly.`;
}

// ─── Main Analysis Functions ─────────────────────────────────────────────────

// Legacy: Simple mode for free-form analysis (no target required)
export function analyzeSpeech(text: string, era: number): VoiceCorrection {
  let corrected = text;
  const grammarErrors: string[] = [];

  for (const rule of grammarPatterns) {
    if (rule.pattern.test(corrected)) {
      corrected = corrected.replace(rule.pattern, rule.fix);
      grammarErrors.push(rule.msg);
    }
  }

  const isCorrect = grammarErrors.length === 0;
  const explanation = isCorrect
    ? ''
    : eraExplanation(grammarErrors, era);

  return { original: text, corrected, explanation, isCorrect };
}

// Strict mode: Compare spoken text against a target sentence
export function analyzeSpeechQuality(spoken: string, target: string, era: number): SpeechAuditResult {
  const spokenTokens = spoken.trim().toLowerCase().split(/\s+/);
  const targetTokens = target.trim().toLowerCase().split(/\s+/);

  const grammarErrors: string[] = [];
  const spellingErrors: string[] = [];
  const pronunciationErrors: string[] = [];

  // Grammar check on spoken text
  let correctedSentence = spoken;
  for (const rule of grammarPatterns) {
    if (rule.pattern.test(correctedSentence)) {
      correctedSentence = correctedSentence.replace(rule.pattern, rule.fix);
      grammarErrors.push(rule.msg);
    }
  }

  // Word-level audit
  const maxLen = Math.max(spokenTokens.length, targetTokens.length);
  const wordAudits: WordAudit[] = [];

  for (let i = 0; i < maxLen; i++) {
    const spokenWord = spokenTokens[i] ?? '';
    const expectedWord = targetTokens[i] ?? '';
    const closeness = expectedWord ? wordCloseness(spokenWord, expectedWord) : 0;

    let errorType: ErrorType = 'none';

    if (!spokenWord && expectedWord) {
      errorType = 'spelling'; // missing word
      spellingErrors.push(`Missing word: "${expectedWord}"`);
    } else if (spokenWord && !isDictionaryWord(spokenWord) && closeness < 80) {
      errorType = 'spelling'; // gibberish/diction
      spellingErrors.push(`Unrecognized word: "${spokenWord}"`);
    } else if (closeness < 80 && closeness >= 50) {
      errorType = 'pronunciation';
      pronunciationErrors.push(`"${spokenWord}" sounds like "${expectedWord}" — closeness: ${closeness}%`);
    } else if (closeness < 50 && spokenWord && expectedWord) {
      errorType = 'grammar'; // very different word = likely wrong word
      grammarErrors.push(`Said "${spokenWord}", expected "${expectedWord}"`);
    }

    wordAudits.push({ word: spokenWord, expected: expectedWord, errorType, closeness });
  }

  const allErrors = [...grammarErrors, ...spellingErrors, ...pronunciationErrors];
  const isCorrect = allErrors.length === 0;

  // Score = average closeness of all word pairs
  const overallScore = maxLen === 0 ? 100 : Math.round(
    wordAudits.reduce((sum, w) => sum + (w.expected ? w.closeness : 0), 0) /
    wordAudits.filter(w => w.expected).length || 100
  );

  const explanation = isCorrect
    ? era === 1 ? 'Great job! Your sentence was perfect!' : 'Excellent phonetic alignment. No errors detected.'
    : eraExplanation(allErrors, era);

  return {
    spokenWords: wordAudits,
    overallScore,
    grammarErrors,
    spellingErrors,
    pronunciationErrors,
    isCorrect,
    correctedSentence: isCorrect ? spoken : target,
    explanation,
  };
}

// ─── Challenge Content Pool ──────────────────────────────────────────────────

export const voiceLabChallenges: Record<number, VoiceChallenge[]> = {
  1: [
    { id: 'e1_1', target: 'The dog runs fast.', eraHint: 'Watch the action word for one dog!', category: 'Subject-Verb Agreement' },
    { id: 'e1_2', target: 'She went to the store.', eraHint: '"Go" has a special past-tense form.', category: 'Irregular Verbs' },
    { id: 'e1_3', target: 'I am happy today.', eraHint: 'Use "am" after "I".', category: 'Verb To Be' },
    { id: 'e1_4', target: 'They have a big house.', eraHint: 'Use "have" with "they".', category: 'Subject-Verb Agreement' },
    { id: 'e1_5', target: 'We ate dinner early.', eraHint: '"Eat" is irregular — it becomes "ate".', category: 'Irregular Verbs' },
  ],
  2: [
    { id: 'e2_1', target: 'The scientists have discovered a new planet.', eraHint: 'Present perfect with a plural subject.', category: 'Present Perfect' },
    { id: 'e2_2', target: 'If she studies hard, she will pass the exam.', eraHint: 'First conditional: If + present, will + base verb.', category: 'Conditionals' },
    { id: 'e2_3', target: 'Neither the teacher nor the students were prepared.', eraHint: 'Agreement with "neither...nor" follows the closer noun.', category: 'Complex Agreement' },
    { id: 'e2_4', target: 'The report was written by the committee.', eraHint: 'Passive voice: was/were + past participle.', category: 'Passive Voice' },
    { id: 'e2_5', target: 'Having finished the exam, she left the room.', eraHint: 'Participial phrase modifies the subject.', category: 'Participial Phrases' },
  ],
  3: [
    { id: 'e3_1', target: 'The corpus demonstrates significant morphophonological variation across dialects.', eraHint: 'Academic register and phoneme accuracy are both evaluated.', category: 'Academic Register' },
    { id: 'e3_2', target: 'Syntactically ambiguous structures often require pragmatic context for disambiguation.', eraHint: 'Precision of articulation is critical in academic discourse.', category: 'Syntax' },
    { id: 'e3_3', target: 'The subjunctive mood is employed to express hypothetical or counterfactual conditions.', eraHint: 'Notice the subjunctive form: "is employed" in an abstract claim.', category: 'Subjunctive Mood' },
  ],
};

export function getChallengesForEra(era: number): VoiceChallenge[] {
  if (era >= 3) return voiceLabChallenges[3];
  if (era >= 2) return voiceLabChallenges[2];
  return voiceLabChallenges[1];
}
