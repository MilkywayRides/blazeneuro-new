# Course Management System - Developer Quick Reference

## 🚀 Quick Start

### 1. Apply Database Migration
```bash
# Option 1: Push schema to database
npx drizzle-kit push

# Option 2: Manual SQL execution
psql $DATABASE_URL < drizzle/0013_amusing_tinkerer.sql
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access Admin Panel
```
URL: http://localhost:3000/admin/courses
Auth: Login with admin role
```

## 📚 API Reference

### Admin Endpoints

#### Create Course
```typescript
POST /api/admin/courses
Headers: { Cookie: session_token }
Body: {
  title: string
  type: "FREE" | "PAID"
}
Response: Course
```

#### List Courses
```typescript
GET /api/admin/courses
Headers: { Cookie: session_token }
Response: Array<{
  id: string
  title: string
  type: "FREE" | "PAID"
  createdAt: string
  pageCount: number
}>
```

#### Get Course
```typescript
GET /api/admin/courses/[courseId]
Headers: { Cookie: session_token }
Response: {
  ...Course
  pages: Array<Page>
}
```

#### Add Page
```typescript
POST /api/admin/courses/[courseId]/pages
Headers: { Cookie: session_token }
Body: {
  title: string
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  body?: string        // For ARTICLE
  videoUrl?: string    // For VIDEO
}
Response: Page
```

### Public Endpoints

#### List Courses
```typescript
GET /api/courses
Response: Array<{
  id: string
  title: string
  type: "FREE" | "PAID"
  pageCount: number
}>
```

#### Get Course
```typescript
GET /api/courses/[courseId]
Response: {
  ...Course
  pages: Array<Page>
}
```

## 🗄️ Database Schema

### courses
```typescript
{
  id: uuid (PK)
  title: string
  type: "FREE" | "PAID"
  createdAt: timestamp
  updatedAt: timestamp
}
```

### course_pages
```typescript
{
  id: uuid (PK)
  courseId: uuid (FK → courses.id)
  title: string
  order: number
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  body?: string
  videoUrl?: string
  quizData?: jsonb
  createdAt: timestamp
}
```

### course_purchases
```typescript
{
  id: uuid (PK)
  userId: string
  courseId: uuid (FK → courses.id)
  createdAt: timestamp
}
```

## 🎨 Component Usage

### Admin Course List
```tsx
import { Card, Table, Badge, Button, Dialog } from "@/components/ui"

// Empty state
<Card>
  <CardContent>
    <CardDescription>No courses yet!</CardDescription>
    <Button onClick={openDialog}>+ Create Course</Button>
  </CardContent>
</Card>

// Populated state
<Table>
  <TableRow>
    <TableCell>{course.title}</TableCell>
    <TableCell>
      <Badge variant={course.type === "FREE" ? "default" : "destructive"}>
        {course.type}
      </Badge>
    </TableCell>
  </TableRow>
</Table>
```

### Course Viewer with Paywall
```tsx
const showPaywall = 
  course.type === "PAID" && 
  !hasPurchased && 
  !isAdmin && 
  session?.user

{showPaywall && (
  <div className="absolute inset-0 z-50 backdrop-blur-md bg-background/80">
    <Card>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <Badge>Premium Course</Badge>
      </CardHeader>
      <CardContent>
        <p>Unlock full access to this course</p>
        <Badge variant="outline">Price coming soon</Badge>
      </CardContent>
      <CardFooter>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button disabled>Enroll Now</Button>
          </TooltipTrigger>
          <TooltipContent>Payment integration coming soon</TooltipContent>
        </Tooltip>
        <Button variant="outline" asChild>
          <a href="/login">Sign In</a>
        </Button>
      </CardFooter>
    </Card>
  </div>
)}
```

## 🔐 Authorization Patterns

### Admin Route Protection
```typescript
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Admin logic here
}
```

### Client-Side Admin Check
```typescript
import { authClient } from "@/lib/auth-client"

const { data: session } = authClient.useSession()
const isAdmin = session?.user?.role === "admin"
```

## 🎯 Common Tasks

### Add a New Content Type

1. **Update Schema:**
```typescript
// src/lib/schema.ts
contentType: text("content_type", { 
  enum: ["ARTICLE", "VIDEO", "QUIZ", "PODCAST"] // Add PODCAST
}).notNull()
```

2. **Update Admin Dialog:**
```tsx
// src/app/admin/courses/[courseId]/page.tsx
<SelectItem value="PODCAST">Podcast</SelectItem>

