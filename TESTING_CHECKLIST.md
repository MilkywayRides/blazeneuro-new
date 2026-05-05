# Course Management System - Testing Checklist

## Pre-Deployment Checklist

### ✅ Database Setup
- [ ] Migration file generated: `drizzle/0013_amusing_tinkerer.sql`
- [ ] Database connection configured in `.env.local`
- [ ] Migration applied: `npx drizzle-kit push` OR manual SQL execution
- [ ] Verify tables exist: `courses`, `course_pages`, `course_purchases`

### ✅ Environment Variables
- [ ] `DATABASE_URL` set correctly
- [ ] `BETTER_AUTH_SECRET` configured
- [ ] `NEXT_PUBLIC_AUTH_URL` set
- [ ] All auth provider credentials configured

### ✅ Dependencies
- [ ] `npm install` completed successfully
- [ ] No TypeScript errors: `npm run build`
- [ ] Development server starts: `npm run dev`

---

## Admin Flow Testing

### Course Creation
- [ ] Login as admin (role === "admin")
- [ ] Navigate to `/admin/courses`
- [ ] Verify "Courses" link in admin sidebar
- [ ] See empty state with "No courses yet!" message
- [ ] Click "+ Create Course" button
- [ ] Dialog opens with title input and type selector
- [ ] Create a FREE course (e.g., "Introduction to React")
- [ ] Create a PAID course (e.g., "Advanced Node.js")
- [ ] Verify courses appear in table
- [ ] Verify FREE badge is default variant
- [ ] Verify PAID badge is destructive variant
- [ ] Verify page count shows 0 for new courses

### Course Builder
- [ ] Click "Manage" on a course
- [ ] Navigate to `/admin/courses/[courseId]`
- [ ] Verify course title and type badge display
- [ ] Verify page count shows correctly
- [ ] Click "+ Add Page" button
- [ ] Dialog opens with page form

#### Add Article Page
- [ ] Enter page title: "Introduction"
- [ ] Select content type: "Article"
- [ ] Textarea appears for content
- [ ] Enter some text content
- [ ] Click "Add Page"
- [ ] Page appears in table with order 1
- [ ] Content type badge shows "ARTICLE"

#### Add Video Page
- [ ] Click "+ Add Page" again
- [ ] Enter page title: "Setup Tutorial"
- [ ] Select content type: "Video"
- [ ] URL input appears
- [ ] Enter YouTube URL
- [ ] Click "Add Page"
- [ ] Page appears with order 2
- [ ] Content type badge shows "VIDEO"

#### Add Quiz Page
- [ ] Click "+ Add Page" again
- [ ] Enter page title: "Knowledge Check"
- [ ] Select content type: "Quiz"
- [ ] Placeholder textarea appears
- [ ] Click "Add Page"
- [ ] Page appears with order 3
- [ ] Content type badge shows "QUIZ"

### Page Management
- [ ] Verify pages are ordered correctly (1, 2, 3)
- [ ] Verify delete button (trash icon) appears
- [ ] Verify all page titles display correctly
- [ ] Verify content type badges have outline variant

---

## User Flow Testing

### Course Catalog
- [ ] Logout from admin
- [ ] Login as regular user (role === "user")
- [ ] Navigate to `/dashboard`
- [ ] Verify "Courses" button in header (left of notification bell)
- [ ] Click "Courses" button
- [ ] Navigate to `/dashboard/courses`
- [ ] Verify button shows secondary variant (active state)
- [ ] See course catalog grid
- [ ] Verify responsive layout (1/2/3 columns)
- [ ] Verify both FREE and PAID courses display
- [ ] Verify type badges show correctly
- [ ] Verify page counts display

### Sidebar Integration
- [ ] Check left sidebar
- [ ] Verify "Courses" section appears after separator
- [ ] Verify all courses listed
- [ ] Verify BookOpenIcon displays
- [ ] Click on a course in sidebar
- [ ] Verify checkmark appears for active course

### FREE Course Viewing
- [ ] Click "View Course" on FREE course
- [ ] Navigate to `/dashboard/courses/[courseId]`
- [ ] Verify two-column layout
- [ ] Verify left sidebar shows page list
- [ ] Verify course title and FREE badge in sidebar
- [ ] Click on first page
- [ ] Verify page highlights with secondary variant
- [ ] Verify content renders in right panel

#### Article Content
- [ ] Select article page
- [ ] Verify card displays
- [ ] Verify title shows
- [ ] Verify text content renders

#### Video Content
- [ ] Select video page
- [ ] Verify card displays
- [ ] Verify iframe embeds
- [ ] Verify aspect-video class applied
- [ ] Verify video loads (if URL valid)

#### Quiz Content
- [ ] Select quiz page
- [ ] Verify card displays
- [ ] Verify "Quiz coming soon" message
- [ ] Verify "Coming Soon" badge displays

### PAID Course Paywall
- [ ] Click "View Course" on PAID course
- [ ] Navigate to `/dashboard/courses/[courseId]`
- [ ] **Verify paywall appears**
- [ ] Verify backdrop blur effect
- [ ] Verify content behind is blurred
- [ ] Verify centered card displays
- [ ] Verify course title shows
- [ ] Verify "Premium Course" badge
- [ ] Verify "Unlock full access" message
- [ ] Verify "Price coming soon" badge
- [ ] Verify "Enroll Now" button is disabled
- [ ] Hover over "Enroll Now" button
- [ ] Verify tooltip: "Payment integration coming soon"
- [ ] Verify "Sign In" button displays
- [ ] Click "Sign In" button
- [ ] Verify redirects to login page

