'use client';

import Image from 'next/image';
import {useEffect, useMemo, useState} from 'react';

export type SpeakerFlyer = {
  name: string;
  src: string;
};

type SpeakerFlyerGridProps = {
  flyers: SpeakerFlyer[];
};

export default function SpeakerFlyerGrid({flyers}: SpeakerFlyerGridProps) {
  const [selectedFlyer, setSelectedFlyer] = useState<SpeakerFlyer | null>(null);
  const [query, setQuery] = useState('');
  const sortedFlyers = useMemo(
    () => [...flyers].sort((a, b) => a.name.localeCompare(b.name)),
    [flyers]
  );
  const visibleFlyers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return sortedFlyers;

    return sortedFlyers.filter((flyer) => flyer.name.toLocaleLowerCase().includes(normalizedQuery));
  }, [query, sortedFlyers]);

  useEffect(() => {
    if (!selectedFlyer) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedFlyer(null);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedFlyer]);

  return (
    <>
      <div className="speaker-flyer-search">
        <label htmlFor="speaker-search">Search</label>
        <input
          autoComplete="off"
          id="speaker-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Speaker name"
          type="search"
          value={query}
        />
      </div>

      <div className="speaker-flyer-grid">
        {visibleFlyers.map((flyer) => (
          <article className="speaker-flyer-card glass-card" key={flyer.name}>
            <button
              aria-label={`Expand flyer for ${flyer.name}`}
              className="speaker-flyer-preview"
              onClick={() => setSelectedFlyer(flyer)}
              type="button"
            >
              <Image
                alt={`Guest speaker flyer for ${flyer.name}`}
                height={1350}
                sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 960px) 45vw, 31vw"
                src={flyer.src}
                width={1080}
              />
              <span className="speaker-flyer-expand" aria-hidden="true">View full size</span>
            </button>
            <h2>{flyer.name}</h2>
          </article>
        ))}
      </div>

      {visibleFlyers.length === 0 ? (
        <p className="speaker-flyer-empty">No speakers found for “{query.trim()}”.</p>
      ) : null}

      {selectedFlyer ? (
        <div
          aria-label={`${selectedFlyer.name} flyer preview`}
          aria-modal="true"
          className="speaker-flyer-modal"
          onClick={() => setSelectedFlyer(null)}
          role="dialog"
        >
          <button
            aria-label="Close flyer preview"
            className="speaker-flyer-modal-close"
            onClick={() => setSelectedFlyer(null)}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
          <Image
            alt={`Guest speaker flyer for ${selectedFlyer.name}`}
            className="speaker-flyer-modal-image"
            height={1350}
            onClick={(event) => event.stopPropagation()}
            priority
            sizes="100vw"
            src={selectedFlyer.src}
            width={1080}
          />
        </div>
      ) : null}
    </>
  );
}
