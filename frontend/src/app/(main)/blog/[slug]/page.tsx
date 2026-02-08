'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDate, calculateReadingTime } from '@/utils/helpers';

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
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      {blog.cover_image && (
        <div className="relative h-96 bg-gray-900">
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
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 -mt-20 relative z-10">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>

          {/* Author & Meta */}
          <div className="flex items-center gap-4 pb-6 border-b">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              {blog.author.avatar_url ? (
                <Image
                  src={blog.author.avatar_url}
                  alt={blog.author.full_name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                  {blog.author.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">{blog.author.full_name}</div>
              <div className="text-sm text-gray-600">
                {formatDate(blog.created_at)} · {readingTime} min read · {blog.views_count} views
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 py-6 border-b">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              ❤️ Like ({blog.likes_count})
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              💬 Comment ({blog.comments_count})
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              🔗 Share
            </button>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mt-8"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
          <h2 className="text-2xl font-bold mb-6">Comments ({blog.comments_count})</h2>
          
          {/* Comment Form */}
          <div className="mb-8">
            <textarea
              placeholder="Write a comment..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <button className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Post Comment
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            <div className="text-center text-gray-500">No comments yet</div>
          </div>
        </div>

        {/* Related Blogs */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-sm text-gray-500 mb-2">Technology</div>
              <h3 className="font-bold text-lg mb-2">Related Blog Title 1</h3>
              <p className="text-gray-600 text-sm">Brief description of the blog post...</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-sm text-gray-500 mb-2">Programming</div>
              <h3 className="font-bold text-lg mb-2">Related Blog Title 2</h3>
              <p className="text-gray-600 text-sm">Brief description of the blog post...</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
