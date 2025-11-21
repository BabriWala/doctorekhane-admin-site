// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ArrowLeft, Edit, Save, X, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import Link from "next/link";

const FieldComparison = ({ label, previous, current }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Previous</p>
        <p className="font-medium">{previous || "N/A"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">New</p>
        <p className="font-medium">{current || "N/A"}</p>
      </div>
    </div>
  </div>
);

export default function UserDetailPage({ params }) {
  const { id } = params;

  const router = useRouter();

  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await api.get(`/users/admin/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "user",
        passportNumber: user.passportNumber || "",
      });
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch(`/users/admin/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User updated successfully"); // ✅ success toast

      queryClient.invalidateQueries(["user", id]);
      queryClient.invalidateQueries(["users"]);
      setIsEditing(false);
      setShowConfirmDialog(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/users/admin/${id}`);
    },
    onSuccess: () => {
      toast.success("User deleted successfully"); // ✅ success toast

      router.push("/admin/users");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status) => {
      const response = await api.patch(`/api/users/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success("User status updated successfully"); // ✅ success toast

      queryClient.invalidateQueries(["user", id]);
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const watchedValues = watch();

  const onSubmit = (data) => {
    const changes = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== user[key]) {
        changes[key] = data[key];
      }
    });

    if (Object.keys(changes).length === 0) {
      toast.error("No changes were made to update");

      setIsEditing(false);
      return;
    }

    setPendingChanges(changes);
    setShowConfirmDialog(true);
  };

  const confirmUpdate = () => {
    updateMutation.mutate(pendingChanges);
  };

  const handleStatusChange = (status) => {
    statusMutation.mutate(status);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
      passportNumber: user.passportNumber || "",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-muted-foreground mt-2">
          The user you're looking for doesn't exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={user.status === "active" ? "default" : "destructive"}>
            {user.status}
          </Badge>
          <Badge variant="secondary">{user.role}</Badge>
        </div>
      </div>

      <div className="flex gap-4">
        {!isEditing ? (
          <>
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                handleStatusChange(
                  user.status === "active" ? "blocked" : "active"
                )
              }
              disabled={statusMutation.isLoading}
            >
              {statusMutation.isLoading
                ? "Updating..."
                : user.status === "active"
                ? "Block User"
                : "Unblock User"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={updateMutation.isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        )}
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="visa-applications">Visa Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                {isEditing ? "Edit user details" : "View user details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    {isEditing ? (
                      <div>
                        <Input
                          id="name"
                          {...register("name", {
                            required: "Name is required",
                          })}
                        />
                        {user.name !== watchedValues.name &&
                          watchedValues.name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Previous:{" "}
                              <span className="font-medium">{user.name}</span>
                            </p>
                          )}
                        {errors.name && (
                          <p className="text-xs text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium">{user.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <div>
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
                        />
                        {user.email !== watchedValues.email &&
                          watchedValues.email && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Previous:{" "}
                              <span className="font-medium">{user.email}</span>
                            </p>
                          )}
                        {errors.email && (
                          <p className="text-xs text-red-500">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium">{user.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <div>
                        <Input
                          id="phone"
                          {...register("phone", {
                            pattern: {
                              value: /^[+]?[1-9][\d]{0,15}$/,
                              message: "Invalid phone number format",
                            },
                          })}
                        />
                        {user.phone !== watchedValues.phone && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Previous:{" "}
                            <span className="font-medium">
                              {user.phone || "Not set"}
                            </span>
                          </p>
                        )}
                        {errors.phone && (
                          <p className="text-xs text-red-500">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium">{user.phone || "Not set"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    {isEditing ? (
                      <div>
                        <Select
                          value={watchedValues.role}
                          onValueChange={(value) => setValue("role", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">
                              Super Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {user.role !== watchedValues.role &&
                          watchedValues.role && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Previous:{" "}
                              <span className="font-medium capitalize">
                                {user.role}
                              </span>
                            </p>
                          )}
                      </div>
                    ) : (
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Passport Number</Label>
                    {isEditing ? (
                      <div>
                        <Input
                          id="passportNumber"
                          {...register("passportNumber")}
                        />
                        {user.passportNumber !==
                          watchedValues.passportNumber && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Previous:{" "}
                            <span className="font-medium">
                              {user.passportNumber || "Not set"}
                            </span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium">
                        {user.passportNumber || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Created At</Label>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <p className="font-medium">
                      {new Date(user.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>User Bookings</CardTitle>
              <CardDescription>All bookings made by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {user.bookings?.length > 0 ? (
                <div className="space-y-4">
                  {user.bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{booking.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No bookings found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visa-applications">
          <Card>
            <CardHeader>
              <CardTitle>Visa Applications</CardTitle>
              <CardDescription>
                All visa applications submitted by this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.visaApplications?.length > 0 ? (
                <div className="space-y-4">
                  {user.visaApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{application.country}</h4>
                          <p className="text-sm text-muted-foreground">
                            Applied:{" "}
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            application.status === "approved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {application.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No visa applications found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Changes"
        description="You're about to update the following fields. Please review the changes:"
        confirmText="Update User"
        onConfirm={confirmUpdate}
        loading={updateMutation.isLoading}
      >
        <div className="space-y-4">
          {Object.entries(pendingChanges).map(([key, value]) => (
            <FieldComparison
              key={key}
              label={
                key.charAt(0).toUpperCase() +
                key.slice(1).replace(/([A-Z])/g, " $1")
              }
              previous={user[key]}
              current={value}
            />
          ))}
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete User"
        description={`Are you sure you want to delete "${user.name}"? This action cannot be undone and will permanently remove all user data including bookings and visa applications.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isLoading}
      />
    </div>
  );
}
