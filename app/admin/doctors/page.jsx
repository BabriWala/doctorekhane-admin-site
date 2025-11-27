// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDoctor, setDeleteDoctor] = useState(null);

  const queryClient = useQueryClient();

  // Fetch doctors
  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors", searchTerm],
    queryFn: async () => {
      const response = await api.get("/doctor", {
        params: { search: searchTerm },
      });
      return response.data.data; // <-- FIXED
    },
  });

  // Flatten doctors data
  const flattenedDoctors =
    doctors?.map((doc) => ({
      id: doc?.id,
      firstName: doc?.personalDetails?.firstName || "",
      middleName: doc?.personalDetails?.middleName || "",
      lastName: doc?.personalDetails?.lastName || "",
      email: doc?.personalDetails?.email || "",
      phone: doc?.personalDetails?.phone || "",
      status: doc?.status || "N/A",
    })) || [];

  // Delete doctor mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/doctor/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
      toast.success("Doctor deleted successfully");
      setDeleteDoctor(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete doctor");
    },
  });
  console.log(flattenedDoctors);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctors</h1>
          <p className="text-gray-500">Manage your doctors</p>
        </div>
        <Button asChild>
          <Link
            href="/admin/doctors/create"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Doctor
          </Link>
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : flattenedDoctors.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No doctors found.
                </td>
              </tr>
            ) : (
              flattenedDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {doc.firstName} {doc.middleName ? doc.middleName + " " : ""}
                    {doc.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {doc.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {doc.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        doc.status === "active" ? "default" : "secondary"
                      }
                    >
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center gap-2">
                    {/* <Link href={`/admin/doctors/${doc.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link> */}
                    <Link href={`/admin/doctors/${doc.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDoctor(doc)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={!!deleteDoctor}
        onOpenChange={() => setDeleteDoctor(null)}
        title="Delete Doctor"
        description={`Are you sure you want to delete "${deleteDoctor?.firstName} ${deleteDoctor?.lastName}"? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate(deleteDoctor.id)}
        loading={deleteMutation.isLoading}
      />
    </div>
  );
}
