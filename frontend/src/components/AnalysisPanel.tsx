import React, { useState } from 'react';
import { useEditorStore, useAnalysisStore } from '../context/store';
import { analysisAPI } from '../services/api';

const ANALYSIS_TYPES = [
  { id: 'bug-detection', label: 'Bug Detection' },
  { id: 'code-review', label: 'Code Review' },
  { id: 'optimization', label: 'Optimization' },
  { id: 'security-analysis', label: 'Security Analysis' },
  { id: 'complexity-analysis', label: 'Complexity Analysis' },
  { id: 'test-generation', label: 'Test Generation' },
  { id: 'refactoring', label: 'Refactoring' },
];

export const AnalysisPanel: React.FC = () => {
  const { code, language } = useEditorStore();
  const { analysisType, setAnalysisType, analysis, isAnalyzing, setAnalysis, setIsAnalyzing } =
    useAnalysisStore();
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    try {
      setError('');
      setIsAnalyzing(true);
      const response = await analysisAPI.analyze(code, language, analysisType, null);
      setAnalysis(response.data.analysis);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700 space-y-3">
        <h2 className="text-lg font-semibold text-white">AI Code Analysis</h2>

        <select
          value={analysisType}
          onChange={(e) => setAnalysisType(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
        >
          {ANALYSIS_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !code}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded p-3 mb-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isAnalyzing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-center">
              <div className="animate-spin mb-2">⏳</div>
              <p>Analyzing...</p>
            </div>
          </div>
        ) : analysis ? (
          <div className="text-gray-300 text-sm whitespace-pre-wrap">{analysis}</div>
        ) : (
          <p className="text-gray-500">Analysis results will appear here</p>
        )}
      </div>
    </div>
  );
};
