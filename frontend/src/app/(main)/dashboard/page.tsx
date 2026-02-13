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
import { Heart, MessageCircle, Eye, PenSquare, User, UserPlus, UserCheck } from 'lucide-react';
import { useBlogs, useTrendingBlogs } from '@/hooks/useBlog';
import { useFollowUser, useUnfollowUser, useFollowing } from '@/hooks/useUser';
import { userApi } from '@/lib/api/user';

const Dashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [page, setPage] = useState(1);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  // Initialize filter from URL params
  useEffect(() => {
    const tab = searchParams.get('tab') as 'all' | 'following' | 'trending';
    if (tab && ['all', 'following', 'trending'].includes(tab)) {
      setFilter(tab);
    }
  }, [searchParams]);

  // Fetch following users
  const { data: followingData } = useFollowing(user?.id || '');
  useEffect(() => {
    if (followingData?.data) {
      const followingIds = new Set(followingData.data.map((u: any) => u.id));
      setFollowingUsers(followingIds);
    }
  }, [followingData]);

  // Fetch suggested users
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const response = await userApi.searchUsers('');
        if (response.success && response.data) {
          // Filter out current user and take first 3
          const suggested = response.data
            .filter((u: any) => u.id !== user?.id)
            .slice(0, 3);
          setSuggestedUsers(suggested);
        }
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
  const { data: trendingData, isLoading: loadingTrending } = useTrendingBlogs();

  // Follow/unfollow mutations
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Get blogs based on current filter
  const getBlogs = () => {
    if (filter === 'trending') {
      return trendingData?.data || [];
    }
    if (filter === 'following') {
      // Filter blogs by followed users
      return allBlogsData?.data?.blogs?.filter(blog => 
        blog.author?.id && followingUsers.has(blog.author.id)
      ) || [];
    }
    return allBlogsData?.data?.blogs || [];
  };

  const blogs = getBlogs();
  const isLoading = filter === 'trending' ? loadingTrending : loadingAllBlogs;

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
    const newFilter = value as 'all' | 'following' | 'trending';
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
          <Card
            key={blog.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`${ROUTES.BLOG}/${blog.slug}`)}
          >
            <CardContent className="p-6">
              {/* Author */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={blog.author?.avatar_url} alt={blog.author?.full_name} />
                    <AvatarFallback>{blog.author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{blog.author?.full_name || blog.author?.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(blog.created_at)} · {calculateReadingTime(blog.content || '')} min read
                    </div>
                  </div>
                </div>
                {blog.author?.id && blog.author.id !== user?.id && (
                  <Button
                    size="sm"
                    variant={followingUsers.has(blog.author.id) ? "outline" : "default"}
                    onClick={(e) => handleFollow(blog.author.id, e)}
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                  >
                    {followingUsers.has(blog.author.id) ? (
                      <><UserCheck className="w-4 h-4 mr-1" /> Following</>
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-1" /> Follow</>
                    )}
                  </Button>
                )}
              </div>

              {/* Content */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2 hover:text-primary">
                  {blog.title}
                </h2>
                <p className="text-muted-foreground line-clamp-2">{blog.excerpt}</p>
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" /> {blog.likes_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" /> {blog.comments_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {blog.views_count || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Load More */}
        {filter === 'all' && blogs.length > 0 && (
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
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="text-muted-foreground">Discover personalized content just for you</p>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={handleTabChange} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">For You</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
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
              
              <TabsContent value="trending" className="space-y-6 mt-0">
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
                            <AvatarImage src={suggestedUser.avatar_url} />
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