'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { AIToolbar } from '@/components/AIToolbar';
import { ROUTES } from '@/utils/constants';
import { 
  useGenerateContent, 
  useImproveContent, 
  useGrammarCheck, 
  useSEOSuggestions 
} from '@/hooks/useAI';
import { getErrorMessage } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      <div className="border-b sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSave}
            >
              Save Draft
            </Button>
            <Button
              onClick={handlePublish}
            >
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-md bg-destructive/15 p-4 text-sm text-destructive border border-destructive/30">
            <div className="flex justify-between items-start">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="h-auto p-0 hover:bg-transparent"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Cover Image */}
        <div className="mb-6">
          <Label htmlFor="coverImage" className="mb-2">Cover Image URL (optional)</Label>
          <Input
            id="coverImage"
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          {coverImage && (
            <div className="mt-4 relative h-64 bg-muted rounded-lg overflow-hidden">
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
          className="w-full text-4xl font-bold border-none focus:outline-none mb-4 placeholder:text-muted-foreground bg-transparent"
        />

        {/* Tags */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
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
              className="flex-1"
            />
            <Button
              onClick={addTag}
              type="button"
              variant="secondary"
            >
              Add
            </Button>
          </div>
        </div>

        {/* AI Toolbar */}
        <div className="mb-4 rounded-lg border border-border overflow-hidden">
          <AIToolbar onGenerate={handleAIGenerate} isLoading={aiLoading} />
        </div>

        {/* Editor */}
        <Editor
          content={content}
          onChange={setContent}
          placeholder="Start writing your amazing blog..."
        />
      </div>
    </div>
  );
}
