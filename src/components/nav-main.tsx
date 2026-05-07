"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const pathname = usePathname()
  const { open } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <TooltipProvider>
            {items.map((item) => {
              const isActive = pathname === item.url
              
              const linkElement = (
                <Link 
                  href={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full ${
                    isActive 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent/50'
                  } ${!open ? 'justify-center' : ''}`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {open && <span className="flex-1 text-left">{item.title}</span>}
                </Link>
              )
              
              return (
                <SidebarMenuItem key={item.title}>
                  {!open ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {linkElement}
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    linkElement
                  )}
                </SidebarMenuItem>
              )
            })}
          </TooltipProvider>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
