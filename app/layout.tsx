import type { Metadata, Viewport } from "next";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pinyin Talk",
    template: "%s | Pinyin Talk",
  },
  description: "Learn Mandarin by voice with pinyin, tones, and a patient AI partner for spoken practice and memory review.",
  applicationName: "Pinyin Talk",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pinyin Talk",
    description: "Learn Mandarin by voice with pinyin, tones, and a patient AI partner for spoken practice and memory review.",
    url: siteUrl,
    siteName: "Pinyin Talk",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinyin Talk",
    description: "Learn Mandarin by voice with pinyin, tones, and a patient AI partner for spoken practice and memory review.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
