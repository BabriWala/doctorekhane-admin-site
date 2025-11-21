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

export default function EducationTab({ doctorId }) {
  const [loading, setLoading] = useState(false);
  const [educationList, setEducationList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      degree: "",
      institution: "",
      yearOfCompletion: "",
    },
  });

  // Fetch doctor’s education
  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const res = await api.get(`/doctor/${doctorId}`);
        if (res.data?.education) {
          setEducationList(res.data.education);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch education"
        );
      }
    };
    fetchEducation();
  }, [doctorId, toast]);

  // Submit handler
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingId) {
        // Update
        await api.put(`/doctor/${doctorId}/education/${editingId}`, data);

        toast.success("Education updated");
      } else {
        // Add
        await api.post(`/doctor/${doctorId}/education`, data);

        toast.success("Education added");
      }

      // Refresh list
      const res = await api.get(`/doctor/${doctorId}`);
      setEducationList(res.data.education);

      // Reset with empty values ✅
      reset({
        degree: "",
        institution: "",
        yearOfCompletion: "",
      });
      setEditingId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save education");
    } finally {
      setLoading(false);
    }
  };

  // Delete education
  const handleDelete = async (educationId) => {
    try {
      await api.delete(`/doctor/${doctorId}/education/${educationId}`);


      toast.success("Education deleted");


      setEducationList((prev) => prev.filter((edu) => edu._id !== educationId));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete education"
      );
    }
  };

  // Edit handler
  const handleEdit = (edu) => {
    reset({
      degree: edu.degree,
      institution: edu.institution,
      yearOfCompletion: edu.yearOfCompletion,
    });
    setEditingId(edu._id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardDescription>
          Manage doctor’s education history (add, edit, delete)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Degree</Label>
              <Input
                {...register("degree", { required: true })}
                disabled={loading}
              />
              {errors.degree && (
                <p className="text-red-500 text-sm">Required</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Institution</Label>
              <Input
                {...register("institution", { required: true })}
                disabled={loading}
              />
              {errors.institution && (
                <p className="text-red-500 text-sm">Required</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Year of Completion</Label>
              <Input
                type="number"
                {...register("yearOfCompletion", { required: true })}
                disabled={loading}
              />
              {errors.yearOfCompletion && (
                <p className="text-red-500 text-sm">Required</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : editingId
              ? "Update Education"
              : "Add Education"}
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
          {educationList.length === 0 ? (
            <p className="text-gray-500">No education records yet.</p>
          ) : (
            educationList.map((edu) => (
              <div
                key={edu._id}
                className="flex items-center justify-between border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-sm text-gray-600">
                    {edu.institution} — {edu.yearOfCompletion}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(edu)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(edu._id)}
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
