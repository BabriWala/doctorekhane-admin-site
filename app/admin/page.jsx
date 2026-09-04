// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Calendar, FileText, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
// import { ApiStatus } from "@/components/api/api-status";
import api from "@/lib/api";

const StatCard = ({ title, value, description, icon: Icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {Boolean(trend) && (
          <span
            className={`inline-flex items-center ${trend > 0 ? "text-green-600" : "text-red-600"
              }`}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
        {description}
      </p>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/stats");
      return response.data;
    },
    retry: 3,
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: health, isError: healthError } = useQuery({ queryKey: ["system-health"], queryFn: async () => (await api.get("/health")).data, refetchInterval: 30000 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {/* <ApiStatus /> */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin panel. Here's what's happening today.
        </p>
      </div>

      {/* <ApiStatus /> */}

      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              Failed to load dashboard data. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          description="from last month"
          icon={Users}
          trend={stats?.users?.trend}
        />
        <StatCard
          title="Active Bookings"
          value={stats?.bookings?.active || 0}
          description="currently active"
          icon={Calendar}
          trend={stats?.bookings?.trend}
        />
        <StatCard
          title="Active Doctors"
          value={stats?.doctors?.active ?? "—"}
          description="in the directory"
          icon={FileText}

        />
        <StatCard
          title="Hospitals"
          value={stats?.hospitals?.total ?? "—"}
          description="in the directory"
          icon={TrendingUp}

        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in your system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity?.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              )) || (
                  <p className="text-sm text-muted-foreground">
                    No recent activity
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <span className="text-sm">{healthError ? "Unavailable" : health ? "Operational" : "Checking…"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="text-sm">{health?.data?.database || "Unknown"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <span className="text-sm">Not monitored</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
