// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Save, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { FileUpload } from "@/components/ui/FileUpload";

export default function ProfilePage() {
  const { user, getMe } = useAuth();

  const queryClient = useQueryClient();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: user,
  });

  const watchedValues = watch();

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch("/auth/profile", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully"); // ✅ success toast

      getMe(); // Refresh user data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const formData = new FormData();
      formData.append("profilePhoto", files[0]);

      const response = await api.post("/auth/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile photo updated successfully"); // ✅ success toast

      getMe(); // Refresh user data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to upload photo");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (password) => {
      await api.delete("/auth/account", { data: { password } });
    },
    onSuccess: () => {
      toast.success("Your account has been permanently deleted");
      // Auth provider will handle logout and redirect
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete account");
    },
  });

  const onSubmit = (data) => {
    const changes = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== user[key]) {
        changes[key] = data[key];
      }
    });

    if (Object.keys(changes).length === 0) {
      toast.success("No changes were made to update");

      return;
    }

    updateMutation.mutate(changes);
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm account deletion");

      return;
    }
    deleteMutation.mutate(deletePassword);
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6 max-w-4xl">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profilePhoto || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <FileUpload
                    onUpload={(files) => uploadMutation.mutate(files)}
                    accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
                    maxSize={5 * 1024 * 1024} // 5MB
                    multiple={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      disabled={updateMutation.isLoading}
                    />
                    {user?.name !== watchedValues.name && (
                      <p className="text-xs text-muted-foreground">
                        Previous: {user?.name}
                      </p>
                    )}
                    {errors.name && (
                      <p className="text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      disabled={updateMutation.isLoading}
                    />
                    {user?.email !== watchedValues.email && (
                      <p className="text-xs text-muted-foreground">
                        Previous: {user?.email}
                      </p>
                    )}
                    {errors.email && (
                      <p className="text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...register("phone", {
                        pattern: {
                          value: /^[+]?[1-9][\d]{0,15}$/,
                          message: "Invalid phone number",
                        },
                      })}
                      disabled={updateMutation.isLoading}
                    />
                    {user?.phone !== watchedValues.phone && (
                      <p className="text-xs text-muted-foreground">
                        Previous: {user?.phone || "Not set"}
                      </p>
                    )}
                    {errors.phone && (
                      <p className="text-xs text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Passport Number</Label>
                    <Input
                      id="passportNumber"
                      {...register("passportNumber")}
                      disabled={updateMutation.isLoading}
                    />
                    {user?.passportNumber !== watchedValues.passportNumber && (
                      <p className="text-xs text-muted-foreground">
                        Previous: {user?.passportNumber || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={updateMutation.isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delete Account Dialog */}
          <ConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Delete Account"
            description="This action cannot be undone. Please enter your password to confirm account deletion."
            confirmText="Delete Account"
            variant="destructive"
            onConfirm={handleDeleteAccount}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deletePassword">Password</Label>
                <Input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </ConfirmDialog>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
