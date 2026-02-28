'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/utils/constants';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Big 404 */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-black text-muted/20 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">📝</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.back()} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go back
          </Button>
          <Link href={ROUTES.HOME}>
            <Button className="gap-2 w-full">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <Link href={ROUTES.EXPLORE}>
            <Button variant="outline" className="gap-2 w-full">
              <Search className="w-4 h-4" />
              Explore
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
