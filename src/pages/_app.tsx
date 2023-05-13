import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import { IBM_Plex_Mono } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({ weight: "400", subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        pre,
        code {
          font-family: ${ibmPlexMono.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
