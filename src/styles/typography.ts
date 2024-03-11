import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

export const mono = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-mono",
});

export const sans = IBM_Plex_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-sans",
});
