"use client"

import { LoginForm } from "@/components/login-form"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium text-2xl">
          BlazeNeuro
        </a>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  )
}
