'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Cover Image */}
        <div className="relative h-64 bg-linear-to-r from-primary to-primary/60">
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
        <Card className="-mt-16 relative z-10 mx-4">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name || username} />
                  <AvatarFallback className="text-4xl">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {user?.full_name || username}
                    </h1>
                    <p className="text-muted-foreground">@{username}</p>
                  </div>

                  {isOwnProfile ? (
                    <Button
                      variant="outline"
                      onClick={() => router.push(ROUTES.PROFILE_EDIT)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button onClick={() => {}}>
                      Follow
                    </Button>
                  )}
                </div>

                <p className="mt-4 text-foreground">
                  {user?.bio || 'No bio yet'}
                </p>

                <div className="flex gap-6 mt-4 text-sm">
                  <div>
                    <span className="font-semibold">0</span> <span className="text-muted-foreground">Followers</span>
                  </div>
                  <div>
                    <span className="font-semibold">0</span> <span className="text-muted-foreground">Following</span>
                  </div>
                  <div>
                    <span className="font-semibold">0</span> <span className="text-muted-foreground">Blogs</span>
                  </div>
                </div>

                {user?.interests && user.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {user.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blogs Section */}
        <div className="mx-4 mt-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Published Blogs</h2>
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No blogs published yet
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
