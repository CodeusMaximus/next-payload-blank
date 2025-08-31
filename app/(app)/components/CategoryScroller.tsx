 'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Milk, CupSoda, Snowflake, Ham, Apple, Beef, Cookie, Wine, 
  Salad, Fish, Baby, Candy, Pizza, Utensils, Wheat,
  Sparkles, User, Coffee, Flame, Refrigerator, Carrot,
  Croissant, Flower2, Cat, ShoppingCart, Cake, Heart,
  Banana, Sandwich, Zap, Package, CircleDot, Soup
} from 'lucide-react';

type IconKey =
  | 'milk' | 'drinks' | 'frozen' | 'deli' | 'produce' | 'meat' | 'bakery'
  | 'alcohol' | 'salads' | 'soups' | 'seafood' | 'pizza' | 'baby' | 'candy'
  | 'bread' | 'household' | 'personal' | 'coffee' | 'hot-food' | 'cold-food'
  | 'vegetables' | 'dairy' | 'breakfast' | 'snacks' | 'flowers' | 'pet'
  | 'pharmacy' | 'desserts' | 'health' | 'fruits' | 'cheese' | 'sandwiches'
  | 'energy' | 'organic';

type Category = {
  label: string;
  href: string;
  iconKey?: IconKey;
};

const iconMap: Record<IconKey, React.ComponentType<{ className?: string }>> = {
  // Original categories
  milk: Milk, 
  drinks: CupSoda, 
  frozen: Snowflake, 
  deli: Ham, 
  produce: Apple,
  meat: Beef, 
  bakery: Cookie, 
  alcohol: Wine, 
  salads: Salad, 
  soups: Soup,
  seafood: Fish, 
  pizza: Pizza, 
  baby: Baby, 
  candy: Candy,
  
  // New comprehensive categories
  bread: Wheat,
  household: Sparkles,
  personal: User,
  coffee: Coffee,
  'hot-food': Flame,
  'cold-food': Refrigerator,
  vegetables: Carrot,
  dairy: CircleDot,
  breakfast: Croissant,
  snacks: Package,
  flowers: Flower2,
  pet: Cat,
  pharmacy: Heart,
  desserts: Cake,
  health: Zap,
  fruits: Banana,
  cheese: CircleDot,
  sandwiches: Sandwich,
  energy: Zap,
  organic: Apple,
};

// Modern gradient color schemes with better aesthetics
const colorMap: Record<IconKey, string> = {
  // Original categories
  milk: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
  drinks: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600',
  frozen: 'bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-500',
  deli: 'bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600',
  produce: 'bg-gradient-to-br from-green-400 via-green-500 to-green-600',
  meat: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700',
  bakery: 'bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500',
  alcohol: 'bg-gradient-to-br from-violet-500 via-purple-600 to-purple-700',
  salads: 'bg-gradient-to-br from-lime-400 via-green-400 to-green-500',
  soups: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500',
  seafood: 'bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600',
  pizza: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500',
  baby: 'bg-gradient-to-br from-pink-300 via-pink-400 to-pink-500',
  candy: 'bg-gradient-to-br from-fuchsia-400 via-pink-500 to-rose-500',
  
  // New comprehensive categories with beautiful gradients
  bread: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400',
  household: 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600',
  personal: 'bg-gradient-to-br from-indigo-400 via-blue-500 to-purple-500',
  coffee: 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800',
  'hot-food': 'bg-gradient-to-br from-red-400 via-orange-500 to-yellow-500',
  'cold-food': 'bg-gradient-to-br from-blue-300 via-cyan-400 to-teal-400',
  vegetables: 'bg-gradient-to-br from-green-300 via-emerald-400 to-green-500',
  dairy: 'bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400',
  breakfast: 'bg-gradient-to-br from-orange-300 via-amber-400 to-yellow-400',
  snacks: 'bg-gradient-to-br from-purple-300 via-violet-400 to-purple-500',
  flowers: 'bg-gradient-to-br from-pink-400 via-rose-400 to-red-400',
  pet: 'bg-gradient-to-br from-brown-400 via-amber-500 to-orange-500',
  pharmacy: 'bg-gradient-to-br from-red-300 via-pink-400 to-rose-400',
  desserts: 'bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500',
  health: 'bg-gradient-to-br from-emerald-400 via-green-500 to-lime-500',
  fruits: 'bg-gradient-to-br from-yellow-300 via-orange-300 to-red-400',
  cheese: 'bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400',
  sandwiches: 'bg-gradient-to-br from-amber-400 via-orange-400 to-red-400',
  energy: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500',
  organic: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500',
};

export default function CategoryScroller({ items }: { items: Category[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setLeft] = useState(false);
  const [canScrollRight, setRight] = useState(false);

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

  // drag-to-scroll
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let isDown = false, startX = 0, startLeft = 0;
    const down = (e: MouseEvent) => { isDown = true; startX = e.pageX; startLeft = el.scrollLeft; el.classList.add('cursor-grabbing'); };
    const move = (e: MouseEvent) => { if (!isDown) return; el.scrollLeft = startLeft - (e.pageX - startX); };
    const up = () => { isDown = false; el.classList.remove('cursor-grabbing'); };
    el.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { el.removeEventListener('mousedown', down); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, []);

  // wheel→horizontal
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta !== 0) { el.scrollLeft += delta; e.preventDefault(); }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const scrollByAmount = (amt: number) => trackRef.current?.scrollBy({ left: amt, behavior: 'smooth' });

  return (
    <section className="relative">
      {/* fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent z-10" />

      {/* arrows */}
      {canScrollLeft && (
        <button
          aria-label="Scroll left"
          onClick={() => scrollByAmount(-320)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 text-white p-2 backdrop-blur hover:bg-black/70 transition-all duration-200"
        >‹</button>
      )}
      {canScrollRight && (
        <button
          aria-label="Scroll right"
          onClick={() => scrollByAmount(320)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 text-white p-2 backdrop-blur hover:bg-black/70 transition-all duration-200"
        >›</button>
      )}

      {/* track */}
      <nav
        aria-label="Shop categories"
        ref={trackRef}
        className="no-scrollbar relative flex gap-4 overflow-x-auto scroll-smooth px-4 py-3 select-none cursor-grab
                   snap-x snap-mandatory scroll-px-4"
      >
        {items.map((cat, i) => {
          const Icon = cat.iconKey ? iconMap[cat.iconKey] : Utensils;
          const color = cat.iconKey ? colorMap[cat.iconKey] : 'bg-gradient-to-br from-neutral-400 to-neutral-500';
          return (
            <Link key={i} href={cat.href} className="shrink-0 snap-start focus:outline-none group">
              <div
                className="w-28 md:w-32 rounded-2xl 
                           bg-white dark:bg-neutral-900 
                           hover:shadow-xl hover:scale-105 
                           transition-all duration-300 ease-out
                           flex flex-col items-center justify-center px-4 py-4
                           relative overflow-hidden"
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
                
                {/* Icon container with gradient and glow effect */}
                <div className={`relative mb-3 grid h-14 w-14 place-items-center rounded-2xl text-white ${color} 
                                 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out
                                 shadow-lg group-hover:shadow-xl`}>
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Icon className="h-7 w-7 relative z-10 drop-shadow-sm" />
                </div>
                
                <span className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 
                                 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {cat.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </section>
  );
}