'use client';

import { useEffect, useRef, useState } from 'react';
import { stats, type Stat } from '../data/stats';
import type {SanityCardItem} from '@/sanity/lib/types';

function useCountUp(targetValue: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return undefined;

    let animationFrame = 0;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * targetValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [duration, hasStarted, targetValue]);

  return { ref, value };
}

type StatCardProps = {
  stat: Stat;
};

function StatCard({ stat }: StatCardProps) {
  const { ref, value } = useCountUp(stat.value);

  return (
    <article className="stat-card" ref={ref}>
      <strong>
        {value}
        {stat.suffix}
      </strong>
      <span>{stat.label}</span>
    </article>
  );
}

type StatsSectionProps = {
  kicker?: string;
  title?: string;
  intro?: string;
  items?: Array<Stat | SanityCardItem>;
};

function normalizeStats(items?: Array<Stat | SanityCardItem>) {
  if (!items?.length) {
    return stats;
  }

  return items
    .filter((item) => ('isVisible' in item ? item.isVisible !== false : true))
    .map((item) => {
      if ('value' in item) {
        return item;
      }

      const rawNumber = typeof item.number === 'string' ? item.number.trim() : '';
      const match = rawNumber.match(/^(\d+(?:\.\d+)?)(.*)$/);
      const numericValue = match ? Number(match[1]) : Number(rawNumber);
      const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
      const suffix = match?.[2]?.trim() || '';

      return {
        value: safeValue,
        suffix,
        label: item.title || item.description || '',
      };
    })
    .filter((item) => item.label);
}

export default function StatsSection({
  kicker = 'Reach and impact',
  title = 'Caribbean stories. Lasting connections.',
  intro = 'Since 2001, Animae Caribe has championed Caribbean animation, bringing emerging artists together with experienced industry voices. Through screenings, workshops and creative exchange, we help regional talent develop their craft, share their stories and connect with opportunities beyond the Caribbean.',
  items,
}: StatsSectionProps) {
  const renderedStats = normalizeStats(items);

  return (
    <section className="section stats-section">
      <div className="container narrow-heading centered stats-intro">
        <span className="section-kicker">{kicker}</span>
        <h2>{title}</h2>
        <p>{intro}</p>
      </div>
      <div className="container stats-grid">
        {renderedStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
