import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { AuthInitializer } from "@/components/AuthInitializer";
import { GooeyToastProvider } from "@/components/GooeyToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Draft.IO - AI-Powered Blogging Platform",
  description: "Create, share, and discover amazing blog content with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`  }
      >
        <Providers>
          <GooeyToastProvider />
          <AuthInitializer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
