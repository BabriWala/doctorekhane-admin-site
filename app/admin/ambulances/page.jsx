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

export default function AmbulancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteAmbulance, setDeleteAmbulance] = useState(null);

  const queryClient = useQueryClient();

  // Fetch ambulances
  const { data, isLoading } = useQuery({
    queryKey: ["ambulances", searchTerm],
    queryFn: async () => {
      const res = await api.get("/ambulance", {
        params: { search: searchTerm },
      });
      return res.data.ambulances;
    },
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when tab/window regains focus
    refetchOnReconnect: true, // Refetch if browser reconnects to network
  });

  // Delete ambulance mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/ambulance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["ambulances"]);
      toast.error("Ambulance deleted successfully");
      setDeleteAmbulance(null);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete ambulance"
      );
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ambulances</h1>
          <p className="text-gray-500">Manage registered ambulances</p>
        </div>
        <Button asChild>
          <Link
            href="/admin/ambulances/create"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Ambulance
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search ambulances by city or type..."
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
                Driver Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
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
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No ambulances found.
                </td>
              </tr>
            ) : (
              data.map((ambulance) => (
                <tr key={ambulance._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {ambulance.basicInfo?.driverName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {ambulance.basicInfo?.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {ambulance.address?.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {ambulance.contact?.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        ambulance.availability?.isAvailable
                          ? "default"
                          : "secondary"
                      }
                    >
                      {ambulance.availability?.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center gap-2">
                    {/* <Link href={`/admin/ambulances/${ambulance._id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link> */}
                    <Link href={`/admin/ambulances/${ambulance._id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteAmbulance(ambulance)}
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

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteAmbulance}
        onOpenChange={() => setDeleteAmbulance(null)}
        title="Delete Ambulance"
        description={`Are you sure you want to delete "${deleteAmbulance?.basicInfo?.vehicleName}"? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate(deleteAmbulance._id)}
        loading={deleteMutation.isLoading}
      />
    </div>
  );
}
