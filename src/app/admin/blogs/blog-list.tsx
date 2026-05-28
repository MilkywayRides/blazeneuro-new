"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/relative-time";
import Link from "next/link";
import { Pencil, Trash2, ExternalLink, CircleCheck, Clock } from "lucide-react";
import { deleteBlog } from "./actions";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogListProps {
  initialBlogs: BlogPost[];
}

export function BlogList({ initialBlogs }: BlogListProps) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    setIsDeleting(id);
    try {
      const result = await deleteBlog(id);
      if (result.success) {
        setBlogs(blogs.filter((blog) => blog.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete blog:", error);
      alert("Failed to delete blog");
    } finally {
      setIsDeleting(null);
    }
  };

  const truncateUrl = (url: string, maxLength: number = 30) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted/50">
          <TableRow>
            <TableHead className="px-4">Title</TableHead>
            <TableHead className="hidden md:table-cell">URL</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead className="text-right px-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs.map((post) => (
            <TableRow key={post.id} className="group">
              <TableCell className="font-medium px-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 relative flex-shrink-0 rounded-md overflow-hidden bg-muted border">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-[10px] text-muted-foreground uppercase">
                        {post.title.substring(0, 2)}
                      </div>
                    )}
                  </div>
                  <span className="truncate max-w-[200px] md:max-w-[400px]" title={post.title}>
                    {post.title}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Link 
                  href={`/blogs/${post.slug}`} 
                  target="_blank"
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-mono bg-muted/30 px-2 py-1 rounded w-fit"
                >
                  {truncateUrl(`https://blazeneuro.com/blogs/${post.id}`)}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="outline" className="px-1.5 text-muted-foreground gap-1 font-normal">
                  {post.published ? (
                    <CircleCheck className="h-3 w-3 text-green-500" />
                  ) : (
                    <Clock className="h-3 w-3 text-yellow-500" />
                  )}
                  {post.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                <RelativeTime date={post.createdAt} />
              </TableCell>
              <TableCell className="text-right px-4">
                <div className="flex justify-end gap-1">
                  <Link href={`/admin/blogs/${post.id}`}>
                    <Button variant="ghost" size="icon" title="Edit" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(post.id)}
                    disabled={isDeleting === post.id}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
