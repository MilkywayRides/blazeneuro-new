import React from "react";
import { 
  SectionCards, 
  RevenueCard, 
  CustomersCard, 
  AccountsCard, 
  GrowthCard 
} from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable, schema as DataTableSchema } from "@/components/data-table";
import { z } from "zod";

export type BlockType = 
  | "sectionCards" 
  | "revenueCard" 
  | "customersCard" 
  | "accountsCard" 
  | "growthCard" 
  | "chartArea" 
  | "dataTable";

type DataTableItem = z.infer<typeof DataTableSchema>;

export interface BlockConfig {
  id: BlockType;
  name: string;
  render: (props: { tableData: DataTableItem[] }) => React.ReactNode;
}

export const blockRegistry: Record<BlockType, BlockConfig> = {
  sectionCards: {
    id: "sectionCards",
    name: "All Stats Cards (Grid)",
    render: () => <SectionCards />,
  },
  revenueCard: {
    id: "revenueCard",
    name: "Revenue Card",
    render: () => (
      <div className="px-4 lg:px-6">
        <RevenueCard />
      </div>
    ),
  },
  customersCard: {
    id: "customersCard",
    name: "Customers Card",
    render: () => (
      <div className="px-4 lg:px-6">
        <CustomersCard />
      </div>
    ),
  },
  accountsCard: {
    id: "accountsCard",
    name: "Accounts Card",
    render: () => (
      <div className="px-4 lg:px-6">
        <AccountsCard />
      </div>
    ),
  },
  growthCard: {
    id: "growthCard",
    name: "Growth Card",
    render: () => (
      <div className="px-4 lg:px-6">
        <GrowthCard />
      </div>
    ),
  },
  chartArea: {
    id: "chartArea",
    name: "Interactive Chart",
    render: () => (
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    ),
  },
  dataTable: {
    id: "dataTable",
    name: "Data Table",
    render: ({ tableData }) => <DataTable data={tableData} />,
  },
};
