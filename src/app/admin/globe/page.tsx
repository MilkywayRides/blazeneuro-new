import { requireAdmin } from "@/lib/auth-check"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Metadata } from "next"
import GlobeClient from "./globe-client"

export const metadata: Metadata = {
  title: "Live Globe",
}

export default async function GlobePage() {
  await requireAdmin()

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
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <GlobeClient />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
