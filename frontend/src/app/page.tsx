'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LandingNavbar } from '@/components/LandingNavbar';
import { 
  PenSquare, 
  Sparkles, 
  Users, 
  TrendingUp, 
  Zap, 
  Shield, 
  MessageSquare,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Rss
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            AI-Powered Blogging Platform
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Write, Share, and Grow Your{' '}
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Influence
            </span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground md:text-xl max-w-3xl mx-auto">
            Create amazing content with AI assistance, connect with readers, and turn your ideas into engaging stories. 
            Join thousands of writers who are already using Draft.IO to amplify their voice.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8">
                Start Writing for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8">
                See How It Works
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>AI-powered writing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Real-time collaboration</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you write better, faster, and reach more readers.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Sparkles className="h-10 w-10 mb-4 text-primary" />
                <CardTitle>AI Writing Assistant</CardTitle>
                <CardDescription>
                  Get intelligent suggestions, improve your content, and overcome writer's block with our advanced AI.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="h-10 w-10 mb-4 text-primary" />
                <CardTitle>Build Your Audience</CardTitle>
                <CardDescription>
                  Connect with readers who share your interests and grow your following organically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <TrendingUp className="h-10 w-10 mb-4 text-primary" />
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track your performance with detailed analytics and understand what resonates with your audience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Zap className="h-10 w-10 mb-4 text-primary" />
                <CardTitle>Real-time Collaboration</CardTitle>
                <CardDescription>
                  Work together with other writers, receive instant feedback, and build a creative community.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 mb-4 text-primary" />
                <CardTitle>Content Protection</CardTitle>
                <CardDescription>
                  Your content is safe with enterprise-grade security and automatic backups.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <MessageSquare className="h-10 w-10 mb-4 text-primary" />
                <CardTitle>Engage Your Readers</CardTitle>
                <CardDescription>
                  Foster meaningful conversations with comments, likes, and direct messaging.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Start Writing in Minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with Draft.IO in three simple steps
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold">Create Your Account</h3>
                <p className="text-muted-foreground">
                  Sign up for free in seconds. No credit card required.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold">Start Writing</h3>
                <p className="text-muted-foreground">
                  Use our AI-powered editor to create amazing content effortlessly.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold">Publish & Grow</h3>
                <p className="text-muted-foreground">
                  Share your stories and watch your audience grow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feed Showcase Section */}
      <section id="feed" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div>
                <div className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Public Feed
                </div>
                <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                  Explore Stories from Everyone
                </h2>
                <p className="mb-6 text-lg text-muted-foreground">
                  Browse the public feed to discover posts by category — Technology, Health, Business, Science, and more. No account needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/feed">
                    <Button size="lg" className="gap-2">
                      <Rss className="h-5 w-5" />
                      Browse the Feed
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="lg" variant="outline">
                      Start Writing
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['Technology', 'Health', 'Business', 'Science', 'Art', 'Travel'].map((cat) => (
                  <Link
                    key={cat}
                    href={`/feed?category=${cat}`}
                    className="flex items-center justify-center rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all p-4 text-sm font-medium"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Active Writers</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Stories Published</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">100K+</div>
              <div className="text-sm text-muted-foreground">Monthly Readers</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary/20 bg-linear-to-r from-primary/5 to-primary/10">
            <CardContent className="p-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Ready to Share Your Story?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of writers who are already using Draft.IO to create, share, and grow their influence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <Button size="lg" className="text-lg px-8">
                    Start Writing for Free
                    <PenSquare className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <PenSquare className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Draft.IO</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered blogging platform for modern writers.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/feed" className="hover:text-foreground">Feed</Link></li>
                <li><Link href="#" className="hover:text-foreground">Roadmap</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Draft.IO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}