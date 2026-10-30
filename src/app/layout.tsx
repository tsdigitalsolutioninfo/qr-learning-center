import './globals.css';
import type { Metadata, Viewport } from 'next';
export const metadata: Metadata = {
  metadataBase: new URL('https://qr-learning-center.vercel.app'),
  title: { default: 'QR Learning Center | JNV & OAV Preparation', template: '%s | QR Learning Center' },
  description: 'Helping students prepare for JNV and OAV entrance examinations with practice tests, application assistance, admit card support and study materials.',
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
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="m-0 min-h-screen antialiased">{children}</body></html>;
}
