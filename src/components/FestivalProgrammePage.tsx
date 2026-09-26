import ButtonLink from './ButtonLink';
import {ArrowRightIcon, ExternalIcon} from './Icons';
import type {SanityEvent, SanityFestivalEdition} from '../sanity/lib/types';
import {getPastEditionsRoute} from '../lib/festivalRoutes';
import {getPublicFestivalEventTitle} from '../lib/festivalContent';

type ProgrammeItem = {
  dateKey: string;
  dateLabel: string;
  dateShortLabel: string;
  timeLabel: string;
  title: string;
  description: string;
  venue: string;
  category: string;
  attendanceLabel?: string;
  priceLabel?: string;
  actionHref?: string;
  actionLabel?: string;
};

type EditionMetaItem = {
  label: string;
  value: string;
};

type FestivalProgrammePageProps = {
  year: string;
  edition?: SanityFestivalEdition | null;
  events?: SanityEvent[] | null;
  eyebrow: string;
  title: string;
  intro: string;
  emptyMessage: string;
  backHref: string;
  backLabel: string;
};

function formatDateLabel(dateTime?: string, legacyDate?: string) {
  if (dateTime) {
    const parsed = new Date(dateTime);

    if (!Number.isNaN(parsed.getTime())) {
      return {
        key: parsed.toISOString().slice(0, 10),
        label: new Intl.DateTimeFormat('en', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }).format(parsed),
        shortLabel: new Intl.DateTimeFormat('en', {
          month: 'short',
          day: 'numeric',
        }).format(parsed),
      };
    }
  }

  if (legacyDate) {
    const parsed = new Date(`${legacyDate}T00:00:00`);

    if (!Number.isNaN(parsed.getTime())) {
      return {
        key: legacyDate,
        label: new Intl.DateTimeFormat('en', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }).format(parsed),
        shortLabel: new Intl.DateTimeFormat('en', {
          month: 'short',
          day: 'numeric',
        }).format(parsed),
      };
    }

    return {key: legacyDate, label: legacyDate, shortLabel: legacyDate};
  }

  return {key: 'date-tba', label: 'Date to be announced', shortLabel: 'Date TBA'};
}

function formatTimeLabel(event: SanityEvent) {
  const start = event.startDateTime ? new Date(event.startDateTime) : null;
  const end = event.endDateTime ? new Date(event.endDateTime) : null;

  if (start && !Number.isNaN(start.getTime())) {
    const startLabel = new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(start);

    if (end && !Number.isNaN(end.getTime())) {
      const endLabel = new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(end);

      return `${startLabel} - ${endLabel}`;
    }

    return startLabel;
  }

  if (event.startTime && event.endTime) {
    return `${event.startTime} - ${event.endTime}`;
  }

  return event.startTime || 'Time to be announced';
}

function normalizeProgrammeItems(events?: SanityEvent[] | null): ProgrammeItem[] {
  if (!events?.length) {
    return [];
  }

  return events
    .filter((event) => event.isVisible !== false && event.title && (event.startDateTime || event.date))
    .map((event) => {
      const date = formatDateLabel(event.startDateTime, event.date);
      const actionHref = event.ticketUrl || event.registrationUrl;

      return {
        dateKey: date.key,
        dateLabel: date.label,
        dateShortLabel: date.shortLabel,
        timeLabel: formatTimeLabel(event),
        title: getPublicFestivalEventTitle(event.title),
        description: event.shortDescription || '',
        venue: event.venue || 'Venue to be announced',
        category: event.eventType || 'Festival event',
        attendanceLabel: event.attendanceType,
        priceLabel: event.priceLabel,
        actionHref,
        actionLabel: actionHref ? event.buttonLabel || (event.ticketUrl ? 'Get tickets' : 'Register now') : undefined,
      };
    });
}

function groupProgrammeItems(items: ProgrammeItem[]) {
  const groups = new Map<string, {dateLabel: string; items: ProgrammeItem[]}>();

  items.forEach((item) => {
    const existing = groups.get(item.dateKey);

    if (existing) {
      existing.items.push(item);
      return;
    }

    groups.set(item.dateKey, {dateLabel: item.dateLabel, items: [item]});
  });

  return Array.from(groups.entries()).map(([dateKey, value]) => ({
    dateKey,
    dateLabel: value.dateLabel,
    items: value.items,
  }));
}

