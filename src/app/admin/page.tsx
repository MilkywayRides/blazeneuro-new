import { requireAdmin } from "@/lib/auth-check";
import { DashboardBuilder } from "@/components/admin/dashboard-builder";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

import data from "../dashboard/data.json"

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 pt-4">
        <DashboardBuilder initialTableData={data} />
      </div>
    </div>
  )
}
