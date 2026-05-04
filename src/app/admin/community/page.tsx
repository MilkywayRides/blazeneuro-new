import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community - Admin",
};

import { requireAdmin } from "@/lib/auth-check"
import { getMessages } from "./actions"
import CommunityClient from "./community-client"

export default async function CommunityPage() {
  await requireAdmin()
  const messages = await getMessages()
  
  return (
    
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <CommunityClient initialMessages={messages} />
        </div>
      
  )
}
