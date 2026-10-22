import './globals.css';
import type { Metadata, Viewport } from 'next';
export const metadata: Metadata = {
  metadataBase: new URL('https://qr-learning-center.vercel.app'),
  title: { default: 'QR Learning Center Deogarh', template: '%s | QR Learning Center' },
  description: 'Student outreach and follow-up management for QR Learning Center Deogarh.',
  openGraph: {
    type: 'website',
    url: 'https://qr-learning-center.vercel.app/',
    title: 'QR Learning Center Deogarh',
    description: 'Student outreach and follow-up management for QR Learning Center Deogarh.',
    siteName: 'QR Learning Center Deogarh',
    images: [{ url: '/site-og-immage.jpg', alt: 'QR Learning Center Deogarh' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Learning Center Deogarh',
    description: 'Student outreach and follow-up management for QR Learning Center Deogarh.',
    images: ['/site-og-immage.jpg'],
  },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="m-0 min-h-screen antialiased">{children}</body></html>;
}
