import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { TweetEmbed } from "@/components/ui/TweetEmbed";
import { FEATURED_TWEET_IDS, TWEET_HANDLE } from "@/lib/data";

/**
 * Three official X embeds. The tweets render live from X, so there is no
 * local copy of their text to drift out of date.
 */
export function Tweets() {
  return (
    <section
      id="tweets"
      aria-labelledby="tweets-heading"
      className="mx-auto max-w-[1440px] px-6 py-28 md:py-40 lg:px-10"
    >
      <SectionHeading id="tweets-heading" lead="Latest" highlight="Tweets" />

      <ul className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURED_TWEET_IDS.map((id, i) => (
          <Reveal as="li" key={id} delay={i * 0.08}>
            <TweetEmbed id={id} handle={TWEET_HANDLE} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
