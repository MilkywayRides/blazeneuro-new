export default function CourseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[calc(100vh-3rem)] overflow-hidden flex flex-col">
      {children}
    </div>
  )
}
