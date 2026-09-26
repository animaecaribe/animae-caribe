import type {
  SanityAboutPage,
  SanityAboutJobListing,
  SanityAboutSectionPage,
  SanityContactPage,
  SanityEvent,
  SanityFestivalEdition,
  SanityFestivalPage,
  SanityHousePage,
  SanityPartner,
  SanityPartnersPage,
  SanityPostTeaser,
  SanitySiteSettings,
  SanityUmbrellaHomePage,
} from './types';
import {sanityFetch} from './client';

const imageWithAltProjection = `
  alt,
  caption,
  crop,
  hotspot,
  asset,
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
`;

const seoProjection = `
  seoTitle,
  seoDescription,
  "seoImage": {
    ${imageWithAltProjection}
  }
`;

const muxVideoProjection = `
  title,
  muxPlaybackId,
  startTimeSeconds,
  endTimeSeconds,
  posterMode,
  posterTimeSeconds,
  "customPosterImage": {
    ${imageWithAltProjection}
  },
  "fallbackImage": {
    ${imageWithAltProjection}
  },
  ariaLabel
`;

const videoShowreelProjection = `
  title,
  label,
  muxPlaybackId,
  startTimeSeconds,
  endTimeSeconds,
  posterMode,
  posterTimeSeconds,
  buttonLabel,
  modalTitle,
  modalDescription,
  ariaLabel,
  "customPosterImage": {
    ${imageWithAltProjection}
  },
  "fallbackImage": {
    ${imageWithAltProjection}
  }
`;

const richTextSectionProjection = `
  isVisible,
  showEyebrow,
  showHeading,
  showBody,
  showCta,
  showImage,
  eyebrow,
  heading,
  body,
  plainText,
  "image": {
    ${imageWithAltProjection}
  },
  cta
`;

const cardItemProjection = `
  isVisible,
  number,
  title,
  description,
  "image": {
    ${imageWithAltProjection}
  },
  cta
`;

const cardGridSectionProjection = `
  isVisible,
  showEyebrow,
  showHeading,
  showIntro,
  showCta,
  eyebrow,
  heading,
  intro,
  cards[]{
    ${cardItemProjection}
  },
  cta
`;

const archiveTeaserSectionProjection = `
  isVisible,
  showEyebrow,
  showHeading,
  showCopy,
  showCta,
  showImage,
  eyebrow,
  heading,
  copy,
  "image": {
    ${imageWithAltProjection}
  },
  cta
`;

const pageHeroProjection = `
  eyebrow,
  title,
  description,
  "image": {
    "url": image.asset->url,
    "alt": image.alt,
    "width": image.asset->metadata.dimensions.width,
    "height": image.asset->metadata.dimensions.height
  }
`;

const aboutGalleryImageProjection = `
  "url": asset->url,
  alt,
  caption,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
`;

const aboutSectionPageProjection = `
  title,
  "slug": slug.current,
  pageType,
  isVisible,
  heroVisualType,
  hero{
    ${pageHeroProjection}
  },
  "directorImage": {
    "url": directorImage.asset->url,
    "alt": directorImage.alt,
    "width": directorImage.asset->metadata.dimensions.width,
    "height": directorImage.asset->metadata.dimensions.height
  },
  youtubeUrl,
  secondaryYoutubeUrl,
  content{
    heading,
    subheading,
    body
  },
  pdfResource{
    title,
    description,
    downloadLabel,
    "file": {
      "url": file.asset->url,
      "originalFilename": file.asset->originalFilename,
      "mimeType": file.asset->mimeType
    }
  },
  galleryProvider,
  "galleryImages": galleryImages[]{
    ${aboutGalleryImageProjection}
  },
  externalGalleryImages[]{
    url,
    alt,
    caption
  },
  externalGalleryUrl,
  googleDriveFolderId,
  seo{
    seoTitle,
    seoDescription,
    "seoImage": {
      "url": seoImage.asset->url,
      "alt": seoImage.alt,
      "width": seoImage.asset->metadata.dimensions.width,
      "height": seoImage.asset->metadata.dimensions.height
    }
  }
`;

