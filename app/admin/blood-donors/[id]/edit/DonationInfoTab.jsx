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

export default function DonationInfoTab({ donorId }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      lastDonationDate: "",
      isActive: true,
      notes: "",
    },
  });

  // Fetch current donor donation info
  useEffect(() => {
    const fetchDonationInfo = async () => {
      try {
        const res = await api.get(`/blood-donor/${donorId}`);
        if (res.data?.donor?.donationInfo) {
          const data = {
            ...res.data.donor.donationInfo,
            lastDonationDate: res.data.donor.donationInfo.lastDonationDate
              ? res.data.donor.donationInfo.lastDonationDate.split("T")[0]
              : "",
          };
          reset(data);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch donation info",
        );
      }
    };
    fetchDonationInfo();
  }, [donorId, reset, toast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.put(`/blood-donor/${donorId}/donation-info`, data);

      toast.success("Blood donor donation info updated successfully"); // ✅ success toast

      reset(res.data.donationInfo);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update donation info",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation Info</CardTitle>
        <CardDescription>
          Update blood donor donation information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Last Donation Date</Label>
              <Input
                type="date"
                {...register("lastDonationDate")}
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label>Active Donor</Label>
              <select
                {...register("isActive")}
                disabled={loading}
                className="border rounded px-2 py-1 w-full"
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea {...register("notes")} rows={4} disabled={loading} />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Donation Info"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
