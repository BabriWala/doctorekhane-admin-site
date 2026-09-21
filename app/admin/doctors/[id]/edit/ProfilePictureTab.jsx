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

export default function ProfilePictureTab({ doctorId }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  // Fetch current profile picture
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctor/${doctorId}`);
        if (res.data?.personalDetails?.profilePicture) {
          setProfilePicture(res.data.personalDetails.profilePicture);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch profile picture"
        );
      }
    };
    fetchDoctor();
  }, [doctorId, toast]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();

    try {
      const fileInput = e.target.elements.profilePicture;
      if (!fileInput.files[0]) {
        toast.error("Please select a file first");
        return;
      }
      const formData = new FormData();
      formData.append("profilePicture", fileInput.files[0]);
      setLoading(true);
      const res = await api.put(
        `/doctor/${doctorId}/profile-picture`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setProfilePicture(res.data.profilePicture);
      setPreview(null);
      e.target.reset();
      toast.success("Profile picture updated successfully"); // ✅ success toast
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile picture"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload or update doctor’s profile picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Profile Picture */}
        {profilePicture && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Current Picture:</p>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${profilePicture}`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border"
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
              className="w-32 h-32 rounded-full object-cover border"
            />
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-4">
          <input type="file" name="profilePicture" accept="image/*" onChange={handleFileChange} disabled={loading} />
          <Button type="submit" disabled={loading || !preview}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
