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

export default function ChambersTab({ doctorId }) {
  const [loading, setLoading] = useState(false);
  const [chambers, setChambers] = useState([]);
  const [editingId, setEditingId] = useState(null);

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

  // Fetch chambers
  useEffect(() => {
    const fetchChambers = async () => {
      try {
        const res = await api.get(`/doctor/${doctorId}`);
        if (res.data?.chambers) {
          setChambers(res.data.chambers);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch chambers"
        );
      }
    };
    fetchChambers();
  }, [doctorId, toast]);

  // Add or update chamber
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/doctor/${doctorId}/chamber/${editingId}`, data);

        toast.success("AChamber updated");
      } else {
        await api.post(`/doctor/${doctorId}/chamber`, data);

        toast.success("Chamber added");
      }

      // Refresh list
      const res = await api.get(`/doctor/${doctorId}`);
      setChambers(res.data.chambers);

      reset();
      setEditingId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save chamber");
    } finally {
      setLoading(false);
    }
  };

  // Delete chamber
  const handleDelete = async (chamberId) => {
    try {
      await api.delete(`/doctor/${doctorId}/chamber/${chamberId}`);
      toast.success("Chamber deleted");

      setChambers((prev) => prev.filter((c) => c._id !== chamberId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete chamber");
    }
  };

  // Edit chamber
  const handleEdit = (chamber) => {
    reset({
      chamberName: chamber.chamberName || "",
      contactNumber: chamber.contactNumber || "",
      day: chamber.day || "",
      from: chamber.from || "",
      to: chamber.to || "",
      address: {
        street: chamber.address?.street || "",
        city: chamber.address?.city || "",
        state: chamber.address?.state || "",
        country: chamber.address?.country || "",
        zip: chamber.address?.zip || "",
      },
    });
    setEditingId(chamber._id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chambers</CardTitle>
        <CardDescription>
          Manage doctor’s chambers (add, edit, delete)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Chamber Name</Label>
              <Input
                {...register("chamberName", { required: true })}
                disabled={loading}
              />
              {errors.chamberName && (
                <p className="text-red-500 text-sm">Required</p>
              )}
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input {...register("contactNumber")} disabled={loading} />
            </div>
            <div>
              <Label>Day</Label>
              <Controller
                control={control}
                name="day"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading}
                  >
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
              {errors.day && <p className="text-red-500 text-sm">Required</p>}
            </div>
            <div>
              <Label>From</Label>
              <Input
                type="time"
                {...register("from", { required: true })}
                disabled={loading}
              />
            </div>
            <div>
              <Label>To</Label>
              <Input
                type="time"
                {...register("to", { required: true })}
                disabled={loading}
              />
            </div>
            <div>
              <Label>Street</Label>
              <Input {...register("address.street")} disabled={loading} />
            </div>
            <div>
              <Label>City</Label>
              <Input {...register("address.city")} disabled={loading} />
            </div>
            <div>
              <Label>State</Label>
              <Input {...register("address.state")} disabled={loading} />
            </div>
            <div>
              <Label>Country</Label>
              <Input {...register("address.country")} disabled={loading} />
            </div>
            <div>
              <Label>Zip</Label>
              <Input {...register("address.zip")} disabled={loading} />
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

        {/* List */}
        <div className="space-y-4">
          {chambers.length === 0 ? (
            <p className="text-gray-500">No chambers yet.</p>
          ) : (
            chambers.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between border p-3 rounded-lg"
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(c)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(c._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
