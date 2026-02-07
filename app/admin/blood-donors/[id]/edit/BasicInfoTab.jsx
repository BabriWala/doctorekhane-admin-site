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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BasicInfoTab({ donorId }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      dob: "",
      bloodGroup: "",
    },
  });

  // Fetch donor data on mount
  useEffect(() => {
    const fetchDonor = async () => {
      try {
        const res = await api.get(`/blood-donor/${donorId}`);
        if (res.data?.donor?.basicInfo) {
          reset(res.data.donor.basicInfo);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch donor info",
        );
      }
    };
    fetchDonor();
  }, [donorId, reset, toast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put(`/blood-donor/${donorId}/basic-info`, data);

      toast.success("Blood donor info updated successfully"); // ✅ success toast
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update donor info",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Update blood donor’s basic information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>First Name *</Label>
              <Input
                {...register("firstName", {
                  required: "First Name is required",
                })}
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Middle Name</Label>
              <Input {...register("middleName")} disabled={loading} />
            </div>

            <div className="space-y-1">
              <Label>Last Name *</Label>
              <Input
                {...register("lastName", { required: "Last Name is required" })}
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Gender *</Label>
              <Select
                value={watch("gender")}
                onValueChange={(value) => setValue("gender", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-red-500">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Date of Birth *</Label>
              <Input
                type="date"
                {...register("dob", { required: "Date of Birth is required" })}
                disabled={loading}
              />
              {errors.dob && (
                <p className="text-xs text-red-500">{errors.dob.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Blood Group *</Label>
              <Select
                value={watch("bloodGroup")}
                onValueChange={(value) => setValue("bloodGroup", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Info"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
