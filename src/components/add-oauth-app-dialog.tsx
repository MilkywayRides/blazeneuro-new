"use client";

import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { authorizeOAuthApp } from "@/app/admin/settings/oauth/actions";

export function AddOAuthAppDialog() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button>
            <Plus className="h-4 w-4" />
            Add App
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add OAuth App</DialogTitle>
            <DialogDescription>
              Enter the Client ID and Client Secret from the OAuth app
            </DialogDescription>
          </DialogHeader>
          <AddAppForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>
        <Button>
          <Plus className="h-4 w-4" />
          Add App
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add OAuth App</DrawerTitle>
          <DrawerDescription>
            Enter the Client ID and Client Secret from the OAuth app
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <AddAppForm setOpen={setOpen} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function AddAppForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const clientId = formData.get("clientId") as string;
    const clientSecret = formData.get("clientSecret") as string;

    const result = await authorizeOAuthApp(clientId, clientSecret);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientId">Client ID</Label>
        <Input
          id="clientId"
          name="clientId"
          placeholder="Enter client ID"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="clientSecret">Client Secret</Label>
        <Input
          id="clientSecret"
          name="clientSecret"
          type="password"
          placeholder="Enter client secret"
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Adding..." : "Add App"}
      </Button>
    </form>
  );
}
