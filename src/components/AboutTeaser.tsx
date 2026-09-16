import type {PortableTextBlock} from '@portabletext/types';
import ButtonLink from './ButtonLink';
import { ArrowRightIcon } from './Icons';
import PortableTextRenderer from '@/sanity/PortableTextRenderer';

type AboutTeaserProps = {
  kicker?: string;
  title?: string;
  copy?: string;
  body?: PortableTextBlock[] | null;
  ctaHref?: string;
  ctaLabel?: string;
  showKicker?: boolean;
  showTitle?: boolean;
  showCopy?: boolean;
  showCta?: boolean;
};

export default function AboutTeaser({
  kicker = 'About us',
  title = 'A creative house for Caribbean animation, talent and digital storytelling.',
  copy = 'Animae Caribe House brings artists, animators and storytellers together to develop ideas and create animated work. Rooted in the Caribbean, the House supports story development, creative production and collaboration, connecting regional talent with projects and partners at home and abroad.',
  body,
  ctaHref = '/about',
  ctaLabel = 'Read about the house',
  showKicker = true,
  showTitle = true,
  showCopy = true,
  showCta = true,
}: AboutTeaserProps) {
  return (
    <section className="section about-teaser" id="about-preview">
      <div className="container split-grid">
        <div>
          {showKicker !== false ? <span className="section-kicker">{kicker}</span> : null}
          {showTitle !== false ? <h2>{title}</h2> : null}
        </div>
        <div className="stacked-copy">
          {showCopy !== false ? (
            body?.length ? (
              <PortableTextRenderer value={body} />
            ) : (
              <p>{copy}</p>
            )
          ) : null}
          {showCta !== false ? (
            <ButtonLink href={ctaHref} variant="outline">
              {ctaLabel} <ArrowRightIcon />
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
