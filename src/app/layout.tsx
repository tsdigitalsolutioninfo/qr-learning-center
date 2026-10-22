import './globals.css';
import type { Metadata, Viewport } from 'next';
export const metadata: Metadata = {
  title: { default: 'QR Learning Center Deogarh', template: '%s | QR Learning Center' },
  description: 'Student outreach and follow-up management for QR Learning Center Deogarh.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="m-0 min-h-screen antialiased">{children}</body></html>;
}
