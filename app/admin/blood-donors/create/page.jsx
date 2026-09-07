// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function CreateBloodDonorForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/blood-donor/basic-info", data);

      toast.success("Blood donor created successfully"); // ✅ success toast

      router.push("/admin/blood-donors");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create blood donor"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Blood Donor</CardTitle>
          <CardDescription>Fill in the donor's basic info</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>First Name <span className="text-red-600">*</span></Label>
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
                <Label>Last Name <span className="text-red-600">*</span></Label>
                <Input
                  {...register("lastName", {
                    required: "Last Name is required",
                  })}
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Gender <span className="text-red-600">*</span></Label>
                <input type="hidden" {...register("gender", { required: "Gender is required" })} />
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
                  <p className="text-xs text-red-500">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Date of Birth <span className="text-red-600">*</span></Label>
                <Input
                  type="date"
                  required
                  {...register("dob", { required: "Date of birth is required" })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <Label>Blood Group <span className="text-red-600">*</span></Label>
                <input type="hidden" {...register("bloodGroup", { required: "Blood group is required" })} />
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
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Blood Donor"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
