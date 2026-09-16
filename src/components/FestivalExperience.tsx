import Hero from './Hero';
import AboutTeaser from './AboutTeaser';
import PartnersStrip from './PartnersStrip';
import ServicesSection from './ServicesSection';
import ButtonLink from './ButtonLink';
import FestivalCalendarSection from './FestivalCalendarSection';
import FestivalSpeakersSection from './FestivalSpeakersSection';
import FestivalVenueSection from './FestivalVenueSection';
import { ArrowRightIcon, MailIcon } from './Icons';
import { festivalEvents, festivalHighlights, festivalPartners } from '../data/festival';
import type { Partner } from '../data/partners';
import type { SanityCardItem, SanityEvent, SanityFestivalPage } from '../sanity/lib/types';
import {resolvePastEditionsHref, resolveProgrammeHref} from '../lib/festivalRoutes';

type FestivalExperienceProps = {
  content?: SanityFestivalPage | null;
  partners?: Partner[] | null;
  events?: SanityEvent[] | null;
  currentProgrammeHref?: string;
};

function formatEventDate(date?: string) {
  if (!date) return undefined;
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('en', {month: 'short', day: 'numeric'}).format(parsed);
}

function formatEventDateTime(dateTime?: string) {
  if (!dateTime) return undefined;
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return {
    date: new Intl.DateTimeFormat('en', {month: 'short', day: 'numeric'}).format(parsed),
    time: new Intl.DateTimeFormat('en', {hour: 'numeric', minute: '2-digit'}).format(parsed),
  };
}

function formatEventTimeRange(startDateTime?: string, endDateTime?: string, legacyStartTime?: string, legacyEndTime?: string) {
  const start = formatEventDateTime(startDateTime);
  const end = formatEventDateTime(endDateTime);

  if (start && end) {
    return `${start.time} - ${end.time}`;
  }

  if (start) {
    return start.time;
  }

  if (legacyStartTime && legacyEndTime) {
    return `${legacyStartTime} - ${legacyEndTime}`;
  }

  return legacyStartTime || '';
}

function normalizeEvents(events?: SanityEvent[] | null) {
  if (!events?.length) {
    return festivalEvents;
  }

  return events
    .filter((event) => event.title && (event.startDateTime || event.date))
    .map((event) => {
      const modernStart = formatEventDateTime(event.startDateTime);

      return {
      date: modernStart?.date || formatEventDate(event.date) || '',
      time: formatEventTimeRange(event.startDateTime, event.endDateTime, event.startTime, event.endTime),
      title: event.title || '',
      description: event.shortDescription || '',
      location: event.venue || '',
      category: event.eventType || event.attendanceType || 'Festival',
      };
    })
    .filter((event) => event.date || event.time);
}

function normalizeHighlights(cards?: SanityCardItem[] | null) {
  if (!cards?.length) {
    return festivalHighlights;
  }

  return cards
    .filter((card) => card.title && card.description)
    .map((card, index) => ({
      number: card.number || String(index + 1).padStart(2, '0'),
      title: card.title || '',
      description: card.description || '',
    }));
}

function resolveMuxPosterSrc(
  posterMode: 'muxFrame' | 'customImage' | 'fallbackImage' | undefined,
  customPosterSrc?: string,
  fallbackPosterSrc?: string
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

  return customPosterSrc || fallbackPosterSrc;
}

