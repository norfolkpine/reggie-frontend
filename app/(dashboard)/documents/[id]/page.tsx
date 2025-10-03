import DocPageClient from './page.client'

export function DocLayout() {
  return <DocPageClient />
}

// Cloudflare Pages runs this route dynamically; returning an empty array
// ensures Next.js does not attempt to statically enumerate document IDs
export const generateStaticParams = async () => {
  // Runtime data fetching resolves documents; pre-generation isn't required yet
  return []
}

export default function Page() {
  return <DocLayout />;
}
