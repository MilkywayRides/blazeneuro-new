import { requireAdmin } from "@/lib/auth-check"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getMessages } from "./actions"
import CommunityClient from "./community-client"

export default async function CommunityPage() {
  await requireAdmin()
  const messages = await getMessages()
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <CommunityClient initialMessages={messages} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
