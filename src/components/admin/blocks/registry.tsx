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
  className?: string;
  render: (props: { tableData: DataTableItem[] }) => React.ReactNode;
}

export const blockRegistry: Record<BlockType, BlockConfig> = {
  sectionCards: {
    id: "sectionCards",
    name: "All Stats Cards (Grid)",
    className: "col-span-full",
    render: () => <SectionCards />,
  },
  revenueCard: {
    id: "revenueCard",
    name: "Revenue Card",
    className: "col-span-1",
    render: () => <RevenueCard />,
  },
  customersCard: {
    id: "customersCard",
    name: "Customers Card",
    className: "col-span-1",
    render: () => <CustomersCard />,
  },
  accountsCard: {
    id: "accountsCard",
    name: "Accounts Card",
    className: "col-span-1",
    render: () => <AccountsCard />,
  },
  growthCard: {
    id: "growthCard",
    name: "Growth Card",
    className: "col-span-1",
    render: () => <GrowthCard />,
  },
  chartArea: {
    id: "chartArea",
    name: "Interactive Chart",
    className: "col-span-full",
    render: () => <ChartAreaInteractive />,
  },
  dataTable: {
    id: "dataTable",
    name: "Data Table",
    className: "col-span-full",
    render: ({ tableData }) => <DataTable data={tableData} />,
  },
};
