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

export default function ContactTab({ donorId }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: "",
      email: "",
      website: "",
    },
  });

  // Fetch current donor contact info
  useEffect(() => {
    const fetchDonor = async () => {
      try {
        const res = await api.get(`/blood-donor/${donorId}`);
        if (res.data?.donor?.contact) {
          reset(res.data.donor.contact);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch contact info",
        );
      }
    };
    fetchDonor();
  }, [donorId, reset, toast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.put(`/blood-donor/${donorId}/contact`, data);

      toast.success("Blood donor contact updated successfully"); // ✅ success toast

      reset(res.data.contact);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update contact info",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact</CardTitle>
        <CardDescription>
          Update blood donor contact information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Phone *</Label>
              <Input
                {...register("phone", { required: "Phone number is required" })}
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input
                type="email"
                {...register("email", { required: "Email is required" })}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Website</Label>
              <Input {...register("website")} disabled={loading} />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Contact"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
