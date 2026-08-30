"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, Moon, Sun, User, LogOut, Menu } from "lucide-react"
import { useTheme } from "next-themes"

export function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [notifications] = useState([
    { id: 1, message: "New user registration", unread: true },
    { id: 2, message: "Booking approved", unread: false },
  ])

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="flex min-h-16 items-center justify-between gap-2 border-b bg-background px-3 sm:px-4">
      <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={onMenuClick} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="min-w-0 flex-1">
        <div className="relative hidden max-w-md sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10" />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[min(20rem,calc(100vw-1rem))]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? "bg-blue-500" : "bg-gray-300"}`} />
                <span className="text-sm">{notification.message}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profilePhoto || "/placeholder.svg"} />
                <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || "A"}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
