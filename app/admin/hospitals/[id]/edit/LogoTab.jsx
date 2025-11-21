// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LogoTab({ hospitalId }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [logo, setLogo] = useState(null);

  // Fetch current logo on mount
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await api.get(`/hospital/${hospitalId}`);
        if (res.data?.basicInfo?.logo) {
          setLogo(res.data.basicInfo.logo);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch hospital logo"
        );
      }
    };
    fetchHospital();
  }, [hospitalId, toast]);

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();
    const fileInput = e.target.elements.logo;
    if (!fileInput.files[0]) {
      toast.success("Please select a file first");

      return;
    }

    const formData = new FormData();
    formData.append("logo", fileInput.files[0]);

    try {
      setLoading(true);
      const res = await api.put(`/hospital/${hospitalId}/logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLogo(res.data.logo);
      setPreview(null);

      toast.success("Hospital logo updated successfully"); // ✅ success toast
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update hospital logo"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Logo</CardTitle>
        <CardDescription>Upload or update hospital logo</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Logo */}
        {logo && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Current Logo:</p>
            <img
              src={
                logo.startsWith("http")
                  ? logo
                  : `${process.env.NEXT_PUBLIC_API_URL}${logo}`
              }
              alt="Logo"
              className="w-32 h-32 rounded object-cover border"
            />
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 rounded object-cover border"
            />
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
