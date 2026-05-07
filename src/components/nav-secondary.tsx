"use client"

import * as React from "react"
import Link from "next/link"

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

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { open } = useSidebar()
  
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <TooltipProvider>
            {items.map((item) => {
              const linkElement = (
                <Link 
                  href={item.url} 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-accent/50 ${!open ? 'justify-center' : ''}`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {open && <span className="flex-1">{item.title}</span>}
                </Link>
              )
              
              return (
                <SidebarMenuItem key={item.title}>
                  {!open ? (
                    <Tooltip>
                      <TooltipTrigger>
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