const aboutJobListingProjection = `
  _id,
  eyebrow,
  title,
  "slug": slug.current,
  description,
  body,
  "featuredImage": {
    "url": featuredImage.asset->url,
    "alt": featuredImage.alt,
    "width": featuredImage.asset->metadata.dimensions.width,
    "height": featuredImage.asset->metadata.dimensions.height
  },
  applicationInfo,
  applicationUrl,
  expiryDate
`;

const partnerProjection = `
  name,
  "url": coalesce(url, website),
  website,
  "logoUrl": logo.asset->url,
  active,
  relationship,
  relatedExperiences,
  relatedExperience,
  partnerTypes,
  partnerType,
  sortOrder
`;

const partnerSectionSettingsProjection = `
  isVisible,
  showHeading,
  showIntro,
  showCta,
  heading,
  intro,
  cta,
  "partners": partners[coalesce(@->active, true) == true]->{
    ${partnerProjection}
  }
`;

const personProjection = `
  _id,
  name,
  "slug": slug.current,
  active,
  sortOrder,
  role,
  bio,
  "image": image{
    alt,
    caption,
    crop,
    hotspot,
    asset,
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  }
`;

const eventProjection = `
  isVisible,
  _id,
  title,
  "slug": slug.current,
  startDateTime,
  endDateTime,
  date,
  startTime,
  endTime,
  venue,
  eventType,
  shortDescription,
  attendanceType,
  priceLabel,
  buttonLabel,
  ticketUrl,
  registrationUrl,
  "imageUrl": image.asset->url,
  festivalEdition->{
    _id,
    title,
    theme,
    year,
    startDate,
    endDate,
    location,
    description,
    isActive
  }
`;

const festivalEditionProjection = `
  _id,
  title,
  year,
  theme,
  startDate,
  endDate,
  location,
  description,
  isActive
`;

export async function getSiteSettings() {
  return sanityFetch<SanitySiteSettings>(`*[_type == "siteSettings"][0]{
    siteTitle,
    defaultSeo,
    contactEmail,
    contactPhone,
    location,
    contactMapSearchText,
    footerCopy,
    navigationLinks,
    footerLinks,
    socialLinks
  }`);
}

export async function getUmbrellaHomePage() {
  return sanityFetch<SanityUmbrellaHomePage>(`*[_type == "umbrellaHomePage"][0]{
    seo{
      seoTitle,
      seoDescription,
      "seoImage": {
        "url": seoImage.asset->url,
        "alt": seoImage.alt,
        "width": seoImage.asset->metadata.dimensions.width,
        "height": seoImage.asset->metadata.dimensions.height
      }
    },
    splitHero{
      isVisible,
      leftPanel{
        showEyebrow,
        showTitle,
        showDescription,
        showCta,
        showMedia,
        eyebrow,
        title,
        description,
        cta,
        "backgroundImageUrl": backgroundImage.asset->url,
        "backgroundImageAlt": backgroundImage.alt,
        video{
          title,
          muxPlaybackId,
          startTimeSeconds,
          endTimeSeconds,
          posterMode,
          posterTimeSeconds,
          "customPosterImage": {
            "url": customPosterImage.asset->url,
            "alt": customPosterImage.alt
          },
          "fallbackImage": {
            "url": fallbackImage.asset->url,
            "alt": fallbackImage.alt
          },
          ariaLabel
        }
      },
      rightPanel{
        showEyebrow,
        showTitle,
        showDescription,
        showCta,
        showMedia,
        eyebrow,
        title,
        description,
        cta,
        "backgroundImageUrl": backgroundImage.asset->url,
        "backgroundImageAlt": backgroundImage.alt,
        video{
          title,
          muxPlaybackId,
          startTimeSeconds,
          endTimeSeconds,
          posterMode,
          posterTimeSeconds,
          "customPosterImage": {
            "url": customPosterImage.asset->url,
            "alt": customPosterImage.alt
          },
          "fallbackImage": {
            "url": fallbackImage.asset->url,
            "alt": fallbackImage.alt
          },
          ariaLabel
        }
      }
    },
    aboutSection{
      isVisible,
      showEyebrow,
      showHeading,
      showDescription,
      showCta,
      eyebrow,
      heading,
      description,
      plainText,
      cta
    },
    ecosystemSection{
      isVisible,
      showEyebrow,
      showHeading,
      showIntro,
      showCards,
      showCta,
      eyebrow,
      heading,
      intro,
      cards[]{
        isVisible,
        number,
        title,
        description
      },
      cta
    },
    partnersSection{
      isVisible,
      eyebrow,
      heading,
      "partners": partners[coalesce(@->active, true) == true]->{
        ${partnerProjection}
      }
    }
  }`);
}

