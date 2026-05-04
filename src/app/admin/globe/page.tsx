import { requireAdmin } from "@/lib/auth-check"
import { Metadata } from "next"
import GlobeClient from "./globe-client"

export const metadata: Metadata = {
  title: "Live Globe",
}

export default async function GlobePage() {
  await requireAdmin()

  return (
    
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <GlobeClient />
        </div>
      
  )
}
