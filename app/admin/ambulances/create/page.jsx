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

export default function CreateAmbulanceForm() {
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
      vehicleNumber: "",
      type: "",
      driverName: "",
      driverLicense: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/ambulance", data);

      toast.success("Ambulance created successfully"); // ✅ success toast

      router.push("/admin/ambulances");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create ambulance"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Ambulance</CardTitle>
          <CardDescription>Fill in the ambulance's basic info</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Vehicle Number <span className="text-red-600">*</span></Label>
                <Input
                  {...register("vehicleNumber", {
                    required: "Vehicle Number is required",
                  })}
                  disabled={loading}
                />
                {errors.vehicleNumber && (
                  <p className="text-xs text-red-500">
                    {errors.vehicleNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Type <span className="text-red-600">*</span></Label>
                <input type="hidden" {...register("type", { required: "Type is required" })} />
                <Select
                  value={watch("type")}
                  onValueChange={(value) => setValue("type", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Basic", "Advanced", "ICU"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-xs text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Driver Name <span className="text-red-600">*</span></Label>
                <Input
                  {...register("driverName", {
                    required: "Driver Name is required",
                  })}
                  disabled={loading}
                />
                {errors.driverName && (
                  <p className="text-xs text-red-500">
                    {errors.driverName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Driver License</Label>
                <Input {...register("driverLicense")} disabled={loading} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Ambulance"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
