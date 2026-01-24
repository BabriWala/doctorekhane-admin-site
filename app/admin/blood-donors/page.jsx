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

export default function BloodDonorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDonor, setDeleteDonor] = useState(null);

  const queryClient = useQueryClient();

  // Fetch blood donors
  const { data, isLoading } = useQuery({
    queryKey: ["blood-donors", searchTerm],
    queryFn: async () => {
      const res = await api.get("/blood-donor", {
        params: { search: searchTerm },
      });
      return res.data.donors; // API returns { count, donors }
    },
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when tab/window regains focus
    refetchOnReconnect: true, // Refetch if browser reconnects to network
  });

  // Delete donor mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/blood-donor/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["blood-donors"]);
      toast.success("Blood donor deleted successfully");

      setDeleteDonor(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete donor");
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blood Donors</h1>
          <p className="text-gray-500">Manage registered blood donors</p>
        </div>
        <Button asChild>
          <Link
            href="/admin/blood-donors/create"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Donor
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search donors by name or city..."
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
                Blood Group
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
                  No donors found.
                </td>
              </tr>
            ) : (
              data.map((donor) => (
                <tr key={donor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {donor.basicInfo?.firstName}
                    {donor.basicInfo?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {donor.basicInfo?.bloodGroup}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {donor.address?.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {donor.contact?.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        donor.donationInfo?.isActive ? "default" : "secondary"
                      }
                    >
                      {donor.donationInfo?.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center gap-2">
                    {/* <Link href={`/admin/blood-donors/${donor._id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link> */}
                    <Link href={`/admin/blood-donors/${donor._id}/edit`}>
                      <Button size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDonor(donor)}
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
        open={!!deleteDonor}
        onOpenChange={() => setDeleteDonor(null)}
        title="Delete Blood Donor"
        description={`Are you sure you want to delete "${deleteDonor?.basicInfo?.name}"? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate(deleteDonor._id)}
        loading={deleteMutation.isLoading}
      />
    </div>
  );
}
