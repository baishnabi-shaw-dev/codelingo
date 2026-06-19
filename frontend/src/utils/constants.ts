// Supported programming languages for code execution
export const SUPPORTED_LANGUAGES = {
  java: { id: 26, name: 'Java' },
  python: { id: 71, name: 'Python' },
  javascript: { id: 63, name: 'JavaScript' },
  typescript: { id: 74, name: 'TypeScript' },
  c: { id: 50, name: 'C' },
  cpp: { id: 54, name: 'C++' },
  csharp: { id: 51, name: 'C#' },
  go: { id: 60, name: 'Go' },
  rust: { id: 73, name: 'Rust' },
  php: { id: 68, name: 'PHP' },
} as const;

export const LANGUAGE_LABELS: Record<keyof typeof SUPPORTED_LANGUAGES, string> = {
  java: 'Java',
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
};

export const TRANSLATION_PAIRS = [
  ['java', 'python'],
  ['java', 'javascript'],
  ['java', 'cpp'],
  ['python', 'javascript'],
  ['python', 'cpp'],
  ['c', 'cpp'],
  ['cpp', 'javascript'],
  ['csharp', 'java'],
  ['go', 'python'],
  ['rust', 'cpp'],
] as const;

// Language to Monaco Editor language ID mapping
export const MONACO_LANGUAGE_MAP: Record<string, string> = {
  java: 'java',
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  php: 'php',
};

// AI Analysis types
export const ANALYSIS_TYPES = {
  'bug-detection': 'Bug Detection',
  'code-review': 'Code Review',
  optimization: 'Optimization',
  'security-analysis': 'Security Analysis',
  'complexity-analysis': 'Complexity Analysis',
  'test-generation': 'Test Generation',
  refactoring: 'Refactoring',
} as const;

// AI Providers
export const AI_PROVIDERS = {
  groq: {
    id: 'groq',
    name: 'Groq',
    description: 'Fast and free AI provider',
    color: '#FF6B35',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: "Google's AI model",
    color: '#4285F4',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Multi-model AI aggregator',
    color: '#FF6B9D',
  },
} as const;

export type Language = keyof typeof SUPPORTED_LANGUAGES;
export type AnalysisType = keyof typeof ANALYSIS_TYPES;
export type AIProvider = keyof typeof AI_PROVIDERS;
