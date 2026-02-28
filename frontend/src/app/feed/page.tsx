'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LandingNavbar } from '@/components/LandingNavbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Eye, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { API_URL, ROUTES } from '@/utils/constants';
import type { Blog } from '@/types';
import { useAuthStore } from '@/stores';

const CATEGORIES = [
  'All',
  'Technology',
  'Health',
  'Business',
  'Science',
  'Art',
  'Travel',
  'Food',
  'Finance',
  'Education',
  'Entertainment',
  'Sports',
];

interface BlogListResponse {
  blogs: Blog[];
  count: number;
}

async function fetchPublicBlogs(params: {
  q?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<{ blogs: Blog[]; count: number }> {
  const token = useAuthStore.getState().tokens?.accessToken;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const limit = params.limit ?? 18;
  const offset = params.offset ?? 0;

  // If there is a text search query, use /search endpoint
  if (params.q) {
    const query = new URLSearchParams({ q: params.q, limit: String(limit), offset: String(offset) });
    const res = await fetch(`${API_URL}/api/blogs/search?${query}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch blogs');
    const data = await res.json();
    const raw: Blog[] = data?.data?.blogs ?? data?.blogs ?? [];
    return { blogs: raw, count: raw.length };
  }

  // Otherwise use the public feed endpoint and filter by category client-side
  // Fetch a larger page so category filtering still shows enough results
  const fetchLimit = params.category ? Math.max(limit * 4, 60) : limit;
  const query = new URLSearchParams({ limit: String(fetchLimit), offset: String(offset) });
  const res = await fetch(`${API_URL}/api/blogs/feed?${query}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch blogs');
  const data = await res.json();
  let blogs: Blog[] = data?.data?.blogs ?? data?.blogs ?? [];

  // Client-side category filter (category is a direct column on the blog row)
  if (params.category) {
    blogs = blogs.filter(
      (b) => b.category?.toLowerCase() === params.category!.toLowerCase()
    );
  }

  // Slice back to requested limit
  const sliced = blogs.slice(0, limit);
  return { blogs: sliced, count: blogs.length };
}

export default function PublicFeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') ?? 'All';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 18;

  const loadBlogs = useCallback(
    async (category: string, q: string, offset: number, append = false) => {
      try {
        if (offset === 0) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        const result = await fetchPublicBlogs({
          q: q || undefined,
          category: category !== 'All' ? category : undefined,
          limit: PAGE_SIZE,
          offset,
        });

        setBlogs((prev) => (append ? [...prev, ...result.blogs] : result.blogs));
        setCount(result.count);
      } catch {
        setError('Could not load posts. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Initial load + reload when filters change
  useEffect(() => {
    setPage(0);
    loadBlogs(activeCategory, searchQuery, 0, false);
  }, [activeCategory, searchQuery, loadBlogs]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(inputValue.trim());
  }

  function handleCategory(cat: string) {
    setActiveCategory(cat);
    setSearchQuery('');
    setInputValue('');
  }

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    loadBlogs(activeCategory, searchQuery, next * PAGE_SIZE, true);
  }

  const hasMore = blogs.length < count;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      {/* Page header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <h1 className="text-3xl font-bold mb-2">Public Feed</h1>
          <p className="text-muted-foreground mb-6">
            Discover stories from writers around the world
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search stories…"
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => loadBlogs(activeCategory, searchQuery, 0)}>
              Try Again
            </Button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-lg font-medium mb-2">No stories found</p>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : `No published stories in ${activeCategory === 'All' ? 'any category' : activeCategory} yet`}
            </p>
            <Button onClick={() => handleCategory('All')} variant="outline">
              Browse all stories
            </Button>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-6">
              {count} {count === 1 ? 'story' : 'stories'}
              {activeCategory !== 'All' && ` in ${activeCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="min-w-36"
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Want to share your story?</h2>
          <p className="text-muted-foreground mb-4">
            Join Draft.IO and publish your writing to readers worldwide.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Start Writing for Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ blog }: { blog: Blog }) {
  const router = useRouter();

  function truncate(text: string | undefined | null, maxLen: number) {
    if (!text) return '';
    const plain = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return plain.length > maxLen ? plain.slice(0, maxLen) + '…' : plain;
  }

  return (
    <article
      className="group flex flex-col rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={() => router.push(`${ROUTES.BLOG}/${blog.slug}`)}
    >
      {blog.cover_image_url && (
        <div className="relative h-44 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Category / tags */}
        {(blog.category || (blog.tags && blog.tags.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {blog.category && (
              <Badge variant="secondary" className="text-xs">
                {blog.category}
              </Badge>
            )}
            {blog.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <h3 className="font-semibold text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {blog.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
          {truncate(blog.content, 130)}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-auto text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
              {blog.author?.username?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <span>{blog.author?.username ?? 'Unknown'}</span>
          </div>

          <div className="flex items-center gap-3">
            {blog.reading_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {blog.reading_time}m
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {blog.views_count}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {blog.likes_count}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
