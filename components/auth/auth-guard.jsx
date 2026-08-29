"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AuthGuard({ children, requireAdmin = false }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 🚨 Skip guard completely on public routes
  // 🚨 Public routes should skip guard
  const publicRoutes = ["/login", "/register"];
  if (publicRoutes.includes(pathname)) {
    return children;
  }

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        if (pathname !== "/login") {
          router.replace("/login");
        }
        return;
      }

      if (requireAdmin && !isAdmin) {
        router.push("/access-denied");
        return;
      }
    }
  }, [loading, isAuthenticated, isAdmin, requireAdmin, router, pathname]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </CardTitle>
            <CardDescription>Verifying your authentication</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={"/login"}>
              <Button className="w-full"> Go To Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/admin")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
