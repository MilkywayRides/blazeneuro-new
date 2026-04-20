"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createUserOAuthApp } from "../oauth/actions";

export function NewOAuthAppDialog() {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    await createUserOAuthApp(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />New App</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create OAuth Application</DialogTitle>
          <DialogDescription>
            Register a new OAuth application to integrate with BlazeNeuro
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Application name</Label>
            <Input id="name" name="name" placeholder="My Application" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="What does your app do?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homepageUrl">Homepage URL</Label>
            <Input id="homepageUrl" name="homepageUrl" type="url" placeholder="https://example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="callbackUrl">Authorization callback URL</Label>
            <Input id="callbackUrl" name="callbackUrl" type="url" placeholder="https://example.com/callback" required />
          </div>

          <Button type="submit" className="w-full">Create Application</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
