'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';
import { formatDate, calculateReadingTime } from '@/utils/helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, MessageCircle, Eye, PenSquare, User, Sparkles, X, Loader2 } from 'lucide-react';
import { useMyBlogs, useRecommendedFeed, useInfiniteBlogs } from '@/hooks/useBlog';
import { useFollowUser, useUnfollowUser, useFollowing } from '@/hooks/useUser';
import { userApi } from '@/lib/api/user';
import { BlogPostCard } from '@/components/BlogPostCard';

const DashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'following' | 'mine'>('all');
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [showAllInterests, setShowAllInterests] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initialize filter from URL params
  useEffect(() => {
    const tab = searchParams.get('tab') as 'all' | 'following' | 'mine';
    if (tab && ['all', 'following', 'mine'].includes(tab)) {
      setFilter(tab);
    }
  }, [searchParams]);

  // Fetch following users
  const { data: followingData } = useFollowing(user?.id || '');
  useEffect(() => {
    if (followingData?.data) {
      const list: any[] = (followingData.data as any)?.following ?? followingData.data ?? [];
      const followingIds = new Set(list.map((u: any) => u.id));
      setFollowingUsers(followingIds);
    }
  }, [followingData]);

  // Fetch suggested users — top writers you don't already follow, sorted by follower count
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        // Cast a wide net with common letters to get a diverse pool of users
        const queries = ['a', 'e', 'i', 'o', 's', 't'];
        let allUsers: any[] = [];
        for (const q of queries) {
          try {
            const response = await userApi.searchUsers(q);
            if (response?.data && Array.isArray(response.data)) {
              allUsers = [...allUsers, ...response.data];
            }
          } catch {
            // ignore individual failures
          }
        }
        // Deduplicate by id, remove self, sort by followers_count desc, keep top 10 buffer
        const seen = new Set<string>();
        const suggested = allUsers
          .filter((u: any) => {
            if (u.id === user?.id || seen.has(u.id)) return false;
            seen.add(u.id);
            return true;
          })
          .sort((a: any, b: any) => (b.followers_count ?? 0) - (a.followers_count ?? 0))
          .slice(0, 10); // keep buffer so we can filter out already-followed in render
        setSuggestedUsers(suggested);
      } catch (error) {
        console.error('Failed to fetch suggested users:', error);
      }
    };
    if (user?.id) fetchSuggestedUsers();
  }, [user?.id]);

  // "For You" — infinite scroll
  const {
    data: infiniteData,
    isLoading: loadingInfinite,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteBlogs(10);

  // Other tabs
  const { data: myBlogsData, isLoading: loadingMyBlogs } = useMyBlogs(1);
  const { data: recommendedData } = useRecommendedFeed();

  // Sentinel observer — fires fetchNextPage when the sentinel div enters view
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && filter === 'all') {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, filter]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Follow/unfollow mutations
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Get blogs based on current filter
  const getBlogs = () => {
    if (filter === 'mine') {
      return myBlogsData?.data?.blogs || [];
    }
    if (filter === 'following') {
      const allPages = infiniteData?.pages ?? [];
      const allBlogs = allPages.flatMap((p: any) => p?.data?.blogs ?? []);
      return allBlogs.filter(blog =>
        blog.author?.id && followingUsers.has(blog.author.id)
      );
    }
    // 'all' / "For You" — accumulated infinite pages
    const allPages = infiniteData?.pages ?? [];
    const allBlogs = allPages.flatMap((p: any) => p?.data?.blogs ?? []);
    // if recommendation service returned results, surface them first
    const recommended = recommendedData?.data;
    if (recommended && Array.isArray(recommended) && recommended.length > 0 && allBlogs.length === 0) {
      return recommended as any[];
    }
    return allBlogs;
  };

  const blogs = getBlogs();
  const isLoading = filter === 'mine' ? loadingMyBlogs : loadingInfinite;

  const handleFollow = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (followingUsers.has(userId)) {
      await unfollowMutation.mutateAsync(userId);
      setFollowingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } else {
      await followMutation.mutateAsync(userId);
      setFollowingUsers(prev => new Set(prev).add(userId));
    }
  };

  const handleTabChange = (value: string) => {
    const newFilter = value as 'all' | 'following' | 'mine';
    setFilter(newFilter);
    router.push(`${ROUTES.DASHBOARD}?tab=${value}`, { scroll: false });
  };

  const renderBlogFeed = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blogs...</p>
          </CardContent>
        </Card>
      );
    }

    if (blogs.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <CardTitle className="text-xl mb-2">No posts yet</CardTitle>
            <CardDescription className="mb-4">
              {filter === 'following'
                ? 'Start following people to see their content'
                : filter === 'mine'
                ? "You haven't written any blogs yet"
                : 'Be the first to write a blog!'}
            </CardDescription>
            <Button onClick={() => router.push(ROUTES.WRITE)}>
              <PenSquare className="w-4 h-4 mr-2" />
              Write Your First Blog
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        {blogs.map((blog) => (
          <BlogPostCard
            key={blog.id}
            blog={blog}
            currentUserId={user?.id}
            isFollowing={!!(blog.author?.id && followingUsers.has(blog.author.id))}
            followPending={followMutation.isPending || unfollowMutation.isPending}
            onFollow={handleFollow}
            showStatus={filter === 'mine'}
          />
        ))}

        {/* Infinite scroll sentinel — only on "For You" tab */}
        {filter === 'all' && (
          <div ref={sentinelRef} className="py-6 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
            {!hasNextPage && blogs.length > 0 && (
              <p className="text-sm text-muted-foreground">You&apos;ve seen all posts ✓</p>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {/* Show "Welcome" for new accounts (created < 10 min ago), otherwise "Welcome back" */}
            {user?.created_at && (Date.now() - new Date(user.created_at).getTime()) < 10 * 60 * 1000
              ? `Welcome, ${user?.full_name || user?.username}! 🎉`
              : `Welcome back, ${user?.full_name || user?.username}!`}
          </h1>
          <p className="text-muted-foreground">Discover personalized content just for you</p>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={handleTabChange} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">For You</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="mine">Your Blogs</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            {/* Main Feed */}
            <div className="lg:col-span-2">
              <TabsContent value="all" className="space-y-6 mt-0">
                {renderBlogFeed()}
              </TabsContent>
              
              <TabsContent value="following" className="space-y-6 mt-0">
                {renderBlogFeed()}
              </TabsContent>
              
              <TabsContent value="mine" className="space-y-6 mt-0">
                {renderBlogFeed()}
              </TabsContent>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => router.push(ROUTES.WRITE)}
                    className="w-full"
                  >
                    <PenSquare className="w-4 h-4 mr-2" />
                    Write a Blog
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(ROUTES.PROFILE_EDIT)}
                    className="w-full"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Your Interests */}
              {user?.interests && user.interests.length > 0 && (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Your Interests
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Topics guiding your feed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {user.interests.slice(0, 3).map((interest) => (
                          <Badge
                            key={interest}
                            variant="secondary"
                            className="cursor-default"
                          >
                            {interest}
                          </Badge>
                        ))}
                        {user.interests.length > 3 && (
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => setShowAllInterests(true)}
                          >
                            +{user.interests.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* All Interests Modal */}
                  <Dialog open={showAllInterests} onOpenChange={setShowAllInterests}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          All Your Interests
                        </DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground -mt-1">
                        These are the topics you selected during sign-up. They shape your personalised feed.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {user.interests.map((interest) => (
                          <Badge
                            key={interest}
                            variant="secondary"
                            className="text-sm py-1 px-3"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      <div className="pt-2 flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          {user.interests.length} interest{user.interests.length !== 1 ? 's' : ''} selected
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(ROUTES.PROFILE_EDIT)}
                        >
                          Edit Interests
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {/* Trending Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Trending Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'React', 'AI', 'Web Dev', 'Python', 'Career'].map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Writers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestedUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading writers...</p>
                  ) : (
                    suggestedUsers
                      // Filter out people you already follow — reactive to followingUsers state
                      .filter((u: any) => !followingUsers.has(u.id))
                      .slice(0, 3)
                      .map((suggestedUser) => (
                        <div key={suggestedUser.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={suggestedUser.profile_picture_url} />
                              <AvatarFallback>{suggestedUser.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{suggestedUser.full_name || suggestedUser.username}</div>
                              <div className="text-xs text-muted-foreground">
                                @{suggestedUser.username}
                                {suggestedUser.followers_count > 0 && (
                                  <span className="ml-1 text-muted-foreground/60">· {suggestedUser.followers_count} followers</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => handleFollow(suggestedUser.id, e)}
                            disabled={followMutation.isPending || unfollowMutation.isPending}
                          >
                            Follow
                          </Button>
                        </div>
                      ))
                  )}
                  {suggestedUsers.filter((u: any) => !followingUsers.has(u.id)).length === 0 && suggestedUsers.length > 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">You&apos;re following everyone here!</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

export default Dashboard;