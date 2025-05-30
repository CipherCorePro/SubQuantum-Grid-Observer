
export enum WeightingStrategyType {
  NONE = "Keine Gewichtung",
  POSITION = "Positionsbasierte Gewichtung",
  KEYWORD = "Schlüsselwort Gewichtung", // Simplified from TF-IDF
  COMBINED = "Kombinierte Gewichtung",
}

export interface Settings {
  windowSize: number;
  tokenizerName: string; // e.g., "tiktoken" (actual tokenization simplified)
  tiktokenModel: string; // Model for tokenizer (e.g., "gpt-3.5-turbo", UI only)
  weightingStrategy: WeightingStrategyType;
  dynamicWindowSize: boolean;
  positionWeightingFactor: number; // For combined strategy
  extraStopwords: string; // Space-separated
}

export interface SentenceWithScore {
  sentence: string;
  score: number;
  originalIndex: number;
}
    