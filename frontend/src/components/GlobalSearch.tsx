'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, FileText, X } from 'lucide-react';
import { userApi } from '@/lib/api/user';
import { blogApi } from '@/lib/api/blog';
import type { User as UserType, Blog } from '@/types';
import { ROUTES } from '@/utils/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Tab = 'all' | 'blogs' | 'writers';

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [users, setUsers] = useState<UserType[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // Debounced search — fires 600ms after the user stops typing, min 2 chars
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setUsers([]);
      setBlogs([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [userRes, blogRes] = await Promise.allSettled([
          userApi.searchUsers(query),
          blogApi.searchBlogs(query),
        ]);

        setUsers(
          userRes.status === 'fulfilled' && userRes.value?.data
            ? userRes.value.data.slice(0, 4)
            : []
        );
        setBlogs(
          blogRes.status === 'fulfilled' && blogRes.value?.data?.blogs
            ? blogRes.value.data.blogs.slice(0, 3)
            : []
        );
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, 600);
  }, [query]);

  function navigate(path: string) {
    setQuery('');
    setOpen(false);
    router.push(path);
  }

  const showUsers = activeTab !== 'blogs';
  const showBlogs = activeTab !== 'writers';
  const hasResults = (showUsers && users.length > 0) || (showBlogs && blogs.length > 0);

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search people & posts..."
          className="pl-9 pr-8 py-2 w-64 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {(['all', 'blogs', 'writers'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onMouseDown={(e) => { e.preventDefault(); setActiveTab(tab); }}
                className={`flex-1 py-2 text-xs font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary bg-accent/30'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {!query.trim() && (
            <div className="py-5 text-center text-sm text-muted-foreground">
              Type to search&hellip;
            </div>
          )}

          {query.trim() && loading && (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          )}

          {query.trim() && !loading && !hasResults && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results for &quot;{query}&quot;
            </div>
          )}

          {!loading && showUsers && users.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                People
              </div>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => navigate(`${ROUTES.PROFILE}/${u.username}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left"
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={u.profile_picture_url} />
                    <AvatarFallback>{u.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{u.full_name || u.username}</div>
                    <div className="text-xs text-muted-foreground truncate">@{u.username}</div>
                  </div>
                  <User className="w-3 h-3 text-muted-foreground ml-auto shrink-0" />
                </button>
              ))}
            </div>
          )}

          {!loading && showBlogs && blogs.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                Posts
              </div>
              {blogs.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`${ROUTES.BLOG}/${b.slug}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{b.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      by {b.author?.username}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
