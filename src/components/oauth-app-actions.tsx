"use client"

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Eye, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { archiveOAuthApp, unarchiveOAuthApp, deleteOAuthApp } from "@/app/admin/oauth/app-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export function OAuthAppActions({ appId, archived }: { appId: string; archived: boolean }) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function handleArchive() {
    await archiveOAuthApp(appId);
    router.refresh();
  }

  async function handleUnarchive() {
    await unarchiveOAuthApp(appId);
    router.refresh();
  }

  async function handleDelete() {
    await deleteOAuthApp(appId);
    setDeleteDialogOpen(false);
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/oauth/${appId}`} className="flex items-center cursor-pointer">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!archived ? (
            <DropdownMenuItem onClick={handleArchive} className="flex items-center cursor-pointer">
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleUnarchive} className="flex items-center cursor-pointer">
              <ArchiveRestore className="h-4 w-4 mr-2" />
              Restore
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)} 
            className="flex items-center cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete OAuth Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this OAuth app? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
