# 🎓 Course Management System

A complete, production-ready course management system for Next.js 14 with admin controls, public viewing, and premium course paywalls.

## 🚀 Quick Start

```bash
# 1. Apply database migration
npx drizzle-kit push

# 2. Start development server
npm run dev

# 3. Access admin panel
# Navigate to: http://localhost:3000/admin/courses
# Login with admin credentials
```

## ✨ Features

- ✅ **Admin Course Management** - Create and manage courses with ease
- ✅ **Multi-Content Types** - Support for Articles, Videos, and Quizzes
- ✅ **Public Course Catalog** - Responsive grid layout for course browsing
- ✅ **Course Viewer** - Two-column layout with sidebar navigation
- ✅ **Premium Paywall** - Monetization-ready with admin bypass
- ✅ **Role-Based Access** - Secure admin-only routes with BetterAuth
- ✅ **ShadCN UI** - Beautiful, accessible components throughout
- ✅ **Type-Safe** - Full TypeScript support with Drizzle ORM
- ✅ **Responsive** - Mobile, tablet, and desktop optimized

## 📚 Documentation

- **[Complete Guide](COURSE_SYSTEM_COMPLETE.md)** - Full implementation details
- **[Architecture](COURSE_SYSTEM_ARCHITECTURE.md)** - Visual diagrams and flow
- **[Quick Reference](COURSE_SYSTEM_QUICK_REFERENCE.md)** - Developer guide
- **[Testing Checklist](TESTING_CHECKLIST.md)** - Comprehensive test plan

## 🗄️ Database Schema

### courses
```typescript
{
  id: uuid
  title: string
  type: "FREE" | "PAID"
  createdAt: timestamp
  updatedAt: timestamp
}
```

### course_pages
```typescript
{
  id: uuid
  courseId: uuid (FK)
  title: string
  order: number
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  body?: string
  videoUrl?: string
  quizData?: jsonb
  createdAt: timestamp
}
```

## 🔌 API Endpoints

### Admin (Auth Required)
- `POST /api/admin/courses` - Create course
- `GET /api/admin/courses` - List courses
- `GET /api/admin/courses/[id]` - Get course
- `POST /api/admin/courses/[id]/pages` - Add page

### Public
- `GET /api/courses` - List courses
- `GET /api/courses/[id]` - Get course

## 🎨 Pages

### Admin
- `/admin/courses` - Course list and creation
- `/admin/courses/[id]` - Course builder

### Public
- `/dashboard/courses` - Course catalog
- `/dashboard/courses/[id]` - Course viewer

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** ShadCN UI + TailwindCSS
- **Database:** Drizzle ORM + Neon PostgreSQL
- **Auth:** BetterAuth (role-based)
- **Language:** TypeScript

## 📦 Installation

No additional packages required! Uses existing dependencies.

## 🧪 Testing

```bash
# Run verification script
./verify-course-system.sh

# Check TypeScript
npm run build

# Start dev server
npm run dev
```

## 🔐 Security

- ✅ Role-based access control
- ✅ Admin-only routes protected
- ✅ Paywall enforcement for PAID courses
- ✅ Admin bypass for testing
- ✅ Session validation on all routes

## 📱 Responsive Design

- **Mobile:** 1-column grid, collapsible sidebar
- **Tablet:** 2-column grid, visible sidebar
- **Desktop:** 3-column grid, full layout

## 🎯 Usage Examples

### Create a Course (Admin)
1. Login as admin
2. Navigate to `/admin/courses`
3. Click "+ Create Course"
4. Enter title and select type (FREE/PAID)
5. Click "Create"

### Add Pages (Admin)
1. Click "Manage" on a course
2. Click "+ Add Page"
3. Enter page details
4. Select content type
5. Add content (text, URL, or quiz data)
6. Click "Add Page"

### View Course (User)
1. Navigate to `/dashboard/courses`
2. Click "View Course"
3. Browse pages in sidebar
4. View content in main area

## 🔮 Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Quiz builder and quiz-taking
- [ ] Course progress tracking
- [ ] Completion certificates
- [ ] Course ratings and reviews
- [ ] Search and filtering
- [ ] Rich text editor
- [ ] Video upload/hosting

## 📝 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/courses/
│   │   └── courses/
│   ├── admin/courses/
│   └── dashboard/courses/
├── components/
│   ├── nav-courses.tsx
│   ├── app-sidebar.tsx
│   └── site-header.tsx
└── lib/
    └── schema.ts

drizzle/
└── 0013_amusing_tinkerer.sql
```

## 🤝 Contributing

1. Review the [Quick Reference](COURSE_SYSTEM_QUICK_REFERENCE.md)
2. Check the [Testing Checklist](TESTING_CHECKLIST.md)
3. Follow the existing code patterns
4. Use ShadCN components only
5. Maintain type safety

## 📄 License

Same as parent project

## 🆘 Support

- Check documentation files
- Review testing checklist
- Verify database migration
- Check console for errors

## ✅ Status

**COMPLETE** - Ready for deployment and testing

---

**Version:** 1.0.0  
**Last Updated:** 2026-05-05  
**Author:** Senior Full-Stack Engineer  
**Stack:** Next.js 14 + ShadCN + Drizzle + BetterAuth
