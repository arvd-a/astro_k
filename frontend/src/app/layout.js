import { Inter } from 'next/font/google';
import './globals.css';
import CosmicBackground from '@/components/CosmicBackground';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Astro K | Ephemeral Vedic Chart Engine',
  description: 'Privacy-first, ephemeral Vedic astrology chart engine. No data stored.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <CosmicBackground />
        {/* Main layout container above the fixed background */}
        <main style={{ position: 'relative', zIndex: 10 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
