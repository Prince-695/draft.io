'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LandingNavbar } from '@/components/LandingNavbar';
import {
  PenSquare,
  Sparkles,
  Users,
  TrendingUp,
  Zap,
  Shield,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Rss,
  Star,
  Globe,
  BookOpen,
  Feather,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    gradient: 'from-violet-500 to-indigo-500',
    title: 'AI Writing Assistant',
    desc: "Beat writer's block with smart suggestions, auto-completions and one-click content improvements powered by GPT.",
  },
  {
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-500',
    title: 'Analytics & Insights',
    desc: 'See exactly who reads your posts, how long they stay, and which stories keep them coming back.',
  },
  {
    icon: Users,
    gradient: 'from-pink-500 to-rose-500',
    title: 'Grow Your Audience',
    desc: 'Followers, recommendations and a personalised feed surface your work to exactly the right readers.',
  },
  {
    icon: MessageSquare,
    gradient: 'from-amber-500 to-orange-500',
    title: 'Real-time Chat',
    desc: 'Talk directly to readers and fellow writers with instant DMs — no third-party app needed.',
  },
  {
    icon: Zap,
    gradient: 'from-cyan-500 to-blue-500',
    title: 'Publish Instantly',
    desc: 'Draft, preview and go live in one click. Schedule posts, save drafts, auto-backup in the background.',
  },
  {
    icon: Shield,
    gradient: 'from-slate-500 to-gray-600',
    title: 'Your Content, Safe',
    desc: 'OAuth2, JWT-secured endpoints, and daily backups. Your words are yours — always.',
  },
];

const STEPS = [
  { n: '01', title: 'Create an Account', desc: 'Sign up free in under 30 seconds. No credit card, no catch.' },
  { n: '02', title: 'Write with AI', desc: 'Open the editor, let AI assist your drafts, add images and publish.' },
  { n: '03', title: 'Build Your Audience', desc: 'Get discovered through the public feed, search and recommendations.' },
];

const CATEGORIES = [
  { label: 'Technology', emoji: '💻' },
  { label: 'Health', emoji: '🏃' },
  { label: 'Business', emoji: '📈' },
  { label: 'Science', emoji: '🔬' },
  { label: 'Art', emoji: '🎨' },
  { label: 'Travel', emoji: '✈️' },
];

const STATS = [
  { value: '10K+', label: 'Active Writers' },
  { value: '50K+', label: 'Stories Published' },
  { value: '1M+', label: 'Words Written' },
  { value: '95%', label: 'Satisfaction' },
];

