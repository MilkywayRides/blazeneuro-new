import { requireAuth } from "@/lib/auth-check";
import { DashboardLayoutClient } from "./layout-client";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth();

  const userData = {
    name: session.user.name || "User",
    email: session.user.email || "",
    avatar: session.user.image || "/avatars/default.jpg",
  };

  return (
    <DashboardLayoutClient 
      userData={userData}
      userId={session.user.id}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      {children}
    </DashboardLayoutClient>
  )
}
