"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export function StorageChart({ databaseId, initialStorage }: { databaseId: string; initialStorage: string }) {
  const [storage, setStorage] = useState(parseFloat(initialStorage) || 0);
  const maxStorage = 1024; // 1GB limit for example

  useEffect(() => {
    async function fetchStorage() {
      try {
        const response = await fetch(`/api/databases/${databaseId}/storage`);
        const data = await response.json();
        setStorage(parseFloat(data.storageUsed) || 0);
      } catch (error) {
        console.error("Failed to fetch storage:", error);
      }
    }

    fetchStorage();
    const interval = setInterval(fetchStorage, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [databaseId]);

  const percentage = (storage / maxStorage) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Used</span>
            <span className="font-medium">{storage.toFixed(2)} MB / {maxStorage} MB</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {percentage.toFixed(1)}% used
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