function formatEditionRange(edition: SanityFestivalEdition | null | undefined, year: string) {
  if (!edition?.startDate || !edition?.endDate) {
    return `Festival ${edition?.year || year}`;
  }

  const start = new Date(`${edition.startDate}T00:00:00`);
  const end = new Date(`${edition.endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `Festival ${edition?.year || year}`;
  }

  const startLabel = new Intl.DateTimeFormat('en', {month: 'short', day: 'numeric'}).format(start);
  const endLabel = new Intl.DateTimeFormat('en', {month: 'short', day: 'numeric', year: 'numeric'}).format(end);

  return `${startLabel} - ${endLabel}`;
}

function buildEditionMeta(edition: SanityFestivalEdition | null | undefined): EditionMetaItem[] {
  const items: EditionMetaItem[] = [];
  if (edition?.location) {
    items.push({label: 'Location', value: edition.location});
  }

  if (edition?.theme) {
    items.push({label: 'Theme', value: edition.theme});
  }

  return items;
}

export default function FestivalProgrammePage({
  year,
  edition,
  events,
  eyebrow,
  title,
  intro,
  emptyMessage,
  backHref,
  backLabel,
}: FestivalProgrammePageProps) {
  const groupedEvents = groupProgrammeItems(normalizeProgrammeItems(events));
  const editionRange = formatEditionRange(edition, year);
  const editionMeta = buildEditionMeta(edition);

  return (
    <>
      <section className="festival-programme-page-hero festival-programme-page-hero-art">
        <div className="container festival-programme-page-hero-shell">
          <div className="festival-programme-page-copy">
            <span className="section-kicker">{eyebrow}</span>
            <h1>{title}</h1>
            <div className="festival-programme-page-date-range">{editionRange}</div>
            <p>
              {edition?.description ||
                intro ||
                `Browse the day-by-day programme for Animae Caribe Festival ${year}.`}
            </p>
            {editionMeta.length ? (
              <div className="festival-programme-page-meta">
                {editionMeta.map((item) => (
                  <span key={`${item.label}-${item.value}`}>
                    <strong>{item.label}:</strong> {item.value}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="festival-programme-page-actions">
              <ButtonLink href={backHref} variant="outline">
                {backLabel} <ArrowRightIcon />
              </ButtonLink>
              <ButtonLink href={getPastEditionsRoute()} variant="soft">
                Past Editions <ArrowRightIcon />
              </ButtonLink>
            </div>
          </div>

          <div className="festival-programme-page-side">
            <div className="festival-programme-ghost-calendar" aria-hidden="true">
              <div className="festival-programme-ghost-calendar-frame">
                <div className="festival-programme-ghost-calendar-bar" />
                <div className="festival-programme-ghost-calendar-grid">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="festival-programme-ghost-chip festival-programme-ghost-chip-cyan" />
              <div className="festival-programme-ghost-chip festival-programme-ghost-chip-gold" />
              <div className="festival-programme-ghost-orb" />
            </div>
          </div>
        </div>
      </section>

      <section className="section festival-programme-page-section">
        <div className="container festival-programme-page-shell">
          {groupedEvents.length ? (
            groupedEvents.map((group) => (
              <section className="festival-programme-day-block" key={group.dateKey}>
                <div className="festival-programme-day-heading">
                  <span className="section-kicker">Festival Day</span>
                  <h2>{group.dateLabel}</h2>
                </div>
                <div className="festival-programme-day-events">
                  {group.items.map((event) => (
                    <article
                      className="festival-event-card festival-programme-card glass-card"
                      key={`${group.dateKey}-${event.title}-${event.timeLabel}`}
                    >
                      <div className="festival-event-meta">
                        <span>{event.dateShortLabel}</span>
                        <small>{event.timeLabel}</small>
                      </div>
                      <div className="festival-programme-card-copy">
                        <p className="festival-event-category">{event.category}</p>
                        <h3>{event.title}</h3>
                        <p>{event.description}</p>
                        <div className="festival-programme-card-footer">
                          <strong>{event.venue}</strong>
                          {event.attendanceLabel || event.priceLabel ? (
                            <div className="festival-programme-event-flags">
                              {event.attendanceLabel ? <span>{event.attendanceLabel}</span> : null}
                              {event.priceLabel ? <span>{event.priceLabel}</span> : null}
                            </div>
                          ) : null}
                        </div>
                        {event.actionHref && event.actionLabel ? (
                          <div className="festival-programme-event-action">
                            <ButtonLink href={event.actionHref} variant="outline" external>
                              {event.actionLabel} <ExternalIcon />
                            </ButtonLink>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="festival-programme-empty glass-panel">
              <span className="section-kicker">Programme updates</span>
              <h2>{emptyMessage}</h2>
              <p>
                Return to the Festival homepage for previews, partners, venue details, and updates as the programme
                takes shape.
              </p>
              <ButtonLink href={backHref} variant="primary">
                {backLabel} <ArrowRightIcon />
              </ButtonLink>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
