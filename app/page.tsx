import { Hero } from "@/components/sections/Hero";
import { Bio } from "@/components/sections/Bio";
import { MediaChannels } from "@/components/sections/MediaChannels";
import { News } from "@/components/sections/News";
import { Tweets } from "@/components/sections/Tweets";
import { Videos } from "@/components/sections/Videos";
import { Vods } from "@/components/sections/Vods";
import { Sponsors } from "@/components/sections/Sponsors";
import { Footer } from "@/components/sections/Footer";
import { Nav } from "@/components/ui/Nav";
import { RoachTrail } from "@/components/ui/RoachTrail";
import { getLiveStatus, getLatestVods } from "@/lib/api/twitch";
import { getLatestVideos } from "@/lib/api/youtube";
import { getLatestTweets } from "@/lib/api/x";
import { getNews } from "@/lib/api/news";

/**
 * Static export: the page is prerendered at build time. The data fetchers
 * run during the build and, with no API keys set, fall back to curated
 * data. To refresh the live numbers, rebuild (the deploy workflow does
 * this on every push, and can be scheduled).
 */
export const dynamic = "force-static";

export default async function Page() {
  const [live, vods, videos, tweets, news] = await Promise.all([
    getLiveStatus(),
    getLatestVods(),
    getLatestVideos(),
    getLatestTweets(),
    getNews(),
  ]);

  return (
    <>
      {/* No preloader: the hero's own entrance is the intro, matching the
          reference. Stacking a 2.2s counter in front of a 2.7s entrance
          just delayed the page twice. */}
      <Nav live={live} />
      {/* Relative so the trail's absolute SVG measures against the document
          rather than the viewport. */}
      <div className="relative">
        <RoachTrail />
        <main>
          <Hero />
          <Bio />
          <MediaChannels live={live} />
          <News items={news} />
          <Tweets tweets={tweets} />
          <Videos videos={videos} />
          <Vods vods={vods} />
          <Sponsors />
        </main>
        <Footer />
      </div>
    </>
  );
}
