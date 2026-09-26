import FestivalExperience from '@/components/FestivalExperience';
import {DEFAULT_FESTIVAL_YEAR, getFestivalEventsRoute} from '@/lib/festivalRoutes';
import {normalizeSanityPartners} from '@/lib/partners';
import {getActiveFestivalEdition, getFestivalPage, getFestivalPartners, getUpcomingFestivalEventsByEdition} from '@/sanity/lib/queries';
import type {SanityEvent, SanityFestivalPage} from '@/sanity/lib/types';

export const revalidate = 60;

function isRenderableEvent(event: SanityEvent | null | undefined): event is SanityEvent {
  return Boolean(event?.isVisible !== false && event?.title && (event.startDateTime || event.date));
}

export async function generateMetadata() {
  const [festivalPage, activeEdition] = await Promise.all([getFestivalPage(), getActiveFestivalEdition()]);
  const seo = festivalPage?.seo;

  return {
    title: seo?.seoTitle || (activeEdition?.title
      ? `${activeEdition.title} | Screenings, Workshops and Caribbean Animation`
      : 'Animae Caribe Festival | Screenings, Workshops and Caribbean Animation'),
    description:
      seo?.seoDescription ||
      activeEdition?.description ||
      'The Animae Caribe Festival experience for screenings, workshops, panels, animation showcases, industry development and community programming.',
  };
}

function mergeFestivalPageWithActiveEdition(
  festivalPage: SanityFestivalPage | null,
  activeEdition: Awaited<ReturnType<typeof getActiveFestivalEdition>>
): SanityFestivalPage | null {
  if (!festivalPage) {
    return festivalPage;
  }

  if (!activeEdition) {
    return festivalPage;
  }

  return {
    ...festivalPage,
    hero: {
      ...festivalPage.hero,
      heading: activeEdition.title || festivalPage.hero?.heading,
    },
    eventsPreview: {
      ...festivalPage.eventsPreview,
      festivalEdition: activeEdition,
    },
  };
}

export default async function FestivalPage() {
  const [festivalPage, sanityPartners, activeEdition] = await Promise.all([
    getFestivalPage(),
    getFestivalPartners(),
    getActiveFestivalEdition(),
  ]);
  const mergedFestivalPage = mergeFestivalPageWithActiveEdition(festivalPage, activeEdition);
  const partners = normalizeSanityPartners(sanityPartners);
  const festivalEditionId = mergedFestivalPage?.eventsPreview?.festivalEdition?._id;
  const festivalEditionYear = mergedFestivalPage?.eventsPreview?.festivalEdition?.year || activeEdition?.year || DEFAULT_FESTIVAL_YEAR;
  const maxEvents = mergedFestivalPage?.eventsPreview?.maxEvents || 3;
  const upcomingEvents = festivalEditionId ? await getUpcomingFestivalEventsByEdition(festivalEditionId, maxEvents) : null;
  const legacySelectedEvents = mergedFestivalPage?.eventsPreview?.events?.filter(isRenderableEvent) || null;
  const events = upcomingEvents?.length ? upcomingEvents : legacySelectedEvents?.length ? legacySelectedEvents : null;

  return (
    <FestivalExperience
      content={mergedFestivalPage}
      partners={partners.length ? partners : null}
      events={events}
      currentProgrammeHref={getFestivalEventsRoute(festivalEditionYear)}
    />
  );
}
