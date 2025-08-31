import { notFound } from 'next/navigation'

type PageDoc = {
  title: string
  slug: string
  content?: string
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const normalized = slug.toLowerCase()

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/pages?where[slug][equals]=${normalized}`,
    { cache: 'no-store' }
  )

  if (!res.ok) notFound()

  const data = await res.json()
  const page = data?.docs?.[0] as PageDoc | undefined
  if (!page) notFound()

  return (
    <main className="container mx-auto max-w-3xl py-10">
      <h1 className="text-3xl font-semibold">{page.title}</h1>
      {page.content ? (
        <article
          className="prose mt-6"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <p className="mt-6 text-neutral-500">No content yet.</p>
      )}
    </main>
  )
}
