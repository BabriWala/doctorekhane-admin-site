// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function BloodDonorPage() {
  const [search, setSearch] = useState(""); // client-side search (current page only)
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [isActive, setIsActive] = useState(""); // "true" | "false" | ""

  // ✅ pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ✅ build params (ONLY those supported by backend)
  const params = useMemo(() => {
    const p = { page, limit }; // ✅ include pagination
    // if (address.trim()) p.address = address.trim();
    if (bloodGroup) p.bloodGroup = bloodGroup;
    if (isActive) p.isActive = isActive; // backend converts to boolean
    return p;
  }, [address, bloodGroup, isActive, page, limit]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["blood-donors", params],
    queryFn: async () => {
      const res = await api.get("/blood-donor", { params });
      return res.data; // ✅ return full payload (donors + pagination)
    },
    refetchOnMount: "always",
    staleTime: 0,
    refetchOnWindowFocus: true,
    keepPreviousData: true, // ✅ smoother pagination
  });

  const pagination = data?.pagination || {
    totalItems: 0,
    totalPages: 1,
    currentPage: page,
    pageSize: limit,
  };

  // ✅ map essential fields
  const donors =
    data?.donors?.map((d) => ({
      id: d._id,
      name: `${d?.basicInfo?.firstName || ""} ${d?.basicInfo?.lastName || ""}`.trim(),
      bloodGroup: d?.basicInfo?.bloodGroup || "",
      phone: d?.contact?.phone || "",
      address: d?.address?.address || "",
      isActive: d?.donationInfo?.isActive ?? false,
    })) || [];

  // ✅ client-side search (only within current page results)
  const filteredDonors = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return donors;

    return donors.filter((d) => {
      return (
        d.name.toLowerCase().includes(s) ||
        d.phone.toLowerCase().includes(s) ||
        d.address.toLowerCase().includes(s) ||
        d.bloodGroup.toLowerCase().includes(s)
      );
    });
  }, [search, donors]);

  // ✅ when any filter changes, reset to page 1
  const resetToFirstPage = () => setPage(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blood Donors</h1>
          <p className="text-gray-500">Search and manage blood donors</p>
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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search (client-side on current page only) */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search name / address / phone (current page)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* address */}
        {/* <Input
          placeholder="address (ex: Dhaka)"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            resetToFirstPage();
          }}
        /> */}

        {/* Blood Group */}
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white text-black dark:bg-gray-900 dark:text-white"
          value={bloodGroup}
          onChange={(e) => {
            setBloodGroup(e.target.value);
            resetToFirstPage();
          }}
        >
          <option value="">All Groups</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        {/* Active */}
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white text-black dark:bg-gray-900 dark:text-white"
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value);
            resetToFirstPage();
          }}
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Status line */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>{isFetching ? "Refreshing..." : ""}</div>

        {/* Page size */}
        <div className="flex items-center gap-2">
          <span>Rows:</span>
          <select
            className="border rounded-md px-2 py-1 bg-white text-black dark:bg-gray-900 dark:text-white"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Blood Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Address
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
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
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-red-500">
                  Failed to load donors
                </td>
              </tr>
            ) : filteredDonors.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No donors found.
                </td>
              </tr>
            ) : (
              filteredDonors.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {d.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{d.bloodGroup}</td>
                  <td className="px-6 py-4 text-gray-600">{d.phone}</td>
                  <td className="px-6 py-4 text-gray-600">{d.address}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={d.isActive ? "default" : "secondary"}>
                      {d.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Link href={`/admin/blood-donors/${d.id}/edit`}>
                      <Button size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Total: <span className="font-medium">{pagination.totalItems}</span> •
          Page <span className="font-medium">{pagination.currentPage}</span> of{" "}
          <span className="font-medium">{pagination.totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pagination.currentPage <= 1}
          >
            Prev
          </Button>

          {/* simple page numbers (max 5) */}
          {Array.from(
            { length: Math.min(5, pagination.totalPages) },
            (_, i) => {
              const start = Math.max(1, pagination.currentPage - 2);
              const pageNum = start + i;
              if (pageNum > pagination.totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={
                    pageNum === pagination.currentPage ? "default" : "outline"
                  }
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            },
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={pagination.currentPage >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
