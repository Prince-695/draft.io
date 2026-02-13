'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDate, calculateReadingTime } from '@/utils/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPage({ params }: BlogPageProps) {
  const { slug } = use(params);
  const router = useRouter();

  // TODO: Fetch blog data
  const blog = {
    title: 'Sample Blog Post',
    content: '<p>This is sample content</p>',
    author: {
      username: 'johndoe',
      full_name: 'John Doe',
      avatar_url: '',
    },
    cover_image: '',
    tags: ['technology', 'programming'],
    views_count: 125,
    likes_count: 23,
    comments_count: 5,
    created_at: new Date().toISOString(),
  };

  const readingTime = calculateReadingTime(blog.content);

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      {blog.cover_image && (
        <div className="relative h-96 bg-muted">
          <Image
            src={blog.cover_image}
            alt={blog.title}
            fill
            className="object-cover opacity-90"
          />
        </div>
      )}

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        <Card className="-mt-20 relative z-10">
          <CardContent className="p-8 md:p-12">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {blog.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-center gap-4 pb-6">
              <Avatar className="w-12 h-12">
                {blog.author.avatar_url ? (
                  <AvatarImage 
                    src={blog.author.avatar_url} 
                    alt={blog.author.full_name}
                  />
                ) : null}
                <AvatarFallback>
                  {blog.author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{blog.author.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(blog.created_at)} · {readingTime} min read · {blog.views_count} views
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Actions */}
            <div className="flex gap-4 pb-6">
              <Button variant="default" className="gap-2">
                <Heart className="w-4 h-4" />
                Like ({blog.likes_count})
              </Button>
              <Button variant="outline" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Comment ({blog.comments_count})
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            <Separator className="mb-8" />

            {/* Content */}
            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Comments ({blog.comments_count})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Comment Form */}
            <div className="mb-8">
              <Textarea
                placeholder="Write a comment..."
                rows={3}
              />
              <Button className="mt-2">
                Post Comment
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              <div className="text-center text-muted-foreground">No comments yet</div>
            </div>
          </CardContent>
        </Card>

        {/* Related Blogs */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <Badge variant="secondary" className="mb-2">Technology</Badge>
                <h3 className="font-bold text-lg mb-2">Related Blog Title 1</h3>
                <p className="text-muted-foreground text-sm">Brief description of the blog post...</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <Badge variant="secondary" className="mb-2">Programming</Badge>
                <h3 className="font-bold text-lg mb-2">Related Blog Title 2</h3>
                <p className="text-muted-foreground text-sm">Brief description of the blog post...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </article>
    </div>
  );
}