{contentType === "PODCAST" && (
  <div>
    <Label>Audio URL</Label>
    <Input placeholder="https://..." />
  </div>
)}
```

3. **Update Viewer:**
```tsx
// src/app/dashboard/courses/[courseId]/page.tsx
{selectedPage.contentType === "PODCAST" && (
  <Card>
    <CardHeader>
      <CardTitle>{selectedPage.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <audio controls src={selectedPage.audioUrl} />
    </CardContent>
  </Card>
)}
```

### Implement Course Purchase

1. **Create Purchase API:**
```typescript
// src/app/api/courses/[courseId]/purchase/route.ts
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  
  // Payment processing logic
  
  await db.insert(coursePurchases).values({
    userId: session.user.id,
    courseId: params.courseId
  })
  
  return NextResponse.json({ success: true })
}
```

2. **Check Purchase Status:**
```typescript
const [purchase] = await db
  .select()
  .from(coursePurchases)
  .where(
    and(
      eq(coursePurchases.userId, session.user.id),
      eq(coursePurchases.courseId, courseId)
    )
  )

const hasPurchased = !!purchase
```

### Add Course Progress Tracking

1. **Create Progress Table:**
```typescript
export const courseProgress = pgTable("course_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  courseId: uuid("course_id").notNull(),
  pageId: uuid("page_id").notNull(),
  completed: boolean("completed").default(false),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow()
})
```

2. **Track Progress:**
```typescript
await db.insert(courseProgress).values({
  userId: session.user.id,
  courseId,
  pageId,
  completed: true
}).onConflictDoUpdate({
  target: [courseProgress.userId, courseProgress.pageId],
  set: { completed: true, lastAccessedAt: new Date() }
})
```

## 🐛 Debugging Tips

### Check Auth Session
```typescript
// In API route
const session = await auth.api.getSession({ headers: req.headers })
console.log("Session:", session)
console.log("User role:", session?.user?.role)
```

### Verify Database Connection
```typescript
// Test query
const courses = await db.select().from(courses).limit(1)
console.log("Courses:", courses)
```

### Check Paywall Logic
```typescript
console.log({
  courseType: course.type,
  hasPurchased,
  isAdmin,
  hasSession: !!session?.user,
  showPaywall: course.type === "PAID" && !hasPurchased && !isAdmin && session?.user
})
```

## 📝 Testing Checklist

### Admin Flow
- [ ] Login as admin
- [ ] Navigate to /admin/courses
- [ ] Create FREE course
- [ ] Create PAID course
- [ ] Add ARTICLE page
- [ ] Add VIDEO page
- [ ] Add QUIZ page
- [ ] Verify page order
- [ ] Delete page

### User Flow
- [ ] Login as regular user
- [ ] Navigate to /dashboard/courses
- [ ] View course catalog
- [ ] Click FREE course
- [ ] Navigate through pages
- [ ] Click PAID course
- [ ] Verify paywall appears
- [ ] Check sidebar course list

### Admin Bypass
- [ ] Login as admin
- [ ] Navigate to PAID course
- [ ] Verify no paywall
- [ ] Access all content

## 🔗 Related Files

```
Schema:           src/lib/schema.ts
Auth:             src/lib/auth.ts
Admin Routes:     src/app/api/admin/courses/**
Public Routes:    src/app/api/courses/**
Admin Pages:      src/app/admin/courses/**
Public Pages:     src/app/dashboard/courses/**
Components:       src/components/nav-courses.tsx
                  src/components/app-sidebar.tsx
                  src/components/site-header.tsx
Migration:        drizzle/0013_amusing_tinkerer.sql
```

## 💡 Pro Tips

1. **Use Server Components** for data fetching when possible
2. **Mark "use client"** only when you need hooks or interactivity
3. **Always validate** user input in API routes
4. **Use Drizzle's type safety** - let TypeScript catch errors
5. **Test paywall logic** with different user roles
6. **Keep components minimal** - follow the "absolute minimal code" principle
7. **Use ShadCN variants** instead of custom CSS
8. **Leverage Drizzle joins** for efficient queries

## 🆘 Common Issues

### "Unauthorized" on admin routes
- Check session cookie is being sent
- Verify user role is "admin"
- Check auth.api.getSession() is awaited

### Paywall not showing
- Verify course type is "PAID"
- Check user is authenticated
- Confirm user is not admin
- Verify hasPurchased is false

### Pages not ordered correctly
- Check order field is being set
- Verify orderBy(asc(coursePages.order))
- Ensure max(order) + 1 logic is correct

### Migration fails
- Check database connection string
- Verify Drizzle config is correct
- Try manual SQL execution
- Check for conflicting table names

---

**Need Help?** Check the full documentation:
- COURSE_SYSTEM_COMPLETE.md
- COURSE_SYSTEM_ARCHITECTURE.md
- COURSE_SYSTEM_IMPLEMENTATION.md
