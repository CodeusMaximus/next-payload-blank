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

export default function HeroCarouselClient({ slides }: { slides: SlideVM[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [videoLoading, setVideoLoading] = useState<boolean[]>(new Array(slides.length).fill(false));
  const [videosPreloaded, setVideosPreloaded] = useState<boolean[]>(new Array(slides.length).fill(false));
  const [isMobile, setIsMobile] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             window.innerWidth < 768;
    };
    setIsMobile(checkMobile());
  }, []);
  
  const setVideoRef = (idx: number) => (el: HTMLVideoElement | null) => {
    videoRefs.current[idx] = el;
  };
  
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    slideChanged: (s) => {
      setCurrentSlide(s.track.details.rel);
    },
    created: () => {
      setCurrentSlide(0);
    }
  });

  // Track user interaction for mobile autoplay
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
    };

    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  // Preload videos aggressively on component mount (desktop only)
  useEffect(() => {
    if (isMobile) return; // Skip preloading on mobile

    const preloadVideos = async () => {
      slides.forEach((slide, idx) => {
        if (slide.mediaType === 'video' && slide.videoUrl && idx < 3) {
          // Create invisible video element to preload
          const video = document.createElement('video');
          video.src = slide.videoUrl;
          video.preload = 'auto';
          video.muted = true;
          video.playsInline = true;
          
          video.addEventListener('loadeddata', () => {
            setVideosPreloaded(prev => {
              const newState = [...prev];
              newState[idx] = true;
              return newState;
            });
          });
          
          video.load(); // Start loading immediately
        }
      });
    };

    preloadVideos();
  }, [slides, isMobile]);

  // Handle video playback based on current slide
  useEffect(() => {
    if (!loaded) return;

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      
      const slide = slides[index];
      
      if (index === currentSlide) {
        // Play current slide video
        if (slide?.autoplay) {
          // On mobile, only play after user interaction and ensure muted
          if (isMobile && !userInteracted) {
            console.log(`Mobile: waiting for user interaction before playing video ${index}`);
            return;
          }
          
          // Ensure video is muted for autoplay to work
          video.muted = true;
          
          // Check if video is ready to play
          const playWhenReady = () => {
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA or better (lower threshold for mobile)
              video.currentTime = 0;
              video.play().catch((error) => {
                console.log(`Autoplay failed for slide ${index}:`, error);
                // Fallback: show poster image
                if (slide.posterUrl) {
                  console.log(`Falling back to poster image for slide ${index}`);
                }
              });
            } else if (!isMobile) {
              // Only retry on desktop
              setTimeout(playWhenReady, 100);
            }
          };
          
          playWhenReady();
        }
      } else {
        // Pause and reset other videos
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentSlide, loaded, slides, isMobile, userInteracted]);

  // Auto-advance slides with longer duration for video slides
  useEffect(() => {
    if (!slider.current) return;
    
    const currentSlideData = slides[currentSlide];
    const duration = currentSlideData?.mediaType === 'video' ? 6000 : 4000; // Longer for videos
    
    const interval = setInterval(() => {
      slider.current?.next();
    }, duration);
    
    setLoaded(true);
    return () => clearInterval(interval);
  }, [slider, currentSlide, slides]);

  const handleVideoLoadStart = (idx: number) => {
    setVideoLoading(prev => {
      const newState = [...prev];
      newState[idx] = true;
      return newState;
    });
  };

  const handleVideoCanPlay = (idx: number) => {
    setVideoLoading(prev => {
      const newState = [...prev];
      newState[idx] = false;
      return newState;
    });
  };

  if (!slides.length) return null;

  return (
    <div
      ref={sliderRef}
      className={`keen-slider h-[100dvh] w-screen relative overflow-hidden transition-opacity duration-300 ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {slides.map((slide, idx) => (
        <div key={idx} className="keen-slider__slide relative">
          {/* Background layer: image OR video */}
          <div className="absolute inset-0 z-0">
            {slide.mediaType === 'video' && slide.videoUrl ? (
              <>
                <video
                  ref={setVideoRef(idx)}
                  className="h-full w-full object-cover"
                  src={slide.videoUrl}
                  poster={slide.posterUrl}
                  autoPlay={false} // Always false - we control manually
                  loop={slide.loop}
                  muted={true} // Always muted for autoplay to work
                  playsInline={true} // Critical for iOS
                  controls={false} // Hide controls on mobile for cleaner look
                  preload={isMobile ? "none" : (idx < 3 ? "auto" : "metadata")} // No preload on mobile
                  onLoadStart={() => handleVideoLoadStart(idx)}
                  onCanPlay={() => handleVideoCanPlay(idx)}
                  onLoadedData={() => console.log(`Video ${idx} loaded`)}
                  onError={(e) => console.log(`Video ${idx} error:`, e)}
                  webkit-playsinline="true" // Legacy iOS support
                />
                
                {/* Loading overlay for videos */}
                {videoLoading[idx] && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-5">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </>
            ) : (
              slide.imageUrl && (
                <Image
                  src={slide.imageUrl}
                  alt={slide.imageAlt || slide.title || 'Hero'}
                  fill
                  priority={idx === 0} // Priority for first image
                  quality={90}
                  sizes="100vw"
                  className="object-cover"
                />
              )
            )}
            
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Foreground content */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
            {!!slide.title && (
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4 animate-fade-in">
                {slide.title}
              </h1>
            )}
            {!!slide.subtitle && (
              <p className="text-lg md:text-xl text-white drop-shadow mb-6 animate-fade-in animation-delay-200">
                {slide.subtitle}
              </p>
            )}
            {slide.ctaLabel && slide.ctaLink && (
              <Link
                href={slide.ctaLink}
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-full text-sm md:text-base transition-all duration-300 shadow-lg hover:scale-105 animate-fade-in animation-delay-400"
              >
                <span>{slide.ctaLabel}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {/* Slide indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex space-x-2">
              {slides.map((_, slideIdx) => (
                <button
                  key={slideIdx}
                  onClick={() => slider.current?.moveToIdx(slideIdx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    slideIdx === currentSlide
                      ? 'bg-white scale-110'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${slideIdx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}