import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "CrickFlix - The Netflix of Live Sports",
  description: "Stream your favorite sports channels in crystal-clear quality. Cricket, Football, Tennis, and more – all in one place, completely free.",
  keywords: "live sports, streaming, cricket, football, IPTV, free sports streaming",
  authors: [{ name: "CrickFlix" }],
  openGraph: {
    title: "CrickFlix - The Netflix of Live Sports",
    description: "Stream your favorite sports channels in crystal-clear quality.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script src="https://cdn.jsdelivr.net/npm/mpegts.js@1.7.3/dist/mpegts.min.js"></script>
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
