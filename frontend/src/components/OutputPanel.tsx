import React, { memo } from 'react';
import { useEditorStore } from '../context/store';
import { formatExecutionTime } from '../utils/helpers';
import { CodeResultPanel } from './CodeResultPanel';

interface OutputPanelProps {
  onCopy?: (value: string) => void;
}

const formatJudge0Memory = (memoryKb: number) => {
  if (!memoryKb) return '0MB';
  return `${(memoryKb / 1024).toFixed(2)}MB`;
};

export const OutputPanel: React.FC<OutputPanelProps> = memo(({ onCopy }) => {
  const { output, error, isExecuting, executionTime, memory } = useEditorStore();

  return (
    <CodeResultPanel
      title="Program Output"
      value={output}
      placeholder="Program output will appear here"
      isLoading={isExecuting}
      loadingMessage="Running Code..."
      error={error}
      copyLabel="Copy Output"
      onCopy={onCopy}
    >
      {executionTime > 0 && (
        <p className="mt-1 text-xs text-gray-400">
          Execution Time: {formatExecutionTime(executionTime)} | Memory Usage:{' '}
          {formatJudge0Memory(memory)}
        </p>
      )}
    </CodeResultPanel>
  );
});

OutputPanel.displayName = 'OutputPanel';
