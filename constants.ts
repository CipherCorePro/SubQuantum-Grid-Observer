
import { WeightingStrategyType, Settings } from './types'; // FIX: Import Settings

export const DEFAULT_PROMPT: string = "Schreibe den ersten Satz eines spannenden Fantasy-Romans.";
export const GEMINI_MODEL_NAME: string = 'gemini-2.5-flash-preview-04-17'; // As per guidelines

export const GERMAN_STOPWORDS: string[] = [
  "aber", "alle", "allem", "allen", "aller", "alles", "als", "also", "am", "an", "ander", "andere", 
  "anderem", "anderen", "anderer", "anderes", "anderm", "andern", "anderr", "anders", "auch", "auf", 
  "aus", "bei", "bin", "bis", "bist", "da", "damit", "dann", "der", "den", "des", "dem", "die", "das", 
  "dass", "daß", "derselbe", "derselben", "denselben", "desselben", "demselben", "dieselbe", "dieselben", 
  "dasselbe", "dazu", "dein", "deine", "deinem", "deinen", "deiner", "deines", "denn", "derer", "dessen", 
  "dich", "dir", "du", "dies", "diese", "diesem", "diesen", "dieser", "dieses", "doch", "dort", "durch", 
  "ein", "eine", "einem", "einen", "einer", "eines", "einig", "einige", "einigem", "einigen", "einiger", 
  "einiges", "einmal", "er", "ihn", "ihm", "es", "etwas", "euer", "eure", "eurem", "euren", "eurer", 
  "eures", "für", "gegen", "gewesen", "hab", "habe", "haben", "hat", "hatte", "hatten", "hier", "hin", 
  "hinter", "ich", "mich", "mir", "ihr", "ihre", "ihrem", "ihren", "ihrer", "ihres", "euch", "im", "in", 
  "indem", "ins", "ist", "jede", "jedem", "jeden", "jeder", "jedes", "jene", "jenem", "jenen", "jener", 
  "jenes", "jetzt", "kann", "kein", "keine", "keinem", "keinen", "keiner", "keines", "können", "könnte", 
  "machen", "man", "manche", "manchem", "manchen", "mancher", "manches", "mein", "meine", "meinem", 
  "meinen", "meiner", "meines", "mit", "muss", "musste", "nach", "nicht", "nichts", "noch", "nun", 
  "nur", "ob", "oder", "ohne", "sehr", "sein", "seine", "seinem", "seinen", "seiner", "seines", "selbst", 
  "sich", "sie", "ihnen", "sind", "so", "solche", "solchem", "solchen", "solcher", "solches", "soll", 
  "sollte", "sondern", "sonst", "über", "um", "und", "uns", "unsere", "unserem", "unseren", "unser", 
  "unseres", "unter", "viel", "vom", "von", "vor", "während", "war", "waren", "warst", "was", "weg", 
  "weil", "weiter", "welche", "welchem", "welchen", "welcher", "welches", "wenn", "werde", "werden", 
  "wieder", "will", "wir", "wird", "wirst", "wo", "wollen", "wollte", "würde", "würden", "zu", "zum", 
  "zur", "zwar", "zwischen"
];

export const TOKENIZER_OPTIONS: string[] = ["tiktoken"]; // As requested, actual implementation simplified
export const TIKTOKEN_MODEL_OPTIONS: string[] = ["gemini-2.5-flash-preview-04-17", "gpt-3.5-turbo", "gpt-4"]; // Example models for tokenizer config

export const WEIGHTING_STRATEGY_OPTIONS: WeightingStrategyType[] = [
  WeightingStrategyType.NONE,
  WeightingStrategyType.POSITION,
  WeightingStrategyType.KEYWORD,
  WeightingStrategyType.COMBINED,
];

export const INITIAL_SETTINGS: Settings = {
  windowSize: 1000, // Word count proxy
  tokenizerName: "tiktoken",
  tiktokenModel: "gemini-2.5-flash-preview-04-17",
  weightingStrategy: WeightingStrategyType.COMBINED,
  dynamicWindowSize: true,
  positionWeightingFactor: 0.5,
  extraStopwords: "",
};