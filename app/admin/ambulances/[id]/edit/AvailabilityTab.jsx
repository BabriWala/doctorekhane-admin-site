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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function AvailabilityTab({ ambulanceId }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isAvailable: true,
      lastServiceDate: "",
      notes: "",
    },
  });

  // Fetch current ambulance availability info
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get(`/ambulance/${ambulanceId}`);
        if (res.data?.ambulance?.availability) {
          const data = {
            ...res.data.ambulance.availability,
            lastServiceDate: res.data.ambulance.availability.lastServiceDate
              ? res.data.ambulance.availability.lastServiceDate.split("T")[0]
              : "",
          };
          reset(data);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch availability info",
        );
      }
    };
    fetchAvailability();
  }, [ambulanceId, reset, toast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.put(`/ambulance/${ambulanceId}/availability`, data);

      toast.success("Ambulance availability updated successfully"); // ✅ success toast

      reset(res.data.data.availability);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update availability",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>
          Update ambulance availability information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Available</Label>
              <select
                {...register("isAvailable")}
                disabled={loading}
                className="border rounded px-2 py-1 w-full bg-black"
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </select>
            </div>

            {/* <div className="space-y-1">
              <Label>Last Service Date</Label>
              <Input
                type="date"
                {...register("lastServiceDate")}
                disabled={loading}
              />
            </div> */}

            <div className="md:col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea {...register("notes")} rows={4} disabled={loading} />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Availability"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
