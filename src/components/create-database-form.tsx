"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

export function CreateDatabaseForm({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, region }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/database/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to create database:", error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Database Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="my-database"
          required
        />
        <p className="text-xs text-muted-foreground">
          Use lowercase letters, numbers, and hyphens only
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Region</Label>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
            <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
            <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
            <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={creating}>
        {creating ? <Spinner className="h-4 w-4 mr-2" /> : null}
        Create Database
      </Button>
    </form>
  );
}
