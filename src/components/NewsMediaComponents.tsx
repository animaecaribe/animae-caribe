import Link from 'next/link';
import type {NewsMediaAdjacentPosts, NewsMediaDetail, NewsMediaItem, NewsMediaType} from '@/lib/newsMedia';
import {formatNewsMediaDate} from '@/lib/newsMedia';
import {ArrowRightIcon, PlayIcon} from './Icons';

type NewsMediaCardProps = {
  item: NewsMediaItem;
  compact?: boolean;
};

type NewsMediaPaginationProps = {
  currentPage: number;
  totalPages: number;
};

type NewsMediaAdjacentNavProps = {
  adjacent: NewsMediaAdjacentPosts;
};

type NewsMediaDetailHeroProps = {
  item: NewsMediaDetail;
};

const contentTypeLabels: Record<NewsMediaType, string> = {
  article: 'Article',
  video: 'Video',
};

function truncateCardText(value: string, maxLength = 150) {
  if (value.length <= maxLength) {
    return value;
  }

  const trimmed = value.slice(0, maxLength).replace(/\s+\S*$/, '').trim();

  return `${trimmed || value.slice(0, maxLength).trim()}...`;
}

export function NewsMediaHero() {
  return (
    <div className="page-cinematic-hero page-cinematic-hero-news-media">
      <div className="container festival-programme-page-hero-shell">
        <div className="festival-programme-page-copy">
          <span className="section-kicker">Latest Stories</span>
          <h1>News &amp; Media</h1>
          <p>
            Follow the latest Animae Caribe stories, festival coverage, interviews, videos, and creative updates
            from our community and trusted media sources.
          </p>
        </div>
        <div className="festival-programme-page-side">
          <NewsMediaGhostVisual />
        </div>
      </div>
    </div>
  );
}

export function NewsMediaGhostVisual() {
  return (
    <div className="page-cinematic-ghost page-cinematic-ghost-news-media" aria-hidden="true">
      <span className="news-media-ghost-card news-media-ghost-card-large" />
      <span className="news-media-ghost-card news-media-ghost-card-small" />
      <span className="news-media-ghost-play"><PlayIcon /></span>
      <span className="news-media-ghost-line news-media-ghost-line-top" />
      <span className="news-media-ghost-line news-media-ghost-line-middle" />
      <span className="news-media-ghost-line news-media-ghost-line-bottom" />
      <span className="news-media-ghost-dot news-media-ghost-dot-cyan" />
      <span className="news-media-ghost-dot news-media-ghost-dot-yellow" />
    </div>
  );
}

export function getNewsMediaTypeLabel(type: NewsMediaType) {
  return contentTypeLabels[type] || 'News';
}

export function NewsMediaDetailHero({item}: NewsMediaDetailHeroProps) {
  const label = getNewsMediaTypeLabel(item.type);
  const authorLabel = item.author || item.sourceLabel;
  const terms = Array.from(new Set([...item.categories, ...item.tags].filter(Boolean)));

  return (
    <div className="page-cinematic-hero page-cinematic-hero-news-media news-media-detail-hero">
      <div className="container festival-programme-page-hero-shell">
        <div className="festival-programme-page-copy news-media-detail-hero-copy">
          <span className="section-kicker">{label}</span>
          <h1>{item.title}</h1>
          <div className="news-media-hero-meta">
            <span>
              Posted on <time dateTime={item.publishedAt}>{formatNewsMediaDate(item.publishedAt)}</time>
              {authorLabel ? <> by {authorLabel}</> : null}
            </span>
          </div>
          {terms.length ? (
            <div className="news-media-term-row news-media-hero-terms" aria-label="Categories and tags">
              {terms.map((term) => (
                <span key={term}>{term}</span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="festival-programme-page-side">
          <NewsMediaGhostVisual />
        </div>
      </div>
    </div>
  );
}

export function NewsMediaCard({item, compact = false}: NewsMediaCardProps) {
  const label = getNewsMediaTypeLabel(item.type);
  const terms = [...item.categories, ...item.tags].slice(0, compact ? 2 : 3);
  const excerpt = item.excerpt ? truncateCardText(item.excerpt) : undefined;

  return (
    <article className={compact ? 'news-media-card news-media-card-compact glass-card' : 'news-media-card glass-card'}>
      <Link className="news-media-card-media" href={`/news-media/${item.slug}`} aria-label={`Open ${item.title}`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.imageAlt || item.title} loading="lazy" />
        ) : (
          <span className="news-media-card-placeholder" aria-hidden="true">
            <span>{label}</span>
          </span>
        )}
        <span className="news-media-type-badge">{label}</span>
      </Link>

      <div className="news-media-card-body">
        <div className="news-media-card-meta">
          <time dateTime={item.publishedAt}>{formatNewsMediaDate(item.publishedAt)}</time>
          {item.sourceLabel ? <span>{item.sourceLabel}</span> : null}
        </div>
        <h2>
          <Link href={`/news-media/${item.slug}`}>{item.title}</Link>
        </h2>
        {excerpt ? <p>{excerpt}</p> : null}
        {terms.length ? (
          <div className="news-media-term-row" aria-label="Categories and tags">
            {terms.map((term) => (
              <span key={term}>{term}</span>
            ))}
          </div>
        ) : null}
        <Link className="news-media-text-link" href={`/news-media/${item.slug}`}>
          Read more <ArrowRightIcon />
        </Link>
      </div>
    </article>
  );
}

export function NewsMediaPagination({currentPage, totalPages}: NewsMediaPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <nav className="news-media-pagination" aria-label="News and media pagination">
      {previousPage >= 1 ? (
        <Link href={previousPage === 1 ? '/news-media' : `/news-media?page=${previousPage}`}>Previous</Link>
      ) : (
        <span aria-disabled="true">Previous</span>
      )}
      <strong>
        Page {currentPage} of {totalPages}
      </strong>
      {nextPage <= totalPages ? <Link href={`/news-media?page=${nextPage}`}>Next</Link> : <span aria-disabled="true">Next</span>}
    </nav>
  );
}

export function NewsMediaAdjacentNav({adjacent}: NewsMediaAdjacentNavProps) {
  if (!adjacent.previous && !adjacent.next) {
    return null;
  }

  return (
    <nav className="news-media-adjacent" aria-label="Previous and next posts">
      {adjacent.previous ? (
        <Link href={`/news-media/${adjacent.previous.slug}`}>
          <span>Previous Post</span>
          <strong>{adjacent.previous.title}</strong>
        </Link>
      ) : (
        <span />
      )}
      {adjacent.next ? (
        <Link href={`/news-media/${adjacent.next.slug}`}>
          <span>Next Post</span>
          <strong>{adjacent.next.title}</strong>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function NewsMediaEmptyState() {
  return (
    <div className="news-media-empty glass-card">
      <span className="section-kicker">No posts yet</span>
      <h2>Stories and videos will appear here soon.</h2>
      <p>
        There are no published stories or videos to browse yet. Visit the House and Festival pages to learn
        about our creative work and programme.
      </p>
    </div>
  );
}
