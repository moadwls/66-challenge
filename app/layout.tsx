import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: '66 Challenge',
  description: 'Track your 66-day discipline challenge',
  manifest: '/manifest.json',
  themeColor: '#f5f5f5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '66',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
