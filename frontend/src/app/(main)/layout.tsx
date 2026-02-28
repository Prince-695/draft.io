'use client';

import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ChatSocketProvider } from '@/components/ChatSocketProvider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Global chat socket — provides real-time messages + toast/bell notifications */}
        <ChatSocketProvider />
        <Navbar />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