export default function FestivalExperience({content, partners, events, currentProgrammeHref}: FestivalExperienceProps) {
  const firstHeroCta = content?.hero?.primaryCta || content?.hero?.ctas?.[0];
  const aboutCta = content?.aboutSection?.cta;
  const eventCta = content?.eventsPreview?.cta;
  const archiveCta = content?.archiveTeaser?.cta;
  const finalPrimaryCta = content?.finalCta?.primaryCta || content?.finalCta?.cta;
  const finalSecondaryCta = content?.finalCta?.secondaryCta;
  const highlightCards = normalizeHighlights(content?.programmingSection?.cards);
  const eventCards = normalizeEvents(events);
  const programmeHref = resolveProgrammeHref(eventCta?.href, currentProgrammeHref);
  const pastEditionsHref = resolvePastEditionsHref(archiveCta?.href);
  const partnerItems = partners;

  return (
    <>
      <Hero
        ariaLabel="Animae Caribe Festival introduction"
        logoSrc={null}
        logoAlt="Animae Caribe"
        title={content?.hero?.heading || 'Animae Caribe Festival'}
        copy={
          content?.hero?.copy ||
          'A cinematic celebration of animation, Caribbean creativity, screenings, industry development and community.'
        }
        contactHref={firstHeroCta?.href || 'mailto:festival@animaecaribe.com'}
        contactLabel={firstHeroCta?.label || 'Attend the festival'}
        showreelLabel={content?.hero?.showreel?.buttonLabel || 'Watch festival reel'}
        showreelPlaybackId={content?.hero?.showreel?.muxPlaybackId}
        showreelPosterSrc={resolveMuxPosterSrc(
          content?.hero?.showreel?.posterMode,
          content?.hero?.showreel?.customPosterImageUrl,
          content?.hero?.showreel?.fallbackImageUrl
        )}
        showreelPosterMode={content?.hero?.showreel?.posterMode}
        showreelTitle={content?.hero?.showreel?.modalTitle || 'Animae Caribe Festival Showreel'}
        showreelStartTimeSeconds={content?.hero?.showreel?.startTimeSeconds}
        showreelEndTimeSeconds={content?.hero?.showreel?.endTimeSeconds}
        showreelPosterTimeSeconds={content?.hero?.showreel?.posterTimeSeconds}
        showreelAriaLabel={content?.hero?.showreel?.ariaLabel}
        backgroundPlaybackId={content?.hero?.backgroundVideo?.muxPlaybackId}
        backgroundPosterSrc={resolveMuxPosterSrc(
          content?.hero?.backgroundVideo?.posterMode,
          content?.hero?.backgroundVideo?.customPosterImage?.url,
          content?.hero?.backgroundVideo?.fallbackImage?.url
        )}
        backgroundPosterMode={content?.hero?.backgroundVideo?.posterMode}
        backgroundVideoTitle={content?.hero?.backgroundVideo?.title || 'Animae Caribe Festival Hero Background'}
        backgroundStartTimeSeconds={content?.hero?.backgroundVideo?.startTimeSeconds}
        backgroundEndTimeSeconds={content?.hero?.backgroundVideo?.endTimeSeconds}
        backgroundPosterTimeSeconds={content?.hero?.backgroundVideo?.posterTimeSeconds}
      />

      <AboutTeaser
        kicker={content?.aboutSection?.eyebrow || 'About the Festival'}
        title={content?.aboutSection?.heading || 'A festival home for Caribbean animation, creative exchange and industry momentum.'}
        copy={
          content?.aboutSection?.description ||
          content?.aboutSection?.plainText ||
          'Animae Caribe Festival brings artists, audiences, studios, students and partners together through screenings, workshops, panels, showcases and community experiences. It celebrates Caribbean imagination while creating practical pathways for animation talent and regional industry development.'
        }
        ctaHref={aboutCta?.href || programmeHref}
        ctaLabel={aboutCta?.label || 'Explore the programme'}
      />

      <PartnersStrip
        items={partnerItems?.length ? partnerItems : festivalPartners}
        kicker={content?.partnersSection?.eyebrow || content?.partnersSection?.heading || 'Festival partners and collaborators'}
        ariaLabel="Festival partners and collaborators"
      />

      <ServicesSection
        id="programming"
        kicker={content?.programmingSection?.eyebrow || 'Festival Programming'}
        title={content?.programmingSection?.heading || 'Highlights'}
        intro={
          content?.programmingSection?.description ||
          content?.programmingSection?.intro ||
          'A programme shaped around screenings, workshops, showcases, industry connection and community experiences for Caribbean animation.'
        }
        items={highlightCards}
      />

      <FestivalSpeakersSection content={content?.speakersSection} />

      <FestivalCalendarSection content={content?.calendarSection} />

      <section className="section festival-programme-section" id="programme">
        <div className="container">
          <div className="services-header">
            <div>
              <span className="section-kicker">{content?.eventsPreview?.eyebrow || 'Programme Preview'}</span>
              <h2>{content?.eventsPreview?.heading || 'Upcoming festival moments'}</h2>
            </div>
            <p>
              {content?.eventsPreview?.description ||
                'The next upcoming festival moments will appear here automatically once a Festival Year / Edition and published events are set in Sanity.'}
            </p>
          </div>

          <div className="festival-events-grid">
            {eventCards.map((event) => (
              <article className="festival-event-card glass-card" key={event.title}>
                <div className="festival-event-meta">
                  <span>{event.date}</span>
                  <small>{event.time}</small>
                </div>
                <div>
                  <p className="festival-event-category">{event.category}</p>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <strong>{event.location}</strong>
                </div>
              </article>
            ))}
          </div>

          <div className="festival-programme-actions">
            <ButtonLink href={programmeHref} variant="primary">
              {eventCta?.label || 'View Full Programme'} <ArrowRightIcon />
            </ButtonLink>
          </div>
        </div>
      </section>

      <FestivalVenueSection content={content?.venueSection} />

      <section className="section festival-archive-section">
        <div className="container split-grid">
          <div>
            <span className="section-kicker">{content?.archiveTeaser?.eyebrow || 'Past Editions'}</span>
            <h2>{content?.archiveTeaser?.heading || 'A history of Caribbean animation and exchange.'}</h2>
          </div>
          <p>
            {content?.archiveTeaser?.description ||
              content?.archiveTeaser?.plainText ||
              'Discover the screenings, workshops and creative exchanges that have shaped Animae Caribe over the years. Our past editions trace a continuing commitment to Caribbean stories, emerging talent and connections across the animation industry.'}
          </p>
          <ButtonLink href={pastEditionsHref} variant="outline">
            {archiveCta?.label || 'Explore Past Editions'} <ArrowRightIcon />
          </ButtonLink>
        </div>
      </section>

      <section className="section festival-cta-section">
        <div className="container festival-cta-shell glass-panel">
          <div>
            <span className="section-kicker">{content?.finalCta?.eyebrow || 'Join the Festival'}</span>
            <h2>{content?.finalCta?.heading || 'Attend, submit, partner, sponsor or volunteer with Animae Caribe Festival.'}</h2>
            <p>
              {content?.finalCta?.description ||
                content?.finalCta?.plainText ||
                'This page is ready for the next layer of real calls-to-action when dates, submissions and partner packages are finalized.'}
            </p>
          </div>
          <div className="festival-cta-actions">
            {finalPrimaryCta?.href && finalPrimaryCta.label ? (
              <ButtonLink href={finalPrimaryCta.href} variant="primary">
                <MailIcon /> {finalPrimaryCta.label}
              </ButtonLink>
            ) : (
              <ButtonLink href="mailto:festival@animaecaribe.com" variant="primary">
                <MailIcon /> Partner with us
              </ButtonLink>
            )}
            {finalSecondaryCta?.href && finalSecondaryCta.label ? (
              <ButtonLink href={finalSecondaryCta.href} variant="outline">
                {finalSecondaryCta.label} <ArrowRightIcon />
              </ButtonLink>
            ) : (
              <ButtonLink href="mailto:festival@animaecaribe.com" variant="outline">
                Submit your work <ArrowRightIcon />
              </ButtonLink>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
