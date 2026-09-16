import Hero from './Hero';
import PartnersStrip from './PartnersStrip';
import AboutTeaser from './AboutTeaser';
import ServicesSection from './ServicesSection';
import SunriseDivider from './SunriseDivider';
import FeaturedWork from './FeaturedWork';
import StatsSection from './StatsSection';
import TeamTeaser from './TeamTeaser';
import FestivalFeatureSection from './FestivalFeatureSection';
import NewsTeaser from './NewsTeaser';
import FaqSection from './FaqSection';
import ButtonLink from './ButtonLink';
import { ArrowRightIcon, MailIcon } from './Icons';
import type { Partner } from '../data/partners';
import { normalizeSanityPartners } from '@/lib/partners';
import { urlForImage } from '@/sanity/lib/image';
import type { SanityCardItem, SanityHousePage, SanityPostTeaser } from '@/sanity/lib/types';

type HouseExperienceProps = {
  content?: SanityHousePage | null;
  partners?: Partner[] | null;
  posts?: SanityPostTeaser[] | null;
};

function resolveImageUrl(source?: {url?: string} | null, width?: number, height?: number) {
  if (!source) {
    return undefined;
  }

  const builder = urlForImage(source);

  if (builder) {
    if (typeof width === 'number') {
      builder.width(width);
    }

    if (typeof height === 'number') {
      builder.height(height).fit('crop');
    }

    return builder.auto('format').url();
  }

  return source.url;
}

function normalizeCardItems(cards?: SanityCardItem[] | null) {
  return (
    cards
      ?.filter((card) => card.isVisible !== false && card.title && card.description)
      .map((card, index) => ({
        number: card.number || String(index + 1).padStart(2, '0'),
        title: card.title || '',
        description: card.description || '',
      })) || []
  );
}

function getButtonVariant(style?: 'primary' | 'soft' | 'outline', fallback: 'primary' | 'soft' | 'outline' = 'primary') {
  return style || fallback;
}

function resolveMuxPosterSrc(
  posterMode: 'muxFrame' | 'customImage' | 'fallbackImage' | undefined,
  customPosterSrc?: string,
  fallbackPosterSrc?: string,
  legacyFallbackSrc?: string
) {
  if (posterMode === 'customImage') {
    return customPosterSrc || fallbackPosterSrc;
  }

  if (posterMode === 'fallbackImage') {
    return fallbackPosterSrc || customPosterSrc;
  }

  if (posterMode === 'muxFrame') {
    return undefined;
  }

  return customPosterSrc || fallbackPosterSrc || legacyFallbackSrc;
}

