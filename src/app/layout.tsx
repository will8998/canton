import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "BitSafe - Bitcoin Yield Vaults",
  description: "Explore and invest in Bitcoin yield vaults with varying risk levels and returns",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="font-space-grotesk antialiased">

            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                {children}
              </div>
              <Footer />
            </div>

      </body>
    </html>
  );
}
