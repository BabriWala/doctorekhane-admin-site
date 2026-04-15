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

export default function SpecializationTab({ doctorId }) {
  const [loading, setLoading] = useState(false);
  const [specializationList, setSpecializationList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { field: "", description: "" },
  });

  // Fetch
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const res = await api.get(`/doctor/${doctorId}`);
        setSpecializationList(res.data?.specialization || []);
      } catch {
        toast.error("Failed to fetch specializations");
      }
    };

    fetchSpecializations();
  }, [doctorId]);

  // Add / Update
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

      reset();
      setEditingId(null);
    } catch {
      toast.error("Failed to save specialization");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/doctor/${doctorId}/specialization/${id}`);

      toast.success("Specialization deleted");

      setSpecializationList((prev) => prev.filter((s) => s._id !== id));
    } catch {
      toast.error("Failed to delete specialization");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Edit
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
        <CardDescription>Manage doctor’s specializations</CardDescription>
      </CardHeader>

      <CardContent>
        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Field</Label>
              <Input {...register("field", { required: true })} />
              {errors.field && <p className="text-red-500 text-sm">Required</p>}
            </div>

            <div>
              <Label>Description</Label>
              <Input {...register("description")} />
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
          {specializationList.length === 0 ? (
            <p className="text-gray-500">No specialization records yet.</p>
          ) : (
            specializationList.map((spec) => (
              <div
                key={spec._id}
                className="flex justify-between border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{spec.field}</p>
                  {spec.description && (
                    <p className="text-sm text-gray-600">{spec.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* EDIT */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(spec)}
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
                        <AlertDialogTitle>
                          Delete Specialization
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                          Are you sure you want to delete this specialization?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() => handleDelete(spec._id)}
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