export default function HouseExperience({content, partners, posts}: HouseExperienceProps) {
  const heroCtas = content?.hero?.ctas || [];
  const primaryHeroCta = heroCtas[0];
  const selectedPartners = normalizeSanityPartners(content?.partnersSection?.partners);
  const partnerItems = selectedPartners.length ? selectedPartners : partners || undefined;
  const servicesItems = normalizeCardItems(content?.servicesSection?.cards);
  const statsItems = content?.statsSection?.cards;
  const faqItems = content?.faqSection?.filter((item) => item.isVisible !== false && item.title && item.description) || [];
  const heroLogoSrc =
    resolveImageUrl(content?.hero?.logo, 520) ||
    (content?.hero?.showLogo === false ? null : '/assets/animae-house-logo-white.png');
  const backgroundPosterSrc = resolveMuxPosterSrc(
    content?.hero?.backgroundVideo?.posterMode,
    resolveImageUrl(content?.hero?.backgroundVideo?.customPosterImage, 1920),
    resolveImageUrl(content?.hero?.backgroundVideo?.fallbackImage, 1920),
    content?.hero?.backgroundVideo?.muxPlaybackId ? undefined : resolveImageUrl(content?.hero?.backgroundImage, 1920)
  );
  const showreelPosterSrc = resolveMuxPosterSrc(
    content?.hero?.showreel?.posterMode,
    resolveImageUrl(content?.hero?.showreel?.customPosterImage, 1600),
    resolveImageUrl(content?.hero?.showreel?.fallbackImage, 1600)
  );
  const ctaImageUrl = resolveImageUrl(content?.ctaSection?.image, 1080, 1080);

  return (
    <>
      <Hero
        ariaLabel="Animae Caribe House introduction"
        eyebrow={content?.hero?.eyebrow}
        logoSrc={heroLogoSrc}
        logoAlt={content?.hero?.logo?.alt || 'Animae Caribe House'}
        title={content?.hero?.heading || 'Animae Caribe House'}
        copy={
          content?.hero?.copy ||
          'A cinematic digital home for animated stories, creative production, community building and Caribbean imagination.'
        }
        showEyebrow={content?.hero?.showEyebrow !== false}
        showLogo={content?.hero?.showLogo !== false}
        showTitle={content?.hero?.showHeading !== false}
        showCopy={content?.hero?.showCopy !== false}
        showActions={content?.hero?.showCtas !== false}
        showBackgroundMedia={content?.hero?.showBackgroundMedia !== false}
        contactHref={primaryHeroCta?.href || 'mailto:info@animaecaribehouse.com'}
        contactLabel={primaryHeroCta?.label || 'Get in touch'}
        showreelLabel={content?.hero?.showreel?.buttonLabel || 'Watch showreel'}
        backgroundPlaybackId={content?.hero?.backgroundVideo?.muxPlaybackId}
        backgroundPosterSrc={backgroundPosterSrc}
        backgroundPosterMode={content?.hero?.backgroundVideo?.posterMode}
        backgroundVideoTitle={content?.hero?.backgroundVideo?.title || 'Animae Caribe House Hero Background'}
        backgroundStartTimeSeconds={content?.hero?.backgroundVideo?.startTimeSeconds}
        backgroundEndTimeSeconds={content?.hero?.backgroundVideo?.endTimeSeconds}
        backgroundPosterTimeSeconds={content?.hero?.backgroundVideo?.posterTimeSeconds}
        showreelPlaybackId={content?.hero?.showreel?.muxPlaybackId}
        showreelPosterSrc={showreelPosterSrc}
        showreelPosterMode={content?.hero?.showreel?.posterMode}
        showreelTitle={content?.hero?.showreel?.modalTitle || content?.hero?.showreel?.title || 'Animae Caribe House Showreel'}
        showreelStartTimeSeconds={content?.hero?.showreel?.startTimeSeconds}
        showreelEndTimeSeconds={content?.hero?.showreel?.endTimeSeconds}
        showreelPosterTimeSeconds={content?.hero?.showreel?.posterTimeSeconds}
        showreelAriaLabel={content?.hero?.showreel?.ariaLabel}
      />

      {content?.aboutSection?.isVisible !== false ? (
        <AboutTeaser
          kicker={content?.aboutSection?.eyebrow || 'About us'}
          title={content?.aboutSection?.heading || 'A creative house for Caribbean animation, talent and digital storytelling.'}
          copy={
            content?.aboutSection?.plainText ||
            'Animae Caribe House brings artists, animators and storytellers together to develop ideas and create animated work. Rooted in the Caribbean, the House supports story development, creative production and collaboration, connecting regional talent with projects and partners at home and abroad.'
          }
          body={content?.aboutSection?.body}
          ctaHref={content?.aboutSection?.cta?.href || '/about'}
          ctaLabel={content?.aboutSection?.cta?.label || 'Read about the house'}
          showKicker={content?.aboutSection?.showEyebrow !== false}
          showTitle={content?.aboutSection?.showHeading !== false}
          showCopy={content?.aboutSection?.showBody !== false}
          showCta={content?.aboutSection?.showCta !== false}
        />
      ) : null}

      {content?.partnersSection?.isVisible !== false ? (
        <PartnersStrip
          items={partnerItems}
          kicker={
            content?.partnersSection?.showHeading !== false
              ? content?.partnersSection?.heading || 'Partners and collaborators'
              : undefined
          }
          intro={content?.partnersSection?.showIntro !== false ? content?.partnersSection?.intro : undefined}
          ctaHref={content?.partnersSection?.showCta !== false ? content?.partnersSection?.cta?.href : undefined}
          ctaLabel={content?.partnersSection?.showCta !== false ? content?.partnersSection?.cta?.label : undefined}
          ctaVariant={getButtonVariant(content?.partnersSection?.cta?.style, 'outline')}
          ariaLabel="Animae Caribe House partners and collaborators"
        />
      ) : null}

      {content?.servicesSection?.isVisible !== false ? (
        <ServicesSection
          id="services"
          kicker={content?.servicesSection?.eyebrow || 'What We Create'}
          title={content?.servicesSection?.heading || 'Services'}
          intro={
            content?.servicesSection?.intro ||
            'From first idea to final delivery, Animae Caribe House helps bring bold Caribbean and global stories to life through animation, digital content, emerging technology, and collaborative production support.'
          }
          items={servicesItems.length ? servicesItems : undefined}
        />
      ) : null}

      <SunriseDivider />

      {content?.featuredWorkSection?.isVisible !== false ? (
        <FeaturedWork
          title={content?.featuredWorkSection?.heading || 'Featured Projects'}
          copy={
            content?.featuredWorkSection?.plainText ||
            'A curated look at the stories, visual worlds and creative experiments taking shape inside Animae Caribe House. We Animate in Sunshine.'
          }
          body={content?.featuredWorkSection?.body}
          primaryCtaHref={content?.featuredWorkSection?.cta?.href || '/portfolio'}
          primaryCtaLabel={content?.featuredWorkSection?.cta?.label || 'View portfolio'}
          showCta={content?.featuredWorkSection?.showCta !== false}
        />
      ) : null}

      {content?.statsSection?.isVisible !== false ? (
        <StatsSection
          kicker={content?.statsSection?.eyebrow || 'Reach and impact'}
          title={content?.statsSection?.heading || 'Caribbean stories. Lasting connections.'}
          intro={
            content?.statsSection?.intro ||
            'Since 2001, Animae Caribe has championed Caribbean animation, bringing emerging artists together with experienced industry voices. Through screenings, workshops and creative exchange, we help regional talent develop their craft, share their stories and connect with opportunities beyond the Caribbean.'
          }
          items={statsItems}
        />
      ) : null}

      {content?.teamSection?.isVisible !== false ? (
        <TeamTeaser
          kicker={content?.teamSection?.eyebrow || 'The team'}
          title={content?.teamSection?.heading || 'The people behind the pixels, stories and community.'}
          copy={
            content?.teamSection?.plainText ||
            'We are artists, animators, storytellers and creative organisers brought together by a belief in Caribbean imagination. From developing stories at the House to welcoming new voices at the Festival, our work connects creativity, learning and community—helping stories rooted in our region find their place in the world.'
          }
          body={content?.teamSection?.body}
          image={content?.teamSection?.image}
          showImage={content?.teamSection?.showImage !== false}
          ctaHref={content?.teamSection?.cta?.href || '/team'}
          ctaLabel={content?.teamSection?.cta?.label || 'Meet the team'}
          showCta={content?.teamSection?.showCta !== false}
        />
      ) : null}

      {content?.festivalTeaserSection?.isVisible !== false ? (
        <FestivalFeatureSection
          kicker={content?.festivalTeaserSection?.eyebrow || 'Animae Caribe Festival'}
          title={content?.festivalTeaserSection?.heading || 'Celebrating Caribbean animation in motion.'}
          copy={
            content?.festivalTeaserSection?.plainText ||
            'Five unforgettable days of world-class animation, games, and digital creativity under the Caribbean sun.'
          }
          body={content?.festivalTeaserSection?.body}
          image={content?.festivalTeaserSection?.image}
          showImage={content?.festivalTeaserSection?.showImage !== false}
          ctaHref={content?.festivalTeaserSection?.cta?.href || '/festival'}
          ctaLabel={content?.festivalTeaserSection?.cta?.label || 'Find out more'}
          showCta={content?.festivalTeaserSection?.showCta !== false}
        />
      ) : null}

      {content?.newsSection?.isVisible !== false ? (
        <NewsTeaser
          kicker={content?.newsSection?.eyebrow || 'News and articles'}
          title={content?.newsSection?.heading || 'News from the House and Festival.'}
          copy={content?.newsSection?.showBody !== false ? content?.newsSection?.plainText : undefined}
          body={content?.newsSection?.showBody !== false ? content?.newsSection?.body : undefined}
          ctaHref={content?.newsSection?.cta?.href || '/news-media'}
          ctaLabel={content?.newsSection?.cta?.label || 'Read articles'}
          posts={posts}
          showCta={content?.newsSection?.showCta !== false}
        />
      ) : null}

      {faqItems.length ? (
        <FaqSection
          items={faqItems}
          title="Answers for ambitious projects, studio partnerships and big creative plans."
          intro="Everything here is built to make the next conversation easier, faster and clearer."
        />
      ) : (
        <FaqSection />
      )}

      {content?.ctaSection?.isVisible !== false ? (
        <section className="section editorial-feature-section house-final-cta" id="house-cta">
          <div className="container editorial-feature-inner">
            <div className="editorial-feature-shell">
              {content?.ctaSection?.showImage !== false && ctaImageUrl ? (
                <div className="editorial-feature-media">
                  <img src={ctaImageUrl} alt={content?.ctaSection?.image?.alt || 'Animae Caribe House call to action'} />
                </div>
              ) : null}
              <div className="editorial-feature-copy">
                {content?.ctaSection?.showEyebrow !== false ? (
                  <span className="section-kicker">{content?.ctaSection?.eyebrow || 'Start the conversation'}</span>
                ) : null}
                {content?.ctaSection?.showHeading !== false ? (
                  <h2>{content?.ctaSection?.heading || 'Bring your next animated story, campaign, or collaboration to life.'}</h2>
                ) : null}
                {content?.ctaSection?.showCopy !== false ? (
                  <p>
                    {content?.ctaSection?.copy ||
                      'Connect with Animae Caribe House for creative production, story development, studio collaboration, and bold digital work shaped from the Caribbean.'}
                  </p>
                ) : null}
                {content?.ctaSection?.showCta !== false ? (
                  <ButtonLink
                    href={content?.ctaSection?.cta?.href || 'mailto:info@animaecaribehouse.com'}
                    variant={getButtonVariant(content?.ctaSection?.cta?.style, 'primary')}
                  >
                    {content?.ctaSection?.cta?.href?.startsWith('mailto:') ? (
                      <>
                        <MailIcon /> {content?.ctaSection?.cta?.label || 'Get in touch'}
                      </>
                    ) : (
                      content?.ctaSection?.cta?.label || 'Get in touch'
                    )}{' '}
                    <ArrowRightIcon />
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
