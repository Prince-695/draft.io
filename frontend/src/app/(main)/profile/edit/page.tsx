'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useAuthStore } from '@/stores';
import { ROUTES, API_ENDPOINTS } from '@/utils/constants';
import apiClient from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Home } from 'lucide-react';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = useState((user as any)?.avatar_url || user?.profile_picture_url || '');
  const [coverPreview, setCoverPreview] = useState((user as any)?.cover_image || user?.cover_image_url || '');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      bio: user?.bio || '',
      location: '',
      website: '',
      twitter: '',
      github: '',
      linkedin: '',
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // TODO: Upload to Cloudinary
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // TODO: Upload to Cloudinary
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaveError(null);
      setIsSaving(true);
      await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, {
        full_name: data.full_name,
        bio: data.bio?.trim() || undefined,
        location: data.location?.trim() || undefined,
        website: data.website?.trim() || undefined,
        // Strip leading @ from twitter handle; skip if empty
        twitter_handle: data.twitter?.trim()
          ? data.twitter.trim().replace(/^@/, '')
          : undefined,
        // Accept raw username or full URL for github/linkedin
        github_url: data.github?.trim() || undefined,
        linkedin_url: data.linkedin?.trim() || undefined,
      });
      updateUser({
        full_name: data.full_name,
        bio: data.bio,
      });
      const username = user?.username;
      if (username) {
        router.push(`${ROUTES.PROFILE}/${username}`);
      } else {
        router.push(ROUTES.DASHBOARD);
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const msg = error?.response?.data?.error || error?.message || 'Failed to save profile. Please try again.';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (saveError && saveError.toLowerCase().includes('not found')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <p className="text-2xl font-bold">Profile Error</p>
          <p className="text-muted-foreground">{saveError}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setSaveError(null)}>Try Again</Button>
            <Button onClick={() => router.push(ROUTES.DASHBOARD)}>
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground mt-1">Update your profile information</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.DASHBOARD)}>
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No cover image
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Click to upload (max 5MB)</p>
            </CardContent>
          </Card>

          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative cursor-pointer">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarPreview} alt="Avatar" />
                    <AvatarFallback className="text-2xl">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Click to upload new avatar
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  type="text"
                  {...register('full_name')}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  {...register('location')}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  {...register('website')}
                  placeholder="https://yourwebsite.com"
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  type="text"
                  {...register('twitter')}
                  placeholder="@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  type="text"
                  {...register('github')}
                  placeholder="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  type="text"
                  {...register('linkedin')}
                  placeholder="username"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Error */}
          {saveError && (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/10">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive flex-1">{saveError}</p>
              <Button size="sm" variant="outline" onClick={() => router.push(ROUTES.DASHBOARD)}>
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
