import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'mon-budget',
  description: 'Directeur financier personnel IA',
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  themeColor: '#10231f',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
