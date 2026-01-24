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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateDoctorPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      dob: "",
      phone: "",
      email: "",
      about: "",
      totalExperience: 0,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/doctor", {
        personalDetails: data,
      });
      toast.success("Doctor created successfully");
      router.push("/admin/doctors");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Doctor</CardTitle>
          <CardDescription>
            Fill in the personal details to add a new doctor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-xs text-red-500">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* <div className="space-y-1">
                <Label>Date of Birth *</Label>
                <Input type="date" {...register("dob")} disabled={loading} />
                {errors.dob && (
                  <p className="text-xs text-red-500">{errors.dob.message}</p>
                )}
              </div> */}

              <div className="space-y-1">
                <Label>Phone *</Label>
                <Input {...register("phone")} disabled={loading} />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Email *</Label>
                <Input type="email" {...register("email")} disabled={loading} />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-1">
                <Label>About</Label>
                <Textarea {...register("about")} rows={4} disabled={loading} />
              </div>

              <div className="space-y-1">
                <Label>Total Experience (years)</Label>
                <Input
                  type="number"
                  {...register("totalExperience")}
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Doctor"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
