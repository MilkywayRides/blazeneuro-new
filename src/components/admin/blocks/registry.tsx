import React from "react";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";

export type BlockType = "sectionCards" | "chartArea" | "dataTable";

export interface BlockConfig {
  id: BlockType;
  name: string;
  render: (props: { tableData: Record<string, unknown>[] }) => React.ReactNode;
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
