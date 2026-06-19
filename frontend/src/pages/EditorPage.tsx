import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { OutputPanel } from '../components/OutputPanel';
import { InputPanel } from '../components/InputPanel';
import { ExecutionToolbar } from '../components/ExecutionToolbar';
import { CodeResultPanel } from '../components/CodeResultPanel';
import { useEditorStore } from '../context/store';
import { analysisAPI, conversionAPI } from '../services/api';
import { copyToClipboard, formatErrorMessage } from '../utils/helpers';
import { LANGUAGE_LABELS, TRANSLATION_PAIRS } from '../utils/constants';
import type { Language } from '../utils/constants';

const CodeEditor = lazy(() =>
  import('../components/CodeEditor').then((module) => ({ default: module.CodeEditor }))
);

const getSupportedTargets = (sourceLanguage: string) => {
  const targets = new Set<string>();

  TRANSLATION_PAIRS.forEach(([left, right]) => {
    if (left === sourceLanguage) targets.add(right);
    if (right === sourceLanguage) targets.add(left);
  });

  return Array.from(targets);
};

export const EditorPage: React.FC = () => {
  const { code, language, isExecuting } = useEditorStore();
  const [targetLanguage, setTargetLanguage] = useState<Language>('javascript');
  const [optimizeCode, setOptimizeCode] = useState(false);
  const [addHelpfulComments, setAddHelpfulComments] = useState(false);
  const [detectBugs, setDetectBugs] = useState(true);
  const [translatedCode, setTranslatedCode] = useState('');
  const [optimizedCode, setOptimizedCode] = useState('');
  const [bugReport, setBugReport] = useState('');
  const [processingMessage, setProcessingMessage] = useState('');
  const [processError, setProcessError] = useState('');
  const [toast, setToast] = useState('');

  const supportedTargets = useMemo(() => getSupportedTargets(language), [language]);
  const normalizedTarget = supportedTargets.includes(targetLanguage)
    ? targetLanguage
    : (supportedTargets[0] as Language | undefined);
  const isProcessing = Boolean(processingMessage);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handleCopy = useCallback(
    async (value: string) => {
      if (!value) return;
      const copied = await copyToClipboard(value);
      showToast(copied ? 'Copied Successfully' : 'Copy failed');
    },
    [showToast]
  );

  const handleProcessCode = useCallback(async () => {
    if (!code || !normalizedTarget) return;

    try {
      setProcessError('');
      setTranslatedCode('');
      setOptimizedCode('');
      setBugReport('');

      setProcessingMessage('Translating Code...');
      const conversionResponse = await conversionAPI.convert(
        code,
        language,
        normalizedTarget,
        addHelpfulComments
      );
      const converted = conversionResponse.data.convertedCode || '';
      setTranslatedCode(converted);

      if (optimizeCode) {
        setProcessingMessage('Optimizing Code...');
        const optimizationResponse = await analysisAPI.analyze(
          converted,
          normalizedTarget,
          'optimization',
          null
        );
        setOptimizedCode(optimizationResponse.data.analysis || '');
      }

      if (detectBugs) {
        setProcessingMessage('Detecting Bugs...');
        const bugResponse = await analysisAPI.analyze(code, language, 'bug-detection', null);
        setBugReport(bugResponse.data.analysis || '');
      }
    } catch (error) {
      setProcessError(formatErrorMessage(error));
    } finally {
      setProcessingMessage('');
    }
  }, [addHelpfulComments, code, detectBugs, language, normalizedTarget, optimizeCode]);

  const outputGridClass = optimizeCode
    ? 'grid gap-4 lg:grid-cols-3'
    : 'grid gap-4 lg:grid-cols-2';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-700 bg-gray-900 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">CodeLingo</h1>
            <p className="text-sm text-gray-400">Translate, analyze, optimize, comment, and run code.</p>
          </div>
          {toast && (
            <div className="rounded border border-green-600 bg-green-950 px-3 py-2 text-sm text-green-200">
              {toast}
            </div>
          )}
        </div>
      </header>

      <main className="space-y-4 p-4 sm:p-6">
        <section className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-sm text-gray-300">Target Language</span>
                <select
                  value={normalizedTarget || ''}
                  onChange={(event) => setTargetLanguage(event.target.value as Language)}
                  className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                >
                  {supportedTargets.length === 0 ? (
                    <option value="">No supported target</option>
                  ) : (
                    supportedTargets.map((target) => (
                      <option key={target} value={target}>
                        {LANGUAGE_LABELS[target as Language]}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="flex items-center gap-3 rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100">
                <input
                  type="checkbox"
                  checked={optimizeCode}
                  onChange={(event) => setOptimizeCode(event.target.checked)}
                  className="h-4 w-4 accent-blue-500"
                />
                Optimize Code
              </label>

              <label className="flex items-center gap-3 rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100">
                <input
                  type="checkbox"
                  checked={addHelpfulComments}
                  onChange={(event) => setAddHelpfulComments(event.target.checked)}
                  className="h-4 w-4 accent-blue-500"
                />
                Add Helpful Comments
              </label>

              <label className="flex items-center gap-3 rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100">
                <input
                  type="checkbox"
                  checked={detectBugs}
                  onChange={(event) => setDetectBugs(event.target.checked)}
                  className="h-4 w-4 accent-blue-500"
                />
                Detect Bugs
              </label>
            </div>

            <button
              type="button"
              onClick={handleProcessCode}
              disabled={isProcessing || isExecuting || !code || !normalizedTarget}
              className="rounded bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? processingMessage : 'Translate Code'}
            </button>
          </div>

          {processError && (
            <div className="mt-4 rounded border border-red-700 bg-red-950/40 p-3 text-sm text-red-300">
              {processError}
            </div>
          )}
        </section>

        <section className={outputGridClass}>
          <div className="space-y-4">
            <Suspense
              fallback={
                <div className="flex min-h-[30rem] items-center justify-center rounded-lg border border-gray-700 bg-gray-900 text-gray-300">
                  Loading editor...
                </div>
              }
            >
              <CodeEditor />
            </Suspense>
            <InputPanel />
            <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
              <ExecutionToolbar />
              <OutputPanel onCopy={handleCopy} />
            </div>
          </div>

          <CodeResultPanel
            title="Translated Output"
            value={translatedCode}
            placeholder="Translated code will appear here"
            isLoading={processingMessage === 'Translating Code...'}
            loadingMessage="Translating Code..."
            copyLabel="Copy Translated Code"
            onCopy={handleCopy}
          >
            {normalizedTarget && (
              <p className="mt-1 text-xs text-gray-400">
                {LANGUAGE_LABELS[language as Language]} to {LANGUAGE_LABELS[normalizedTarget]}
              </p>
            )}
          </CodeResultPanel>

          {optimizeCode && (
            <CodeResultPanel
              title="Optimized Output"
              value={optimizedCode}
              placeholder="Optimized code will appear here"
              isLoading={processingMessage === 'Optimizing Code...'}
              loadingMessage="Optimizing Code..."
              copyLabel="Copy Optimized Code"
              onCopy={handleCopy}
            />
          )}
        </section>

        {detectBugs && (
          <CodeResultPanel
            title="Detected Issues"
            value={bugReport}
            placeholder="Bug detection results will appear here"
            isLoading={processingMessage === 'Detecting Bugs...'}
            loadingMessage="Detecting Bugs..."
          />
        )}
      </main>
    </div>
  );
};
