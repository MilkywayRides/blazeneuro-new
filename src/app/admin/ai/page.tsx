import { requireAdmin } from "@/lib/auth-check";
import { redirect } from "next/navigation";
import AIChatInterface from "./chat-interface";

export default async function AdminAIPage() {
  const session = await requireAdmin();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin AI Chat</h1>
      <AIChatInterface userId={session.user.id} />
    </div>
  );
}
