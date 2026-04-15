// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import api from "@/lib/api";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function ChambersTab({ doctorId }) {
  const [loading, setLoading] = useState(false);
  const [chambers, setChambers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      chamberName: "",
      contactNumber: "",
      day: "",
      from: "",
      to: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zip: "",
      },
    },
  });

  // Fetch
  useEffect(() => {
    const fetchChambers = async () => {
      try {
        const res = await api.get(`/doctor/${doctorId}`);
        setChambers(res.data?.chambers || []);
      } catch {
        toast.error("Failed to fetch chambers");
      }
    };

    fetchChambers();
  }, [doctorId]);

  // Add / Update
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/doctor/${doctorId}/chamber/${editingId}`, data);
        toast.success("Chamber updated");
      } else {
        await api.post(`/doctor/${doctorId}/chamber`, data);
        toast.success("Chamber added");
      }

      const res = await api.get(`/doctor/${doctorId}`);
      setChambers(res.data.chambers);

      reset();
      setEditingId(null);
    } catch {
      toast.error("Failed to save chamber");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/doctor/${doctorId}/chamber/${id}`);

      toast.success("Chamber deleted");

      setChambers((prev) => prev.filter((c) => c._id !== id));
    } catch {
      toast.error("Failed to delete chamber");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Edit
  const handleEdit = (c) => {
    reset({
      chamberName: c.chamberName || "",
      contactNumber: c.contactNumber || "",
      day: c.day || "",
      from: c.from || "",
      to: c.to || "",
      address: {
        street: c.address?.street || "",
        city: c.address?.city || "",
        state: c.address?.state || "",
        country: c.address?.country || "",
        zip: c.address?.zip || "",
      },
    });
    setEditingId(c._id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chambers</CardTitle>
        <CardDescription>Manage doctor’s chambers</CardDescription>
      </CardHeader>

      <CardContent>
        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Chamber Name</Label>
              <Input {...register("chamberName", { required: true })} />
            </div>

            <div>
              <Label>Contact Number</Label>
              <Input {...register("contactNumber")} />
            </div>

            <div>
              <Label>Day</Label>
              <Controller
                control={control}
                name="day"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ].map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>From</Label>
              <Input type="time" {...register("from", { required: true })} />
            </div>

            <div>
              <Label>To</Label>
              <Input type="time" {...register("to", { required: true })} />
            </div>

            <div>
              <Label>Street</Label>
              <Input {...register("address.street")} />
            </div>

            <div>
              <Label>City</Label>
              <Input {...register("address.city")} />
            </div>

            <div>
              <Label>State</Label>
              <Input {...register("address.state")} />
            </div>

            <div>
              <Label>Country</Label>
              <Input {...register("address.country")} />
            </div>

            <div>
              <Label>Zip</Label>
              <Input {...register("address.zip")} />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : editingId
                ? "Update Chamber"
                : "Add Chamber"}
          </Button>

          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          )}
        </form>

        {/* LIST */}
        <div className="space-y-4">
          {chambers.length === 0 ? (
            <p className="text-gray-500">No chambers yet.</p>
          ) : (
            chambers.map((c) => (
              <div
                key={c._id}
                className="flex justify-between border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{c.chamberName}</p>
                  <p className="text-sm text-gray-600">
                    {c.day} | {c.from} - {c.to}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.address?.street}, {c.address?.city}, {c.address?.country}
                  </p>
                </div>

                <div className="flex gap-2">
                  {/* EDIT */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(c)}
                  >
                    Edit
                  </Button>

                  {/* DELETE CONFIRM */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chamber</AlertDialogTitle>

                        <AlertDialogDescription>
                          Are you sure you want to delete this chamber? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() => handleDelete(c._id)}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
