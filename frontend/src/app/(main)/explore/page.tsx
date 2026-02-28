'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, TrendingUp, Clock } from 'lucide-react';
import { useTrendingBlogs, useSearchBlogs, useBlogs } from '@/hooks/useBlog';
import { BlogPostCard } from '@/components/BlogPostCard';
import { ROUTES } from '@/utils/constants';

const POPULAR_TAGS = [
  'Technology', 'Programming', 'AI', 'Design', 'Startups',
  'Career', 'Writing', 'Science', 'Health', 'Finance',
];

const SkeletonCards = () => (
  <div className="grid gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-muted rounded w-32" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
          </div>
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-full mb-1" />
          <div className="h-3 bg-muted rounded w-2/3 mb-4" />
          <div className="h-40 bg-muted rounded" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const { data: trendingData, isLoading: loadingTrending } = useTrendingBlogs();
  const { data: latestData, isLoading: loadingLatest } = useBlogs(1, 20);
  const { data: searchData, isLoading: loadingSearch } = useSearchBlogs(activeSearch);

  const trendingBlogs = trendingData?.data ?? [];
  const latestBlogs = latestData?.data?.blogs ?? [];
  const searchBlogs = (searchData?.data as any)?.blogs ?? searchData?.data ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim());
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setActiveSearch(tag);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Explore</h1>
          <p className="text-muted-foreground">Discover content and popular authors</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blogs by title, tag, or topic..."
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {/* Popular Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {POPULAR_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="latest">
          <TabsList className="mb-6">
            <TabsTrigger value="latest" className="gap-2">
              <Clock className="w-4 h-4" />
              Latest
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            {activeSearch && (
              <TabsTrigger value="search" className="gap-2">
                <Search className="w-4 h-4" />
                &ldquo;{activeSearch}&rdquo;
              </TabsTrigger>
            )}
          </TabsList>

          {/* ── Latest ── */}
          <TabsContent value="latest">
            {loadingLatest ? <SkeletonCards /> : latestBlogs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <CardTitle className="mb-2">No published blogs yet</CardTitle>
                  <CardDescription>Be the first to publish!</CardDescription>
                  <Button className="mt-4" onClick={() => router.push(ROUTES.WRITE)}>Write a Blog</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {(latestBlogs as any[]).map((blog: any) => (
                  <BlogPostCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Trending ── */}
          <TabsContent value="trending">
            {loadingTrending ? <SkeletonCards /> : trendingBlogs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <CardTitle className="mb-2">No trending blogs yet</CardTitle>
                  <CardDescription>Be the first to publish and start the trend!</CardDescription>
                  <Button className="mt-4" onClick={() => router.push(ROUTES.WRITE)}>Write a Blog</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {(trendingBlogs as any[]).map((blog: any, idx: number) => (
                  <BlogPostCard key={blog.id} blog={blog} rank={idx} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Search Results ── */}
          {activeSearch && (
            <TabsContent value="search">
              {loadingSearch ? <SkeletonCards /> : (searchBlogs as any[]).length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <CardTitle className="mb-2">No results found</CardTitle>
                    <CardDescription>Try different keywords or browse trending content</CardDescription>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {(searchBlogs as any[]).map((blog: any) => (
                    <BlogPostCard key={blog.id} blog={blog} />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

