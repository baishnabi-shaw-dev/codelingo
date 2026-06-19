import React from 'react';
import { Link } from 'react-router-dom';

const aiProcessingUses = [
  'Code Translation',
  'Code Optimization',
  'Bug Detection',
  'Code Review',
  'Security Analysis',
  'Documentation Generation',
];

const securityMeasures = [
  'HTTPS enforced in production',
  'Encrypted API key storage',
  'Backend-only AI provider communication',
  'Rate limiting',
  'Input validation',
];

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-gray-100 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-blue-300 hover:text-blue-200">
          Back to CodeLingo
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-400">Last updated: June 19, 2026</p>

        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-white">AI Processing</h2>
          <p>
            User-submitted source code may be sent to the AI provider selected by the user for the
            specific services requested in CodeLingo.
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-300">
            {aiProcessingUses.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-white">User API Keys</h2>
          <p>
            CodeLingo does not automatically create Groq, Gemini, OpenRouter, or any third-party API
            accounts on behalf of users. Users connect their own provider account by entering their
            own API key.
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-300">
            <li>API keys are encrypted before storage.</li>
            <li>API keys are only used to process user requests.</li>
            <li>API keys are never sold, shared, or exposed to other users.</li>
            <li>Users may delete their API keys at any time.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-white">Code Ownership</h2>
          <ul className="list-disc space-y-2 pl-6 text-gray-300">
            <li>Users retain ownership of all submitted code.</li>
            <li>CodeLingo does not claim ownership of user code.</li>
            <li>Code is processed solely to provide requested services.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-white">Security</h2>
          <ul className="list-disc space-y-2 pl-6 text-gray-300">
            {securityMeasures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-white">User Consent</h2>
          <p>
            Before connecting an AI provider, users must explicitly agree to this statement:
          </p>
          <blockquote className="rounded border border-gray-700 bg-gray-900 p-4 text-gray-200">
            I understand that my submitted code may be sent to my selected AI provider for
            processing.
          </blockquote>
          <p>
            CodeLingo stores the consent status and timestamp in the user account record.
          </p>
        </section>
      </div>
    </main>
  );
};
