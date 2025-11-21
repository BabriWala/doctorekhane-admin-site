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

export default function ImagesTab({ hospitalId }) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);

  // Fetch current hospital images on mount
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await api.get(`/hospital/${hospitalId}`);
        if (res.data?.basicInfo?.images) {
          setImages(res.data.basicInfo.images);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch hospital images"
        );
      }
    };
    fetchHospital();
  }, [hospitalId, toast]);

  // Handle file select for new uploads
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPreviewFiles(
      files.map((file) => ({ file, url: URL.createObjectURL(file) }))
    );
  };

  // Handle images upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (previewFiles.length === 0) {
      toast.error(
        error.response?.data?.message || "Please select at least one image"
      );
      return;
    }

    const formData = new FormData();
    previewFiles.forEach((p) => formData.append("images", p.file));

    try {
      setLoading(true);
      const res = await api.post(`/hospital/${hospitalId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImages(res.data.images);
      setPreviewFiles([]);

      toast.success("Images uploaded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload images");
    } finally {
      setLoading(false);
    }
  };

  // Handle image delete
  const handleDelete = async (image) => {
    const imageId = image.split("/").pop();
    try {
      setLoading(true);
      const res = await api.delete(`/hospital/${hospitalId}/images/${imageId}`);
      setImages(res.data.images);
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Images</CardTitle>
        <CardDescription>
          Upload, preview, and manage hospital images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Images */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img} className="relative">
                <img
                  src={
                    img.startsWith("http")
                      ? img
                      : `${process.env.NEXT_PUBLIC_API_URL}${img}`
                  }
                  alt="Hospital"
                  className="w-full h-32 object-cover rounded border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={() => handleDelete(img)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Preview Selected Images */}
        {previewFiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewFiles.map((p, idx) => (
              <div key={idx} className="relative">
                <img
                  src={p.url}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded border"
                />
              </div>
            ))}
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-2">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload Images"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
