import { NAV_ITEMS } from '@/lib/docs-nav'
import { DocPageClient } from './DocPageClient'

type Props = {
  params: Promise<{ slug?: string[] }>
}

export default async function DocsPage({ params }: Props) {
  await params // Next.js requires awaiting params in server components
  return <DocPageClient />
}

export function generateStaticParams() {
  return [
    { slug: [] },
    ...NAV_ITEMS.filter(i => i.slug !== '').map(i => ({ slug: i.slug.split('/') })),
  ]
}
