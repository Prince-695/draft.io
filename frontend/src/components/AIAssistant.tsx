'use client';

import { useState } from 'react';

interface AIAssistantProps {
  onGenerate: (prompt: string, type: 'generate' | 'improve' | 'grammar' | 'seo') => void;
  isLoading?: boolean;
}

export function AIAssistant({ onGenerate, isLoading = false }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const suggestions = [
    { type: 'generate' as const, label: 'Generate Content', icon: '✨', desc: 'Create content from prompt' },
    { type: 'improve' as const, label: 'Improve Writing', icon: '📝', desc: 'Enhance selected text' },
    { type: 'grammar' as const, label: 'Fix Grammar', icon: '✓', desc: 'Check & fix grammar' },
    { type: 'seo' as const, label: 'SEO Optimize', icon: '🎯', desc: 'Optimize for search' },
  ];

  const handleAction = (type: 'generate' | 'improve' | 'grammar' | 'seo') => {
    if (type === 'generate' && !prompt.trim()) {
      return;
    }
    onGenerate(prompt, type);
    if (type === 'generate') {
      setPrompt('');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-2xl z-50"
        title="AI Assistant"
      >
        ✨
      </button>

      {/* Sidebar Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-2xl z-40 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">AI Writing Assistant</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Generate Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Generate Content</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to write about..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
              />
              <button
                onClick={() => handleAction('generate')}
                disabled={!prompt.trim() || isLoading}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : '✨ Generate'}
              </button>
            </div>

            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Quick Actions
              </label>
              <div className="space-y-2">
                {suggestions.slice(1).map((suggestion) => (
                  <button
                    key={suggestion.type}
                    onClick={() => handleAction(suggestion.type)}
                    disabled={isLoading}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{suggestion.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{suggestion.label}</div>
                        <div className="text-xs text-gray-500">{suggestion.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Writing Tips
              </label>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <strong>💡 Tip:</strong> Select text before using Improve or Grammar check
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <strong>🎯 SEO:</strong> Use relevant keywords naturally in your content
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <strong>📈 Engagement:</strong> Start with a compelling hook
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
