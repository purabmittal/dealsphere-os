import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DealSphere OS',
  description: 'The internal operating system for DealSphere.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
