import { db } from "@/lib/db";
import { blog, user, blogFeedback } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft } from "lucide-react";
import { BlogContent } from "@/components/blog-content";
import { BlogFeedback } from "@/components/blog-feedback";
import { Footer } from "@/components/footer";
import { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await db.select().from(blog).where(eq(blog.slug, slug)).limit(1);
  const post = result[0];
  
  return {
    title: post ? `${post.title} - BlazeNeuro` : "Blog - BlazeNeuro",
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let result: any[] = [];
  try {
    result = await db
      .select({
        blog,
        author: user,
      })
      .from(blog)
      .leftJoin(user, eq(blog.authorId, user.id))
      .where(eq(blog.slug, slug))
      .limit(1);
  } catch (error: any) {
    // Fallback if coverImage column doesn't exist
    if (error.message?.includes('coverImage')) {
      const rawResult: any = await db.execute(sql`
        SELECT b.*, u.id as author_id, u.name as author_name, u.email as author_email, 
               u.image as author_image, u.role as author_role
        FROM blog b
        LEFT JOIN "user" u ON b."authorId" = u.id
        WHERE b.slug = ${slug}
        LIMIT 1
      `);
      const rows = Array.isArray(rawResult) ? rawResult : (rawResult.rows || []);
      result = rows.map((r: any) => ({
        blog: {
          id: r.id,
          title: r.title,
          slug: r.slug,
          content: r.content,
          excerpt: r.excerpt,
          published: r.published,
          authorId: r.authorId,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        },
        author: r.author_id ? {
          id: r.author_id,
          name: r.author_name,
          email: r.author_email,
          image: r.author_image,
          role: r.author_role,
        } : null,
      }));
    } else {
      throw error;
    }
  }

  if (!result[0] || !result[0].blog.published) {
    notFound();
  }

  const post = result[0].blog;
  const author = result[0].author;

  // Get feedback counts (default to 0 if table doesn't exist)
  let likesCount = 0;
  let dislikesCount = 0;

  try {
    const feedbackCounts = await db
      .select({
        liked: blogFeedback.liked,
        count: sql<number>`count(*)::int`,
      })
      .from(blogFeedback)
      .where(eq(blogFeedback.blogId, post.id))
      .groupBy(blogFeedback.liked);

    feedbackCounts.forEach((row) => {
      if (row.liked) {
        likesCount = Number(row.count);
      } else {
        dislikesCount = Number(row.count);
      }
    });
  } catch (error) {
    // Table doesn't exist yet, use defaults
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/blogs">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
              Back to Blogs
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-start gap-3">
              {author && (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={author.image || undefined} alt={author.name} />
                    <AvatarFallback>{author.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{author.name}</p>
                    <time>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    {post.updatedAt.getTime() !== post.createdAt.getTime() && (
                      <p>Updated {new Date(post.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </header>

          <BlogContent content={post.content} />

          <BlogFeedback 
            blogId={post.id} 
            initialLikes={likesCount} 
            initialDislikes={dislikesCount} 
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
