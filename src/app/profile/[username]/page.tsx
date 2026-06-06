import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Calendar, User } from "lucide-react"

async function getProfile(username: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
  const res = await fetch(`${baseUrl}/api/profiles/${username}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const profile = await getProfile(username)

  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Banner Area */}
      <div className="h-48 bg-gradient-to-r from-sidebar-primary to-sidebar-accent opacity-20" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            <Card className="overflow-hidden">
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto size-32 rounded-full bg-muted flex items-center justify-center border-4 border-background overflow-hidden">
                  {profile.image ? (
                    <img src={profile.image} alt={profile.name} className="size-full object-cover" />
                  ) : (
                    <User className="size-16 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {profile.bio || "This user hasn't added a bio yet."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-8 py-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="size-6" />
                Published Courses
              </h2>
              
              {profile.courses && profile.courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.courses.map((course: any) => (
                    <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {course.coverImage && (
                        <div className="aspect-video bg-muted">
                          <img src={course.coverImage} alt={course.title} className="size-full object-cover" />
                        </div>
                      )}
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                          <Badge variant={course.type === "FREE" ? "secondary" : "default"}>
                            {course.type === "PAID" ? `$${(course.price / 100).toFixed(2)}` : "Free"}
                          </Badge>
                        </div>
                        <Link href={`/dashboard/courses/${course.id}`}>
                          <Button variant="ghost" className="w-full text-sm mt-2" size="sm">
                            View Course
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center border-dashed">
                  <p className="text-muted-foreground">No courses published yet.</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
