import type {PortableTextBlock} from '@portabletext/types';
import type {SanityImageSource} from '@/sanity/lib/types';
import PortableTextRenderer from '@/sanity/PortableTextRenderer';
import {urlForImage} from '@/sanity/lib/image';
import ButtonLink from './ButtonLink';
import { ArrowRightIcon } from './Icons';

type TeamTeaserProps = {
  kicker?: string;
  title?: string;
  copy?: string;
  body?: PortableTextBlock[] | null;
  image?: SanityImageSource | null;
  showImage?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
  showCta?: boolean;
};

function buildFeatureImageUrl(image?: SanityImageSource | null) {
  return urlForImage(image)?.width(960).height(1080).fit('crop').auto('format').url() || image?.url;
}

export default function TeamTeaser({
  kicker = 'The team',
  title = 'The people behind the pixels, stories and community.',
  copy = 'We are artists, animators, storytellers and creative organisers brought together by a belief in Caribbean imagination. From developing stories at the House to welcoming new voices at the Festival, our work connects creativity, learning and community—helping stories rooted in our region find their place in the world.',
  body,
  image,
  showImage = true,
  ctaHref = '/team',
  ctaLabel = 'Meet the team',
  showCta = true,
}: TeamTeaserProps) {
  const imageUrl = buildFeatureImageUrl(image);

  return (
    <section className="section team-teaser editorial-feature-section" id="team-preview">
      <div className="container editorial-feature-inner">
        <div className="editorial-feature-shell team-feature-shell">
          {showImage !== false ? (
            <div className="editorial-feature-media team-feature-media">
              <img src={imageUrl || '/assets/team.webp'} alt={image?.alt || 'Animae Caribe House team'} />
            </div>
          ) : null}
          <div className="editorial-feature-copy team-feature-copy">
            <span className="section-kicker">{kicker}</span>
            <h2>{title}</h2>
            {body?.length ? <PortableTextRenderer value={body} /> : <p>{copy}</p>}
            {showCta !== false ? (
              <ButtonLink href={ctaHref} variant="primary">
                {ctaLabel} <ArrowRightIcon />
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
