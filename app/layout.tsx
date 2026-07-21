import type { Metadata } from "next";
import "./globals.css";
import { display, body } from "./fonts";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { SITE_URL } from "@/lib/data";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Asmongold - Official Website from your Favorite Streamer",
  description:
    "Zach "Asmongold" Hoyt Official Website. Check everything about your favorite Youtuber, Streamer, and Commentator. Lastest News, Tweets, Videos, and Vods",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Asmongold - Official Website from your Favorite Streamer",
    description:
      "Zach "Asmongold" Hoyt Official Website. Check everything about your favorite Youtuber, Streamer, and Commentator. Lastest News, Tweets, Videos, and Vods",
    url: SITE_URL,
    siteName: "Asmongold",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Asmongold" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asmongold - Official Website from your Favorite Streamer",
    description:
      "Zach "Asmongold" Hoyt Official Website. Check everything about your favorite Youtuber, Streamer, and Commentator. Lastest News, Tweets, Videos, and Vods",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: "Asmongold",
      alternateName: "Zack Hoyt",
      url: SITE_URL,
      jobTitle: "Streamer & Content Creator",
      sameAs: [
        "https://twitch.tv/zackrawrr",
        "https://kick.com/asmongold",
        "https://youtube.com/@AsmonTV",
        "https://rumble.com/c/Asmongold",
        "https://x.com/asmongold",
      ],
    },
    {
      "@type": "WebSite",
      name: "Asmongold — Fan Concept Site",
      url: SITE_URL,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll>
          <ScrollProgress />
          <CustomCursor />
          {children}
          <div aria-hidden className="noise-overlay" />
        </SmoothScroll>
      </body>
    </html>
  );
}
