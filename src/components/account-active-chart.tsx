"use client";

import { useState, useEffect } from "react";
import { EvilAreaChart } from "@/components/evilcharts/charts/area-chart";
import { type ChartConfig } from "@/components/evilcharts/ui/chart";

interface AccountActiveChartProps {
  data: any[];
  chartConfig: ChartConfig;
}

export function AccountActiveChart({ data, chartConfig }: AccountActiveChartProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a network loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <EvilAreaChart
      data={isLoading ? [] : data}
      chartConfig={chartConfig}
      xDataKey="month"
      areaVariant="gradient"
      strokeVariant="dashed"
      curveType="monotone"
      className="w-full h-full"
      isClickable={true}
      isLoading={isLoading}
    />
  );
}
