import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { settingsAPI } from '../services/api';
import { useSettingsStore, useAuthStore } from '../context/store';
import { formatErrorMessage } from '../utils/helpers';

const PROVIDERS = [
  {
    id: 'groq',
    name: 'Groq',
    description: 'Connect an API key from your own Groq account.',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Connect an API key from your own Google AI Studio account.',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Connect an API key from your own OpenRouter account.',
  },
];

export const SettingsPage: React.FC = () => {
  const { logout } = useAuthStore();
  const {
    preferredProvider,
    setPreferredProvider,
    configuredProviders,
    setConfiguredProviders,
    aiProviderConsent,
    setAiProviderConsent,
    consentText,
    setConsentText,
  } = useSettingsStore();
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setPreferredProvider(response.data.preferredProvider);
      setConfiguredProviders(response.data.configuredProviders);
      setAiProviderConsent(response.data.aiProviderConsent);
      setConsentText(response.data.consentText);
      setConsentAccepted(response.data.aiProviderConsent?.accepted || false);
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    }
  };

  const handleSaveApiKey = async () => {
    if (!activeProvider || !apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (!consentAccepted) {
      setError('Please confirm the AI provider processing consent before saving an API key.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      await settingsAPI.updateApiKey(activeProvider, apiKey, consentAccepted, consentText);
      setMessage(`${activeProvider} API key saved successfully`);
      setApiKey('');
      setActiveProvider(null);
      await loadSettings();

      setTimeout(() => setMessage(''), 3000);
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSetPreferredProvider = async (provider: string) => {
    try {
      await settingsAPI.setPreferredProvider(provider);
      setPreferredProvider(provider);
      setMessage(`Preferred provider set to ${provider}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    }
  };

  const handleDeleteApiKey = async (provider: string) => {
    try {
      setLoading(true);
      setError('');
      await settingsAPI.deleteApiKey(provider);
      setMessage(`${provider} API key deleted`);
      await loadSettings();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-900/20 border border-green-700 rounded p-4 mb-6">
            <p className="text-green-400">{message}</p>
          </div>
        )}

        {/* API Keys Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">AI Provider Configuration</h2>
          <p className="text-gray-400 mb-4">
            CodeLingo does not create Groq, Gemini, OpenRouter, or other third-party accounts for
            you. Connect an API key from your own provider account to enable AI-powered code tools.
          </p>
          <p className="mb-4 text-sm">
            <Link to="/privacy" className="text-blue-300 hover:text-blue-200">
              Review the Privacy Policy
            </Link>
          </p>
          <div className="mb-6 rounded border border-blue-700 bg-blue-950/30 p-4 text-sm text-blue-100">
            API keys are sent only to the backend, encrypted before storage, never logged, and never
            returned to the browser after saving.
          </div>

          <div className="space-y-4">
            {PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{provider.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{provider.description}</p>

                    {activeProvider === provider.id ? (
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder={`Enter your ${provider.name} API key`}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoComplete="off"
                        />
                        <label className="flex items-start gap-3 rounded border border-gray-700 bg-gray-900 p-3 text-sm text-gray-200">
                          <input
                            type="checkbox"
                            checked={consentAccepted}
                            onChange={(event) => setConsentAccepted(event.target.checked)}
                            className="mt-1 h-4 w-4 accent-blue-500"
                          />
                          <span>{consentText}</span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveApiKey}
                            disabled={loading || !consentAccepted}
                            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition"
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setActiveProvider(null);
                              setApiKey('');
                            }}
                            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveProvider(provider.id)}
                          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                        >
                          {configuredProviders.includes(provider.id) ? 'Update' : 'Add'} API Key
                        </button>
                        {configuredProviders.includes(provider.id) && (
                          <span className="inline-flex items-center px-3 py-2 rounded bg-green-900/30 border border-green-700 text-green-400 text-sm">
                            Configured
                          </span>
                        )}
                        {configuredProviders.includes(provider.id) && (
                          <button
                            onClick={() => handleDeleteApiKey(provider.id)}
                            disabled={loading}
                            className="px-4 py-2 bg-red-900/50 border border-red-700 rounded text-red-200 hover:bg-red-900 disabled:opacity-50 transition"
                          >
                            Delete Key
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Provider Section */}
        {configuredProviders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Preferred AI Provider</h2>
            <div className="space-y-2">
              {PROVIDERS.filter((p) => configuredProviders.includes(p.id)).map((provider) => (
                <label key={provider.id} className="flex items-center p-3 bg-gray-800 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition">
                  <input
                    type="radio"
                    name="preferredProvider"
                    value={provider.id}
                    checked={preferredProvider === provider.id}
                    onChange={() => handleSetPreferredProvider(provider.id)}
                    className="mr-3"
                  />
                  <span>{provider.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-4">
          <h2 className="mb-2 text-2xl font-semibold">Consent Status</h2>
          <p className="text-sm text-gray-300">
            {aiProviderConsent.accepted
              ? `AI provider processing consent accepted${
                  aiProviderConsent.acceptedAt
                    ? ` on ${new Date(aiProviderConsent.acceptedAt).toLocaleString()}`
                    : ''
                }.`
              : 'AI provider processing consent has not been accepted yet.'}
          </p>
        </div>

        {/* Account Section */}
        <div className="border-t border-gray-700 pt-8">
          <h2 className="text-2xl font-semibold mb-4">Account</h2>
          <button
            onClick={() => logout()}
            className="px-6 py-2 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
