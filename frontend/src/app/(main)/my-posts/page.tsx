'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores';
import { formatDate } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';
import { blogApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/utils/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import {
  Heart, MessageCircle, Eye, PenSquare, Trash2, Globe, FileText,
  BookOpen, TrendingUp, Clock, MoreVertical,
  CheckCircle2, Bookmark,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { engagementApi } from '@/lib/api';

export default function MyPostsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<'all' | 'published' | 'draft' | 'saved'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');

  // Fetch my blogs
  const { data: blogsData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BLOGS, 'mine'],
    queryFn: () => blogApi.getMyBlogs(1),
  });

  // Fetch saved/bookmarked blogs
  const { data: bookmarksData, isLoading: loadingBookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => engagementApi.getBookmarks(),
  });

  const allBlogs: any[] = blogsData?.data?.blogs || [];
  const savedBlogs: any[] = (bookmarksData?.data as any)?.bookmarks || [];

  // Filter by tab
  const blogs = tab === 'saved' ? savedBlogs
    : tab === 'all' ? allBlogs
    : allBlogs.filter((b) => b.status === tab);

  // Stats
  const totalViews = allBlogs.reduce((sum, b) => sum + (b.views_count || 0), 0);
  const totalLikes = allBlogs.reduce((sum, b) => sum + (b.likes_count || 0), 0);
  const totalComments = allBlogs.reduce((sum, b) => sum + (b.comments_count || 0), 0);
  const publishedCount = allBlogs.filter((b) => b.status === 'published').length;
  const draftCount = allBlogs.filter((b) => b.status === 'draft').length;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS, 'mine'] });
      setDeleteId(null);
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (id: string) => blogApi.publishBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS, 'mine'] });
    },
  });

  const handleDelete = (blog: any) => {
    setDeleteId(blog.id);
    setDeleteTitle(blog.title);
  };

  const confirmDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  if (isLoading || loadingBookmarks) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage all your blog posts</p>
          </div>
          <Button onClick={() => router.push(ROUTES.WRITE)}>
            <PenSquare className="w-4 h-4 mr-2" />
            Write New Blog
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allBlogs.length}</p>
                <p className="text-xs text-muted-foreground">Total Posts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Likes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalComments.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Comments</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Posts <Badge variant="secondary" className="ml-2">{allBlogs.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="published">
              Published <Badge variant="secondary" className="ml-2">{publishedCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="draft">
              Drafts <Badge variant="secondary" className="ml-2">{draftCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="saved">
              Saved Posts <Badge variant="secondary" className="ml-2">{savedBlogs.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {['all', 'published', 'draft', 'saved'].map((tabVal) => (
            <TabsContent key={tabVal} value={tabVal} className="space-y-0">
              {blogs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="text-xl mb-2">No posts yet</CardTitle>
                    <CardDescription className="mb-4">
                      {tab === 'draft' ? 'No drafts saved.' : tab === 'published' ? 'No published posts yet.' : tab === 'saved' ? 'You have not saved any posts yet. Hit the Save button on any blog to bookmark it here.' : 'Start writing your first blog post!'}
                    </CardDescription>
                    {tab !== 'saved' && (
                      <Button onClick={() => router.push(ROUTES.WRITE)}>
                        <PenSquare className="w-4 h-4 mr-2" />
                        Write a Blog
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-[1fr_120px_80px_80px_80px_100px] gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
                    <span>Post</span>
                    <span>Status</span>
                    <span className="text-center">Views</span>
                    <span className="text-center">Likes</span>
                    <span className="text-center">Comments</span>
                    <span className="text-right">Actions</span>
                  </div>

                  {/* Rows */}
                  {blogs.map((blog, index) => (
                    <div
                      key={blog.id}
                      className={`grid grid-cols-1 md:grid-cols-[1fr_120px_80px_80px_80px_100px] gap-4 px-4 py-4 items-center hover:bg-muted/30 transition-colors ${index !== 0 ? 'border-t border-border' : ''}`}
                    >
                      {/* Post info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {blog.cover_image_url ? (
                          <div className="relative w-16 h-12 shrink-0 rounded overflow-hidden">
                            <Image src={blog.cover_image_url} alt={blog.title} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-12 shrink-0 rounded bg-muted flex items-center justify-center">
                            {tab === 'saved' ? <Bookmark className="w-5 h-5 text-muted-foreground" /> : <FileText className="w-5 h-5 text-muted-foreground" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p
                            className="font-medium line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                            onClick={() =>
                              blog.status === 'published'
                                ? router.push(`${ROUTES.BLOG}/${blog.slug}`)
                                : router.push(`${ROUTES.WRITE}?edit=${blog.id}`)
                            }
                          >
                            {blog.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {tab === 'saved'
                              ? `Saved ${formatDate(blog.saved_at || blog.created_at)}`
                              : formatDate(blog.updated_at || blog.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="md:block">
                        <Badge
                          variant={blog.status === 'published' ? 'default' : 'secondary'}
                          className="gap-1"
                        >
                          {blog.status === 'published' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {blog.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="text-center text-sm font-medium">
                        <span className="md:block hidden">{(blog.views_count || 0).toLocaleString()}</span>
                        <span className="md:hidden flex items-center gap-1 text-muted-foreground text-xs">
                          <Eye className="w-3 h-3" /> {blog.views_count || 0}
                        </span>
                      </div>
                      <div className="text-center text-sm font-medium">
                        <span className="md:block hidden">{(blog.likes_count || 0).toLocaleString()}</span>
                        <span className="md:hidden flex items-center gap-1 text-muted-foreground text-xs">
                          <Heart className="w-3 h-3" /> {blog.likes_count || 0}
                        </span>
                      </div>
                      <div className="text-center text-sm font-medium">
                        <span className="md:block hidden">{(blog.comments_count || 0).toLocaleString()}</span>
                        <span className="md:hidden flex items-center gap-1 text-muted-foreground text-xs">
                          <MessageCircle className="w-3 h-3" /> {blog.comments_count || 0}
                        </span>
                      </div>

                      {/* Actions dropdown */}
                      <div className="flex justify-end">
                        {tab === 'saved' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`${ROUTES.BLOG}/${blog.slug}`)}
                          >
                            <Globe className="w-4 h-4 mr-1" /> View
                          </Button>
                        ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {blog.status === 'published' && (
                              <DropdownMenuItem
                                onClick={() => router.push(`${ROUTES.BLOG}/${blog.slug}`)}
                              >
                                <Globe className="w-4 h-4 mr-2" />
                                View Post
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => router.push(`${ROUTES.WRITE}?edit=${blog.id}`)}
                            >
                              <PenSquare className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {blog.status === 'draft' && (
                              <DropdownMenuItem
                                onClick={() => publishMutation.mutate(blog.id)}
                                disabled={publishMutation.isPending}
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(blog)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTitle}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
