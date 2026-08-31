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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BasicInfoTab({ hospitalId }) {
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
      name: "",
      registrationNumber: "",
      type: "",
      establishedYear: "",
      description: "",
      status: "Active",
      phone: "",
      email: "",
      servicesText: "",
      facilitiesText: "",
      insuranceText: "",
      accreditationsText: "",
      visitingHoursText: "",
      is24Hours: false,
      emergencyPhone: "",
      ambulancePhone: "",
      bedCount: 0,
    },
  });

  // Fetch hospital data on mount
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await api.get(`/hospital/${hospitalId}`);
        if (res.data?.basicInfo) {
          reset({
            ...res.data.basicInfo,
            phone: res.data.contact?.phone || "",
            email: res.data.contact?.email || "",
            servicesText: (res.data.basicInfo.services || []).join(", "),
            facilitiesText: (res.data.basicInfo.facilities || []).join(", "),
            insuranceText: (res.data.basicInfo.insurance || []).join(", "),
            accreditationsText: (res.data.basicInfo.accreditations || []).join(", "),
            visitingHoursText: (res.data.basicInfo.visitingHours || []).map((slot) => `${slot.day}|${slot.open}|${slot.close}`).join("\n"),
          });
        }
      } catch (error) {


        toast.error(
          error.response?.data?.message || "Failed to fetch hospital details"
        );
      }
    };
    fetchHospital();
  }, [hospitalId, reset, toast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Only update basic info + contact, exclude logo/images
      const updatePayload = {
        name: data.name,
        registrationNumber: data.registrationNumber,
        type: data.type,
        establishedYear: data.establishedYear,
        description: data.description,
        status: data.status,
        phone: data.phone,
        email: data.email,
        services: String(data.servicesText || "").split(",").map((item) => item.trim()).filter(Boolean),
        facilities: String(data.facilitiesText || "").split(",").map((item) => item.trim()).filter(Boolean),
        insurance: String(data.insuranceText || "").split(",").map((item) => item.trim()).filter(Boolean),
        accreditations: String(data.accreditationsText || "").split(",").map((item) => item.trim()).filter(Boolean),
        visitingHours: String(data.visitingHoursText || "").split("\n").map((line) => { const [day, open, close] = line.split("|").map((item) => item.trim()); return { day, open, close }; }).filter((slot) => slot.day && slot.open && slot.close),
        is24Hours: Boolean(data.is24Hours),
        emergencyPhone: data.emergencyPhone,
        ambulancePhone: data.ambulancePhone,
        bedCount: Number(data.bedCount) || 0,
      };

      await api.put(`/hospital/${hospitalId}/basic-info`, updatePayload);


      toast.success("Hospital basic info updated successfully"); // ✅ success toast

    } catch (error) {


      toast.error(
        error.response?.data?.message || "Failed to update hospital info"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Update hospital’s basic information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                {...register("name", { required: "Name is required" })}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1 md:col-span-2"><Label>Services</Label><Input {...register("servicesText")} placeholder="ICU, Emergency, MRI, Dialysis" disabled={loading} /></div>
            <div className="space-y-1 md:col-span-2"><Label>Facilities</Label><Input {...register("facilitiesText")} placeholder="Pharmacy, Parking, Cafeteria" disabled={loading} /></div>
            <div className="space-y-1 md:col-span-2"><Label>Accepted Insurance</Label><Input {...register("insuranceText")} placeholder="Provider A, Provider B" disabled={loading} /></div>
            <div className="space-y-1 md:col-span-2"><Label>Accreditations</Label><Input {...register("accreditationsText")} placeholder="NABH, ISO 9001" disabled={loading} /></div>
            <div className="space-y-1 md:col-span-2"><Label>Visiting Hours</Label><Textarea {...register("visitingHoursText")} rows={5} placeholder={"Sunday|09:00|20:00\nMonday|09:00|20:00"} disabled={loading} /><p className="text-xs text-muted-foreground">One line per day: Day|Opening time|Closing time</p></div>
            <div className="space-y-1"><Label>Bed Count</Label><Input type="number" min="0" {...register("bedCount")} disabled={loading} /></div>
            <label className="flex items-center gap-3 rounded-md border p-3"><input type="checkbox" {...register("is24Hours")} disabled={loading} /><span className="font-medium">Open 24 hours</span></label>

            <div className="space-y-1">
              <Label>Registration Number</Label>
              <Input {...register("registrationNumber")} disabled={loading} />
            </div>

            <div className="space-y-1">
              <Label>Type *</Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Specialized">Specialized</SelectItem>
                  <SelectItem value="Clinic">Clinic</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Established Year</Label>
              <Input
                type="number"
                {...register("establishedYear")}
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <Label>Description</Label>
              <Textarea
                {...register("description")}
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label>Status *</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-6">Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input {...register("phone")} disabled={loading} />
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" {...register("email")} disabled={loading} />
            </div>
            <div className="space-y-1"><Label>Emergency Phone</Label><Input {...register("emergencyPhone")} disabled={loading} /></div>
            <div className="space-y-1"><Label>Ambulance Phone</Label><Input {...register("ambulancePhone")} disabled={loading} /></div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Info"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
