import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { session as sessionTable, courseEnrollments, courses, coursePages, courseProgress } from "@/lib/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Activity } from "lucide-react";
import { AccountActiveChart } from "@/components/account-active-chart";
import { EnrolledCourses } from "@/components/enrolled-courses";

export const metadata: Metadata = {
  title: "Dashboard",
};



const chartConfig = {
  activeFrequency: {
    label: "Active Sessions",
    colors: {
      light: ["#7e22ce"], // Tailwind purple-700
      dark: ["#9333ea"], // Tailwind purple-600
    },
  },
};

export default async function Page() {
  const session = await requireAuth();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // 6 months including current
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const rawSessionData = await db
    .select({
      month: sql<string>`to_char(${sessionTable.createdAt}, 'Mon')`,
      count: sql<number>`count(*)::int`,
    })
    .from(sessionTable)
    .where(
      and(
        eq(sessionTable.userId, session.user.id),
        gte(sessionTable.createdAt, sixMonthsAgo)
      )
    )
    .groupBy(sql`to_char(${sessionTable.createdAt}, 'Mon'), date_trunc('month', ${sessionTable.createdAt})`)
    .orderBy(sql`date_trunc('month', ${sessionTable.createdAt})`);

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleString('default', { month: 'short' }));
  }

  const accountActiveData = months.map(m => {
    const found = rawSessionData.find(d => d.month === m);
    return {
      month: m,
      activeFrequency: found ? found.count : 0
    };
  });

  // Fetch enrolled courses with progress
  const enrolledCoursesData = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      totalPages: sql<number>`count(distinct ${coursePages.id})::int`,
      completedPages: sql<number>`count(distinct case when ${courseProgress.completed} = true then ${courseProgress.pageId} end)::int`,
    })
    .from(courseEnrollments)
    .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .leftJoin(coursePages, eq(coursePages.courseId, courses.id))
    .leftJoin(
      courseProgress,
      and(
        eq(courseProgress.pageId, coursePages.id),
        eq(courseProgress.userId, session.user.id)
      )
    )
    .where(eq(courseEnrollments.userId, session.user.id))
    .groupBy(courses.id, courses.title, courses.description)
    .orderBy(courses.createdAt);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Dashboard
        </h1>
        <p className="text-base text-muted-foreground flex items-center gap-2">
          Welcome back, <span className="font-semibold text-foreground">{session.user.name}</span>
        </p>
      </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Name</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{session.user.name}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight truncate">{session.user.email}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account ID</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-mono truncate tracking-wider">{session.user.id}</div>
              </CardContent>
            </Card>
          </div>

          <EnrolledCourses courses={enrolledCoursesData} />

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <CardTitle>Account Active Frequency</CardTitle>
                </div>
                <CardDescription>Your session activity over the last 7 months</CardDescription>
              </CardHeader>
              <CardContent className="pl-0 pb-4">
                <div className="h-[300px] w-full mt-4 pr-4">
                  <AccountActiveChart
                    data={accountActiveData}
                    chartConfig={chartConfig}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your BlazeNeuro account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center gap-4 py-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                  </Avatar>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-bold tracking-tight">{session.user.name}</p>
                    <Badge variant="secondary">{session.user.email}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
  )
}
