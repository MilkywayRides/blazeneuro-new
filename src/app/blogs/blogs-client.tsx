"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function BlogsPageClient({ blogs: initialBlogs }: { blogs: any[] }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroBlog = initialBlogs[0];
  const otherBlogs = initialBlogs.slice(1);

  return (
    <div className="relative min-h-screen">
      <header className={`fixed left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled ? 'top-0' : 'top-2 md:top-6'
      }`}>
        <div className={`mx-auto transition-all duration-700 ${
          isScrolled ? 'w-full' : 'w-[95%] md:w-[91%]'
        }`}>
          <div className={`relative flex justify-between items-center p-3 md:p-4 transition-all duration-700 ${
            isScrolled ? 'rounded-none' : 'rounded-full'
          } overflow-hidden`}>
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute inset-0" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', opacity: 1, maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></span>
              <span className="absolute inset-0" style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', opacity: 0.8, maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></span>
              <span className="absolute inset-0" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', opacity: 0.6, maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></span>
              <span className="absolute inset-0" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', opacity: 0.4, maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></span>
              <span className="absolute inset-0" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', opacity: 0.2, maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></span>
            </div>
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent)'
            }}></div>
            <h2 className="relative text-lg md:text-2xl font-bold ml-2 md:ml-8">BlazeNeuro</h2>
            <div className="relative flex items-center gap-2 md:gap-4 mr-2 md:mr-8">
              <MainNav />
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pt-24 md:pt-32">
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
              <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
              <NavigationMenu className="max-w-full">
                <NavigationMenuList className="flex-nowrap overflow-x-auto gap-4 pb-4">
                  {otherBlogs.slice(0, 5).map(({ blog: post, author }) => (
                    <NavigationMenuItem key={post.id} className="flex-shrink-0">
                      <NavigationMenuLink asChild>
                        <Link href={`/blogs/${post.slug}`} className="block">
                          <Card className="w-[320px] hover:shadow-xl transition-all overflow-hidden group cursor-pointer border">
                            {post.coverImage ? (
                              <div className="relative h-44 overflow-hidden">
                                <Image
                                  src={post.coverImage}
                                  alt={post.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="h-44 bg-gradient-to-br from-blue-500 to-purple-500" />
                            )}
                            <CardHeader className="pb-3">
                              <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
                              <CardDescription className="flex items-center gap-2 text-xs">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </CardDescription>
                            </CardHeader>
                            {post.excerpt && (
                              <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {post.excerpt}
                                </p>
                              </CardContent>
                            )}
                          </Card>
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {otherBlogs.length > 5 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {otherBlogs.slice(5).map(({ blog: post, author }) => (
                  <Link key={post.id} href={`/blogs/${post.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer p-0 mb-4">
                      {post.coverImage ? (
                        <div className="relative h-56 overflow-hidden rounded-lg m-4">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="h-56 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg m-4" />
                      )}
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      </CardHeader>
                      {post.excerpt && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {post.excerpt}
                          </p>
                          {author && (
                            <div className="flex items-center gap-2 mt-4">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={author.image || undefined} />
                                <AvatarFallback className="text-xs">{author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{author.name}</span>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
