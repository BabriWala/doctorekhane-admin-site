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

export default function AddressTab({ ambulanceId }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      city: "",
      area: "",
      addressLine: "",
      latitude: "",
      longitude: "",
    },
  });

  // Fetch current ambulance address
  useEffect(() => {
    const fetchAmbulance = async () => {
      try {
        const res = await api.get(`/ambulance/${ambulanceId}`);
        if (res.data?.ambulance?.address) {
          reset(res.data.ambulance.address);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch ambulance address",
        );
      }
    };
    fetchAmbulance();
  }, [ambulanceId, reset, toast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.put(`/ambulance/${ambulanceId}/address`, data);

      toast.success("Ambulance address updated successfully"); // ✅ success toast

      reset(res.data.data.address);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address</CardTitle>
        <CardDescription>Update ambulance address details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div className="space-y-1">
              <Label>City</Label>
              <Input
                {...register("city", { required: "City is required" })}
                disabled={loading}
              />
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city.message}</p>
              )}
            </div> */}
            {/* <div className="space-y-1">
              <Label>Area</Label>
              <Input {...register("area")} disabled={loading} />
            </div> */}
            <div className="space-y-1">
              <Label>Address</Label>
              <Input {...register("address")} disabled={loading} />
            </div>
            {/* <div className="space-y-1">
              <Label>Latitude</Label>
              <Input {...register("latitude")} disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label>Longitude</Label>
              <Input {...register("longitude")} disabled={loading} />
            </div> */}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Address"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
