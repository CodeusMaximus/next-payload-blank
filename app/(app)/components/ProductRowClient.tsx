// app/components/ProductRowClient.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Card = {
  id: string;
  title: string;
  href: string;
  price: number;
  imageUrl?: string;
  imageAlt?: string;
  badge?: string;
};

export default function ProductRowClient({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  items,
}: {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  items: Card[];
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setLeft] = useState(false);
  const [canRight, setRight] = useState(false);

  const recalc = () => {
    const el = trackRef.current;
    if (!el) return;
    setLeft(el.scrollLeft > 8);
    setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    recalc();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => recalc();
    const ro = new ResizeObserver(recalc);
    el.addEventListener('scroll', onScroll, { passive: true });
    ro.observe(el);
    return () => { el.removeEventListener('scroll', onScroll); ro.disconnect(); };
  }, []);

  const scrollBy = (amt: number) =>
    trackRef.current?.scrollBy({ left: amt, behavior: 'smooth' });

  return (
    <section className="relative">
      <div className="mb-3 flex items-end justify-between px-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
        </div>
        {ctaLabel && ctaHref && (
          <Link href={ctaHref} className="text-sm font-medium text-pink-600 hover:underline">
            {ctaLabel}
          </Link>
        )}
      </div>

      {/* fade edges */}
      <div className="pointer-events-none absolute left-0 top-10 bottom-0 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-10 bottom-0 w-8 bg-gradient-to-l from-background to-transparent" />

      {/* arrows */}
      {canLeft && (
        <button
          onClick={() => scrollBy(-320)}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 text-white p-2 backdrop-blur hover:bg-black/70"
        >‹</button>
      )}
      {canRight && (
        <button
          onClick={() => scrollBy(320)}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 text-white p-2 backdrop-blur hover:bg-black/70"
        >›</button>
      )}

      <div
        ref={trackRef}
        className="no-scrollbar overflow-x-auto scroll-smooth px-4 py-2 flex gap-4 snap-x snap-mandatory"
      >
        {items.map((p) => (
          <Link
            key={p.id}
            href={p.href}
            className="snap-start shrink-0 w-44 md:w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-md transition"
          >
            <div className="relative h-36 md:h-44 w-full overflow-hidden rounded-t-xl">
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={p.imageAlt ?? p.title}
                  fill
                  sizes="(max-width:768px) 176px, 224px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full grid place-items-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-sm">
                  No image
                </div>
              )}
              {p.badge && (
                <span className="absolute left-2 top-2 rounded-full bg-pink-600 text-white text-xs px-2 py-0.5">
                  {p.badge}
                </span>
              )}
            </div>
            <div className="p-3">
              <div className="line-clamp-2 text-sm font-medium">{p.title}</div>
              <div className="mt-1 text-base font-semibold">${p.price.toFixed(2)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
