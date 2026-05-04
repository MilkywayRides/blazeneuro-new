import { requireAdmin } from "@/lib/auth-check"
import PopupDetail from "./popup-detail"

export default async function PopupPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params

  return (
    
        <PopupDetail id={id} />
      
  )
}
