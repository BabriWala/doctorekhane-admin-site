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

export default function EducationTab({ doctorId }) {
  const [loading, setLoading] = useState(false);
  const [educationList, setEducationList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  // Fetch education
  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const res = await api.get(`/doctor/${doctorId}`);
        setEducationList(res.data?.education || []);
      } catch (error) {
        toast.error("Failed to fetch education");
      }
    };

    fetchEducation();
  }, [doctorId]);

  // Add / Update
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/doctor/${doctorId}/education/${editingId}`, data);
        toast.success("Education updated");
      } else {
        await api.post(`/doctor/${doctorId}/education`, data);
        toast.success("Education added");
      }

      const res = await api.get(`/doctor/${doctorId}`);
      setEducationList(res.data.education);

      reset();
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to save education");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/doctor/${doctorId}/education/${id}`);

      toast.success("Education deleted");

      setEducationList((prev) => prev.filter((edu) => edu._id !== id));
    } catch (error) {
      toast.error("Failed to delete education");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Edit
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
        <CardDescription>Manage doctor’s education history</CardDescription>
      </CardHeader>

      <CardContent>
        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Degree</Label>
              <Input {...register("degree")} disabled={loading} />
            </div>

            <div>
              <Label>Institution</Label>
              <Input {...register("institution")} disabled={loading} />
            </div>

            <div>
              <Label>Year</Label>
              <Input
                type="number"
                {...register("yearOfCompletion")}
                disabled={loading}
              />
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

        {/* LIST */}
        <div className="space-y-4">
          {educationList.length === 0 ? (
            <p className="text-gray-500">No education records yet.</p>
          ) : (
            educationList.map((edu) => (
              <div
                key={edu._id}
                className="flex justify-between border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-sm text-gray-600">
                    {edu.institution} — {edu.yearOfCompletion}
                  </p>
                </div>

                <div className="flex gap-2">
                  {/* EDIT */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(edu)}
                  >
                    Edit
                  </Button>

                  {/* DELETE WITH ALERT DIALOG */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Education</AlertDialogTitle>

                        <AlertDialogDescription>
                          Are you sure you want to delete this record? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() => handleDelete(edu._id)}
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
