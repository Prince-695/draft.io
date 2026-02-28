'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDate, calculateReadingTime } from '@/utils/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowLeft,
  Eye,
  BookmarkCheck,
  UserPlus,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { useBlog } from '@/hooks/useBlog';
import { useFollowUser, useUnfollowUser } from '@/hooks/useUser';
import { useAuthStore } from '@/stores';
import { engagementApi } from '@/lib/api';
import apiClient from '@/lib/api/client';
import type { Comment } from '@/types';
import { ROUTES, API_ENDPOINTS } from '@/utils/constants';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPage({ params }: BlogPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const { data: blogData, isLoading, error } = useBlog(slug);
  const blog = blogData?.data;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  // Track read start time for computing time-spent signal
  const readStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!blog?.id || !isAuthenticated) return;

    // Record the moment the user opened the article
    readStartRef.current = Date.now();

    // Immediately tell the recommendation engine this blog was opened
    apiClient
      .post(API_ENDPOINTS.RECOMMENDATIONS.TRACK_READ, { blogId: blog.id, timeSpent: 0 })
      .catch(() => { /* non-critical */ });

    return () => {
      // On unmount send the real time-spent (best-effort)
      if (!readStartRef.current || !blog?.id) return;
      const timeSpent = Math.round((Date.now() - readStartRef.current) / 1000);
      if (timeSpent < 3) return; // ignore accidental page flashes
      const token = useAuthStore.getState().tokens?.accessToken;
      if (!token) return;
      // keepalive so the request survives the component unmount
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'}${API_ENDPOINTS.RECOMMENDATIONS.TRACK_READ}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ blogId: blog.id, timeSpent }),
        keepalive: true,
      }).catch(() => { /* non-critical */ });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blog?.id, isAuthenticated]);

  useEffect(() => {
    if (blog) {
      setLikesCount(blog.likes_count || 0);
    }
  }, [blog]);

  useEffect(() => {
    if (blog?.id) {
      engagementApi
        .getComments(blog.id)
        .then((res) => {
          const list = (res?.data as any)?.comments;
          if (Array.isArray(list)) setComments(list as Comment[]);
        })
        .catch(() => {});
    }
  }, [blog?.id]);

  const handleLike = async () => {
    if (!isAuthenticated || !blog) return;
    try {
      if (liked) {
        await engagementApi.unlikeBlog(blog.id);
        setLikesCount((n) => n - 1);
      } else {
        await engagementApi.likeBlog(blog.id);
        setLikesCount((n) => n + 1);
      }
      setLiked(!liked);
    } catch { /* ignore */ }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated || !blog) return;
    try {
      if (bookmarked) {
        await engagementApi.unbookmarkBlog(blog.id);
      } else {
        await engagementApi.bookmarkBlog(blog.id);
      }
      setBookmarked(!bookmarked);
    } catch { /* ignore */ }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handlePostComment = async () => {
    if (!isAuthenticated || !commentText.trim() || !blog) return;
    setPostingComment(true);
    try {
      const res = await engagementApi.createComment(blog.id, { content: commentText });
      const newComment = (res?.data as any)?.comment;
      if (newComment) {
        setComments((prev) => [newComment as Comment, ...prev]);
        setCommentText('');
      }
    } catch { /* ignore */ } finally {
      setPostingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Article not found</p>
          <p className="text-muted-foreground mb-4">
            This article may have been removed or doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push(ROUTES.DASHBOARD)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(blog.content || '');
  const isOwnBlog = !!(user?.id && (user.id === (blog as any)?.author_id || user.id === blog?.author?.id));

  const handleFollowToggle = async () => {
    if (!blog?.author?.id) return;
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(blog.author.id);
        setIsFollowing(false);
      } else {
        await followUser.mutateAsync(blog.author.id);
        setIsFollowing(true);
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      {blog.cover_image_url && (
        <div className="relative h-80 md:h-96 bg-muted overflow-hidden">
          <Image
            src={blog.cover_image_url}
            alt={blog.title}
            fill
            className="object-cover opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent" />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 -ml-2" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className={blog.cover_image_url ? '-mt-20 relative z-10' : ''}>
          <CardContent className="p-8 md:p-12">
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag: any) => (
                  <Badge key={typeof tag === 'object' ? tag.id ?? tag.name : tag} variant="secondary">
                    {typeof tag === 'object' ? tag.name : tag}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {blog.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-start justify-between gap-4 pb-6">
              <div className="flex items-center gap-4">
                <Avatar
                  className="w-12 h-12 cursor-pointer"
                  onClick={() =>
                    blog.author?.username &&
                    router.push(`${ROUTES.PROFILE}/${blog.author.username}`)
                  }
                >
                  <AvatarImage src={blog.author?.profile_picture_url} alt={blog.author?.full_name} />
                  <AvatarFallback>{blog.author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div
                    className="font-medium cursor-pointer hover:underline"
                    onClick={() =>
                      blog.author?.username &&
                      router.push(`${ROUTES.PROFILE}/${blog.author.username}`)
                    }
                  >
                    {blog.author?.full_name || blog.author?.username}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>{formatDate(blog.created_at)}</span>
                    <span>·</span>
                    <span>{readingTime} min read</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {blog.views_count || 0} views
                    </span>
                  </div>
                </div>
              </div>
              {isAuthenticated && !isOwnBlog && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant={isFollowing ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5"
                    onClick={handleFollowToggle}
                    disabled={followUser.isPending || unfollowUser.isPending}
                  >
                    {isFollowing ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      const params = new URLSearchParams({
                        userId: blog.author?.id ?? '',
                        username: blog.author?.username ?? '',
                        name: blog.author?.full_name || blog.author?.username || '',
                      });
                      router.push(`${ROUTES.CHAT}?${params.toString()}`);
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                </div>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Action bar */}
            <div className="flex gap-3 pb-6 flex-wrap">
              <Button
                variant={liked ? 'default' : 'outline'}
                className="gap-2"
                onClick={handleLike}
                disabled={!isAuthenticated}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <a href="#comments">
                  <MessageCircle className="w-4 h-4" />
                  {comments.length} Comments
                </a>
              </Button>
              <Button
                variant={bookmarked ? 'default' : 'outline'}
                className="gap-2"
                onClick={handleBookmark}
                disabled={!isAuthenticated}
              >
                {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {bookmarked ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                {copied ? 'Copied!' : 'Share'}
              </Button>
            </div>

            <Separator className="mb-8" />

            {/* Content */}
            <div
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </CardContent>
        </Card>

        {/* Comments */}
        <Card className="mt-6" id="comments">
          <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <div className="mb-8 flex gap-3">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={user?.profile_picture_url} />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a thoughtful comment..."
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="resize-none"
                  />
                  <Button
                    className="mt-2"
                    onClick={handlePostComment}
                    disabled={!commentText.trim() || postingComment}
                  >
                    {postingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 mb-6 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <button
                    className="text-primary hover:underline"
                    onClick={() => router.push(ROUTES.SIGN_IN)}
                  >
                    Sign in
                  </button>{' '}
                  to leave a comment
                </p>
              </div>
            )}

            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No comments yet — be the first to share your thoughts!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={comment.author?.profile_picture_url} />
                      <AvatarFallback>
                        {comment.author?.username?.charAt(0).toUpperCase() ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.author?.full_name || comment.author?.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </article>
    </div>
  );
}
