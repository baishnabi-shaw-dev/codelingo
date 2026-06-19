import React, { memo, useRef, useState } from 'react';
import { useEditorStore } from '../context/store';
import { codeAPI } from '../services/api';
import { LANGUAGE_LABELS } from '../utils/constants';

const formatExecutionError = (language: string, status: string, error: string) => {
  const label = LANGUAGE_LABELS[language as keyof typeof LANGUAGE_LABELS] || language;
  const lowerStatus = status.toLowerCase();

  if (lowerStatus.includes('compilation')) return `${label} Compilation Error\n${error}`;
  if (lowerStatus.includes('time limit')) return 'Execution Timeout';
  if (lowerStatus.includes('runtime') || lowerStatus.includes('signal')) {
    return `${label} Runtime Error\n${error}`;
  }

  return error || status;
};

export const ExecutionToolbar: React.FC = memo(() => {
  const {
    code,
    language,
    stdin,
    setOutput,
    setError: setExecutionError,
    isExecuting,
    setIsExecuting,
    setExecutionTime,
    setMemory,
  } = useEditorStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [toolbarError, setToolbarError] = useState('');

  const handleExecute = async () => {
    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setToolbarError('');
      setOutput('');
      setExecutionError('');
      setExecutionTime(0);
      setMemory(0);
      setIsExecuting(true);

      const response = await codeAPI.execute(code, language, stdin, controller.signal);
      const { output, error: execError, executionTime, memory, status } = response.data;

      setOutput(output);
      if (execError) {
        setExecutionError(formatExecutionError(language, status || '', execError));
      }
      setExecutionTime(executionTime);
      setMemory(memory);
    } catch (err: unknown) {
      const requestError = err as {
        name?: string;
        code?: string;
        response?: { data?: { message?: string } };
      };
      const errorMsg =
        requestError.name === 'CanceledError' || requestError.code === 'ERR_CANCELED'
          ? 'Execution stopped'
          : requestError.response?.data?.message || 'Execution failed';
      setToolbarError(errorMsg);
      setExecutionError(errorMsg);
    } finally {
      abortControllerRef.current = null;
      setIsExecuting(false);
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsExecuting(false);
    setExecutionError('Execution stopped');
  };

  const handleClear = () => {
    const store = useEditorStore.getState();
    store.clear();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-t-lg border-b border-gray-700 bg-gray-800 p-4">
      <button
        onClick={handleExecute}
        disabled={isExecuting || !code}
        className="rounded bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Run
      </button>

      <button
        onClick={handleStop}
        disabled={!isExecuting}
        className="rounded bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Stop
      </button>

      <button
        onClick={handleClear}
        disabled={isExecuting}
        className="rounded bg-gray-700 px-5 py-2 text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Clear
      </button>

      {toolbarError && (
        <div className="flex min-w-[12rem] flex-1 items-center text-sm text-red-400">
          <span className="truncate">{toolbarError}</span>
        </div>
      )}
    </div>
  );
});

ExecutionToolbar.displayName = 'ExecutionToolbar';
