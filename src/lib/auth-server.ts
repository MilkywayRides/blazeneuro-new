import { auth } from "./auth"
import { headers } from "next/headers"

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  return session
}

export async function requireAdmin() {
  const session = await getServerSession()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  if (session.user.role !== "admin") {
    throw new Error("Forbidden")
  }
  
  return session
}
