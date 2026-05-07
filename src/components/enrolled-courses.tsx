"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpenIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type EnrolledCourse = {
  id: string;
  title: string;
  description: string | null;
  totalPages: number;
  completedPages: number;
};

export function EnrolledCourses({ courses }: { courses: EnrolledCourse[] }) {
  const router = useRouter();

  const handleCourseClick = (courseId: string) => {
    const lastPage = localStorage.getItem(`course-${courseId}-last-page`);
    if (lastPage) {
      router.push(`/dashboard/courses/${courseId}?page=${lastPage}`);
    } else {
      router.push(`/dashboard/courses/${courseId}`);
    }
  };

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5" />
            <CardTitle>My Courses</CardTitle>
          </div>
          <CardDescription>Courses you are enrolled in</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You are not enrolled in any courses yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpenIcon className="h-5 w-5" />
          <CardTitle>My Courses</CardTitle>
        </div>
        <CardDescription>Courses you are enrolled in</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => {
          const progress = course.totalPages > 0 
            ? Math.round((course.completedPages / course.totalPages) * 100) 
            : 0;

          return (
            <div 
              key={course.id} 
              onClick={() => handleCourseClick(course.id)}
              className="space-y-2 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold leading-none">{course.title}</h3>
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {course.completedPages} of {course.totalPages} lessons completed
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
