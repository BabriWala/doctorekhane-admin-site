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

export default function AddressTab({ donorId }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      address: "",
    },
  });

  // Fetch current donor address
  useEffect(() => {
    const fetchDonor = async () => {
      try {
        const res = await api.get(`/blood-donor/${donorId}`);
        if (res.data?.donor?.address) {
          reset(res.data?.donor?.address);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch donor address",
        );
      }
    };
    fetchDonor();
  }, [donorId, reset, toast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.put(`/blood-donor/${donorId}/address`, data);

      toast.success("Blood donor address updated successfully"); // ✅ success toast

      reset(res.data.address);
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
        <CardDescription>Update blood donor address details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div className="space-y-1">
              <Label>Street</Label>
              <Input {...register("street")} disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label>City *</Label>
              <Input
                {...register("city", { required: "City is required" })}
                disabled={loading}
              />
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>State</Label>
              <Input {...register("state")} disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              <Input {...register("country")} disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label>Postal Code</Label>
              <Input {...register("postalCode")} disabled={loading} />
            </div> */}
            <div className="space-y-1">
              <Label>Address</Label>
              <Input {...register("address")} disabled={loading} />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Address"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
