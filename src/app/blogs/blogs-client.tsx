"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Grid3X3, List } from "lucide-react";
import { Footer } from "@/components/footer";

export default function BlogsPageClient({ blogs: initialBlogs }: { blogs: any[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const heroBlog = initialBlogs[0];
  const otherBlogs = initialBlogs.slice(1);

  return (
    <div className="relative min-h-screen">
      <main className="container mx-auto px-4 py-8 pt-8">
        {heroBlog && (
          <Link href={`/blogs/${heroBlog.blog.slug}`}>
            <Card className="overflow-hidden mb-12 group cursor-pointer border-none shadow-lg h-[45vh] min-h-[350px]">
              <div className="grid md:grid-cols-2 h-full">
                <div className="relative h-full min-h-[300px] overflow-hidden rounded-lg ml-4">
                  {heroBlog.blog.coverImage ? (
                    <Image
                      src={heroBlog.blog.coverImage}
                      alt={heroBlog.blog.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500" />
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yNCAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
                    </>
                  )}
                </div>
                <CardContent className="flex flex-col justify-center p-8 md:p-12">
                  <Badge className="mb-4 bg-primary/10 text-primary w-fit">
                    Featured Post
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {heroBlog.blog.title}
                  </h2>
                  {heroBlog.blog.excerpt && (
                    <p className="text-base md:text-lg text-muted-foreground mb-6 line-clamp-3">
                      {heroBlog.blog.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-auto">
                    {heroBlog.author && (
                      <>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={heroBlog.author.image || undefined} />
                          <AvatarFallback>
                            {heroBlog.author.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{heroBlog.author.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(heroBlog.blog.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        )}

        {otherBlogs.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No more posts yet</h2>
            <p className="text-muted-foreground">Check back soon for new content</p>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold">Recent Posts</h2>
                <div className="flex w-fit rounded-md border bg-background p-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={view === "grid" ? "default" : "ghost"}
                    className="h-8 gap-2"
                    onClick={() => setView("grid")}
                    aria-pressed={view === "grid"}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Grid
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={view === "list" ? "default" : "ghost"}
                    className="h-8 gap-2"
                    onClick={() => setView("list")}
                    aria-pressed={view === "list"}
                  >
                    <List className="h-4 w-4" />
                    List
                  </Button>
                </div>
              </div>

              {view === "grid" ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {otherBlogs.map(({ blog: post, author }) => (
                    <Link key={post.id} href={`/blogs/${post.slug}`} className="block">
                      <Card className="group flex h-full cursor-pointer flex-col overflow-hidden border-border/70 bg-card/80 p-0 shadow-sm transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg">
                        {post.coverImage ? (
                          <div className="relative m-3 aspect-[16/10] overflow-hidden rounded-md bg-muted">
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="m-3 aspect-[16/10] rounded-md bg-gradient-to-br from-blue-500 to-purple-500" />
                        )}
                        <div className="flex flex-1 flex-col px-1 pb-1">
                          <CardHeader className="pb-3">
                            <CardDescription className="flex items-center gap-2 text-xs">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </CardDescription>
                            <CardTitle className="line-clamp-2 text-xl leading-tight transition-colors group-hover:text-primary">
                              {post.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-1 flex-col justify-between gap-5 pt-0">
                            {post.excerpt && (
                              <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex items-center justify-between gap-3">
                              {author ? (
                                <div className="flex min-w-0 items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={author.image || undefined} />
                                    <AvatarFallback className="text-xs">{author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="truncate text-xs text-muted-foreground">{author.name}</span>
                                </div>
                              ) : (
                                <span />
                              )}
                              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="w-full overflow-hidden rounded-lg border border-border/70 bg-card">
                  {otherBlogs.map(({ blog: post, author }) => (
                    <Link
                      key={post.id}
                      href={`/blogs/${post.slug}`}
                      className="group grid grid-cols-[96px_1fr] gap-3 border-b border-border/70 p-3 transition-colors last:border-b-0 hover:bg-muted/45 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4 sm:p-4 lg:grid-cols-[240px_1fr]"
                    >
                      {post.coverImage ? (
                        <div className="relative h-24 overflow-hidden rounded-md bg-muted sm:aspect-[16/10] sm:h-auto">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="h-24 rounded-md bg-gradient-to-br from-blue-500 to-purple-500 sm:aspect-[16/10] sm:h-auto" />
                      )}
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {author && (
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={author.image || undefined} />
                                <AvatarFallback className="text-[10px]">{author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="truncate">{author.name}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-normal transition-colors group-hover:text-primary sm:text-lg">
                              {post.title}
                            </h3>
                            {post.excerpt && (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground sm:block" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
