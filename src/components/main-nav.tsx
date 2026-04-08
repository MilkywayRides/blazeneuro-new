"use client"

import * as React from "react"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"
import { User, LogOut, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MainNav() {
  const { data: session, isPending } = authClient.useSession()
  const [open, setOpen] = React.useState(false)
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.blazeneuro.com"

  // Check if user is admin from session data
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

  const handleLogout = async () => {
    const accountInfo = localStorage.getItem("lastAccount")
    
    // Sign out and redirect to auth domain
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

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {/* Desktop Navigation */}
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/blogs" className={navigationMenuTriggerStyle()}>
              Blog
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/dashboard" className={navigationMenuTriggerStyle()}>
              Dashboard
            </NavigationMenuLink>
          </NavigationMenuItem>
          {isAdmin && (
            <NavigationMenuItem>
              <NavigationMenuLink href="/admin" className={navigationMenuTriggerStyle()}>
                Admin
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="md:hidden">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]">
          <nav className="flex flex-col gap-4 mt-8">
            <Link href="/" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/blogs" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
              Blog
            </Link>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                Admin
              </Link>
            )}
            {session?.user ? (
              <Button onClick={handleLogout} variant="outline" className="mt-4">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Link href={authUrl} onClick={() => setOpen(false)}>
                <Button className="w-full mt-4">Login</Button>
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {/* User Menu */}
      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2">
            {session.user.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href={authUrl} className="hidden md:block">
          <Button>Login</Button>
        </Link>
      )}
    </div>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <Link href={href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
      </Link>
    </li>
  )
}
