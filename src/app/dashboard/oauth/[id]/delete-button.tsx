"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUserOAuthApp } from "../actions";
import { useTransition } from "react";

export function DeleteButton({ appId }: { appId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (confirm("Are you sure you want to delete this OAuth app?")) {
      startTransition(async () => {
        await deleteUserOAuthApp(appId);
      });
    }
  }

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
