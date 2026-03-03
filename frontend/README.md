# Draft.IO — Frontend

A **Next.js 16** application built with React 19, TypeScript, Tailwind CSS, and a rich set of libraries for a production-grade blogging experience.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Page Reference](#page-reference)
- [Routing & Layout Groups](#routing--layout-groups)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Authentication Flow](#authentication-flow)
- [Real-Time Features](#real-time-features)
- [AI Writing Toolbar](#ai-writing-toolbar)
- [Editor (TipTap)](#editor-tiptap)
- [Component Library](#component-library)
- [Forms & Validation](#forms--validation)
- [Theming](#theming)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Build & Deploy](#build--deploy)

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| Next.js | 16.1.4 | Framework with App Router, SSR/CSR |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4 | Utility-first styling |
| shadcn/ui + Radix UI | latest | Accessible UI primitives |
| TipTap | 3.x | Rich text editor |
| Zustand | 5.x | Client state management |
| TanStack React Query | 5.x | Server state, caching, mutations |
| Axios | 1.x | HTTP client |
| Socket.io-client | 4.x | WebSocket connections |
| Zod | 4.x | Schema validation |
| react-hook-form | 7.x | Form state |
| Framer Motion | 12.x | Animations |
| marked | 17.x | Markdown → HTML parsing |
| next-themes | 0.4.x | Light/dark mode |
| lucide-react | latest | Icon set |
| sonner | 2.x | Toast notifications |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx                # Root layout (providers, fonts)
│   │   ├── globals.css               # Tailwind base layers, CSS variables
│   │   ├── page.tsx                  # Landing page (/)
│   │   ├── feed/
│   │   │   └── page.tsx              # Public blog feed (/feed)
│   │   ├── auth/callback/
│   │   │   └── page.tsx              # Google OAuth return handler
│   │   ├── (auth)/                   # Auth group — uses PublicRoute guard
│   │   │   ├── sign-in/page.tsx
│   │   │   ├── sign-up/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── questionnaire/page.tsx   # Onboarding interest picker
│   │   │   └── profile/page.tsx         # Complete profile after OAuth
│   │   └── (main)/                   # Main app group — uses ProtectedRoute guard
│   │       ├── dashboard/page.tsx    # Home feed after login
│   │       ├── write/page.tsx        # Blog editor + AI toolbar
│   │       ├── blog/[slug]/page.tsx  # Public blog reading view
│   │       ├── explore/page.tsx      # Trending + search
│   │       ├── my-posts/page.tsx     # Own drafts & published posts
│   │       ├── profile/
│   │       │   ├── [username]/page.tsx  # Public user profile
│   │       │   └── edit/page.tsx        # Edit own profile
│   │       ├── chat/page.tsx         # Full-page chat view
│   │       ├── notifications/page.tsx
│   │       └── settings/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives (Button, Card, Dialog…)
│   │   ├── Editor.tsx                # TipTap wrapper with full toolbar
│   │   ├── AIToolbar.tsx             # AI generation toolbar
│   │   ├── AIAssistant.tsx           # Floating AI chat assistant
│   │   ├── BlogPostCard.tsx          # Feed/explore blog card
│   │   ├── MessageSidebar.tsx        # Floating DM panel (any page)
│   │   ├── NotificationDropdown.tsx  # Navbar notification bell
│   │   ├── Navbar.tsx                # Authenticated app navbar
│   │   ├── LandingNavbar.tsx         # Public landing page navbar
│   │   ├── GlobalSearch.tsx          # CMD+K search overlay
│   │   ├── ProtectedRoute.tsx        # Redirects unauthenticated users
│   │   ├── PublicRoute.tsx           # Redirects authenticated users away
│   │   ├── ThemeSwitcher.tsx         # Light/dark toggle
│   │   ├── Loading.tsx               # Full-page spinner
│   │   └── Animations.tsx            # Framer Motion presets
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                # Login, register, logout mutations
│   │   ├── useBlog.ts                # Blog CRUD mutations (single blog)
│   │   ├── useBlogs.ts               # Blog list queries
│   │   ├── useAI.ts                  # AI mutation hooks + usage query
│   │   ├── useUser.ts                # User profile queries + follow mutations
│   │   └── index.ts                  # Re-exports
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             # Axios instance + interceptors
│   │   │   ├── auth.ts               # Auth API functions
│   │   │   ├── blog.ts               # Blog API functions
│   │   │   ├── user.ts               # User API functions
│   │   │   ├── ai.ts                 # AI API functions
│   │   │   ├── chat.ts               # Chat REST API functions
│   │   │   └── index.ts              # Re-exports
│   │   ├── providers.tsx             # React Query + theme providers wrapper
│   │   ├── socket.ts                 # Notification Socket.io singleton
│   │   └── chatSocketInstance.ts     # Chat Socket.io singleton
│   │
│   ├── stores/
│   │   ├── authStore.ts              # Zustand: user, tokens, isAuthenticated
│   │   ├── chatStore.ts              # Zustand: conversations, messages, online users
│   │   ├── uiStore.ts                # Zustand: AI quota, message panel open state
│   │   └── index.ts                  # Re-exports
│   │
│   ├── types/
│   │   └── index.ts                  # Global TS interfaces (User, Blog, ChatMessage…)
│   │
│   └── utils/
│       ├── constants.ts              # ROUTES, API_ENDPOINTS, APP_NAME, WS_URL
│       └── helpers.ts                # getErrorMessage, formatDate, etc.
│
├── public/                           # Static assets
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
└── package.json
```

---

## Page Reference

| Route | Page | Auth | Description |
|---|---|---|---|
| `/` | Landing | — | Hero, features, CTA sections |
| `/feed` | Public Feed | — | Paginated published blogs without login |
| `/sign-in` | Sign In | — | Email/password + Google OAuth button |
| `/sign-up` | Sign Up | — | Registration form with Zod validation |
| `/forgot-password` | Forgot PW | — | Request password reset email |
| `/questionnaire` | Onboarding | ✓ | Select topics of interest (seeds recommendation engine) |
| `/profile` | Profile Setup | ✓ | Complete profile after Google OAuth sign-up |
| `/auth/callback` | OAuth Callback | — | Receives JWT from Google OAuth redirect |
| `/dashboard` | Dashboard | ✓ | Personalized feed + trending + following feed |
| `/write` | Write | ✓ | Full editor + AI toolbar; `?edit=<id>` for editing |
| `/blog/:slug` | Blog View | — | Full blog post with comments, likes, bookmarks |
| `/explore` | Explore | ✓ | Search, trending, browse by category |
| `/my-posts` | My Posts | ✓ | Own drafts and published posts with status badges |
| `/profile/:username` | User Profile | — | Public profile with follow button and their posts |
| `/profile/edit` | Edit Profile | ✓ | Update bio, social links, profile picture |
| `/chat` | Chat | ✓ | Full-page direct message view |
| `/notifications` | Notifications | ✓ | Full notification history |
| `/settings` | Settings | ✓ | Account settings, theme, preferences |

---

## Routing & Layout Groups

Next.js App Router **route groups** (folders wrapped in parentheses) do not appear in the URL but share layouts and middleware:

```
(auth)/       ─ Wrapped in PublicRoute: redirects authenticated users to /dashboard
(main)/       ─ Wrapped in ProtectedRoute: redirects unauthenticated users to /sign-in
```

Each group can have its own `layout.tsx`. The `(main)` layout renders the `Navbar`, `MessageSidebar`, and `NotificationDropdown` on every protected page.

---

## State Management

Three Zustand stores handle all client-side state. They persist data across page navigations without prop drilling.

### `authStore`
```typescript
{
  user: User | null
  tokens: { accessToken: string; refreshToken: string } | null
  isAuthenticated: boolean
  isLoading: boolean        // true until session is verified on app boot
}
```
- Persisted to `localStorage` via `zustand/middleware/persist`
- `login(user, tokens)` — called after successful auth
- `logout()` — clears state + localStorage
- `updateUser(partial)` — merge update for profile edits

### `chatStore`
```typescript
{
  conversations: Array<{ user: User; unreadCount: number }>
  activeConversation: User | null
  messages: ChatMessage[]
  onlineUsers: Set<string>
  typingUsers: Set<string>
}
```
- Updated by Socket.io events in `ChatSocketProvider`
- `setConversationMessages(otherId, myId, msgs)` — load history

### `uiStore`
```typescript
{
  messagePanelOpen: boolean
  aiRequestsUsed: number
  aiRequestsLimit: number
}
```
- `setAIUsage(used, limit)` — called by axios interceptor on every AI response
- `incrementAIUsage()` — unused (interceptor takes precedence)

---

## API Layer

All backend calls go through a single Axios instance defined in `src/lib/api/client.ts`.

### Axios Instance
```
baseURL  = NEXT_PUBLIC_API_URL || 'http://localhost:5000'
timeout  = 30 000 ms
```

### Request Interceptor
Reads the current `accessToken` from `authStore` and attaches it as `Authorization: Bearer <token>` on every outgoing request.

### Response Interceptor
Two jobs:
1. **AI quota update** — reads `X-AI-Requests-Used` and `X-AI-Requests-Limit` response headers and calls `uiStore.setAIUsage()`, keeping the live quota bar accurate
2. **Token refresh** — on 401 responses (excluding auth endpoints), automatically calls `POST /api/auth/refresh`, retries the original request with the new token. On refresh failure: logout + redirect to `/sign-in`

### API Modules

| Module | File | Key Functions |
|---|---|---|
| Auth | `lib/api/auth.ts` | `login`, `register`, `logout`, `refreshToken`, `getMe` |
| Blog | `lib/api/blog.ts` | `createBlog`, `updateBlog`, `publishBlog`, `getBlogBySlug`, `getMyBlogs` |
| User | `lib/api/user.ts` | `getProfile`, `updateProfile`, `follow`, `unfollow`, `searchUsers` |
| AI | `lib/api/ai.ts` | `generateContent`, `generateTitles`, `improveContent`, `checkGrammar`, `getSEOSuggestions`, `getUsage` |
| Chat | `lib/api/chat.ts` | `getMessages`, `getConversations`, `getUnreadCount` |

---

## Authentication Flow

```
1. User submits sign-in form
   → POST /api/auth/login
   → authStore.login(user, tokens)
   → tokens persisted to localStorage

2. App boot (AuthInitializer component)
   → reads tokens from localStorage via Zustand persist
   → calls GET /api/auth/me to verify the access token is still valid
   → on success: authStore.setUser(user), setLoading(false)
   → on 401: attempt refresh → if that fails, logout()

3. Google OAuth
   → user clicks "Continue with Google"
   → redirected to GET /api/auth/google
   → Google consent → callback to /api/auth/google/callback
   → backend issues JWT pair, redirects to /auth/callback?token=...
   → frontend page reads token query param, stores in authStore
   → redirects to /questionnaire (new user) or /dashboard (returning)

4. Token refresh (automatic, in axios interceptor)
   → any 401 response triggers POST /api/auth/refresh
   → new accessToken stored silently
   → original request retried once (_retry flag prevents loops)
```

---

## Real-Time Features

### Notification Socket (`lib/socket.ts`)
```
Connects to: ws://localhost:5006  (NEXT_PUBLIC_WS_URL)
Auth: { token: accessToken } in socket handshake

Events listened to:
  'new_notification'  → adds to notification list in UI
  'unread_count'      → updates red badge in Navbar

Mounted in: NotificationSocketProvider (wraps the (main) layout)
```

### Chat Socket (`lib/chatSocketInstance.ts`)
```
Connects to: ws://localhost:5007
Auth: { token: accessToken } in socket handshake

Events listened to:
  'message_received'  → chatStore.addMessage()
  'message_sent'      → confirmation of own message
  'user_status'       → chatStore online presence map
  'user_typing'       → chatStore typing indicators (auto-cleared after 3s)

Events emitted:
  'send_message'      → { receiverId, content }
  'check_online'      → { userId }
  'typing'            → { receiverId }

Mounted in: ChatSocketProvider (wraps the (main) layout)
```

Both sockets are **singletons** — they connect once on app mount and persist for the entire session. The `getChatSocket()` helper returns the existing instance from anywhere in the component tree.

---

## AI Writing Toolbar

Located in `components/AIToolbar.tsx`. Rendered on the `/write` page above the editor.

**Buttons:**
- **Generate** — opens a dialog for a custom prompt → calls `POST /api/ai/generate/content` → result appended to editor
- **Improve** — rewrites selected/all content with optional instruction → `POST /api/ai/improve/content`
- **Grammar** — fixes grammar/spelling → `POST /api/ai/improve/grammar`
- **SEO** — analyzes title + content → `POST /api/ai/seo/suggestions`
- **Dropdown** — preset quick actions (make professional, make shorter/longer, add emojis, conversational tone)

**Quota Bar:**
- Lives at the right side of the toolbar
- Shows `N / 10 AI requests left` with a colour-coded progress bar (green → yellow → red)
- Updated in real-time from `X-AI-Requests-Used` response headers via the axios interceptor + Zustand `uiStore`
- Resets on the 1st of each month (backend Redis key expires naturally)

**Autosave + Publish safety (write page):**
- Content autosaves to a draft every 30 seconds via a `setTimeout`
- A `savedBlogIdRef` (React ref) mirrors the `savedBlogId` state, so the autosave closure always reads the most current ID — preventing duplicate draft creation
- `handleSave` and `handlePublish` both cancel the pending autosave timer immediately before running to eliminate race conditions

---

## Editor (TipTap)

`components/Editor.tsx` wraps TipTap v3 with the following extensions:

| Extension | Feature |
|---|---|
| StarterKit | Bold, italic, headings, lists, blockquote, horizontal rule |
| CodeBlockLowlight | Syntax-highlighted code blocks (lowlight) |
| Image | Inline image embedding |
| Link | Hyperlinks with auto-detection |
| Placeholder | "Start writing your amazing blog..." hint |

The editor outputs **HTML** which is stored in MongoDB via the blog service. When loaded for editing, the HTML is injected back into TipTap's `content` prop.

AI-generated content arrives as Markdown from the OpenAI API. The frontend runs `marked.parse(result)` to convert it to HTML before inserting into TipTap.

---

## Component Library

The `components/ui/` folder contains shadcn/ui components built on Radix UI primitives. Key components used throughout the app:

| Component | Usage |
|---|---|
| `Button` | All interactive buttons |
| `Card` | Blog post cards, dashboard panels |
| `Dialog` | AI prompt modal, confirmation dialogs |
| `DropdownMenu` | User menu, AI quick actions |
| `Avatar` | User profile pictures (with fallback initials) |
| `Badge` | Tags, blog status labels |
| `Input` / `Textarea` | All form fields |
| `Separator` | Visual dividers |
| `Progress` | AI quota bar |

---

## Forms & Validation

All forms use **react-hook-form** with **Zod** resolver via `@hookform/resolvers/zod`.

Example pattern:
```typescript
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

Validation runs client-side on submit. Server-side validation errors (from the backend's Zod middleware) are caught by the axios response interceptor and surfaced via `getErrorMessage(err)`.

---

## Theming

Next.js + `next-themes` provides light/dark/system theme support.

- CSS variables defined in `globals.css` for both `:root` (light) and `.dark` scopes
- Tailwind `darkMode: 'class'` strategy
- `ThemeSwitcher` component toggles between light/dark using `useTheme()` from next-themes
- Theme is persisted in `localStorage` automatically by next-themes

---

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# Backend API Gateway URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Notification WebSocket URL (notification-service)
NEXT_PUBLIC_WS_URL=http://localhost:5006

# Public app URL (used for OAuth callbacks, sharing)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# App name (optional, defaults to "Draft.IO")
NEXT_PUBLIC_APP_NAME=Draft.IO
```

---

## Running Locally

```bash
# Install dependencies
bun install      # or npm install

# Start development server
bun dev          # or npm run dev
# → http://localhost:3000

# Type-check
npx tsc --noEmit

# Lint
npm run lint
```

The frontend requires the backend API Gateway to be running on port 5000. See the [backend README](../backend/README.md) for instructions.

---

## Build & Deploy

### Vercel (recommended)
```bash
# Production build
bun run build

# Preview build locally
bun run start
```

Set the following in your Vercel project settings:
```
NEXT_PUBLIC_API_URL     = https://your-api-gateway.railway.app
NEXT_PUBLIC_WS_URL      = https://your-notification-service.railway.app
NEXT_PUBLIC_APP_URL     = https://your-vercel-app.vercel.app
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```

### Notes
- All API calls are proxied through the API Gateway — the frontend never talks directly to individual microservices over HTTP
- WebSocket connections (chat + notifications) connect directly to ports 5006 and 5007 respectively, bypassing the gateway
- The app uses the Next.js App Router exclusively — no `pages/` directory

