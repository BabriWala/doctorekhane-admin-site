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

export default function ContactTab({ ambulanceId }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: "",
      alternatePhone: "",
      email: "",
    },
  });

  // Fetch current ambulance contact info
  useEffect(() => {
    const fetchAmbulance = async () => {
      try {
        const res = await api.get(`/ambulance/${ambulanceId}`);
        if (res.data?.ambulance?.contact) {
          reset(res.data.ambulance.contact);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch contact info",
        );
      }
    };
    fetchAmbulance();
  }, [ambulanceId, reset, toast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.put(`/ambulance/${ambulanceId}/contact`, data);

      toast.success("Ambulance contact updated successfully"); // ✅ success toast

      reset(res.data.data.contact);
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
        <CardDescription>Update ambulance contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                {...register("phone", { required: "Phone number is required" })}
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Alternate Phone</Label>
              <Input {...register("alternatePhone")} disabled={loading} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} disabled={loading} />
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
