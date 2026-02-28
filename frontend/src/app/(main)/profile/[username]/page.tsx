'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores';
import { formatDate } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Heart, MessageCircle, Eye, PenSquare, UserPlus, UserCheck,
  MapPin, Globe, Twitter, Linkedin, Github,
} from 'lucide-react';
import { useUserProfile, useFollowUser, useUnfollowUser, useFollowers, useFollowing } from '@/hooks/useUser';
import { blogApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/utils/constants';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params);
  const router = useRouter();
  const { user: currentUser } = useAuthStore();

  const [following, setFollowing] = useState(false);

  // Fetch profile
  const { data: profileData, isLoading: loadingProfile } = useUserProfile(username);
  const profile = profileData?.data as any;
  const isOwnProfile = currentUser?.id === profile?.id;

  // Fetch followers & following counts
  const { data: followersData } = useFollowers(profile?.id || '');
  const { data: followingData } = useFollowing(profile?.id || '');

  // Fetch blogs — own profile uses my-blogs (all statuses), others use user/:id (published only)
  const { data: myBlogsData } = useQuery({
    queryKey: [QUERY_KEYS.BLOGS, 'mine'],
    queryFn: () => blogApi.getMyBlogs(1),
    enabled: isOwnProfile,
  });

  const { data: userBlogsData } = useQuery({
    queryKey: [QUERY_KEYS.BLOGS, 'user', profile?.id],
    queryFn: () => blogApi.getUserBlogs(profile!.id, 1),
    enabled: !isOwnProfile && !!profile?.id,
  });

  const blogs: any[] = isOwnProfile
    ? (myBlogsData?.data?.blogs || [])
    : (userBlogsData?.data?.blogs || []);

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Sync initial follow state from followers list
  useEffect(() => {
    if (followersData?.data && currentUser?.id) {
      const followersList: Array<{ id: string }> = (followersData.data as any)?.followers ?? (Array.isArray(followersData.data) ? followersData.data : []);
      setFollowing(followersList.some((f) => f.id === currentUser.id));
    }
  }, [followersData, currentUser?.id]);

  const handleFollowToggle = async () => {
    if (!profile?.id) return;
    try {
      if (following) {
        await unfollowMutation.mutateAsync(profile.id);
        setFollowing(false);
      } else {
        await followMutation.mutateAsync(profile.id);
        setFollowing(true);
      }
    } catch { /* ignore */ }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">User not found</p>
          <Button onClick={() => router.push(ROUTES.DASHBOARD)}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const followersCount = (followersData?.data as any)?.pagination?.total ?? (followersData?.data as any)?.followers?.length ?? profile?.followers_count ?? 0;
  const followingCount = (followingData?.data as any)?.pagination?.total ?? (followingData?.data as any)?.following?.length ?? profile?.following_count ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-primary to-primary/60 overflow-hidden">
          {profile.cover_image_url ? (
            <Image src={profile.cover_image_url} alt="Cover" fill className="object-cover" />
          ) : null}
        </div>

        {/* Profile Info */}
        <Card className="-mt-16 relative z-10 mx-4">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.profile_picture_url} alt={profile.full_name || username} />
                  <AvatarFallback className="text-4xl">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.full_name || username}</h1>
                    <p className="text-muted-foreground">@{username}</p>
                  </div>

                  {isOwnProfile ? (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => router.push(ROUTES.PROFILE_EDIT)}>
                        Edit Profile
                      </Button>
                      <Button onClick={() => router.push(ROUTES.WRITE)}>
                        <PenSquare className="w-4 h-4 mr-2" />
                        Write
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant={following ? 'outline' : 'default'}
                      onClick={handleFollowToggle}
                      disabled={followMutation.isPending || unfollowMutation.isPending}
                    >
                      {following ? (
                        <><UserCheck className="w-4 h-4 mr-2" />Following</>
                      ) : (
                        <><UserPlus className="w-4 h-4 mr-2" />Follow</>
                      )}
                    </Button>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="mt-4 text-foreground leading-relaxed">{profile.bio}</p>
                )}

                {/* Location, website, socials */}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Globe className="w-4 h-4 shrink-0" />
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {profile.twitter_handle && (
                    <a
                      href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Twitter className="w-4 h-4 shrink-0" />
                      {profile.twitter_handle}
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://linkedin.com/in/${profile.linkedin_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Linkedin className="w-4 h-4 shrink-0" />
                      LinkedIn
                    </a>
                  )}
                  {profile.github_url && (
                    <a
                      href={profile.github_url.startsWith('http') ? profile.github_url : `https://github.com/${profile.github_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Github className="w-4 h-4 shrink-0" />
                      GitHub
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-4 text-sm">
                  <div>
                    <span className="font-semibold">{followersCount}</span>{' '}
                    <span className="text-muted-foreground">Followers</span>
                  </div>
                  <div>
                    <span className="font-semibold">{followingCount}</span>{' '}
                    <span className="text-muted-foreground">Following</span>
                  </div>
                  <div>
                    <span className="font-semibold">{blogs.length}</span>{' '}
                    <span className="text-muted-foreground">Blogs</span>
                  </div>
                </div>

                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.interests.map((interest: any) => (
                      <Badge key={typeof interest === 'object' ? interest.id ?? interest.name : interest} variant="secondary">
                        {typeof interest === 'object' ? interest.name : interest}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Expertise tags */}
                {profile.expertise_tags && profile.expertise_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.expertise_tags.map((tag: any) => (
                      <Badge key={typeof tag === 'object' ? tag.id ?? tag.name : tag} variant="outline">
                        {typeof tag === 'object' ? tag.name : tag}
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
          <h2 className="text-2xl font-bold mb-4">
            {isOwnProfile ? 'My Blogs' : 'Published Blogs'}
          </h2>
          {blogs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {isOwnProfile ? (
                  <div>
                    <p className="mb-4">You haven&apos;t published any blogs yet</p>
                    <Button onClick={() => router.push(ROUTES.WRITE)}>
                      <PenSquare className="w-4 h-4 mr-2" />
                      Write your first blog
                    </Button>
                  </div>
                ) : (
                  <p>No blogs published yet</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() =>
                    blog.status === 'published'
                      ? router.push(`${ROUTES.BLOG}/${blog.slug}`)
                      : router.push(`${ROUTES.WRITE}?edit=${blog.id}`)
                  }
                >
                  <CardContent className="p-6 flex gap-4">
                    {blog.cover_image_url && (
                      <div className="relative w-32 h-24 shrink-0 rounded-md overflow-hidden">
                        <Image src={blog.cover_image_url} alt={blog.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-lg mb-1 hover:text-primary line-clamp-2 flex-1">
                          {blog.title}
                        </h3>
                        {isOwnProfile && blog.status && (
                          <Badge variant={blog.status === 'published' ? 'default' : 'secondary'} className="shrink-0">
                            {blog.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {blog.content?.slice(0, 150)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDate(blog.created_at)}</span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {blog.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {blog.comments_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {blog.views_count || 0}
                        </span>
                      </div>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {blog.tags.slice(0, 3).map((tag: any) => (
                            <Badge
                              key={typeof tag === 'object' ? tag.id ?? tag.name : tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {typeof tag === 'object' ? tag.name : tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
