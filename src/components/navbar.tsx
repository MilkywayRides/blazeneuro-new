"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import {
  User,
  LogOut,
  Menu,
  Brain,
  LayoutDashboard,
  BookOpen,
  Home,
  Shield,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blogs", label: "Blog", icon: BookOpen },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
]

export function Navbar() {
  const { data: session } = authClient.useSession()
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [activePill, setActivePill] = React.useState({ left: 0, width: 0 })
  const pathname = usePathname()
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.blazeneuro.com"
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/")
  const navRef = React.useRef<HTMLElement>(null)
  const linkRefs = React.useRef<(HTMLAnchorElement | null)[]>([])

  const isAdmin = React.useMemo(() => {
    return session?.user?.email === 'admin@blazeneuro.com' ||
           session?.user?.email === 'ankityadav7420@gmail.com'
  }, [session])

  React.useEffect(() => {
    if (session?.user) {
      const provider = session.user.image?.includes('googleusercontent') ? 'google'
                     : session.user.image?.includes('github') ? 'github'
                     : 'email'

      localStorage.setItem("lastAccount", JSON.stringify({
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        provider
      }))
    }
  }, [session])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLogout = async () => {
    const accountInfo = localStorage.getItem("lastAccount")
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          if (accountInfo) {
            const account = JSON.parse(accountInfo)
            const params = new URLSearchParams({
              email: account.email,
              name: account.name || '',
              image: account.image || '',
              provider: account.provider || 'email'
            })
            window.location.href = `${authUrl}?${params.toString()}`
          } else {
            window.location.href = authUrl
          }
        }
      }
    })
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const allLinks = isAdmin
    ? [...navLinks, { href: "/admin", label: "Admin", icon: Shield }]
    : navLinks

  const activeIndex = allLinks.findIndex((link) => isActive(link.href))

  React.useLayoutEffect(() => {
    const updateActivePill = () => {
      const nav = navRef.current
      const activeLink = activeIndex >= 0 ? linkRefs.current[activeIndex] : null

      if (!nav || !activeLink) {
        setActivePill({ left: 0, width: 0 })
        return
      }

      const navRect = nav.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      setActivePill({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
      })
    }

    updateActivePill()
    window.addEventListener("resize", updateActivePill)
    return () => window.removeEventListener("resize", updateActivePill)
  }, [activeIndex, isAdmin])

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/")

  if (isDashboardRoute || isAdminRoute) {
    return null
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-foreground group-hover:scale-105 transition-transform duration-200">
            <Brain className="h-4 w-4 text-background" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight hidden sm:block">
            BlazeNeuro
          </span>
        </Link>

        {/* Desktop Nav — Center */}
        <nav
          ref={navRef}
          className="relative hidden md:flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-1 py-0.5"
        >
          <span
            className="absolute top-1 bottom-1 rounded-full bg-background shadow-sm transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              left: activePill.left,
              width: activePill.width,
              opacity: activePill.width > 0 ? 1 : 0,
            }}
            aria-hidden="true"
          />
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              ref={(node) => {
                linkRefs.current[allLinks.findIndex((item) => item.href === link.href)] = node
              }}
              className={`relative z-10 px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors duration-200 ${
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <ModeToggle />

          {/* User / Login — Desktop */}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-border hover:ring-2 hover:ring-foreground/20 transition-all"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-1 ring-border hover:ring-2 hover:ring-foreground/20 transition-all">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="flex items-center gap-3 px-3 py-3">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-medium truncate">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={authUrl} className="hidden md:block">
              <Button size="sm" className="h-8 rounded-full px-4 text-[13px] font-medium">
                Login
              </Button>
            </Link>
          )}

          {/* Mobile menu — use render prop to avoid nested buttons */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={<button type="button" className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" />}
              >
                <Menu className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] px-0">
                <SheetHeader className="px-6 pb-2">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
                      <Brain className="h-3.5 w-3.5 text-background" />
                    </div>
                    <span className="font-semibold">BlazeNeuro</span>
                  </SheetTitle>
                </SheetHeader>
                <Separator />
                <nav className="flex flex-col gap-0.5 px-3 py-3">
                  {allLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          isActive(link.href)
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>
                <Separator className="mx-3" />
                <div className="px-3 py-3">
                  {session?.user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-3 py-2">
                        {session.user.image ? (
                          <img src={session.user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <Link href={authUrl} onClick={() => setOpen(false)}>
                      <Button size="sm" className="w-full rounded-full">Login</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
