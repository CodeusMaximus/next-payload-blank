// app/components/ProductRow.tsx (SERVER)
import { getPayload } from 'payload';
import config from '@payload-config';

import ProductRowClient from './ProductRowClient';

export default async function ProductRow({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  category,      // e.g. 'ice-cream'
  dealOfWeek,    // boolean
  limit = 16,
}: {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  category?: string;
  dealOfWeek?: boolean;
  limit?: number;
}) {
  const payload = await getPayload({ config });

  const where: any = {};
  if (category) where.category = { equals: category };
  if (dealOfWeek) where.dealOfWeek = { equals: true };

  const res = await payload.find({
    collection: 'products' as any,
    where,
    depth: 1,
    limit,
    sort: '-updatedAt',
  });

  const items = (res.docs ?? []).map((p: any) => {
    const first = Array.isArray(p.images)
      ? p.images.find((m: any) => typeof m === 'object' && m?.url)
      : undefined;

    return {
      id: String(p.id),
      title: String(p.name ?? ''),
      href: `/product/${p.slug ?? p.id}`,
      price: Number(p.price ?? 0),
      imageUrl: first?.url as string | undefined,
      imageAlt: (first?.alt as string | undefined) ?? p.name ?? 'Product',
      // badge: p.dealOfWeek ? 'Deal' : undefined, // optional
    };
  });

  if (!items.length) return null;

  return (
    <ProductRowClient
      title={title}
      subtitle={subtitle}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
      items={items}
    />
  );
}
