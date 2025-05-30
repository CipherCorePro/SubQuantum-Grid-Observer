
import { GERMAN_STOPWORDS } from '../constants';
import { WeightingStrategyType, SentenceWithScore, Settings } from '../types';

// Simplified sentence tokenizer
export const tokenizeSentences = (text: string): string[] => {
  if (!text) return [];
  // Split by common sentence delimiters, keeping the delimiter.
  // This is a basic approach and might not cover all edge cases perfectly.
  return text.match(/[^.!?]+[.!?]\s*|[^.!?]+$/g) || [text];
};

// Simplified word counter (proxy for token count)
export const countWords = (text: string): number => {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

export const getEffectiveStopwords = (extraStopwords: string): string[] => {
  const customStopwords = extraStopwords.toLowerCase().split(/\s+/).filter(Boolean);
  return [...new Set([...GERMAN_STOPWORDS, ...customStopwords])];
};

// Simplified keyword extraction (frequency-based, stopwords removed)
export const extractKeywordsSimple = (text: string, currentStopwords: string[], topN: number = 10): string[] => {
  if (!text) return [];
  // FIX: Explicitly type 'words' as string[] to potentially aid type inference.
  const words: string[] = text.toLowerCase().match(/\b(\w+)\b/g) || [];
  const frequencies: { [key: string]: number } = {};
  
  words.forEach(word => {
    if (!currentStopwords.includes(word) && word.length > 2) {
      frequencies[word] = (frequencies[word] || 0) + 1;
    }
  });

  return Object.entries(frequencies)
    .sort(([, aFreq], [, bFreq]) => bFreq - aFreq)
    .slice(0, topN)
    .map(([word]) => word);
};

const calculatePositionWeight = (sentenceIndex: number, totalSentences: number): number => {
  if (totalSentences <= 1) return 1;
  // Higher weight for beginning and end sentences
  const relativePosition = sentenceIndex / (totalSentences -1);
  if (relativePosition < 0.2 || relativePosition > 0.8) return 1.0;
  return 0.5;
};

const calculateKeywordWeight = (sentence: string, keywords: string[]): number => {
  if (!keywords.length) return 0;
  const sentenceLower = sentence.toLowerCase();
  let score = 0;
  keywords.forEach(keyword => {
    if (sentenceLower.includes(keyword)) {
      score++;
    }
  });
  return score / keywords.length; // Normalize score
};

export const getContext = (
  fullText: string,
  settings: Settings
): string => {
  const currentStopwords = getEffectiveStopwords(settings.extraStopwords);
  const sentences = tokenizeSentences(fullText);
  const totalWords = countWords(fullText);
  
  let windowSizeWords = settings.windowSize;
  // Dynamic window size adjustment based on prompt length (simplified)
  // This part is mentioned in Python code. Assuming prompt length < 100 words is "short".
  // For this function, we don't have direct prompt access, so dynamic adjustment based on prompt length
  // should be handled before calling getContext, or passed in.
  // For now, let's assume windowSize is already adjusted if needed.

  if (totalWords <= windowSizeWords || settings.weightingStrategy === WeightingStrategyType.NONE || sentences.length <= 1) {
    // Take last `windowSizeWords` if text is too long, or full text if short enough or no weighting
    if (totalWords > windowSizeWords) {
        let context = "";
        let currentWordCount = 0;
        for (let i = sentences.length - 1; i >=0; i--) {
            const sentenceWordCount = countWords(sentences[i]);
            if (currentWordCount + sentenceWordCount <= windowSizeWords) {
                context = sentences[i] + " " + context;
                currentWordCount += sentenceWordCount;
            } else {
                // If adding the whole sentence exceeds, try to take part of it (simplified)
                const wordsInSentence = sentences[i].split(/\s+/);
                const remainingCapacity = windowSizeWords - currentWordCount;
                if (remainingCapacity > 0) {
                     context = wordsInSentence.slice(-remainingCapacity).join(" ") + " " + context;
                }
                break;
            }
        }
        return context.trim();
    }
    return fullText;
  }

  const keywords = extractKeywordsSimple(fullText, currentStopwords);
  
  const scoredSentences: SentenceWithScore[] = sentences.map((sentence, index) => {
    let score = 0;
    switch (settings.weightingStrategy) {
      case WeightingStrategyType.POSITION:
        score = calculatePositionWeight(index, sentences.length);
        break;
      case WeightingStrategyType.KEYWORD:
        score = calculateKeywordWeight(sentence, keywords);
        break;
      case WeightingStrategyType.COMBINED:
        const posWeight = calculatePositionWeight(index, sentences.length);
        const keyWeight = calculateKeywordWeight(sentence, keywords);
        score = (posWeight * settings.positionWeightingFactor) + (keyWeight * (1 - settings.positionWeightingFactor));
        break;
      default: // NONE already handled or implies taking tail
        score = 1; // Keep original order if no specific weighting
    }
    return { sentence, score, originalIndex: index };
  });

  // Sort by score (descending), then by original index (ascending) to maintain some order for ties
  scoredSentences.sort((a, b) => {
    if (b.score === a.score) return a.originalIndex - b.originalIndex;
    return b.score - a.score;
  });
  
  let contextText = "";
  let currentContextWords = 0;
  const selectedSentencesForContext: SentenceWithScore[] = [];

  for (const scoredSentence of scoredSentences) {
    const sentenceWords = countWords(scoredSentence.sentence);
    if (currentContextWords + sentenceWords <= windowSizeWords) {
      selectedSentencesForContext.push(scoredSentence);
      currentContextWords += sentenceWords;
    }
    if (currentContextWords >= windowSizeWords) break;
  }

  // Re-sort selected sentences by original index to make context more coherent
  selectedSentencesForContext.sort((a,b) => a.originalIndex - b.originalIndex);
  contextText = selectedSentencesForContext.map(s => s.sentence).join(" ").trim();

  // If context is still too large (due to sentence granularity), trim it (simplistic tail trim)
  while(countWords(contextText) > windowSizeWords && contextText.includes(" ")) {
      contextText = contextText.substring(contextText.indexOf(" ") + 1);
  }
  if(countWords(contextText) > windowSizeWords) { // if it's one very long sentence
      const wordsInContext = contextText.split(/\s+/);
      contextText = wordsInContext.slice(-windowSizeWords).join(" ");
  }

  return contextText.trim();
};