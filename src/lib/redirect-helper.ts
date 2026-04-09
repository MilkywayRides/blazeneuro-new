import { headers } from "next/headers"

export async function getRedirectPath() {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || headersList.get("referer")
  
  if (pathname) {
    try {
      const url = new URL(pathname)
      return url.pathname
    } catch {
      return pathname
    }
  }
  
  return undefined
}
