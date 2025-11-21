// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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

export default function SpecializationTab({ doctorId }) {
  const [loading, setLoading] = useState(false);
  const [specializationList, setSpecializationList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { field: "", description: "" },
  });

  // Fetch doctor's specializations
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const res = await api.get(`/doctor/${doctorId}`);
        if (res.data?.specialization) {
          setSpecializationList(res.data.specialization);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch specializations"
        );
      }
    };
    fetchSpecializations();
  }, [doctorId, toast]);

  // Add or Update specialization
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/doctor/${doctorId}/specialization/${editingId}`, data);

        toast.success("Specialization updated");
      } else {
        await api.post(`/doctor/${doctorId}/specialization`, data);

        toast.success("Specialization added");
      }

      const res = await api.get(`/doctor/${doctorId}`);
      setSpecializationList(res.data.specialization);

      reset({ field: "", description: "" });
      setEditingId(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save specialization"
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete specialization
  const handleDelete = async (id) => {
    try {
      await api.delete(`/doctor/${doctorId}/specialization/${id}`);
      toast.success("Specialization deleted");
      setSpecializationList((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete specialization"
      );
    }
  };

  // Edit specialization
  const handleEdit = (spec) => {
    reset({
      field: spec.field,
      description: spec.description || "",
    });
    setEditingId(spec._id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specialization</CardTitle>
        <CardDescription>
          Manage doctor’s specializations (add, edit, delete)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Field</Label>
              <Input
                {...register("field", { required: true })}
                disabled={loading}
              />
              {errors.field && <p className="text-red-500 text-sm">Required</p>}
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input {...register("description")} disabled={loading} />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : editingId
              ? "Update Specialization"
              : "Add Specialization"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset({ field: "", description: "" });
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          )}
        </form>

        {/* List */}
        <div className="space-y-4">
          {specializationList.length === 0 ? (
            <p className="text-gray-500">No specialization records yet.</p>
          ) : (
            specializationList.map((spec) => (
              <div
                key={spec._id}
                className="flex items-center justify-between border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{spec.field}</p>
                  {spec.description && (
                    <p className="text-sm text-gray-600">{spec.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(spec)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(spec._id)}
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
