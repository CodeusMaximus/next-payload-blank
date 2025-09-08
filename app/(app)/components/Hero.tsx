// app/(app)/components/Hero.tsx
import { getPayloadHMR } from '@payloadcms/next/utilities';
import config from '@payload-config';
import HeroCarouselClient from './HeroCarouselClient';
import type { SlideVM } from './HeroCarouselClient';
import type { Media } from '@/payload-types';

export default async function Hero() {
  const payload = await getPayloadHMR({ config });
  
  try {
    const slides = await payload.find({
      collection: 'hero-slides' as any,
      sort: 'createdAt',
      limit: 10,
    });

    console.log('Server Raw Payload docs:', slides.docs);

    const processedSlides: SlideVM[] = slides.docs.map((slide: any, index: number) => {
      console.log(`Server Slide ${index} processing:`, {
        title: slide.title,
        mediaType: slide.mediaType,
        hasVideo: !!slide.video,
        hasVideoUrl: !!slide.videoUrl,
        videoUrl: slide.videoUrl,
      });

      let finalVideoUrl = '';
      let posterUrl = '';

      if (slide.mediaType === 'video') {
        // Priority 1: External video URL (if provided and not empty)
        if (slide.videoUrl && slide.videoUrl.trim()) {
          finalVideoUrl = slide.videoUrl.trim();
          console.log(`Server Using external video URL for slide ${index}:`, finalVideoUrl);
        } 
        // Priority 2: Uploaded video file - use Vercel Blob URL directly
        else if (slide.video && typeof slide.video === 'object') {
          const videoMedia = slide.video as Media;
          if (videoMedia.url) {
            // Use the Vercel Blob URL directly now that it's working
            finalVideoUrl = videoMedia.url;
            console.log(`Server Using Blob video URL for slide ${index}:`, finalVideoUrl);
            
            // Set poster if available
            if (videoMedia.thumbnailURL) {
              posterUrl = videoMedia.thumbnailURL;
            }
          }
        }

        // Handle separate poster upload
        if (slide.poster && typeof slide.poster === 'object') {
          const posterMedia = slide.poster as Media;
          if (posterMedia.url) {
            posterUrl = posterMedia.url;
          }
        }
      }

      const processedSlide: SlideVM = {
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        ctaLabel: slide.ctaLabel || '',
        ctaLink: slide.ctaLink?.trim() || '',
        mediaType: slide.mediaType as 'image' | 'video',
        videoUrl: finalVideoUrl || undefined,
        posterUrl: posterUrl || undefined,
        imageUrl: slide.mediaType === 'image' && slide.image && typeof slide.image === 'object' 
          ? ((slide.image as any).url || undefined)
          : undefined,
        imageAlt: slide.mediaType === 'image' && slide.image && typeof slide.image === 'object' 
          ? ((slide.image as any).alt || slide.title || 'Hero image')
          : (slide.title || 'Hero image'),
        autoplay: slide.autoplay ?? true,
        loop: slide.loop ?? true,
        muted: slide.muted ?? true,
        controls: slide.controls ?? false,
      };

      console.log(`Server Mapped slide ${index}:`, processedSlide);
      return processedSlide;
    });

    // Filter out slides without proper media
    const validSlides = processedSlides.filter(slide => {
      if (slide.mediaType === 'video') {
        return !!slide.videoUrl;
      } else {
        return !!slide.imageUrl;
      }
    });

    console.log(`Server Final slides count: ${validSlides.length}/${processedSlides.length}`);

    if (validSlides.length === 0) {
      console.warn('No valid slides found');
      return <div>No hero slides available</div>;
    }

    return <HeroCarouselClient slides={validSlides} />;

  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return <div>Error loading hero slides</div>;
  }
}