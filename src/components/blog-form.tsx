"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBlog, updateBlog, deleteBlog } from "@/app/admin/blogs/actions";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type BlogFormProps = {
  blog?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    published: boolean;
  };
};

export function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(blog?.published || false);
  const [content, setContent] = useState(blog?.content || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      content,
      excerpt: formData.get("excerpt") as string,
      coverImage: formData.get("coverImage") as string,
      published,
    };

    if (blog) {
      await updateBlog(blog.id, data);
    } else {
      await createBlog(data);
    }

    router.push("/admin/blogs");
  };

  const handleDelete = async () => {
    if (blog && confirm("Delete this blog post?")) {
      setLoading(true);
      await deleteBlog(blog.id);
      router.push("/admin/blogs");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{blog ? "Edit Blog Post" : "New Blog Post"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={blog?.title}
              placeholder="Enter blog title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={blog?.slug}
              placeholder="blog-post-url"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              name="coverImage"
              defaultValue={blog?.coverImage || ""}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={blog?.excerpt || ""}
              placeholder="Short description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <div data-color-mode="light" className="dark:hidden">
              <MDEditor value={content} onChange={(val) => setContent(val || "")} height={500} />
            </div>
            <div data-color-mode="dark" className="hidden dark:block">
              <MDEditor value={content} onChange={(val) => setContent(val || "")} height={500} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="published"
              checked={published}
              onCheckedChange={(checked) => setPublished(checked as boolean)}
            />
            <Label htmlFor="published" className="cursor-pointer">
              Publish immediately
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : blog ? "Update" : "Create"}
            </Button>
            {blog && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                Delete
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