export async function getFestivalPage() {
  return sanityFetch<SanityFestivalPage>(`*[_type == "festivalPage"][0]{
    seo{
      seoTitle,
      seoDescription,
      "seoImage": {
        "url": seoImage.asset->url,
        "alt": seoImage.alt,
        "width": seoImage.asset->metadata.dimensions.width,
        "height": seoImage.asset->metadata.dimensions.height
      }
    },
    hero{
      isVisible,
      heading,
      copy,
      primaryCta,
      backgroundVideo{
        title,
        muxPlaybackId,
        startTimeSeconds,
        endTimeSeconds,
        posterMode,
        posterTimeSeconds,
        "customPosterImage": {
          "url": customPosterImage.asset->url,
          "alt": customPosterImage.alt
        },
        "fallbackImage": {
          "url": fallbackImage.asset->url,
          "alt": fallbackImage.alt
        },
        ariaLabel
      },
      ctas,
      showreel{
        muxPlaybackId,
        modalTitle,
        modalDescription,
        startTimeSeconds,
        endTimeSeconds,
        posterMode,
        posterTimeSeconds,
        buttonLabel,
        "customPosterImageUrl": customPosterImage.asset->url,
        "fallbackImageUrl": fallbackImage.asset->url
      }
    },
    aboutSection{isVisible, showEyebrow, showHeading, showDescription, showCta, eyebrow, heading, description, plainText, cta},
    partnersSection{
      isVisible,
      eyebrow,
      heading,
      "partners": partners[coalesce(@->active, true) == true]->{
        ${partnerProjection}
      }
    },
	    programmingSection{isVisible, showEyebrow, showHeading, showDescription, eyebrow, heading, description, intro, cards[]{isVisible, number, title, description}},
	    speakersSection{
	      isVisible,
	      showEyebrow,
	      showHeading,
	      showDescription,
	      eyebrow,
	      heading,
	      description,
	      "people": people[@->._id != null && coalesce(@->active, true) == true && !(lower(coalesce(@->name, "")) match "*tyree*") && !(lower(coalesce(@->name, "")) match "*alice*dizon*manuel*")]->{
	        ${personProjection}
	      }
	    },
	    calendarSection{
      isVisible,
      eyebrow,
      heading,
      description,
      modalTitle,
      downloadLabel,
      downloadButtonStyle,
      "calendarImage": {
        "url": calendarImage.asset->url,
        "alt": calendarImage.alt
      }
    },
    eventsPreview{
      isVisible,
      showEyebrow,
      showHeading,
      showDescription,
      showCta,
      eyebrow,
      heading,
      description,
      festivalEdition->{
        _id,
        title,
        year,
        isActive
      },
      maxEvents,
      cta,
      "events": events[@->._id != null && coalesce(@->isVisible, true) == true]->{
        ${eventProjection}
      }
    },
    venueSection{
      isVisible,
      eyebrow,
      heading,
      description,
      venueName,
      address,
      googleMapsEmbedUrl,
      googleMapsUrl,
      mapCtaLabel,
      mapButtonStyle
    },
    archiveTeaser{isVisible, showEyebrow, showHeading, showDescription, showCta, eyebrow, heading, description, plainText, cta},
    finalCta{
      isVisible,
      showEyebrow,
      showHeading,
      showDescription,
      eyebrow,
      heading,
      description,
      plainText,
      primaryCta,
      secondaryCta,
      cta
    }
  }`);
}

