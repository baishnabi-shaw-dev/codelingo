import React, { memo } from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '../context/store';
import { LANGUAGE_LABELS, MONACO_LANGUAGE_MAP, SUPPORTED_LANGUAGES } from '../utils/constants';

export const CodeEditor: React.FC = memo(() => {
  const { code, language, setCode, setLanguage } = useEditorStore();

  return (
    <div className="flex min-h-[30rem] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      <div className="flex items-center justify-between gap-3 border-b border-gray-700 p-4">
        <h2 className="text-base font-semibold text-white">Input Code</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white hover:border-gray-600"
        >
          {Object.keys(SUPPORTED_LANGUAGES).map((lang) => (
            <option key={lang} value={lang}>
              {LANGUAGE_LABELS[lang as keyof typeof LANGUAGE_LABELS]}
            </option>
          ))}
        </select>
      </div>

      <Editor
        height="100%"
        language={MONACO_LANGUAGE_MAP[language] || language}
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';
