import VaultPageClient from './page.client'

// Next on Pages executes this route dynamically; no pre-generated vault UUIDs yet
export const generateStaticParams = async () => {
  // Vault data is resolved at request time; add UUIDs here if you later prerender
  return []
}

export default function VaultPage() {
  return <VaultPageClient />
}
