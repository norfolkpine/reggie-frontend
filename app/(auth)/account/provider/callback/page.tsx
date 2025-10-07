'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ProviderCallbackPage() {
  const router = useRouter()
  const search = useSearchParams()

  useEffect(() => {
    const error = search.get('error')
    // If backend returned an error, send user back to sign-in, else to home
    if (error) {
      router.replace('/sign-in')
    } else {
      // Allow allauth session propagation; then go home
      router.replace('/')
    }
  }, [router, search])

  return null
}


