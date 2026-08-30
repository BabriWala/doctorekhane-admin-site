"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { Container } from "@/components/ui/container"
import { cn } from "@/lib/utils"

export function AdminLayout({ children, className }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-background overflow-hidden">
      <aside className="hidden w-64 shrink-0 md:block">
        <Sidebar className="w-64" />
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button aria-label="Close navigation" className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative h-full w-[min(18rem,85vw)] shadow-2xl">
            <Sidebar className="w-full" onNavigate={() => setMobileSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Container className={cn("py-6", className)}>{children}</Container>
        </main>
      </div>
    </div>
  )
}
