import "@/styles/globals.css";
import { mono, sans } from "@/styles/typography";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import Script from "next/script";

const title = "Hacker News Reader";
const description =
  "Yet another Hacker News Reader with metadata cards and some LLM summaries.";
const image = "/hnr.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://hnr.adluo.ch"),
  title,
  description,
  openGraph: {
    type: "website",
    images: [{ url: image }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: image,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deg1, hue1] = [Math.random() * 360, Math.random() * 360];
  const [deg2, hue2] = [Math.random() * 360, Math.random() * 360];
  const background = [
    `linear-gradient(${deg1}deg, hsl(${hue1} 80% 20%), 20%, rgba(0, 0, 0, 0))`,
    `linear-gradient(${deg2}deg, hsl(${hue2} 80% 20%), 20%, rgba(0, 0, 0, 0))`,
    "black",
  ].join(",");

  return (
    <html lang="en">
      <body
        style={{ background }}
        className={`${mono.variable} ${sans.variable} min-h-screen max-w-full overflow-x-hidden font-sans text-white`}
      >
        {children}
      </body>
      <Script src="https://kit.fontawesome.com/8c38f2aa0a.js"></Script>
      <SpeedInsights />
      <Analytics />
    </html>
  );
}