---

## Admin Bypass Testing

### Paywall Bypass
- [ ] Logout from user account
- [ ] Login as admin
- [ ] Navigate to `/dashboard/courses`
- [ ] Click on PAID course
- [ ] **Verify NO paywall appears**
- [ ] Verify full access to all pages
- [ ] Verify content renders normally
- [ ] Navigate through all pages
- [ ] Verify all content types work

---

## Navigation Testing

### Admin Sidebar
- [ ] Login as admin
- [ ] Verify "Courses" link appears after "Dashboard"
- [ ] Verify BookOpenIcon displays
- [ ] Click "Courses" link
- [ ] Verify navigates to `/admin/courses`
- [ ] Verify active state highlights

### User Sidebar
- [ ] Login as user
- [ ] Verify "Courses" section appears
- [ ] Verify separator before courses
- [ ] Verify all courses listed
- [ ] Verify active course has checkmark
- [ ] Click different courses
- [ ] Verify checkmark moves

### Header Button
- [ ] Verify "Courses" button in header
- [ ] Verify positioned left of notification bell
- [ ] Verify BookOpenIcon displays
- [ ] Click button
- [ ] Verify navigates to `/dashboard/courses`
- [ ] Verify secondary variant when active
- [ ] Navigate away
- [ ] Verify ghost variant when inactive

---

## API Testing

### Admin Endpoints
```bash
# Create Course
curl -X POST http://localhost:3000/api/admin/courses \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=..." \
  -d '{"title":"Test Course","type":"FREE"}'

# List Courses
curl http://localhost:3000/api/admin/courses \
  -H "Cookie: session_token=..."

# Get Course
curl http://localhost:3000/api/admin/courses/[courseId] \
  -H "Cookie: session_token=..."

# Add Page
curl -X POST http://localhost:3000/api/admin/courses/[courseId]/pages \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=..." \
  -d '{"title":"Test Page","contentType":"ARTICLE","body":"Content"}'
```

### Public Endpoints
```bash
# List Courses
curl http://localhost:3000/api/courses

# Get Course
curl http://localhost:3000/api/courses/[courseId]
```

### Authorization Testing
- [ ] Test admin endpoints without auth → 401
- [ ] Test admin endpoints with user role → 401
- [ ] Test admin endpoints with admin role → 200
- [ ] Test public endpoints without auth → 200

---

## Responsive Design Testing

### Mobile (< 768px)
- [ ] Course catalog shows 1 column
- [ ] Course viewer sidebar collapses/scrolls
- [ ] Dialogs fit screen
- [ ] Buttons are touch-friendly
- [ ] Navigation works smoothly

### Tablet (768px - 1024px)
- [ ] Course catalog shows 2 columns
- [ ] Course viewer layout adjusts
- [ ] Sidebar remains visible
- [ ] All interactions work

### Desktop (> 1024px)
- [ ] Course catalog shows 3 columns
- [ ] Course viewer shows full layout
- [ ] All features accessible
- [ ] Optimal spacing and sizing

---

## Edge Cases

### Empty States
- [ ] No courses created → Empty state shows
- [ ] Course with no pages → Empty message shows
- [ ] No courses in sidebar → Section hidden

### Error Handling
- [ ] Invalid course ID → 404 error
- [ ] Network error → Graceful handling
- [ ] Invalid form data → Validation errors

### Data Validation
- [ ] Empty course title → Disabled create button
- [ ] Empty page title → Disabled add button
- [ ] Invalid video URL → Still saves (validation optional)

---

## Performance Testing

### Load Times
- [ ] Course list loads quickly
- [ ] Course viewer renders fast
- [ ] Page switching is instant
- [ ] No layout shifts

### Data Fetching
- [ ] Server Components used for initial data
- [ ] Client Components only where needed
- [ ] No unnecessary re-renders
- [ ] Efficient database queries

---

## Security Testing

### Authentication
- [ ] Unauthenticated users can't access admin routes
- [ ] Regular users can't access admin routes
- [ ] Admin users can access all routes
- [ ] Session validation works correctly

### Authorization
- [ ] Paywall enforced for PAID courses
- [ ] Admin bypass works correctly
- [ ] Purchase check works (when implemented)
- [ ] No data leaks in API responses

---

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Final Verification

### Code Quality
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No console warnings
- [ ] Clean code structure

### UI/UX
- [ ] All ShadCN components used correctly
- [ ] No custom CSS (only Tailwind utilities)
- [ ] Consistent styling throughout
- [ ] Accessible (keyboard navigation, ARIA labels)

### Documentation
- [ ] All documentation files present
- [ ] README updated
- [ ] API documented
- [ ] Architecture documented

---

## Post-Deployment

### Monitoring
- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Track user engagement
- [ ] Collect feedback

### Future Enhancements
- [ ] Plan payment integration
- [ ] Design quiz builder
- [ ] Implement progress tracking
- [ ] Add analytics

---

## Sign-Off

- [ ] All tests passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete

**Tested By:** _______________
**Date:** _______________
**Status:** ✅ APPROVED / ⚠️ NEEDS WORK

---

**Notes:**
