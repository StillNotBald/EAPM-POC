import React, { useState } from 'react';
import { getPortfolioInsights } from '../../services/geminiService';
import { Application } from '../../types';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  apps: Application[];
}

export const AIPanel: React.FC<AIPanelProps> = ({ isOpen, onClose, apps }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);

  const handleAsk = async () => {
    if (!query.trim() || !apiKey) return;
    setLoading(true);
    const result = await getPortfolioInsights(apps, query, apiKey);
    setResponse(result);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F0F4F9]">
        <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
           ✨ Portfolio AI
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {!isKeySet ? (
          <div className="flex flex-col gap-4 mt-10">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                🔑
              </div>
              <h3 className="font-semibold text-gray-900">Enter API Key</h3>
              <p className="text-xs text-gray-500 px-4">
                To use Portfolio AI, please provide your Gemini API key. It is not stored on any server.
              </p>
            </div>
            
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste Gemini API Key here"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
            
            <button
              onClick={() => apiKey && setIsKeySet(true)}
              disabled={!apiKey}
              className="w-full bg-blue-600 text-white rounded-full py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Chat
            </button>
            
            <p className="text-center text-[10px] text-gray-400">
              Get a key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="underline hover:text-blue-500">Google AI Studio</a>
            </p>
          </div>
        ) : (
          <>
            {!response && !loading && (
              <div className="text-center text-gray-500 mt-10 space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   💡
                </div>
                <p className="text-sm">Ask detailed questions about your application portfolio.</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setQuery("Identify high risk applications that contain PII")} className="text-xs bg-gray-50 hover:bg-gray-100 p-2 rounded-lg text-left">"Identify high risk apps with PII"</button>
                  <button onClick={() => setQuery("Which applications should we eliminate based on the TIME model?")} className="text-xs bg-gray-50 hover:bg-gray-100 p-2 rounded-lg text-left">"Candidates for Elimination"</button>
                  <button onClick={() => setQuery("Summarize the health of the Core tier")} className="text-xs bg-gray-50 hover:bg-gray-100 p-2 rounded-lg text-left">"Health of Core Tier"</button>
                </div>
              </div>
            )}

            {loading && (
               <div className="flex flex-col items-center justify-center h-40 space-y-3">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                 <p className="text-sm text-gray-500">Analyzing portfolio data...</p>
               </div>
            )}

            {response && (
              <div className="prose prose-sm prose-blue">
                <div className="bg-blue-50 p-4 rounded-xl text-gray-800 whitespace-pre-line">
                  {response}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isKeySet && (
        <div className="p-4 border-t border-gray-100 bg-white">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none resize-none h-24 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setIsKeySet(false); setApiKey(''); setResponse(null); setQuery(''); }}
              className="px-3 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500"
              title="Change API Key"
            >
              🔑
            </button>
            <button
              onClick={handleAsk}
              disabled={loading || !query}
              className="flex-1 bg-gray-900 text-white rounded-full py-2.5 text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
            >
              Generate Insights
            </button>
          </div>
        </div>
      )}
    </div>
  );
};