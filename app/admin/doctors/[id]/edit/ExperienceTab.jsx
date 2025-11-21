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

export default function ExperienceTab({ doctorId }) {
  const [loading, setLoading] = useState(false);
  const [experienceList, setExperienceList] = useState([]);
  const [editingId, setEditingId] = useState(null);

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

  // Fetch doctor’s experience
  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const res = await api.get(`/doctor/${doctorId}`);
        if (res.data?.experience) {
          setExperienceList(res.data.experience);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch experience"
        );
      }
    };
    fetchExperience();
  }, [doctorId, toast]);

  // Add or Update experience
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

      // Refresh list
      const res = await api.get(`/doctor/${doctorId}`);
      setExperienceList(res.data.experience);

      reset({
        hospitalName: "",
        role: "",
        years: "",
        from: "",
        to: "",
      });
      setEditingId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save experience");
    } finally {
      setLoading(false);
    }
  };

  // Delete experience
  const handleDelete = async (experienceId) => {
    try {
      await api.delete(`/doctor/${doctorId}/experience/${experienceId}`);
      toast.success("Experience deleted");

      setExperienceList((prev) =>
        prev.filter((exp) => exp._id !== experienceId)
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete experience"
      );
    }
  };

  // Edit experience
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
        <CardDescription>
          Manage doctor’s work experience (add, edit, delete)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Hospital Name</Label>
              <Input
                {...register("hospitalName", { required: true })}
                disabled={loading}
              />
              {errors.hospitalName && (
                <p className="text-red-500 text-sm">Required</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Input
                {...register("role", { required: true })}
                disabled={loading}
              />
              {errors.role && <p className="text-red-500 text-sm">Required</p>}
            </div>
            <div className="space-y-1">
              <Label>Years</Label>
              <Input
                type="number"
                {...register("years", { required: true })}
                disabled={loading}
              />
              {errors.years && <p className="text-red-500 text-sm">Required</p>}
            </div>
            <div className="space-y-1">
              <Label>From</Label>
              <Input type="date" {...register("from")} disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label>To</Label>
              <Input type="date" {...register("to")} disabled={loading} />
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
                reset({
                  hospitalName: "",
                  role: "",
                  years: "",
                  from: "",
                  to: "",
                });
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          )}
        </form>

        {/* List */}
        <div className="space-y-4">
          {experienceList.length === 0 ? (
            <p className="text-gray-500">No experience records yet.</p>
          ) : (
            experienceList.map((exp) => (
              <div
                key={exp._id}
                className="flex items-center justify-between border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{exp.hospitalName}</p>
                  <p className="text-sm text-gray-600">
                    {exp.role} — {exp.years} years
                  </p>
                  {exp.from && (
                    <p className="text-xs text-gray-500">
                      {exp.from?.split("T")[0]} →{" "}
                      {exp.to ? exp.to.split("T")[0] : "Present"}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(exp)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(exp._id)}
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
