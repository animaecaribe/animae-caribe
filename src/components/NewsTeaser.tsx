import type {PortableTextBlock} from '@portabletext/types';
import PortableTextRenderer from '@/sanity/PortableTextRenderer';
import ButtonLink from './ButtonLink';
import { ArrowRightIcon } from './Icons';
import type {SanityPostTeaser} from '@/sanity/lib/types';

type NewsTeaserProps = {
  kicker?: string;
  title?: string;
  copy?: string;
  body?: PortableTextBlock[] | null;
  ctaHref?: string;
  ctaLabel?: string;
  posts?: SanityPostTeaser[] | null;
  showCta?: boolean;
};

function formatPostDate(date?: string) {
  if (!date) {
    return 'Recently published';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('en', {month: 'short', day: 'numeric', year: 'numeric'}).format(parsed);
}

function normalizePosts(posts?: SanityPostTeaser[] | null) {
  if (!posts?.length) {
    return [];
  }

  return posts.slice(0, 3).map((post) => ({
    title: post.title || 'Untitled post',
    category: post.relatedExperience === 'festival' ? 'Festival' : post.relatedExperience === 'house' ? 'House' : 'News',
    excerpt: post.excerpt || 'Read the latest update from the Animae Caribe ecosystem.',
    date: formatPostDate(post.date),
  }));
}

export default function NewsTeaser({
  kicker = 'News and articles',
  title = 'News from the House and Festival.',
  copy = 'Updates on creative projects, Festival events and the people shaping Caribbean animation.',
  body,
  ctaHref = '/news-media',
  ctaLabel = 'Read articles',
  posts,
  showCta = true,
}: NewsTeaserProps) {
  const items = normalizePosts(posts);

  return (
    <section className="section news-teaser">
      <div className="container section-heading-row">
        <div>
          <span className="section-kicker">{kicker}</span>
          <h2>{title}</h2>
          {body?.length ? <PortableTextRenderer value={body} /> : copy ? <p>{copy}</p> : null}
        </div>
        {showCta !== false ? (
          <ButtonLink href={ctaHref} variant="outline">
            {ctaLabel} <ArrowRightIcon />
          </ButtonLink>
        ) : null}
      </div>

      <div className="container article-grid compact">
        {!items.length ? <p>There are no published updates to show here yet.</p> : null}
        {items.map((article) => (
          <article className="article-card glass-card" key={article.title}>
            <span>{article.category}</span>
            <h3>{article.title}</h3>
            <p>{article.excerpt}</p>
            <small>{article.date}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
