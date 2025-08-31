// app/components/Hero.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import HeroCarouselClient, { type SlideVM } from './HeroCarouselClient'

export const dynamic = 'force-dynamic'

export default async function Hero() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'hero-slides' as any,
    depth: 1,
    sort: '-updatedAt',
    limit: 20,
  })

  // Debug: Log the raw Payload data
  console.log('Raw Payload docs:', JSON.stringify(docs, null, 2))

  const slides: SlideVM[] = (docs ?? []).map((s: any, index: number) => {
    const img = typeof s.image === 'object' ? s.image : undefined
    const vid = typeof s.video === 'object' ? s.video : undefined
    const poster = typeof s.poster === 'object' ? s.poster : undefined

    // Debug: Log each slide's video data
    console.log(`Slide ${index} video data:`, {
      hasVideoField: !!s.video,
      videoType: typeof s.video,
      videoObject: vid,
      videoUrl: vid?.url,
      externalVideoUrl: s.videoUrl,
      mediaType: s.mediaType,
    })

    const hasVideo = Boolean((s.videoUrl as string | undefined)?.trim() || vid?.url)
    const mediaType: SlideVM['mediaType'] = hasVideo ? 'video' : 'image'

    // --- CTA link resolution ---
    // 1) Force the second slide (index 1) to go to /#deals
    // 2) Otherwise, if your CMS later has ctaLinkType: 'anchor' + anchorId, use that
    // 3) Otherwise, fall back to the plain ctaLink from CMS
    const fromCMSLink = (s.ctaLink as string | undefined)?.trim()
    const anchorLink =
      s?.ctaLinkType === 'anchor' && typeof s?.anchorId === 'string' && s.anchorId.trim()
        ? `/#${s.anchorId.trim()}`
        : undefined
    const finalCTALink = index === 1 ? '/#deals' : (anchorLink || fromCMSLink)

    const mappedSlide = {
      title: String(s.title ?? ''),
      subtitle: s.subtitle ?? undefined,
      ctaLabel: s.ctaLabel ?? undefined,
      ctaLink: finalCTALink, // <<— use resolved link
      mediaType,
      imageUrl: img?.url ?? undefined,
      imageAlt: (img?.alt as string | undefined) ?? s.title ?? 'Hero',
      videoUrl: (s.videoUrl as string | undefined)?.trim() || (vid?.url as string | undefined),
      posterUrl: poster?.url ?? undefined,
      autoplay: Boolean(s.autoplay ?? true),
      loop: Boolean(s.loop ?? true),
      muted: Boolean(s.muted ?? true),
      controls: Boolean(s.controls ?? false),
    } satisfies SlideVM

    // Debug: Log the final mapped slide
    console.log(`Mapped slide ${index}:`, mappedSlide)

    return mappedSlide
  })

  if (!slides.length) return null
  return <HeroCarouselClient slides={slides} />
}
