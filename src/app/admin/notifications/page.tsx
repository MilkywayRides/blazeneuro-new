import { requireAdmin } from "@/lib/auth-check";
import NotificationsClient from "./notifications-client";

export default async function AdminNotifications() {
  await requireAdmin();

  return (
    
        <NotificationsClient />
      
  );
}
