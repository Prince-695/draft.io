'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  // TODO: Fetch user profile and blogs
  const isOwnProfile = user?.username === username;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
          <Image
            src="/placeholder-cover.jpg"
            alt="Cover"
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Profile Info */}
        <div className="bg-white shadow-sm -mt-16 relative z-10 mx-4 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden">
                {user?.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name || username}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user?.full_name || username}
                  </h1>
                  <p className="text-gray-600">@{username}</p>
                </div>

                {isOwnProfile ? (
                  <button
                    onClick={() => router.push(ROUTES.PROFILE_EDIT)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Follow
                  </button>
                )}
              </div>

              <p className="mt-4 text-gray-700">
                {user?.bio || 'No bio yet'}
              </p>

              <div className="flex gap-6 mt-4 text-sm">
                <div>
                  <span className="font-semibold">0</span> Followers
                </div>
                <div>
                  <span className="font-semibold">0</span> Following
                </div>
                <div>
                  <span className="font-semibold">0</span> Blogs
                </div>
              </div>

              {user?.interests && user.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {user.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blogs Section */}
        <div className="mx-4 mt-8">
          <h2 className="text-2xl font-bold mb-4">Published Blogs</h2>
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            No blogs published yet
          </div>
        </div>
      </div>
    </div>
  );
}
