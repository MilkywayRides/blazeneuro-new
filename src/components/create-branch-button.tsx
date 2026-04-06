"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GitBranch } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateBranchButton({ databaseId }: { databaseId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [copyData, setCopyData] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    setCreating(true);
    try {
      await fetch(`/api/databases/${databaseId}/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, copyData }),
      });
      setOpen(false);
      setName("");
      setCopyData(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create branch:", error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <GitBranch className="h-4 w-4 mr-2" />
        Create Branch
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Branch</DialogTitle>
            <DialogDescription>
              Create a new branch for development or testing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input
                id="branch-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="dev"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="copy-data"
                checked={copyData}
                onCheckedChange={(checked) => setCopyData(checked as boolean)}
              />
              <Label htmlFor="copy-data" className="text-sm font-normal cursor-pointer">
                Copy data from main database
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !name}>
              {creating ? "Creating..." : "Create Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