export async function getHousePage() {
  return sanityFetch<SanityHousePage>(`*[_type == "housePage"][0]{
    seo{
      ${seoProjection}
    },
    hero{
      isVisible,
      showEyebrow,
      showHeading,
      showCopy,
      showCtas,
      showLogo,
      showBackgroundMedia,
      eyebrow,
      heading,
      copy,
      "logo": {
        ${imageWithAltProjection}
      },
      "backgroundImage": {
        ${imageWithAltProjection}
      },
      backgroundVideo{
        ${muxVideoProjection}
      },
      showreel{
        ${videoShowreelProjection}
      },
      ctas
    },
    aboutSection{
      ${richTextSectionProjection}
    },
    partnersSection{
      ${partnerSectionSettingsProjection}
    },
    servicesSection{
      ${cardGridSectionProjection}
    },
    featuredWorkSection{
      ${richTextSectionProjection}
    },
    statsSection{
      ${cardGridSectionProjection}
    },
    teamSection{
      ${richTextSectionProjection}
    },
    festivalTeaserSection{
      ${richTextSectionProjection}
    },
    newsSection{
      ${richTextSectionProjection}
    },
    faqSection[]{
      ${cardItemProjection}
    },
    ctaSection{
      ${archiveTeaserSectionProjection}
    }
  }`);
}

export async function getAboutPage() {
  return sanityFetch<SanityAboutPage>(`*[_type == "aboutPage"][0]{
    hero{
      ${pageHeroProjection}
    }
  }`);
}

export async function getAboutSectionPage(slug: string) {
  return sanityFetch<SanityAboutSectionPage>(
    `*[_type == "aboutSectionPage" && slug.current == $slug && coalesce(isVisible, true) == true][0]{
      ${aboutSectionPageProjection}
    }`,
    {slug}
  );
}

export async function getAboutSectionPageSlugs() {
  return sanityFetch<Array<{slug?: string}>>(
    `*[_type == "aboutSectionPage" && defined(slug.current) && coalesce(isVisible, true) == true]{
      "slug": slug.current
    }`
  );
}

export async function getActiveAboutJobListings(todayIsoDate: string) {
  return sanityFetch<SanityAboutJobListing[]>(
    `*[
      _type == "aboutJobListing" &&
      coalesce(isActive, true) == true &&
      coalesce(positionFilled, false) == false &&
      (!defined(expiryDate) || expiryDate >= $todayIsoDate)
    ] | order(expiryDate asc, title asc){
      ${aboutJobListingProjection}
    }`,
    {todayIsoDate}
  );
}

export async function getPartnersPage() {
  return sanityFetch<SanityPartnersPage>(`*[_type == "partnersPage"][0]{
    hero{
      ${pageHeroProjection}
    }
  }`);
}

export async function getContactPage() {
  return sanityFetch<SanityContactPage>(`*[_type == "contactPage"][0]{
    hero{
      ${pageHeroProjection}
    },
    contentSection{
      eyebrow,
      title,
      description
    }
  }`);
}

export async function getActiveFestivalEdition() {
  return sanityFetch<SanityFestivalEdition>(`*[_type == "festivalEdition" && isActive == true][0]{
    ${festivalEditionProjection}
  }`);
}

export async function getFeaturedFestivalEvents() {
  return sanityFetch<SanityEvent[]>(`*[_type == "event" && isFeatured == true && coalesce(isVisible, true) == true] | order(startDateTime asc, date asc, startTime asc)[0...6]{
    ${eventProjection}
  }`);
}

