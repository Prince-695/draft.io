'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useFollowUser, useUnfollowUser } from '@/hooks/useUser';

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [page, setPage] = useState(1);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

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
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger
              value="all"
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              For You
            </TabsTrigger>
            <TabsTrigger
              value="following"
              active={filter === 'following'}
              onClick={() => setFilter('following')}
            >
              Following
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              active={filter === 'trending'}
              onClick={() => setFilter('trending')}
            >
              Trending
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading blogs...</p>
                </CardContent>
              </Card>
            ) : blogs.length === 0 ? (
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
            ) : (
              blogs.map((blog) => (
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
              ))
            )}

            {/* Load More */}
            {blogs.length > 0 && filter === 'all' && !isLoading && (
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
                {['Jane Smith', 'Alex Johnson'].map((name, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{name}</div>
                        <div className="text-xs text-muted-foreground">@{name.toLowerCase().replace(' ', '')}</div>
                      </div>
                    </div>
                    <Button size="sm">Follow</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;