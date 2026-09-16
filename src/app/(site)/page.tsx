import ButtonLink from '@/components/ButtonLink';
import EcosystemSplitHero from '@/components/EcosystemSplitHero';
import PartnersStrip from '@/components/PartnersStrip';
import { ArrowRightIcon, MailIcon } from '@/components/Icons';
import { normalizeSanityPartners } from '@/lib/partners';
import { getUmbrellaHomePage, getUmbrellaPartners } from '@/sanity/lib/queries';
import type { SanityCta } from '@/sanity/lib/types';

export const revalidate = 60;

const defaultMetadata = {
  title: 'Animae Caribe | Animation, Festival, House and Caribbean Creative Community',
  description:
    'The umbrella home for Animae Caribe, connecting the Festival, Animae Caribe House, partners and Caribbean animation community.',
};

function getCtaVariant(cta?: SanityCta, fallback: 'primary' | 'soft' | 'outline' = 'primary') {
  return cta?.style || fallback;
}

export async function generateMetadata() {
  const umbrellaPage = await getUmbrellaHomePage();
  const seo = umbrellaPage?.seo;

  return {
    title: seo?.seoTitle || defaultMetadata.title,
    description: seo?.seoDescription || defaultMetadata.description,
  };
}

export default async function UmbrellaHome() {
  const [umbrellaPage, sanityPartners] = await Promise.all([getUmbrellaHomePage(), getUmbrellaPartners()]);
  const partners = normalizeSanityPartners(sanityPartners);
  const aboutSection = umbrellaPage?.aboutSection;
  const ecosystemSection = umbrellaPage?.ecosystemSection;
  const partnersSection = umbrellaPage?.partnersSection;
  const ecosystemCards = ecosystemSection?.cards?.filter((card) => card.isVisible !== false) || [];

  return (
    <>
      <EcosystemSplitHero content={umbrellaPage?.splitHero} />

      {aboutSection?.isVisible !== false ? (
        <section className="section umbrella-about" id="about-preview">
          <div className="container split-grid">
            <div>
              {aboutSection?.showEyebrow !== false ? (
                <span className="section-kicker">{aboutSection?.eyebrow || 'About Animae Caribe'}</span>
              ) : null}
              {aboutSection?.showHeading !== false ? (
                <h2>{aboutSection?.heading || 'A platform for Caribbean imagination, industry development and cultural exchange.'}</h2>
              ) : null}
            </div>
            <div className="stacked-copy">
              {aboutSection?.showDescription !== false ? (
                <p>
                  {aboutSection?.description ||
                    aboutSection?.plainText ||
                    'Animae Caribe supports Caribbean animation through creative production, learning and cultural exchange. The Festival brings artists, audiences and industry professionals together; the House develops stories and supports production. Together, they connect Caribbean creativity with a wider community of collaborators and audiences.'}
                </p>
              ) : null}
              {aboutSection?.showCta !== false ? (
                <ButtonLink
                  href={aboutSection?.cta?.href || '/contact'}
                  variant={getCtaVariant(aboutSection?.cta, 'outline')}
                >
                  {aboutSection?.cta?.label || 'Contact Animae Caribe'} <MailIcon />
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {partnersSection?.isVisible !== false ? (
        <PartnersStrip
          items={partners}
          kicker={partnersSection?.eyebrow || partnersSection?.heading || 'Animae Caribe partners and collaborators'}
          ariaLabel="Animae Caribe partners"
        />
      ) : null}

      {ecosystemSection?.isVisible !== false ? (
        <section className="section umbrella-contact" id="ecosystem">
          <div className="container section-heading-row">
            <div>
              {ecosystemSection?.showEyebrow !== false ? (
                <span className="section-kicker">{ecosystemSection?.eyebrow || 'Ecosystem'}</span>
              ) : null}
              {ecosystemSection?.showHeading !== false ? (
                <h2>{ecosystemSection?.heading || 'Built for audiences, artists, partners and the next wave of Caribbean stories.'}</h2>
              ) : null}
              {ecosystemSection?.showIntro !== false && ecosystemSection?.intro ? <p>{ecosystemSection.intro}</p> : null}
            </div>
            {ecosystemSection?.showCta !== false ? (
              <ButtonLink
                href={ecosystemSection?.cta?.href || '/festival'}
                variant={getCtaVariant(ecosystemSection?.cta, 'primary')}
              >
                {ecosystemSection?.cta?.label || 'Start with the festival'} <ArrowRightIcon />
              </ButtonLink>
            ) : null}
          </div>
          {ecosystemSection?.showCards !== false && ecosystemCards.length ? (
            <div className="container services-grid mt-8">
              {ecosystemCards.map((card, index) => (
                <article className="services-card glass-card" key={`${card.title || 'ecosystem-card'}-${index}`}>
                  <span className="services-number">{card.number || String(index + 1).padStart(2, '0')}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
