import { requireAdmin } from "@/lib/auth-check";
import { DashboardBuilder } from "@/components/admin/dashboard-builder";
import { getDashboardLayout } from "@/app/admin/dashboard-actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

import data from "../dashboard/data.json"

export default async function AdminPage() {
  await requireAdmin();
  const initialConfig = await getDashboardLayout();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 pt-4">
        <DashboardBuilder initialTableData={data} initialConfig={initialConfig} />
      </div>
    </div>
  )
}
