import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Algo — Meet the people your algorithm would have shown you",
  description:
    "Algo is a social app that matches you with strangers who share your exact interests, taste, and online culture.",
  openGraph: {
    title: "Algo",
    description: "Meet the people your algorithm would have shown you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-algo-bg text-algo-text font-body antialiased min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
