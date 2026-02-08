'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';
import { formatDate, calculateReadingTime } from '@/utils/helpers';

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [page, setPage] = useState(1);

  // TODO: Fetch blogs from API
  const blogs = [
    {
      id: '1',
      title: 'Getting Started with Next.js 14',
      slug: 'getting-started-nextjs-14',
      excerpt: 'Learn how to build modern web applications with the latest Next.js features...',
      content: '<p>Sample content</p>',
      cover_image: '',
      tags: ['nextjs', 'react', 'web development'],
      author: {
        username: 'johndoe',
        full_name: 'John Doe',
        avatar_url: '',
      },
      views_count: 1234,
      likes_count: 56,
      comments_count: 12,
      created_at: new Date().toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="text-gray-600">Discover personalized content just for you</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {[
            { key: 'all', label: 'For You' },
            { key: 'following', label: 'Following' },
            { key: 'trending', label: 'Trending' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                filter === tab.key
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {blogs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">Start following people to see their content</p>
                <button
                  onClick={() => router.push(ROUTES.WRITE)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Write Your First Blog
                </button>
              </div>
            ) : (
              blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => router.push(`${ROUTES.BLOG}/${blog.slug}`)}
                >
                  <div className="p-6">
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        {blog.author.avatar_url ? (
                          <img
                            src={blog.author.avatar_url}
                            alt={blog.author.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                            {blog.author.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{blog.author.full_name}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(blog.created_at)} · {calculateReadingTime(blog.content)} min read
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold mb-2 hover:text-blue-600">
                        {blog.title}
                      </h2>
                      <p className="text-gray-600 line-clamp-2">{blog.excerpt}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>❤️ {blog.likes_count}</span>
                      <span>💬 {blog.comments_count}</span>
                      <span>👁️ {blog.views_count}</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Load More */}
            {blogs.length > 0 && (
              <div className="text-center py-8">
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Load More
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(ROUTES.WRITE)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  ✍️ Write a Blog
                </button>
                <button
                  onClick={() => router.push(ROUTES.PROFILE_EDIT)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  👤 Edit Profile
                </button>
              </div>
            </div>

            {/* Trending Tags */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-4">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'React', 'AI', 'Web Dev', 'Python', 'Career'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-4">Suggested Writers</h3>
              <div className="space-y-4">
                {['Jane Smith', 'Alex Johnson'].map((name, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div>
                        <div className="font-medium text-sm">{name}</div>
                        <div className="text-xs text-gray-500">@{name.toLowerCase().replace(' ', '')}</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard