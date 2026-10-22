import './globals.css';
import type { Metadata, Viewport } from 'next';
export const metadata: Metadata = {
  title: { default: 'Odisha Exam Outreach Manager', template: '%s | Odisha Exam Outreach' },
  description: 'Student outreach and follow-up management for Odisha communities.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="min-h-screen antialiased">{children}</body></html>;
}
