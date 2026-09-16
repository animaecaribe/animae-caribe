'use client';

import Image from 'next/image';
import {useEffect, useMemo, useRef, useState} from 'react';
import {urlForImage} from '@/sanity/lib/image';
import type {SanityFestivalPage, SanityPerson} from '@/sanity/lib/types';

type FestivalSpeakersSectionProps = {
  content?: SanityFestivalPage['speakersSection'] | null;
};

function buildSpeakerImageUrl(image: SanityPerson['image'], width: number, height: number) {
  return urlForImage(image)?.width(width).height(height).fit('crop').auto('format').url() || image?.url;
}

function getSpeakerId(speaker: SanityPerson) {
  return speaker._id || speaker.slug || speaker.name || null;
}

function getSpeakerInitials(name?: string) {
  if (!name) {
    return 'AC';
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'AC';
}

function sortPeople(people?: SanityPerson[] | null) {
  if (!people?.length) {
    return [];
  }

  return [...people]
    .filter((person) => person.active !== false && person.name && !/tyree/i.test(person.name))
    .sort((left, right) => {
      const leftOrder = typeof left.sortOrder === 'number' ? left.sortOrder : Number.MAX_SAFE_INTEGER;
      const rightOrder = typeof right.sortOrder === 'number' ? right.sortOrder : Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return (left.name || '').localeCompare(right.name || '');
    });
}

export default function FestivalSpeakersSection({content}: FestivalSpeakersSectionProps) {
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const speakers = useMemo(() => sortPeople(content?.people), [content?.people]);
  const activeSpeaker = activeSpeakerId ? speakers.find((speaker) => getSpeakerId(speaker) === activeSpeakerId) || null : null;
  const modalImageUrl = activeSpeaker ? buildSpeakerImageUrl(activeSpeaker.image, 960, 1080) : null;
  const modalImageAlt = activeSpeaker?.image?.alt || `${activeSpeaker?.name || 'Speaker'} portrait`;
  const modalImageWidth = activeSpeaker?.image?.width || 960;
  const modalImageHeight = activeSpeaker?.image?.height || 1080;

  const openSpeaker = (speaker: SanityPerson) => {
    const speakerId = getSpeakerId(speaker);

    if (!speakerId) {
      return;
    }

    window.requestAnimationFrame(() => {
      setActiveSpeakerId(speakerId);
    });
  };

  useEffect(() => {
    if (!activeSpeaker) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';

    if (scrollbarCompensation > 0) {
      document.body.style.paddingRight = `${scrollbarCompensation}px`;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveSpeakerId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [activeSpeaker]);

  if (content?.isVisible === false || !speakers.length) {
    return null;
  }

  return (
    <>
      <section className="section festival-speakers-section" id="festival-speakers">
        <div className="container">
          <div className="services-header">
            <div>
              {content?.showEyebrow !== false ? (
                <span className="section-kicker">{content?.eyebrow || 'Speakers & Guests'}</span>
              ) : null}
              {content?.showHeading !== false ? (
                <h2>{content?.heading || 'Meet the speakers, guests and special voices shaping the festival.'}</h2>
              ) : null}
            </div>
            {content?.showDescription !== false ? (
              <p>
                {content?.description ||
                  'Artists, storytellers, producers, technologists and cultural leaders featured across the Animae Caribe Festival programme.'}
              </p>
            ) : null}
          </div>

          <div className="festival-speakers-grid">
            {speakers.map((speaker) => {
              const cardImageUrl = buildSpeakerImageUrl(speaker.image, 560, 560);
              const imageAlt = speaker.image?.alt || `${speaker.name} portrait`;

              return (
                <button
                  className="festival-speaker-card glass-card"
                  key={getSpeakerId(speaker) || speaker.name}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openSpeaker(speaker);
                  }}
                  aria-label={`Open speaker details for ${speaker.name}`}
                >
                  <div className="festival-speaker-card-image">
                    {cardImageUrl ? (
                      <Image
                        src={cardImageUrl}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 680px) 100vw, (max-width: 980px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="festival-speaker-card-placeholder" aria-hidden="true">
                        <span>{getSpeakerInitials(speaker.name)}</span>
                      </div>
                    )}
                  </div>
                  <div className="festival-speaker-card-copy">
                    <h3>{speaker.name}</h3>
                    {speaker.role ? <p>{speaker.role}</p> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {activeSpeaker ? (
        <div
          className="showreel-modal-overlay festival-image-modal-overlay festival-speaker-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={activeSpeaker.name || 'Speaker details'}
          onClick={() => setActiveSpeakerId(null)}
        >
          <div className="showreel-modal-shell festival-speaker-modal-shell" onClick={(event) => event.stopPropagation()}>
            <button
              ref={closeButtonRef}
              className="showreel-modal-close"
              type="button"
              aria-label="Close"
              onClick={() => setActiveSpeakerId(null)}
            >
              <span aria-hidden="true">X</span>
            </button>

            <div className={`festival-speaker-modal-layout${modalImageUrl ? '' : ' festival-speaker-modal-layout-no-media'}`}>
              {modalImageUrl ? (
                <div className="festival-speaker-modal-image">
                  <Image
                    src={modalImageUrl}
                    alt={modalImageAlt}
                    width={modalImageWidth}
                    height={modalImageHeight}
                    sizes="(max-width: 680px) 100vw, 40vw"
                  />
                </div>
              ) : null}
              <div className="festival-speaker-modal-copy">
                <span className="section-kicker">Speakers & Guests</span>
                <h3>{activeSpeaker.name}</h3>
                {activeSpeaker.role ? <p className="festival-speaker-modal-role">{activeSpeaker.role}</p> : null}
                {activeSpeaker.bio ? <p>{activeSpeaker.bio}</p> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
