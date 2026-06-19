import React, { memo } from 'react';
import { useEditorStore } from '../context/store';

export const InputPanel: React.FC = memo(() => {
  const { stdin, setStdin } = useEditorStore();

  return (
    <section className="flex min-h-[12rem] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-base font-semibold text-white">Standard Input</h2>
      </div>

      <textarea
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
        className="flex-1 resize-none border-0 bg-gray-800 p-4 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Example: 10"
      />
    </section>
  );
});

InputPanel.displayName = 'InputPanel';
