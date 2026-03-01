'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart, MessageCircle, Share2, Bookmark,
  UserPlus, UserCheck, Globe, Eye,
} from 'lucide-react';
import { formatDate, calculateReadingTime } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';

interface BlogPostCardProps {
  blog: any;
  currentUserId?: string;
  isFollowing?: boolean;
  followPending?: boolean;
  onFollow?: (userId: string, e: React.MouseEvent) => void;
  /** Show rank number (for Trending tab) */
  rank?: number;
  /** Show status badge (for Your Blogs tab) */
  showStatus?: boolean;
}

export function BlogPostCard({
  blog,
  currentUserId,
  isFollowing,
  followPending,
  onFollow,
  rank,
  showStatus,
}: BlogPostCardProps) {
  const router = useRouter();

  const authorName = blog.author?.full_name || blog.author?.username || blog.full_name || blog.username;
  const authorUsername = blog.author?.username || blog.username;
  const authorAvatar = blog.author?.profile_picture_url ?? null;
  const authorId = blog.author?.id ?? blog.author_id;
  const isOwnPost = !!(currentUserId && authorId && currentUserId === authorId);

  const snippet = (() => {
    const raw = blog.excerpt || blog.content || '';
    return raw.replace(/<[^>]*>/g, '').slice(0, 200);
  })();

  const goToBlog = () => router.push(`${ROUTES.BLOG}/${blog.slug}`);

  return (
    <Card className="overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow bg-card">
      <CardContent className="p-0">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => authorUsername && router.push(`${ROUTES.PROFILE}/${authorUsername}`)}
          >
            <Avatar className="w-11 h-11 shrink-0">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback className="text-base font-semibold">
                {authorName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sm leading-snug text-foreground">
                {authorName}
                {rank !== undefined && (
                  <span className="ml-2 text-2xl font-bold text-muted-foreground/25 select-none">
                    #{rank + 1}
                  </span>
                )}
              </div>
              {authorUsername && (
                <div className="text-xs text-muted-foreground leading-snug">@{authorUsername}</div>
              )}
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                {formatDate(blog.published_at || blog.created_at)}
                <span>·</span>
                <Globe className="w-3 h-3" />
                {blog.reading_time && (
                  <>
                    <span>·</span>
                    <span>{blog.reading_time} min read</span>
                  </>
                )}
                {!blog.reading_time && blog.content && (
                  <>
                    <span>·</span>
                    <span>{calculateReadingTime(blog.content)} min read</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Follow button — only for other people's posts */}
          {onFollow && !isOwnPost && authorId && (
            <Button
              variant={isFollowing ? 'outline' : 'ghost'}
              size="sm"
              className={`gap-1.5 shrink-0 ${!isFollowing ? 'text-primary border border-primary hover:bg-primary/10' : ''}`}
              onClick={(e) => { e.stopPropagation(); onFollow(authorId, e); }}
              disabled={followPending}
            >
              {isFollowing
                ? <><UserCheck className="w-4 h-4" /> Following</>
                : <><UserPlus className="w-4 h-4" /> Follow</>}
            </Button>
          )}
        </div>

        {/* ── Post body ── */}
        <div className="px-4 pb-3 cursor-pointer" onClick={goToBlog}>
          <div className="flex items-start gap-2 mb-1">
            <h3 className="font-bold text-base leading-snug text-foreground line-clamp-2 flex-1">
              {blog.title}
            </h3>
            {showStatus && (
              <Badge
                variant={blog.status === 'published' ? 'default' : 'secondary'}
                className="shrink-0 text-xs"
              >
                {blog.status === 'published' ? 'Published' : 'Draft'}
              </Badge>
            )}
          </div>
          {snippet && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {snippet}
            </p>
          )}
        </div>

        {/* ── Tags ── */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-3">
            {blog.tags.slice(0, 4).map((tag: any) => {
              const label = typeof tag === 'object' ? tag.name : tag;
              return (
                <Badge key={label} variant="secondary" className="text-xs px-2 py-0.5">
                  {label}
                </Badge>
              );
            })}
          </div>
        )}

        {/* ── Cover image ── */}
        {blog.cover_image_url && (
          <div className="cursor-pointer" onClick={goToBlog}>
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full aspect-video object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* ── Engagement counts ── */}
        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="text-red-500">❤</span>
            {blog.likes_count || 0} {blog.likes_count === 1 ? 'reaction' : 'reactions'}
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {blog.comments_count || 0} comments
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {blog.views_count || 0} views
            </span>
          </span>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-border" />

        {/* ── Action bar (LinkedIn‑style) ── */}
        <div className="grid grid-cols-4 divide-x divide-border">
          {[
            { icon: <Heart className="w-4 h-4" />, label: 'Like' },
            { icon: <MessageCircle className="w-4 h-4" />, label: 'Comment' },
            { icon: <Share2 className="w-4 h-4" />, label: 'Share' },
            { icon: <Bookmark className="w-4 h-4" />, label: 'Save' },
          ].map(({ icon, label }) => (
            <button
              key={label}
              onClick={(e) => { e.stopPropagation(); goToBlog(); }}
              className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}
