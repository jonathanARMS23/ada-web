import type { Metadata } from 'next'
import { NAV_ITEMS } from '@/lib/docs-nav'
import { SITE_URL } from '@/lib/site'
import { DocPageClient } from './DocPageClient'

type Props = {
  params: Promise<{ slug?: string[] }>
}

function toSlug(slug?: string[]): string {
  return (slug ?? []).join('/')
}

function docPath(slug: string): string {
  return slug === '' ? '/docs' : `/docs/${slug}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = toSlug((await params).slug)
  const item = NAV_ITEMS.find(i => i.slug === slug)
  if (!item) return {}
  const title = slug === '' ? 'Documentation' : item.title
  return {
    title,
    alternates: { canonical: docPath(slug) },
    openGraph: { title: `${title} — ADA`, url: docPath(slug), type: 'article' },
  }
}

export default async function DocsPage({ params }: Props) {
  const slug = toSlug((await params).slug)
  const item = NAV_ITEMS.find(i => i.slug === slug)
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Documentation', item: `${SITE_URL}/docs` },
      ...(item && slug !== ''
        ? [{ '@type': 'ListItem', position: 3, name: item.title, item: `${SITE_URL}${docPath(slug)}` }]
        : []),
    ],
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }}
      />
      <DocPageClient />
    </>
  )
}

export function generateStaticParams() {
  return [
    { slug: [] },
    ...NAV_ITEMS.filter(i => i.slug !== '').map(i => ({ slug: i.slug.split('/') })),
  ]
}
