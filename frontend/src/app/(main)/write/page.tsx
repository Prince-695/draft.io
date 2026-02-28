'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { marked } from 'marked';
import { Editor } from '@/components/Editor';
import { AIToolbar } from '@/components/AIToolbar';
import { ROUTES } from '@/utils/constants';
import { 
  useGenerateContent, 
  useImproveContent, 
  useGrammarCheck, 
  useSEOSuggestions 
} from '@/hooks/useAI';
import { useUIStore } from '@/stores/uiStore';
import { useCreateBlog, usePublishBlog, useUpdateBlog } from '@/hooks/useBlog';
import { blogApi } from '@/lib/api';
import { getErrorMessage } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X, Cloud, CloudOff, Loader2 } from 'lucide-react';

function WritePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingBlog, setIsLoadingBlog] = useState(!!editId);
  // Keeps the last 4 messages (2 exchanges) of AI conversation context
  const [aiHistory, setAiHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  // AI hooks
  const { mutate: generateContent, isPending: isGenerating } = useGenerateContent();
  const { mutate: improveContent, isPending: isImproving } = useImproveContent();
  const { mutate: checkGrammar, isPending: isCheckingGrammar } = useGrammarCheck();
  const { mutate: getSEO, isPending: isGettingSEO } = useSEOSuggestions();
  const incrementAIUsage = useUIStore((s) => s.incrementAIUsage);

  // Blog mutation hooks
  const createBlogMutation = useCreateBlog();
  const publishBlogMutation = usePublishBlog();
  const updateBlogMutation = useUpdateBlog();
  const [isSaving, setIsSaving] = useState(false);
  const [savedBlogId, setSavedBlogId] = useState<string | null>(editId); // tracks autosaved draft id
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing blog when in edit mode
  useEffect(() => {
    if (!editId) return;
    setIsLoadingBlog(true);
    blogApi.getBlogById(editId)
      .then((res) => {
        const blog = (res as any)?.data ?? res;
        if (blog) {
          setTitle(blog.title ?? '');
          setContent(blog.content ?? '');
          setCoverImage(blog.cover_image_url ?? '');
          setStatus(blog.status ?? 'draft');
          // Tags may be objects {id, name} or plain strings
          if (Array.isArray(blog.tags)) {
            setTags(blog.tags.map((t: any) => (typeof t === 'object' ? t.name : t)));
          }
        }
      })
      .catch((err) => {
        setError('Failed to load blog: ' + getErrorMessage(err));
      })
      .finally(() => setIsLoadingBlog(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // Auto-save: 30 seconds after the last edit to title or content
  useEffect(() => {
    if (!title.trim() && !content.trim()) return;
    setAutoSaveStatus('idle');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        if (savedBlogId) {
          await updateBlogMutation.mutateAsync({
            id: savedBlogId,
            data: { title, content, tags, cover_image_url: coverImage || undefined, status: 'draft' },
          });
        } else if (title.trim()) {
          const res = await createBlogMutation.mutateAsync({
            title,
            content,
            tags,
            cover_image_url: coverImage || undefined,
            status: 'draft',
          });
          if (res?.data?.blog?.id) setSavedBlogId(res.data.blog.id);
        }
        setAutoSaveStatus('saved');
      } catch {
        setAutoSaveStatus('idle');
      }
    }, 30_000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tags, coverImage]);

  const aiLoading = isGenerating || isImproving || isCheckingGrammar || isGettingSEO;

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!content.trim()) { setError('Content is required'); return; }
    setIsSaving(true);
    setError(null);
    try {
      if (savedBlogId) {
        await updateBlogMutation.mutateAsync({
          id: savedBlogId,
          data: { title, content, tags, cover_image_url: coverImage || undefined, status: 'draft' },
        });
      } else {
        const res = await createBlogMutation.mutateAsync({
          title, content, tags, cover_image_url: coverImage || undefined, status: 'draft',
        });
        if (res?.data?.blog?.id) setSavedBlogId(res.data.blog.id);
      }
      setAutoSaveStatus('saved');
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!content.trim()) { setError('Content is required'); return; }
    setIsSaving(true);
    setError(null);
    try {
      let blogId = savedBlogId;
      if (blogId) {
        // Update the existing draft to published
        const res = await updateBlogMutation.mutateAsync({
          id: blogId,
          data: { title, content, tags, cover_image_url: coverImage || undefined, status: 'published' },
        });
        blogId = res?.data?.blog?.id || blogId;
      } else {
        const res = await createBlogMutation.mutateAsync({
          title, content, tags, cover_image_url: coverImage || undefined, status: 'published',
        });
        blogId = res?.data?.blog?.id ?? null;
        if (blogId) setSavedBlogId(blogId);
      }
      // Explicitly publish via the publish endpoint (blog service may require it)
      if (blogId) {
        try {
          await publishBlogMutation.mutateAsync(blogId);
        } catch (publishErr: any) {
          // Swallow only "already published" errors; surface everything else
          const msg: string = publishErr?.response?.data?.error ?? '';
          if (!msg.toLowerCase().includes('already published')) throw publishErr;
        }
      }
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
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
                incrementAIUsage();
                if (response.data?.result) {
                  // Convert AI markdown to HTML before inserting into TipTap
                  const html = marked.parse(response.data.result) as string;
                  setContent(content + html);
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
            { content, instructions: prompt || undefined, conversationHistory: aiHistory },
            {
              onSuccess: (response) => {
                incrementAIUsage();
                if (response.data?.result) {
                  const html = marked.parse(response.data.result) as string;
                  setContent(html);
                  setAiHistory((prev) => [
                    ...prev,
                    { role: 'user', content: prompt || 'Improve this content' },
                    { role: 'assistant', content: response.data!.result! },
                  ].slice(-4));
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
          checkGrammar(
            { content, instructions: prompt || undefined, conversationHistory: aiHistory },
            {
              onSuccess: (response) => {
                incrementAIUsage();
                if (response.data?.result) {
                  const html = marked.parse(response.data.result) as string;
                  setContent(html);
                  setAiHistory((prev) => [
                    ...prev,
                    { role: 'user', content: prompt || 'Check and fix grammar' },
                    { role: 'assistant', content: response.data!.result! },
                  ].slice(-4));
                }
              },
              onError: (err) => {
                setError(getErrorMessage(err));
              },
            }
          );
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
                incrementAIUsage();
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

  if (isLoadingBlog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading blog…</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            {/* Auto-save status */}
            {autoSaveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving…
              </span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Cloud className="w-3 h-3" /> Draft saved
              </span>
            )}
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isSaving}
            >
              {isSaving ? 'Publishing...' : 'Publish'}
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

export default function WritePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <WritePageInner />
    </Suspense>
  );
}
