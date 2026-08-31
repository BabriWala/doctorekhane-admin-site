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

export default function DepartmentsTab({ hospitalId }) {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", servicesText: "" },
  });

  // Fetch hospital departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const [res, doctorsRes] = await Promise.all([api.get(`/hospital/${hospitalId}`), api.get("/doctor", { params: { page: 1, limit: 100, admin: true } })]);
        if (res.data?.departments) {
          setDepartments(res.data.departments);
        }
        setAvailableDoctors(doctorsRes.data?.data || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch departments"
        );
      }
    };
    fetchDepartments();
  }, [hospitalId, toast]);

  // Add or Update department
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingId) {
        const res = await api.put(
          `/hospital/${hospitalId}/departments/${editingId}`,
          { name: data.name, services: String(data.servicesText || "").split(",").map((item) => item.trim()).filter(Boolean), doctors: selectedDoctors }
        );

        toast.success("Department updated");
      } else {
        const res = await api.post(`/hospital/${hospitalId}/departments`, { name: data.name, services: String(data.servicesText || "").split(",").map((item) => item.trim()).filter(Boolean), doctors: selectedDoctors });

        toast.success("Department added");
      }

      // Refresh list
      const res = await api.get(`/hospital/${hospitalId}`);
      setDepartments(res.data.departments);

      reset({ name: "", servicesText: "" });
      setEditingId(null);
      setSelectedDoctors([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save department");
    } finally {
      setLoading(false);
    }
  };

  // Edit department
  const handleEdit = (dept) => {
    reset({ name: dept.name, servicesText: (dept.services || []).join(", ") });
    setEditingId(dept._id);
    setSelectedDoctors((dept.doctors || []).map((doctor) => doctor._id || doctor));
  };

  // Delete department
  const handleDelete = async (departmentId) => {
    try {
      await api.delete(`/hospital/${hospitalId}/departments/${departmentId}`);

      toast.success("Department deleted");

      setDepartments((prev) =>
        prev.filter((dept) => dept._id !== departmentId)
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete department"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Departments</CardTitle>
        <CardDescription>
          Manage hospital departments (add, edit, delete)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Department Name *</Label>
              <Input
                {...register("name", {
                  required: "Department name is required",
                })}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1"><Label>Department Services</Label><Input {...register("servicesText")} placeholder="Consultation, Surgery, Diagnostics" disabled={loading} /></div>
          </div>
          <div className="space-y-2"><Label>Doctors in this department</Label><div className="grid max-h-48 gap-2 overflow-y-auto rounded-md border p-3 md:grid-cols-2">{availableDoctors.map((doctor) => { const id = doctor._id || doctor.id; const name = `${doctor.personalDetails?.firstName || ""} ${doctor.personalDetails?.lastName || ""}`.trim(); return <label key={id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedDoctors.includes(id)} onChange={(event) => setSelectedDoctors((current) => event.target.checked ? [...current, id] : current.filter((item) => item !== id))} />{name || id}</label>; })}</div></div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingId
                ? "Update Department"
                : "Add Department"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset({ name: "", servicesText: "" });
                  setEditingId(null);
                  setSelectedDoctors([]);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>

        {/* List */}
        <div className="space-y-4">
          {departments.length === 0 ? (
            <p className="text-gray-500">No departments yet.</p>
          ) : (
            departments.map((dept) => (
              <div
                key={dept._id}
                className="flex items-center justify-between border p-3 rounded-lg"
              >
                <div><p className="font-medium">{dept.name}</p>{dept.services?.length > 0 && <p className="text-sm text-muted-foreground">{dept.services.join(", ")}</p>}</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(dept)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(dept._id)}
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
