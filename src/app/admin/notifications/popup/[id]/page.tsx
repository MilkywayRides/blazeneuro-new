import { requireAdmin } from "@/lib/auth-check"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import PopupDetail from "./popup-detail"

export default async function PopupPage({ params }: { params: { id: string } }) {
  await requireAdmin()

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <PopupDetail id={params.id} />
      </SidebarInset>
    </SidebarProvider>
  )
}
