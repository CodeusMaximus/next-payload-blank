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
  const [mobileVideosInitialized, setMobileVideosInitialized] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Debug logging for component state
  useEffect(() => {
    console.log('Client: Slides received:', slides.length);
    slides.forEach((slide, idx) => {
      console.log(`Client: Slide ${idx}:`, {
        title: slide.title,
        mediaType: slide.mediaType,
        hasVideoUrl: !!slide.videoUrl,
        videoUrl: slide.videoUrl
      });
    });
  }, [slides]);

  // Clear stuck loading states after timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      setVideoLoading(prev => {
        const hasStuckLoading = prev.some(loading => loading);
        if (hasStuckLoading) {
          console.log('Clearing potentially stuck loading states');
          return new Array(slides.length).fill(false);
        }
        return prev;
      });
    }, 15000); // 15 second timeout
    
    return () => clearTimeout(timeout);
  }, [slides.length]);

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
      setLoaded(true);
    }
  });

  // Initialize mobile video loading immediately on component mount
  useEffect(() => {
    if (!isMobile) return;

    const initializeMobileVideos = () => {
      // Load the first video immediately when component mounts
      const firstVideoSlide = slides.findIndex(slide => slide.mediaType === 'video');
      if (firstVideoSlide !== -1) {
        setTimeout(() => {
          const firstVideo = videoRefs.current[firstVideoSlide];
          if (firstVideo && firstVideo.readyState === 0) {
            console.log('Mobile: Loading first video immediately');
            firstVideo.load();
          }
        }, 100); // Small delay to ensure video element is ready
      }
      setMobileVideosInitialized(true);
    };

    if (loaded) {
      initializeMobileVideos();
    }
  }, [isMobile, loaded, slides]);

  // Track user interaction for mobile autoplay
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteracted) {
        console.log('Mobile: User interaction detected');
        setUserInteracted(true);
        
        // Load current video if it's a video slide
        if (isMobile && slides[currentSlide]?.mediaType === 'video') {
          const currentVideo = videoRefs.current[currentSlide];
          if (currentVideo && currentVideo.readyState < 2) {
            currentVideo.load();
          }
        }
      }
    };

    if (isMobile) {
      const events = ['touchstart', 'click', 'scroll'];
      events.forEach(event => {
        document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleUserInteraction);
        });
      };
    }
  }, [isMobile, currentSlide, slides, userInteracted]);

  // Enhanced preload videos with better error handling
  useEffect(() => {
    if (isMobile) return; // Skip preloading on mobile

    const preloadVideos = () => {
      slides.forEach((slide, idx) => {
        if (slide.mediaType === 'video' && slide.videoUrl) {
          console.log(`Desktop: Starting preload for video ${idx}:`, slide.videoUrl);
          
          // Create invisible video element to preload
          const video = document.createElement('video');
          video.src = slide.videoUrl;
          video.preload = 'auto';
          video.muted = true;
          video.playsInline = true;
          video.crossOrigin = 'anonymous';
          
          video.addEventListener('loadstart', () => {
            console.log(`Desktop preload started for video ${idx}`);
          });
          
          video.addEventListener('loadeddata', () => {
            console.log(`Desktop preload completed for video ${idx}`);
            setVideosPreloaded(prev => {
              const newState = [...prev];
              newState[idx] = true;
              return newState;
            });
          });

          video.addEventListener('error', (e) => {
            const videoElement = e.target as HTMLVideoElement;
            console.error(`Desktop preload error for video ${idx}:`, e);
            console.error(`Failed video URL:`, slide.videoUrl);
            console.error(`Video error details:`, {
              error: videoElement?.error,
              networkState: videoElement?.networkState,
              readyState: videoElement?.readyState,
              src: videoElement?.src
            });
            
            // Try to get more error info
            if (videoElement?.error) {
              console.error(`Video error code: ${videoElement.error.code}`);
              console.error(`Video error message: ${videoElement.error.message}`);
            }
          });
          
          video.addEventListener('abort', () => {
            console.warn(`Desktop preload aborted for video ${idx}`);
          });
          
          video.addEventListener('stalled', () => {
            console.warn(`Desktop preload stalled for video ${idx}`);
          });
          
          setTimeout(() => {
            try {
              video.load();
            } catch (error) {
              console.error(`Error loading video ${idx}:`, error);
            }
          }, idx * 200); // Stagger loads more
        } else {
          console.log(`Desktop: Skipping preload for slide ${idx} - not a video or no URL`);
        }
      });
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        preloadVideos();
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [slides, isMobile]);

  // Production-specific video loading for desktop
  useEffect(() => {
    if (isMobile || !loaded) return;

    const ensureVideoLoaded = (slideIndex: number) => {
      const slide = slides[slideIndex];
      if (slide?.mediaType === 'video' && slide.videoUrl) {
        const video = videoRefs.current[slideIndex];
        if (video && video.readyState < 2) {
          console.log(`Production: Force loading video ${slideIndex}`);
          try {
            video.load();
          } catch (error) {
            console.error(`Error force loading video ${slideIndex}:`, error);
          }
        }
      }
    };

    ensureVideoLoaded(currentSlide);
    
    const nextSlide = (currentSlide + 1) % slides.length;
    setTimeout(() => ensureVideoLoaded(nextSlide), 500);

  }, [currentSlide, loaded, isMobile, slides]);

  // Enhanced mobile video loading with current slide focus
  useEffect(() => {
    if (!isMobile || !loaded || !mobileVideosInitialized) return;

    const loadVideoForSlide = (slideIndex: number) => {
      const slide = slides[slideIndex];
      if (slide?.mediaType === 'video' && slide.videoUrl) {
        const video = videoRefs.current[slideIndex];
        if (video && video.readyState < 2) {
          console.log(`Mobile: Loading video for slide ${slideIndex}`);
          try {
            video.load();
          } catch (error) {
            console.error(`Mobile: Error loading video ${slideIndex}:`, error);
          }
        }
      }
    };

    loadVideoForSlide(currentSlide);
    
    const nextSlide = (currentSlide + 1) % slides.length;
    setTimeout(() => loadVideoForSlide(nextSlide), 1000);

  }, [currentSlide, isMobile, loaded, mobileVideosInitialized, slides]);

  // Handle video playback based on current slide
  useEffect(() => {
    if (!loaded) return;

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      
      const slide = slides[index];
      
      if (index === currentSlide) {
        if (slide?.autoplay && slide.mediaType === 'video') {
          if (isMobile && !userInteracted) {
            console.log(`Mobile: waiting for user interaction before playing video ${index}`);
            return;
          }
          
          video.muted = true;
          
          const playWhenReady = () => {
            if (video.readyState >= 2) {
              video.currentTime = 0;
              video.play().catch((error) => {
                console.log(`Autoplay failed for slide ${index}:`, error);
                if (slide.posterUrl) {
                  console.log(`Falling back to poster image for slide ${index}`);
                }
              });
            } else if (!isMobile) {
              setTimeout(playWhenReady, 100);
            }
          };
          
          playWhenReady();
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentSlide, loaded, slides, isMobile, userInteracted]);

  // Auto-advance slides with adjusted timing for mobile
  useEffect(() => {
    if (!slider.current) return;
    
    const currentSlideData = slides[currentSlide];
    let duration = 4000;
    if (currentSlideData?.mediaType === 'video') {
      duration = isMobile ? 8000 : 6000;
    }
    
    const interval = setInterval(() => {
      slider.current?.next();
    }, duration);
    
    return () => clearInterval(interval);
  }, [slider, currentSlide, slides, isMobile]);

  // Improved video event handlers
  const handleVideoLoadStart = (idx: number) => {
    console.log(`Video ${idx} load start`);
    setVideoLoading(prev => {
      const newState = [...prev];
      newState[idx] = true;
      return newState;
    });
  };

  const handleVideoCanPlay = (idx: number) => {
    console.log(`Video ${idx} can play`);
    setVideoLoading(prev => {
      const newState = [...prev];
      newState[idx] = false;
      return newState;
    });
  };

  const handleVideoLoadedData = (idx: number) => {
    console.log(`Video ${idx} loaded data, readyState:`, videoRefs.current[idx]?.readyState);
    setVideoLoading(prev => {
      const newState = [...prev];
      newState[idx] = false;
      return newState;
    });
  };

  const handleVideoLoadedMetadata = (idx: number) => {
    console.log(`Video ${idx} metadata loaded`);
    setVideoLoading(prev => {
      const newState = [...prev];
      newState[idx] = false;
      return newState;
    });

    if (isMobile && idx === currentSlide) {
      const video = videoRefs.current[idx];
      if (video && video.readyState < 2) {
        setTimeout(() => {
          if (video.readyState < 2) {
            video.load();
          }
        }, 100);
      }
    }
  };

  const handleVideoError = (idx: number, e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = e.currentTarget;
    console.error(`Video ${idx} error:`, {
      error: target.error,
      networkState: target.networkState,
      readyState: target.readyState,
      src: target.src,
      currentTime: target.currentTime
    });
    
    if (target.error) {
      console.error(`Video ${idx} error details:`, {
        code: target.error.code,
        message: target.error.message
      });
    }
    
    setVideoLoading(prev => {
      const newState = [...prev];
      newState[idx] = false;
      return newState;
    });
  };

  const handleVideoWaiting = (idx: number) => {
    console.log(`Video ${idx} waiting`);
    const video = videoRefs.current[idx];
    if (video && video.readyState < 2) {
      setVideoLoading(prev => {
        const newState = [...prev];
        newState[idx] = true;
        return newState;
      });
    }
  };

  const handleVideoPlaying = (idx: number) => {
    console.log(`Video ${idx} playing`);
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
                  autoPlay={false}
                  loop={slide.loop}
                  muted={true}
                  playsInline={true}
                  controls={false}
                  preload={isMobile ? "metadata" : "auto"}
                  crossOrigin="anonymous"
                  onLoadStart={() => handleVideoLoadStart(idx)}
                  onCanPlay={() => handleVideoCanPlay(idx)}
                  onLoadedData={() => handleVideoLoadedData(idx)}
                  onLoadedMetadata={() => handleVideoLoadedMetadata(idx)}
                  onError={(e) => handleVideoError(idx, e)}
                  onWaiting={() => handleVideoWaiting(idx)}
                  onPlaying={() => handleVideoPlaying(idx)}
                  webkit-playsinline="true"
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
                  priority={idx === 0}
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