import ButtonLink from './ButtonLink';
import {ArrowRightIcon} from './Icons';
import type {SanityFestivalEdition} from '../sanity/lib/types';
import {getFestivalEventsRoute, getPastFestivalEventsRoute} from '../lib/festivalRoutes';

type PastFestivalEditionsPageProps = {
  editions?: SanityFestivalEdition[] | null;
  currentYear: number;
};

function formatEditionDates(edition: SanityFestivalEdition) {
  if (!edition.startDate || !edition.endDate) {
    return edition.location || 'Dates to be announced';
  }

  const start = new Date(`${edition.startDate}T00:00:00`);
  const end = new Date(`${edition.endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return edition.location || 'Dates to be announced';
  }

  const startLabel = new Intl.DateTimeFormat('en', {month: 'short', day: 'numeric'}).format(start);
  const endLabel = new Intl.DateTimeFormat('en', {month: 'short', day: 'numeric', year: 'numeric'}).format(end);

  return edition.location ? `${startLabel} - ${endLabel} · ${edition.location}` : `${startLabel} - ${endLabel}`;
}

export default function PastFestivalEditionsPage({editions, currentYear}: PastFestivalEditionsPageProps) {
  const items = editions?.filter((edition) => typeof edition.year === 'number') || [];

  return (
    <>
      <section className="festival-programme-page-hero festival-past-editions-hero">
        <div className="container festival-programme-page-hero-shell">
          <div>
            <span className="section-kicker">Festival Archive</span>
            <h1>Past Editions</h1>
            <p>
              Explore the events and programmes of previous Animae Caribe Festivals, from screenings and workshops
              to conversations connecting Caribbean creators with the wider animation community.
            </p>
          </div>
          <div className="festival-programme-page-meta">
            <p>Looking for this year’s events? Explore the {currentYear} Festival programme.</p>
            <div className="festival-programme-page-actions">
              <ButtonLink href="/festival" variant="outline">
                Festival Home <ArrowRightIcon />
              </ButtonLink>
              <ButtonLink href={getFestivalEventsRoute(currentYear)} variant="soft">
                {currentYear} Programme <ArrowRightIcon />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section festival-past-editions-section">
        <div className="container">
          {items.length ? (
            <div className="festival-past-editions-grid">
              {items.map((edition) => (
                <article className="festival-edition-card glass-card" key={edition._id || edition.year}>
                  <span className="section-kicker">{edition.year}</span>
                  <h2>{edition.title || `Animae Caribe Festival ${edition.year}`}</h2>
                  <p>{edition.theme || edition.description || 'Programme archive for this edition.'}</p>
                  <strong>{formatEditionDates(edition)}</strong>
                  <div className="festival-edition-actions">
                    <ButtonLink href={getPastFestivalEventsRoute(edition.year)} variant="primary">
                      View events <ArrowRightIcon />
                    </ButtonLink>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="festival-programme-empty glass-panel">
              <span className="section-kicker">Archive updates</span>
              <h2>No past editions are available yet.</h2>
              <p>
                Earlier programmes are not currently available to browse. Visit the Festival page to explore the
                current programme and learn about Animae Caribe.
              </p>
              <ButtonLink href="/festival" variant="primary">
                Return to Festival Home <ArrowRightIcon />
              </ButtonLink>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
