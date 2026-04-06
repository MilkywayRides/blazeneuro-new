"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { createOAuthApp } from "@/app/admin/oauth/actions";

export function OAuthAppDialog() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
          <Plus className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">New OAuth App</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>New OAuth Application</DialogTitle>
            <DialogDescription>
              Register a new OAuth application to integrate with BlazeNeuro
            </DialogDescription>
          </DialogHeader>
          <OAuthAppForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
        <Plus className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">New OAuth App</span>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>New OAuth Application</DrawerTitle>
          <DrawerDescription>
            Register a new OAuth application to integrate with BlazeNeuro
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <OAuthAppForm setOpen={setOpen} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            Cancel
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function OAuthAppForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  async function handleSubmit(formData: FormData) {
    await createOAuthApp(formData);
    setOpen(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Application name</Label>
        <Input
          id="name"
          name="name"
          placeholder="My Application"
          required
        />
        <p className="text-xs text-muted-foreground">
          Something users will recognize and trust.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="homepageUrl">Homepage URL</Label>
        <Input
          id="homepageUrl"
          name="homepageUrl"
          type="url"
          placeholder="http://localhost:3000"
          required
        />
        <p className="text-xs text-muted-foreground">
          The full URL to your application homepage.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Application description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Optional description"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          This is displayed to all users of your application.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="callbackUrl">Authorization callback URL</Label>
        <Input
          id="callbackUrl"
          name="callbackUrl"
          type="url"
          placeholder="http://localhost:3000/api/auth/callback"
          required
        />
        <p className="text-xs text-muted-foreground">
          Your application's callback URL.
        </p>
      </div>

      <Button type="submit" className="w-full">Create OAuth App</Button>
    </form>
  );
}
