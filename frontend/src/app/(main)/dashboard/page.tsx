'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';
import { formatDate, calculateReadingTime } from '@/utils/helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Eye, PenSquare, User } from 'lucide-react';
import { useBlogs, useMyBlogs, useRecommendedFeed } from '@/hooks/useBlog';
import { useFollowUser, useUnfollowUser, useFollowing } from '@/hooks/useUser';
import { userApi } from '@/lib/api/user';
import { BlogPostCard } from '@/components/BlogPostCard';

const Dashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'following' | 'mine'>('all');
  const [page, setPage] = useState(1);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

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

  // Fetch suggested users
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        // Try multiple common letters to get diverse suggestions
        const queries = ['a', 'e', 'i'];
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
        // Deduplicate, remove self, take first 3
        const seen = new Set<string>();
        const suggested = allUsers
          .filter((u: any) => {
            if (u.id === user?.id || seen.has(u.id)) return false;
            seen.add(u.id);
            return true;
          })
          .slice(0, 3);
        setSuggestedUsers(suggested);
      } catch (error) {
        console.error('Failed to fetch suggested users:', error);
      }
    };
    if (user?.id) {
      fetchSuggestedUsers();
    }
  }, [user?.id]);

  // Fetch blogs based on filter
  const { data: allBlogsData, isLoading: loadingAllBlogs } = useBlogs(page, 10);
  const { data: myBlogsData, isLoading: loadingMyBlogs } = useMyBlogs(page);
  const { data: recommendedData, isLoading: loadingRecommended } = useRecommendedFeed();

  // Follow/unfollow mutations
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Get blogs based on current filter
  const getBlogs = () => {
    if (filter === 'mine') {
      return myBlogsData?.data?.blogs || [];
    }
    if (filter === 'following') {
      // Filter blogs by followed users (client-side until a server feed API is added)
      return allBlogsData?.data?.blogs?.filter(blog => 
        blog.author?.id && followingUsers.has(blog.author.id)
      ) || [];
    }
    // 'all' / "For You" — use recommendation service, fall back to all blogs
    const recommended = recommendedData?.data;
    if (recommended && Array.isArray(recommended) && recommended.length > 0) {
      return recommended as any[];
    }
    return allBlogsData?.data?.blogs || [];
  };

  const blogs = getBlogs();
  const isLoading = filter === 'mine' ? loadingMyBlogs
    : filter === 'all' ? (loadingRecommended && loadingAllBlogs)
    : loadingAllBlogs;

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
    setPage(1); // Reset page when changing tabs
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

        {/* Load More */}
        {(filter === 'all' || filter === 'mine') && blogs.length > 0 && (
          <div className="text-center py-8">
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={loadingAllBlogs}
            >
              {loadingAllBlogs ? 'Loading...' : 'Load More'}
            </Button>
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
                    suggestedUsers.map((suggestedUser) => (
                      <div key={suggestedUser.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={suggestedUser.profile_picture_url} />
                            <AvatarFallback>{suggestedUser.username?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{suggestedUser.full_name || suggestedUser.username}</div>
                            <div className="text-xs text-muted-foreground">@{suggestedUser.username}</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={followingUsers.has(suggestedUser.id) ? "outline" : "default"}
                          onClick={(e) => handleFollow(suggestedUser.id, e)}
                          disabled={followMutation.isPending || unfollowMutation.isPending}
                        >
                          {followingUsers.has(suggestedUser.id) ? 'Following' : 'Follow'}
                        </Button>
                      </div>
                    ))
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

export default Dashboard;