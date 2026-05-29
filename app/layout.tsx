import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'RxManager — Pharmacy Management Software',
    template: '%s | RxManager',
  },
  description:
    'All-in-one pharmacy management software. Manage inventory, run your POS, track customers, generate reports, and grow your pharmacy business.',
  keywords: ['pharmacy software', 'medical store management', 'pharmacy POS', 'inventory management'],
  openGraph: {
    title: 'RxManager — Pharmacy Management Software',
    description: 'All-in-one pharmacy management software for modern pharmacies.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
