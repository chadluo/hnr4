import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { VercelToolbar } from "@vercel/toolbar/next";
import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";

const SITE_TITLE = "Hacker News Reader";
const SITE_DESCRIPTION =
  "Yet another Hacker News Reader with metadata cards and some LLM summaries.";
const SITE_IMAGE = "/hnr.png";

const mono = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-mono",
});

const sans = IBM_Plex_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hnr.adluo.ch"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    images: [{ url: SITE_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: SITE_IMAGE,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deg1, h1, h2] = [
    Math.random() * 360,
    Math.random() * 360,
    Math.random() * 360,
  ];
  let deg2: number;
  do {
    deg2 = Math.random() * 360;
  } while (Math.abs(deg1 - deg2) < 90);

  const l = 0.2 + Math.random() * 0.1;
  const c = 0.1 + Math.random() * 0.1;

  const background = [
    `linear-gradient(${deg1}deg, oklch(${l} ${c} ${h1}deg), 20%, oklch(0 0 ${h1}deg / 0))`,
    `linear-gradient(${deg2}deg, oklch(${l} ${c} ${h2}deg), 20%, oklch(0 0 ${h2}deg / 0))`,
    "black",
  ].join(",");

  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV !== "production" && (
          <script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            async
          />
        )}
      </head>
      <body
        style={{ background }}
        className={`${mono.variable} ${sans.variable} min-h-screen max-w-full overflow-x-hidden font-sans text-sm text-white md:text-base`}
      >
        {children}
        {process.env.NODE_ENV !== "production" && <VercelToolbar />}
        <Script src="https://kit.fontawesome.com/8c38f2aa0a.js" />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
