"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Calendar,
  FileText,
  Settings,
  Menu,
  Component,
  X,
  Home,
  Star,
  Stethoscope,
  Building2,
  Droplets,
  Ambulance,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { name: "Hospitals", href: "/admin/hospitals", icon: Building2 },
  { name: "Blood Donors", href: "/admin/blood-donors", icon: Droplets },
  { name: "Blood Requests", href: "/admin/blood-requests", icon: Droplets },
  { name: "Ambulances", href: "/admin/ambulances", icon: Ambulance },
  { name: "Ambulance Requests", href: "/admin/ambulance-requests", icon: FileText },
  { name: "Ambulance Page", href: "/admin/ambulance-settings", icon: Settings },
  { name: "Appointments", href: "/admin/appointments", icon: Calendar },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  // { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  // {
  //   name: "Visa Applications",
  //   href: "/admin/visa-applications",
  //   icon: FileText,
  // },
  // { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({ className, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full bg-card border-r", className)}>
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h2 className="text-lg font-semibold">Admin Panel</h2>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return (
            <Link key={item.name} href={item.href} onClick={onNavigate}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn("w-full justify-start", collapsed && "px-2")}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">{item.name}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
