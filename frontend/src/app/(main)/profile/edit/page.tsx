'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');
  const [coverPreview, setCoverPreview] = useState(user?.cover_image || '');

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
      // TODO: Call API to update profile
      updateUser({
        full_name: data.full_name,
        bio: data.bio,
      });
      router.push(`${ROUTES.PROFILE}/${user?.username}`);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">Update your profile information</p>
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

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
