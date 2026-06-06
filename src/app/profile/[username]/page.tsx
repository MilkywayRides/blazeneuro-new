import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { BookOpen, Calendar, User as UserIcon, MapPin, Link as LinkIcon } from "lucide-react"
import { db } from "@/lib/db"

async function getProfile(username: string) {
  try {
    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.username, username),
      columns: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true
      }
    })

    if (!userRecord) return null

    const userCourses = await db.query.courses.findMany({
      where: (c, { eq }) => eq(c.publisherId, userRecord.id)
    })

    return {
      ...userRecord,
      courses: userCourses
    }
  } catch (error) {
    console.error("Error fetching profile:", error)
    return null
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const profile = await getProfile(username)

  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* YouTube Inspired Banner Area */}
      <div className="w-full h-[16vw] min-h-[150px] max-h-[300px] bg-muted relative overflow-hidden">
        {/* Placeholder for banner - clean neutral look */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-muted" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Identity Section (YouTube Style) */}
        <div className="flex flex-col md:flex-row gap-6 items-start py-8">
          <div className="size-24 md:size-40 rounded-full bg-muted flex-shrink-0 border-4 border-background overflow-hidden -mt-12 md:-mt-20 relative z-10 shadow-sm">
            {profile.image ? (
              <img src={profile.image} alt={profile.name} className="size-full object-cover" />
            ) : (
              <UserIcon className="size-full p-6 text-muted-foreground bg-muted" />
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{profile.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm font-medium">
                <span>@{profile.username}</span>
                <span className="hidden md:inline">•</span>
                <span>{profile.courses.length} courses</span>
              </div>
            </div>
            
            {profile.bio && (
              <p className="text-sm md:text-base text-muted-foreground line-clamp-2 max-w-3xl leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-4 pt-2">
              <Button className="rounded-full px-6 font-bold bg-foreground text-background hover:bg-foreground/90">
                Follow
              </Button>
              <Button variant="outline" className="rounded-full px-6 font-bold">
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="courses" className="w-full mt-4">
          <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none p-0 gap-8">
            <TabsTrigger 
              value="courses" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none h-full px-0 font-bold text-base"
            >
              Courses
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none h-full px-0 font-bold text-base"
            >
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="py-8 focus-visible:outline-none">
            {profile.courses && profile.courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {profile.courses.map((course: any) => (
                  <Link key={course.id} href={`/dashboard/courses/${course.id}`} className="group">
                    <div className="space-y-3">
                      <div className="aspect-video bg-muted rounded-xl overflow-hidden relative group-hover:rounded-none transition-all duration-300 shadow-sm border border-border/50">
                        {course.coverImage ? (
                          <img src={course.coverImage} alt={course.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="size-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/30">
                            <BookOpen className="size-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="secondary" className="bg-black/80 text-white border-none font-bold text-[10px] py-0.5 px-1.5 backdrop-blur-sm">
                            {course.type === "PAID" ? `$${(course.price / 100).toFixed(2)}` : "FREE"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span>{profile.name}</span>
                          <span>•</span>
                          <span>{new Date(course.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-4 border rounded-2xl border-dashed">
                <div className="p-4 rounded-full bg-muted">
                  <BookOpen className="size-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg">No courses yet</p>
                  <p className="text-muted-foreground text-sm">This creator hasn't published any courses yet.</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="py-8 focus-visible:outline-none max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {profile.bio || "No description provided."}
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Stats</h3>
                  <div className="space-y-4 border-y py-4">
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span>Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <BookOpen className="size-4 text-muted-foreground" />
                      <span>{profile.courses.length} courses published</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-foreground">
                  <Flag className="size-4 mr-2" /> Report user
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Flag({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
    </svg>
  )
}
