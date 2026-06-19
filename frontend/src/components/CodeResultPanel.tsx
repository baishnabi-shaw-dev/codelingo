import React, { memo } from 'react';

interface CodeResultPanelProps {
  title: string;
  value: string;
  placeholder: string;
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string;
  copyLabel?: string;
  onCopy?: (value: string) => void;
  children?: React.ReactNode;
}

export const CodeResultPanel = memo(
  ({
    title,
    value,
    placeholder,
    isLoading = false,
    loadingMessage = 'Processing...',
    error = '',
    copyLabel = 'Copy',
    onCopy,
    children,
  }: CodeResultPanelProps) => {
    const canCopy = value.trim().length > 0 && !isLoading;

    return (
      <section className="flex min-h-[22rem] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
        <div className="flex min-h-[4rem] items-center justify-between gap-3 border-b border-gray-700 p-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white">{title}</h2>
            {children}
          </div>
          {onCopy && (
            <button
              type="button"
              onClick={() => onCopy(value)}
              disabled={!canCopy}
              className="shrink-0 rounded border border-gray-600 px-3 py-2 text-sm font-medium text-gray-100 transition hover:border-blue-400 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copyLabel}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex h-full min-h-[12rem] items-center justify-center text-center text-gray-300">
              <div>
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                <p>{loadingMessage}</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded border border-red-700 bg-red-950/40 p-3">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm text-red-300">{error}</pre>
            </div>
          ) : value ? (
            <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-gray-100">
              {value}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">{placeholder}</p>
          )}
        </div>
      </section>
    );
  }
);

CodeResultPanel.displayName = 'CodeResultPanel';
