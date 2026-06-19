import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../utils/types';

interface AuthStore {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
}

interface EditorStore {
  code: string;
  language: string;
  stdin: string;
  output: string;
  error: string;
  isExecuting: boolean;
  executionTime: number;
  memory: number;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setStdin: (stdin: string) => void;
  setOutput: (output: string) => void;
  setError: (error: string) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  setExecutionTime: (executionTime: number) => void;
  setMemory: (memory: number) => void;
  clear: () => void;
}

interface AnalysisStore {
  analysisType: string;
  selectedProvider: string | null;
  analysis: string;
  isAnalyzing: boolean;
  setAnalysisType: (type: string) => void;
  setSelectedProvider: (provider: string | null) => void;
  setAnalysis: (analysis: string) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
}

interface SettingsStore {
  preferredProvider: string;
  configuredProviders: string[];
  aiProviderConsent: {
    accepted: boolean;
    acceptedAt: string | null;
    consentText: string;
  };
  consentText: string;
  isLoading: boolean;
  setPreferredProvider: (provider: string) => void;
  setConfiguredProviders: (providers: string[]) => void;
  setAiProviderConsent: (consent: SettingsStore['aiProviderConsent']) => void;
  setConsentText: (consentText: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useEditorStore = create<EditorStore>((set) => ({
  code: '',
  language: 'python',
  stdin: '',
  output: '',
  error: '',
  isExecuting: false,
  executionTime: 0,
  memory: 0,
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setStdin: (stdin) => set({ stdin }),
  setOutput: (output) => set({ output }),
  setError: (error) => set({ error }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  setExecutionTime: (executionTime) => set({ executionTime }),
  setMemory: (memory) => set({ memory }),
  clear: () => set({ code: '', stdin: '', output: '', error: '' }),
}));

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  analysisType: 'code-review',
  selectedProvider: null,
  analysis: '',
  isAnalyzing: false,
  setAnalysisType: (analysisType) => set({ analysisType }),
  setSelectedProvider: (selectedProvider) => set({ selectedProvider }),
  setAnalysis: (analysis) => set({ analysis }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
}));

export const useSettingsStore = create<SettingsStore>((set) => ({
  preferredProvider: 'groq',
  configuredProviders: [],
  aiProviderConsent: {
    accepted: false,
    acceptedAt: null,
    consentText: '',
  },
  consentText:
    'I understand that my submitted code may be sent to my selected AI provider for processing.',
  isLoading: false,
  setPreferredProvider: (preferredProvider) => set({ preferredProvider }),
  setConfiguredProviders: (configuredProviders) => set({ configuredProviders }),
  setAiProviderConsent: (aiProviderConsent) => set({ aiProviderConsent }),
  setConsentText: (consentText) => set({ consentText }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
