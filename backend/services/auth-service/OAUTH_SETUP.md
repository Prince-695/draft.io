# Google OAuth Setup Instructions

## Setting up Google OAuth for Draft.IO

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Project name: `draft-io` (or your preferred name)
4. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

### 3. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen:
   - User Type: External
   - App name: Draft.IO
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Create OAuth client ID:
   - Application type: Web application
   - Name: Draft.IO Web Client
   - Authorized redirect URIs:
     - `http://localhost:5001/auth/google/callback` (development)
     - `https://your-production-domain.com/auth/google/callback` (production)

### 4. Get Credentials

1. After creating, you'll see:
   - **Client ID**: `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxx`
2. Copy these values

### 5. Update .env File

```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5001/auth/google/callback
```

### 6. Test OAuth Flow

1. Start the Auth Service:
   ```bash
   cd backend/services/auth-service
   bun run dev
   ```

2. Visit: `http://localhost:5001/auth/google`
   - Should redirect to Google login
   - After login, redirects to `http://localhost:3000/auth/callback?token=xxx`

### 7. Frontend Integration

The frontend needs to handle the OAuth callback route:

```typescript
// In frontend: app/(auth)/auth/callback/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Store token in localStorage or cookie
      localStorage.setItem('auth_token', token);
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      // Handle error
      router.push('/sign-in?error=oauth_failed');
    }
  }, [searchParams, router]);

  return <div>Processing login...</div>;
}
```

## Security Notes

- Never commit `.env` file with real credentials
- Use different credentials for development and production
- Rotate secrets regularly
- Add production domain to authorized redirect URIs before deploying

## Troubleshooting

### "redirect_uri_mismatch" error
- Ensure the redirect URI in Google Console exactly matches the one in your code
- Include the protocol (`http://` or `https://`)
- No trailing slashes

### "invalid_client" error
- Check that Client ID and Secret are correct
- Ensure they're properly set in `.env`
- Restart the server after updating `.env`
