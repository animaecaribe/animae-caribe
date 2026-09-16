'use client';

import { useEffect, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { useShowreel } from './ShowreelProvider';

export default function ShowreelModal() {
  const {
    modalPlaybackId,
    isShowreelOpen,
    closeShowreel,
    modalPosterSrc,
    modalPosterMode,
    variant,
    modalVideoTitle,
    modalStartTimeSeconds,
    modalEndTimeSeconds,
    modalPosterTimeSeconds,
    modalAriaLabel,
  } = useShowreel();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isShowreelOpen) {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';

    if (scrollbarCompensation > 0) {
      body.style.paddingRight = `${scrollbarCompensation}px`;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeShowreel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [closeShowreel, isShowreelOpen]);

  if (!isShowreelOpen) {
    return null;
  }

  return (
    <div
      className="showreel-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={modalAriaLabel || `Play the ${modalVideoTitle}`}
      onClick={closeShowreel}
    >
      <div className="showreel-modal-shell" onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
        <button
          ref={closeButtonRef}
          className="showreel-modal-close"
          type="button"
          aria-label="Close showreel"
          onClick={closeShowreel}
        >
          <span aria-hidden="true">X</span>
        </button>

        <div className="showreel-modal-player-frame">
          {modalPlaybackId ? (
            <MuxPlayer
              className="showreel-modal-player"
              playbackId={modalPlaybackId}
              autoPlay
              assetStartTime={modalStartTimeSeconds}
              assetEndTime={modalEndTimeSeconds}
              playsInline
              streamType="on-demand"
              poster={modalPosterMode === 'muxFrame' ? undefined : modalPosterSrc}
              thumbnailTime={typeof modalPosterTimeSeconds === 'number' ? modalPosterTimeSeconds : 28}
              metadata={{
                video_title: modalVideoTitle,
              }}
              style={{
                width: '100%',
                height: '100%',
                '--media-object-fit': 'cover',
              }}
            />
          ) : (
            <div className="showreel-placeholder" style={{ backgroundImage: `url(${modalPosterSrc})` }}>
              <div>
                <span className="section-kicker">{variant === 'festival' ? 'Festival reel' : 'Showreel'}</span>
                <h2>{variant === 'festival' ? 'Festival showreel coming soon.' : 'Showreel coming soon.'}</h2>
                <p>
                  The {variant === 'festival' ? 'Festival' : 'House'} reel is not currently available. Please check back to watch highlights of our work.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
