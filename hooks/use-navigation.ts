"use client"

import { usePathname, useRouter } from "next/navigation"
import { routes, RouteKey } from "@/lib/navigation"

export function useNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navigate = (route: RouteKey) => {
    router.push(routes[route].path)
  }

  const isActive = (route: RouteKey) => {
    return pathname === routes[route].path
  }

  return {
    navigate,
    isActive,
    currentPath: pathname,
  }
}