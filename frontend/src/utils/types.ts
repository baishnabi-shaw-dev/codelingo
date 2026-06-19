export type JSON =
  | string
  | number
  | boolean
  | null
  | JSON[]
  | { [key: string]: JSON };

export interface User {
  id: string;
  email: string;
  username: string;
  preferredProvider: 'groq' | 'gemini' | 'openrouter';
}

export interface CodeExecutionResult {
  success: boolean;
  output: string;
  error: string;
  status: string;
  executionTime: number;
  memory: number;
}

export interface CodeAnalysisResult {
  analysis: string;
}

export interface UserSettings {
  preferredProvider: 'groq' | 'gemini' | 'openrouter';
  configuredProviders: ('groq' | 'gemini' | 'openrouter')[];
  aiProviderConsent: {
    accepted: boolean;
    acceptedAt: string | null;
    consentText: string;
  };
  consentText: string;
}
