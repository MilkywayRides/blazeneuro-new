import React from "react";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable, schema as DataTableSchema } from "@/components/data-table";
import { z } from "zod";

export type BlockType = "sectionCards" | "chartArea" | "dataTable";

type DataTableItem = z.infer<typeof DataTableSchema>;

export interface BlockConfig {
  id: BlockType;
  name: string;
  render: (props: { tableData: DataTableItem[] }) => React.ReactNode;
}

export const blockRegistry: Record<BlockType, BlockConfig> = {
  sectionCards: {
    id: "sectionCards",
    name: "Stats Cards",
    render: () => <SectionCards />,
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
