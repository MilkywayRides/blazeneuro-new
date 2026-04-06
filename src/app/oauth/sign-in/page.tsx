import { redirect } from "next/navigation"

export default async function OAuthSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string }>
}) {
  const params = await searchParams
  
  // Redirect to the auth subdomain login with callback
  const authUrl = new URL(`${process.env.NEXT_PUBLIC_AUTH_URL}/login`)
  
  if (params.callbackURL) {
    // Pass the callback URL so we can redirect back after auth
    authUrl.searchParams.set("redirect", params.callbackURL)
  }
  
  redirect(authUrl.toString())
}
