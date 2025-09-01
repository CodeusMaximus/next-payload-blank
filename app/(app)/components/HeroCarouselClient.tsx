'use client';

import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

export type SlideVM = {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
  mediaType: 'image' | 'video';
  imageUrl?: string;
  imageAlt?: string;
  videoUrl?: string;
  posterUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
};

function playWhenReady(v: HTMLVideoElement) {
  if (v.readyState >= 3 /* HAVE_FUTURE_DATA */) {
    v.play().catch(() => {});
  } else {
    const onCanPlay = () => {
      v.removeEventListener('canplay', onCanPlay);
      v.play().catch(() => {});
    };
    v.addEventListener('canplay', onCanPlay, { once: true });
  }
}

export default function HeroCarouselClient({ slides }: { slides: SlideVM[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    console.log('Slides data received:', slides);
    slides.forEach((slide, idx) => {
      console.log(`Slide ${idx}:`, {
        title: slide.title,
        mediaType: slide.mediaType,
        videoUrl: slide.videoUrl,
        posterUrl: slide.posterUrl,
        autoplay: slide.autoplay,
        muted: slide.muted,
        loop: slide.loop,
      });
    });
  }, [slides]);

  const setVideoRef = (idx: number) => (el: HTMLVideoElement | null) => {
    videoRefs.current[idx] = el;
  };

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    renderMode: 'performance',
    slideChanged: (s) => {
      setCurrentSlide(s.track.details.rel);
    },
    created: () => {
      setCurrentSlide(0);
      // start first video if present
      const v0 = videoRefs.current[0];
      if (v0) {
        if (!v0.muted) v0.muted = true; // ensure autoplay OK on mobile
        playWhenReady(v0);
      }
      setLoaded(true); // trigger fade-in after slider is ready
    },
  });

  // Handle video playback based on current slide
  useEffect(() => {
    if (!loaded) return;

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentSlide) {
        // play active slide if configured
        const slide = slides[index];
        if (slide?.mediaType === 'video' && slide.autoplay) {
          if (!video.muted) video.muted = true;
          playWhenReady(video);
        }
      } else {
        // pause others, but keep their buffer (no load/seek resets)
        if (!video.paused) video.pause();
      }
    });

    // pre-warm the NEXT slide's video so it starts instantly
    const nextIdx = (currentSlide + 1) % slides.length;
    const next = videoRefs.current[nextIdx];
    if (next) next.preload = 'auto';
  }, [currentSlide, loaded, slides]);

  // Auto-advance slides
  useEffect(() => {
    if (!slider.current) return;
    const interval = setInterval(() => {
      slider.current?.next();
    }, 4000);
    return () => clearInterval(interval);
  }, [slider]);

  if (!slides.length) return null;

  return (
    <div
      ref={sliderRef}
      className={`keen-slider h-[100dvh] w-screen relative overflow-hidden transition-opacity duration-500 ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {slides.map((slide, idx) => (
        <div key={idx} className="keen-slider__slide relative">
          {/* Background layer: image OR video */}
          <div className="absolute inset-0 z-0">
            {slide.mediaType === 'video' && slide.videoUrl ? (
              <video
                ref={setVideoRef(idx)}
                className="h-full w-full object-cover"
                src={slide.videoUrl}
                poster={slide.posterUrl}
                // controlled in effects
                autoPlay={false}
                loop={!!slide.loop}
                muted={slide.muted ?? true}
                playsInline
                controls={!!slide.controls}
                preload="metadata"
                onLoadedData={() => console.log(`Video ${idx} loaded`)}
                onCanPlay={() => console.log(`Video ${idx} can play`)}
              />
            ) : (
              slide.imageUrl && (
                <Image
                  src={slide.imageUrl}
                  alt={slide.imageAlt || slide.title || 'Hero'}
                  fill
                  priority={idx === 0}
                  quality={90}
                  className="object-cover"
                />
              )
            )}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Foreground content */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
            {!!slide.title && (
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
                {slide.title}
              </h1>
            )}
            {!!slide.subtitle && (
              <p className="text-lg md:text-xl text-white drop-shadow mb-6">{slide.subtitle}</p>
            )}
            {slide.ctaLabel && slide.ctaLink && (
              <Link
                href={slide.ctaLink}
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-full text-sm md:text-base transition-all duration-300 shadow-lg hover:scale-105"
              >
                <span>{slide.ctaLabel}</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
