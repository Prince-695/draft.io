'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { AIAssistant } from '@/components/AIAssistant';
import { ROUTES } from '@/utils/constants';
import { 
  useGenerateContent, 
  useImproveContent, 
  useGrammarCheck, 
  useSEOSuggestions 
} from '@/hooks/useAI';
import { getErrorMessage } from '@/utils/helpers';

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [error, setError] = useState<string | null>(null);

  // AI hooks
  const { mutate: generateContent, isPending: isGenerating } = useGenerateContent();
  const { mutate: improveContent, isPending: isImproving } = useImproveContent();
  const { mutate: checkGrammar, isPending: isCheckingGrammar } = useGrammarCheck();
  const { mutate: getSEO, isPending: isGettingSEO } = useSEOSuggestions();

  const aiLoading = isGenerating || isImproving || isCheckingGrammar || isGettingSEO;

  const handleSave = async () => {
    try {
      // TODO: Call API to save blog
      console.log({ title, content, tags, coverImage, status });
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Failed to save blog:', error);
    }
  };

  const handlePublish = async () => {
    setStatus('published');
    await handleSave();
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAIGenerate = async (prompt: string, type: 'generate' | 'improve' | 'grammar' | 'seo') => {
    setError(null);
    
    try {
      switch (type) {
        case 'generate':
          // Generate new content from prompt
          generateContent(
            { prompt, context: content },
            {
              onSuccess: (response) => {
                if (response.data?.result) {
                  // Append generated content to existing content
                  setContent(content + '\n\n' + response.data.result);
                }
              },
              onError: (err) => {
                setError(getErrorMessage(err));
              },
            }
          );
          break;

        case 'improve':
          // Improve existing content
          if (!content) {
            setError('Please write some content first before improving');
            return;
          }
          improveContent(
            { content, instructions: prompt },
            {
              onSuccess: (response) => {
                if (response.data?.result) {
                  setContent(response.data.result);
                }
              },
              onError: (err) => {
                setError(getErrorMessage(err));
              },
            }
          );
          break;

        case 'grammar':
          // Check grammar and spelling
          if (!content) {
            setError('Please write some content first before checking grammar');
            return;
          }
          checkGrammar(content, {
            onSuccess: (response) => {
              if (response.data?.result) {
                setContent(response.data.result);
              }
            },
            onError: (err) => {
              setError(getErrorMessage(err));
            },
          });
          break;

        case 'seo':
          // Get SEO suggestions
          if (!title || !content) {
            setError('Please add title and content first for SEO analysis');
            return;
          }
          getSEO(
            { title, content },
            {
              onSuccess: (response) => {
                console.log('SEO Suggestions:', response.data?.suggestions);
                // You could show these in a modal or side panel
              },
              onError: (err) => {
                setError(getErrorMessage(err));
              },
            }
          );
          break;
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      setError('Failed to process AI request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b sticky top-0 bg-white z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <div className="flex justify-between items-start">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Cover Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Cover Image URL (optional)</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {coverImage && (
            <div className="mt-4 relative h-64 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={coverImage}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Blog Title..."
          className="w-full text-4xl font-bold border-none focus:outline-none mb-4 placeholder:text-gray-300"
        />

        {/* Tags */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tags (press Enter)..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={addTag}
              type="button"
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Editor */}
        <Editor
          content={content}
          onChange={setContent}
          placeholder="Start writing your amazing blog..."
        />
      </div>

      {/* AI Assistant */}
      <AIAssistant onGenerate={handleAIGenerate} isLoading={aiLoading} />
    </div>
  );
}
