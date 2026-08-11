import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import "./globals.css";

import {
  LanguageProvider,
} from "@/lib/LanguageContext";

import Header from "@/components/Header";

export const metadata: Metadata = {
  title:
    "فواتيري — إدارة الفواتير وعروض الأسعار",

  description:
    "تطبيق احترافي لإدارة الفواتير وعروض الأسعار",

  manifest:
    "/manifest.json",

  appleWebApp: {
    capable: true,

    statusBarStyle:
      "default",

    title:
      "فواتيري",
  },
};

export const viewport = {
  width:
    "device-width",

  initialScale:
    1,

  themeColor:
    "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
    >
      <head>

        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        <link
          rel="apple-touch-icon"
          href="/icons/icon-192.png"
        />

        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />

      </head>

      <body
        className="min-h-screen bg-[#f7f7fb] text-slate-900 antialiased"
        style={{
          fontFamily:
            "'Noto Sans Arabic', 'Inter', Arial, sans-serif",
        }}
      >

        <LanguageProvider>

          <Header />

          <main
            id="app-content"
            className="min-h-screen pt-16 transition-all duration-300 lg:ps-64 lg:pt-0"
          >
            {children}
          </main>

        </LanguageProvider>

      </body>
    </html>
  );
}
