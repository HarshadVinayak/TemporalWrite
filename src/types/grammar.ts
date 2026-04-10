export type ExerciseType = 'WordBank' | 'Transformer' | 'ErrorSpotter';

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  explanation: string;
  topic?: string;
}

export interface WordBankExercise extends BaseExercise {
  type: 'WordBank';
  sentence: string; // contains blank: ___
  options: string[];
  correctAnswer: string;
}

export interface TransformerExercise extends BaseExercise {
  type: 'Transformer';
  originalSentence: string;
  targetStructure: string;
  correctAnswer: string; // or an array of acceptable answers
}

export interface ErrorSpotterExercise extends BaseExercise {
  type: 'ErrorSpotter';
  sentenceWithErrors: string;
  correctAnswer: string;
}

export type GrammarChallenge = WordBankExercise | TransformerExercise | ErrorSpotterExercise;
