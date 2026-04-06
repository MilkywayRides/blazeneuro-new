import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationButton } from "@/components/notification-button"
import { getNotifications } from "@/app/admin/notifications/actions"

export async function SiteHeader() {
  const notifications = await getNotifications();

  return (
    <SiteHeaderClient notifications={notifications} />
  )
}

export function SiteHeaderClient({ notifications }: { notifications?: any[] }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
      </div>
      <div className="ml-auto px-4">
        <NotificationButton notifications={notifications || []} />
      </div>
    </header>
  )
}
