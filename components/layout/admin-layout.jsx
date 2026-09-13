"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { Container } from "@/components/ui/container"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function AdminLayout({ children, className }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="admin-shell flex h-dvh bg-background overflow-hidden">
      <aside className="hidden w-64 shrink-0 lg:block">
        <Sidebar className="w-64" />
      </aside>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[min(18rem,85vw)] p-0 [&>button]:hidden">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SheetDescription className="sr-only">Choose an admin section</SheetDescription>
          <Sidebar className="w-full" onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Container className={cn("py-4 sm:py-6", className)}>{children}</Container>
        </main>
      </div>
    </div>
  )
}
