"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

export function ResetPasswordButton({ databaseId, currentPassword }: { databaseId: string; currentPassword: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState(currentPassword);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  function generatePassword() {
    setPassword(nanoid(32));
  }

  async function handleUpdate() {
    setUpdating(true);
    try {
      await fetch(`/api/databases/${databaseId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to update password:", error);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Key className="h-4 w-4 mr-2" />
        Reset Password
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Database Password</DialogTitle>
            <DialogDescription>
              Update the password for this database. The connection string will be updated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Button variant="outline" onClick={generatePassword}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the refresh icon to auto-generate a secure password
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updating || !password}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
