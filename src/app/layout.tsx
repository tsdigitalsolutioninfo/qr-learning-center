import './globals.css';
import type { Metadata, Viewport } from 'next';
import PwaRegistration from '@/components/PwaRegistration';

export const metadata: Metadata = {
  metadataBase: new URL('https://qr-learning-center.vercel.app'),
  title: { default: 'QR Learning Center Deogarh', template: '%s | QR Learning Center' },
  description: 'Student outreach and follow-up management for QR Learning Center Deogarh.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://qr-learning-center.vercel.app/',
    title: 'QR Learning Center | JNV & OAV Preparation',
    description: 'Entrance exam preparation and application support for JNV and OAV aspirants in Deogarh, Odisha.',
    siteName: 'QR Learning Center Deogarh',
    images: [{ url: '/site-og-immage.jpg', alt: 'QR Learning Center Deogarh' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Learning Center | JNV & OAV Preparation',
    description: 'Entrance exam preparation and application support for JNV and OAV aspirants in Deogarh, Odisha.',
    images: ['/site-og-immage.jpg'],
  },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#171957',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="m-0 min-h-screen antialiased">
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
