"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Database, RefreshCw } from "lucide-react";

interface TableInfo {
  tablename: string;
  size: string;
}

interface TableData {
  rows: any[];
  columns: { column_name: string; data_type: string }[];
  count: number;
}

export function DatabaseTables({ databaseId }: { databaseId: string }) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, [databaseId]);

  async function fetchTables() {
    try {
      const response = await fetch(`/api/databases/${databaseId}/tables`);
      const data = await response.json();
      setTables(data.tables || []);
      if (data.tables?.length > 0 && !selectedTable) {
        fetchTableData(data.tables[0].tablename);
      }
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    }
  }

  async function fetchTableData(tableName: string) {
    setLoading(true);
    setSelectedTable(tableName);
    try {
      const response = await fetch(`/api/databases/${databaseId}/tables/${tableName}`);
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error("Failed to fetch table data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (tables.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Database className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No tables yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {tables.length} {tables.length === 1 ? 'table' : 'tables'} in this database
        </p>
        <Button variant="outline" size="sm" onClick={fetchTables}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={selectedTable || tables[0]?.tablename} onValueChange={fetchTableData}>
        <TabsList variant="line">
          {tables.map((table) => (
            <TabsTrigger key={table.tablename} value={table.tablename}>
              {table.tablename}
              <span className="ml-2 text-xs text-muted-foreground">({table.size})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tables.map((table) => (
          <TabsContent key={table.tablename} value={table.tablename}>
            <Card>
              <CardHeader>
                <CardTitle>{table.tablename}</CardTitle>
                {tableData && selectedTable === table.tablename && (
                  <CardDescription>
                    Showing {tableData.count} rows (max 100)
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : tableData && selectedTable === table.tablename ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {tableData.columns.map((col) => (
                            <TableHead key={col.column_name}>{col.column_name}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.rows.map((row, idx) => (
                          <TableRow key={idx}>
                            {tableData.columns.map((col) => (
                              <TableCell key={col.column_name} className="max-w-xs truncate">
                                {String(row[col.column_name] ?? '')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