export async function getUpcomingFestivalEventsByEdition(editionId: string, maxEvents = 3) {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const limit = Math.min(Math.max(maxEvents, 1), 12);

  return sanityFetch<SanityEvent[]>(
    `*[
      _type == "event" &&
      coalesce(isVisible, true) == true &&
      references($editionId) &&
      (
        (defined(startDateTime) && startDateTime >= $now) ||
        (!defined(startDateTime) && defined(date) && date >= $today)
      )
    ] | order(startDateTime asc, date asc, startTime asc)[0...${limit}]{
      ${eventProjection}
    }`,
    {editionId, now, today}
  );
}

export async function getFestivalEditionByYear(year: number | string) {
  return sanityFetch<SanityFestivalEdition>(
    `*[_type == "festivalEdition" && year == $year][0]{
      ${festivalEditionProjection}
    }`,
    {year: Number(year)}
  );
}

export async function getAllFestivalEditions() {
  return sanityFetch<SanityFestivalEdition[]>(`*[_type == "festivalEdition" && defined(year)] | order(year desc){
    ${festivalEditionProjection}
  }`);
}

export async function getPastFestivalEditions() {
  const [allEditions, activeEdition] = await Promise.all([getAllFestivalEditions(), getActiveFestivalEdition()]);

  if (!allEditions?.length) {
    return null;
  }

  const activeYear = activeEdition?.year;

  return allEditions
    .filter((edition) => {
      if (typeof edition.year !== 'number') {
        return false;
      }

      if (typeof activeYear === 'number') {
        return edition.year < activeYear;
      }

      return edition.isActive !== true;
    })
    .sort((left, right) => (right.year || 0) - (left.year || 0));
}

export async function getFestivalEventsByEdition(editionId: string) {
  return sanityFetch<SanityEvent[]>(
    `*[
      _type == "event" &&
      coalesce(isVisible, true) == true &&
      references($editionId)
    ] | order(startDateTime asc, date asc, startTime asc){
      ${eventProjection}
    }`,
    {editionId}
  );
}

export async function getAllFestivalEvents() {
  return sanityFetch<SanityEvent[]>(`*[_type == "event" && coalesce(isVisible, true) == true] | order(startDateTime asc, date asc, startTime asc){
    ${eventProjection}
  }`);
}

export async function getPartnersByExperience(experience: 'umbrella' | 'festival' | 'house') {
  return sanityFetch<SanityPartner[]>(
    `*[
      _type == "partner" &&
      coalesce(active, true) == true &&
      (
        (
          (
            !defined(relatedExperiences) ||
            count(relatedExperiences) == 0
          ) &&
          !defined(relatedExperience)
        ) ||
        (
          $experience in coalesce(relatedExperiences, []) ||
          relatedExperience == $experience
        )
      )
    ] | order(coalesce(sortOrder, 999999) asc, name asc){
      ${partnerProjection}
    }`,
    {experience}
  );
}

export async function getUmbrellaPartners() {
  return getPartnersByExperience('umbrella');
}

export async function getFestivalPartners() {
  return getPartnersByExperience('festival');
}

export async function getHousePartners() {
  return getPartnersByExperience('house');
}

export async function getRecentPosts() {
  // News cards link to /news-media/[slug], so missing slugs stay out of public lists.
  return sanityFetch<SanityPostTeaser[]>(`*[
    _type == "post" &&
    defined(slug.current) &&
    coalesce(isVisible, true) == true
  ] | order(coalesce(publishedAt, date) desc)[0...6]{
    title,
    "slug": slug.current,
    "date": coalesce(publishedAt, date),
    excerpt,
    relatedExperience,
    "featuredImageUrl": featuredImage.asset->url
  }`);
}

export async function getPageBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "page" && slug.current == $slug][0]{
      title,
      excerpt,
      body,
      relatedExperience,
      sections,
      seo
    }`,
    {slug}
  );
}