const TESTIMONIALS = [
  {
    text: 'Draft.IO changed how I write. The AI suggestions are scary good and the editor just gets out of your way.',
    author: 'Priya S.',
    role: 'Tech blogger',
  },
  {
    text: 'I moved my entire newsletter here. The analytics actually tell me something useful for once.',
    author: 'Marcus T.',
    role: 'Finance writer',
  },
  {
    text: 'The public feed brought me readers I would never have found on my own. My following tripled in a month.',
    author: 'Leila K.',
    role: 'Travel storyteller',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <LandingNavbar />

      {/* HERO */}
      <section className="relative pt-24 pb-32 md:pt-36 md:pb-44 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute right-0 bottom-0 h-[400px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Blogging Platform
          </div>

          <h1 className="mx-auto mb-6 max-w-5xl text-5xl font-extrabold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
            The platform where{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
                great writers
              </span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                <path d="M2 9C50 3 100 1 150 5C200 9 250 11 298 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/40" />
              </svg>
            </span>
            {' '}<br className="hidden sm:block" />
            find their audience
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            Write faster with AI, publish beautifully, and grow a loyal readership —
            all in one place. No plugins, no complexity, no limits.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                Start Writing Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/feed">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold">
                <Globe className="mr-2 h-4 w-4" />
                Browse the Feed
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {['Free to start', 'No credit card', 'AI-powered editor', 'Public feed included'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary/70" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Editor mockup */}
        <div className="container mx-auto px-4 mt-20 max-w-4xl">
          <div className="relative rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/10 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <div className="ml-4 flex-1 h-5 max-w-xs rounded-md bg-muted/60" />
            </div>
            <div className="flex items-center gap-3 border-b border-border/40 bg-muted/20 px-6 py-2.5">
              {['B', 'I', 'U', 'H1', 'H2', '{ }', '≡'].map((t) => (
                <span key={t} className="h-7 px-2 rounded text-xs font-mono text-muted-foreground bg-muted/50 flex items-center">{t}</span>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="h-6 w-16 rounded bg-primary/20 text-xs text-primary font-medium flex items-center justify-center">AI ✦</span>
                <span className="h-6 w-16 rounded bg-primary text-xs text-primary-foreground font-medium flex items-center justify-center">Publish</span>
              </div>
            </div>
            <div className="px-8 py-8 space-y-4">
              <div className="h-8 w-2/3 rounded-lg bg-foreground/10" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted/60" />
                <div className="h-4 w-[92%] rounded bg-muted/60" />
                <div className="h-4 w-[85%] rounded bg-muted/60" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full rounded bg-muted/60" />
                <div className="h-4 w-[78%] rounded bg-muted/60" />
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-1/2 rounded bg-primary/20" />
                  <div className="h-3 w-3/4 rounded bg-primary/15" />
                  <div className="h-3 w-2/3 rounded bg-primary/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="border-y border-border/50 bg-muted/30 py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/60 uppercase tracking-widest text-xs">Trusted by writers from</span>
            {['Medium', 'Substack', 'WordPress', 'Ghost', 'Dev.to'].map((p) => (
              <span key={p} className="font-semibold text-foreground/40 text-base">{p}</span>
            ))}
            <span className="font-medium text-foreground/60 uppercase tracking-widest text-xs">communities</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">write &amp; grow</span>
            </h2>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Built specifically for writers who want to focus on craft, not configuration.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, gradient, title, desc }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative py-28 overflow-hidden border-t">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/5 blur-[80px]" />
        </div>
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              From idea to published — in minutes
            </h2>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-0 md:grid-cols-3 relative">
              <div className="hidden md:block absolute top-10 left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] h-px bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
              {STEPS.map(({ n, title, desc }) => (
                <div key={n} className="relative flex flex-col items-center text-center px-6 py-4">
                  <div className="mb-5 relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary/20 bg-background shadow-lg shadow-primary/10">
                    <span className="text-3xl font-black text-primary leading-none">{n}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-10 text-base font-semibold shadow-lg shadow-primary/20">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEED SHOWCASE */}
      <section id="feed" className="py-28 border-t">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl grid gap-16 md:grid-cols-2 items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Public Feed</p>
              <h2 className="mb-5 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-tight">
                Discover stories,{' '}
                <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">no login required</span>
              </h2>
              <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
                Browse thousands of posts by topic. Find what inspires you.
                When you&apos;re ready to write — we&apos;ll be here.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/feed">
                  <Button size="lg" className="gap-2 h-11">
                    <Rss className="h-4 w-4" />
                    Explore the Feed
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="lg" variant="outline" className="h-11">
                    Start Writing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map(({ label, emoji }) => (
                <Link
                  key={label}
                  href={`/feed?category=${label}`}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-28 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Testimonials</p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Loved by writers worldwide</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {TESTIMONIALS.map(({ text, author, role }) => (
              <div key={author} className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-1 border-t border-border/40">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{author}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 grid-cols-2 md:grid-cols-4 text-center max-w-4xl mx-auto">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="mb-1 text-4xl font-black text-primary tracking-tight">{value}</div>
                <div className="text-sm text-muted-foreground font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary px-8 py-20 text-center text-primary-foreground shadow-2xl shadow-primary/30">
            <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
                <Feather className="h-3.5 w-3.5" />
                Your story starts here
              </div>
              <h2 className="mb-5 text-3xl font-extrabold tracking-tight md:text-5xl">
                Ready to write something{' '}
                <br className="hidden md:block" />
                worth reading?
              </h2>
              <p className="mb-8 mx-auto max-w-lg text-primary-foreground/80 text-lg">
                Join thousands of writers publishing on Draft.IO every day. Free forever for individuals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <Button size="lg" className="h-12 px-10 text-base font-bold bg-white text-primary hover:bg-white/90 shadow-xl">
                    Create Your Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button size="lg" variant="ghost" className="h-12 px-10 text-base font-semibold text-primary-foreground hover:bg-white/15">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Stories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-muted/30 py-14">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 md:grid-cols-4 mb-12">
            <div className="md:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <PenSquare className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold">Draft.IO</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The AI-powered blogging platform built for writers who mean business.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/70">Product</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/feed" className="hover:text-foreground transition-colors">Public Feed</Link></li>
                <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/70">Company</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/70">Legal</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Draft.IO. All rights reserved.</p>
            <p className="flex items-center gap-1">Made with <span className="text-red-500 mx-0.5">♥</span> for writers everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
