'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores';
import { ROUTES, API_ENDPOINTS } from '@/utils/constants';
import apiClient from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertCircle, Home } from 'lucide-react';
import { toast } from '@/utils/toast';

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

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaveError(null);
      setIsSaving(true);
      await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, {
        full_name: data.full_name,
        bio: data.bio?.trim() || undefined,
        location: data.location?.trim() || undefined,
        website: data.website?.trim() || undefined,
        twitter_handle: data.twitter?.trim()
          ? data.twitter.trim().replace(/^@/, '')
          : undefined,
        github_url: data.github?.trim() || undefined,
        linkedin_url: data.linkedin?.trim() || undefined,
      });
      updateUser({
        full_name: data.full_name,
        bio: data.bio,
      });
      toast.success({ title: 'Profile saved!' });
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

        {/* User card */}
        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-muted/40 border">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="text-2xl font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{user?.full_name || user?.username}</p>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
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
