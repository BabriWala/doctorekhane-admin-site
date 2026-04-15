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

export default function ExperienceTab({ doctorId }) {
  const [loading, setLoading] = useState(false);
  const [experienceList, setExperienceList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      hospitalName: "",
      role: "",
      years: "",
      from: "",
      to: "",
    },
  });

  // Fetch
  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const res = await api.get(`/doctor/${doctorId}`);
        setExperienceList(res.data?.experience || []);
      } catch {
        toast.error("Failed to fetch experience");
      }
    };

    fetchExperience();
  }, [doctorId]);

  // Add / Update
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/doctor/${doctorId}/experience/${editingId}`, data);
        toast.success("Experience updated");
      } else {
        await api.post(`/doctor/${doctorId}/experience`, data);
        toast.success("Experience added");
      }

      const res = await api.get(`/doctor/${doctorId}`);
      setExperienceList(res.data.experience);

      reset();
      setEditingId(null);
    } catch {
      toast.error("Failed to save experience");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/doctor/${doctorId}/experience/${id}`);

      toast.success("Experience deleted");

      setExperienceList((prev) => prev.filter((exp) => exp._id !== id));
    } catch {
      toast.error("Failed to delete experience");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Edit
  const handleEdit = (exp) => {
    reset({
      hospitalName: exp.hospitalName,
      role: exp.role,
      years: exp.years,
      from: exp.from ? exp.from.split("T")[0] : "",
      to: exp.to ? exp.to.split("T")[0] : "",
    });
    setEditingId(exp._id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience</CardTitle>
        <CardDescription>Manage doctor’s work experience</CardDescription>
      </CardHeader>

      <CardContent>
        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Hospital Name</Label>
              <Input {...register("hospitalName", { required: true })} />
            </div>

            <div>
              <Label>Role</Label>
              <Input {...register("role", { required: true })} />
            </div>

            <div>
              <Label>Years</Label>
              <Input type="number" {...register("years", { required: true })} />
            </div>

            <div>
              <Label>From</Label>
              <Input type="date" {...register("from")} />
            </div>

            <div>
              <Label>To</Label>
              <Input type="date" {...register("to")} />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : editingId
                ? "Update Experience"
                : "Add Experience"}
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
          {experienceList.length === 0 ? (
            <p className="text-gray-500">No experience records yet.</p>
          ) : (
            experienceList.map((exp) => (
              <div
                key={exp._id}
                className="flex justify-between border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{exp.hospitalName}</p>
                  <p className="text-sm text-gray-600">
                    {exp.role} — {exp.years} years
                  </p>
                  {exp.from && (
                    <p className="text-xs text-gray-500">
                      {exp.from.split("T")[0]} →{" "}
                      {exp.to ? exp.to.split("T")[0] : "Present"}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* EDIT */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(exp)}
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
                        <AlertDialogTitle>Delete Experience</AlertDialogTitle>

                        <AlertDialogDescription>
                          Are you sure you want to delete this experience? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() => handleDelete(exp._id)}
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
