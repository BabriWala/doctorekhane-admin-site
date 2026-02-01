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

export default function AmbulancesPage() {
  const [search, setSearch] = useState(""); // client-side search (current page only)
  const [address, setAddress] = useState("");
  const [type, setType] = useState(""); // Basic | Advanced | ICU
  const [isAvailable, setIsAvailable] = useState(""); // "true" | "false" | ""

  // ✅ pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ✅ build params (ONLY those supported by backend)
  const params = useMemo(() => {
    const p = { page, limit }; // ✅ include pagination
    if (address.trim()) p.address = address.trim();
    if (type) p.type = type;
    if (isAvailable) p.isAvailable = isAvailable;
    return p;
  }, [address, type, isAvailable, page, limit]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["ambulances", params],
    queryFn: async () => {
      const res = await api.get("/ambulance", { params });
      return res.data; // ✅ return full payload (ambulances + pagination)
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
  const ambulances =
    data?.ambulances?.map((a) => ({
      id: a._id,
      vehicleNumber: a?.basicInfo?.vehicleNumber || "",
      type: a?.basicInfo?.type || "",
      driverName: a?.basicInfo?.driverName || "",
      phone: a?.contact?.phone || "",
      address: a?.address?.address || "",
      isAvailable: a?.availability?.isAvailable ?? false,
    })) || [];

  // ✅ client-side search (only within current page results)
  const filteredAmbulances = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return ambulances;

    return ambulances.filter((a) => {
      return (
        a.vehicleNumber.toLowerCase().includes(s) ||
        a.driverName.toLowerCase().includes(s) ||
        a.phone.toLowerCase().includes(s) ||
        a.address.toLowerCase().includes(s) ||
        a.type.toLowerCase().includes(s)
      );
    });
  }, [search, ambulances]);

  // ✅ when any filter changes, reset to page 1
  const resetToFirstPage = () => setPage(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ambulances</h1>
          <p className="text-gray-500">Search and manage ambulances</p>
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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Search (client-side on current page only) */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search vehicle / driver / phone (current page)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* address */}
        <Input
          placeholder="address (ex: Dhaka)"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            resetToFirstPage();
          }}
        />

        {/* Type */}
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white text-black dark:bg-gray-900 dark:text-white"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            resetToFirstPage();
          }}
        >
          <option value="">All Types</option>
          <option value="Basic">Basic</option>
          <option value="Advanced">Advanced</option>
          <option value="ICU">ICU</option>
        </select>

        {/* Availability */}
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white text-black dark:bg-gray-900 dark:text-white"
          value={isAvailable}
          onChange={(e) => {
            setIsAvailable(e.target.value);
            resetToFirstPage();
          }}
        >
          <option value="">All</option>
          <option value="true">Available</option>
          <option value="false">Busy</option>
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
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                address
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
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-red-500">
                  Failed to load ambulances
                </td>
              </tr>
            ) : filteredAmbulances.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No ambulances found.
                </td>
              </tr>
            ) : (
              filteredAmbulances.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {a.vehicleNumber}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{a.type}</td>
                  <td className="px-6 py-4 text-gray-600">{a.driverName}</td>
                  <td className="px-6 py-4 text-gray-600">{a.phone}</td>
                  <td className="px-6 py-4 text-gray-600">{a.address}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={a.isAvailable ? "default" : "secondary"}>
                      {a.isAvailable ? "Available" : "Busy"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Link href={`/admin/ambulances/${a.id}/edit`}>
                      <Button size="sm" variant="outline">
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
