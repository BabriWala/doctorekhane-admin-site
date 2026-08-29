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

export default function ProfessionalTab({ doctorId }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      position: "",
      department: "",
      field: "",
      consultationFee: "",
      consultationFeeNew: "",
      status: "Active",
      order: 1,
      licenseNumber: "",
      nidNumber: "",
      languagesText: "",
      servicesText: "",
      conditionsText: "",
      telemedicine: false,
      featured: false,
      totalPatients: 0,
    },
  });

  const statusValue = watch("status");

  // Fetch doctor's professional info
  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const res = await api.get(`/doctor/${doctorId}`);

        if (res.data?.professional) {
          reset({
            ...res.data.professional,
            status: res.data.professional?.status || "Active",
            languagesText: (res.data.languages || []).join(", "),
            servicesText: (res.data.services || []).join(", "),
            conditionsText: (res.data.conditionsTreated || []).join(", "),
            telemedicine: Boolean(res.data.telemedicine),
            featured: Boolean(res.data.featured),
            totalPatients: res.data.totalPatients || 0,
          });
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch professional info",
        );
      }
    };

    fetchProfessional();
  }, [doctorId, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const splitList = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
      await api.put(`/doctor/${doctorId}/professional`, {
        ...data,
        languages: splitList(data.languagesText),
        services: splitList(data.servicesText),
        conditionsTreated: splitList(data.conditionsText),
      });
      toast.success("Professional info updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update professional info",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Info</CardTitle>
        <CardDescription>Update doctor’s professional details</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Position */}
            <div className="space-y-1">
              <Label>Position</Label>
              <Input
                {...register("position", { required: true })}
                disabled={loading}
              />
              {errors.position && (
                <p className="text-red-500 text-sm">Required</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-1">
              <Label>Department</Label>
              <Input {...register("department")} disabled={loading} />
            </div>

            {/* Field */}
            <div className="space-y-1">
              <Label>Field</Label>
              <Input {...register("field")} disabled={loading} />
            </div>

            {/* Consultation Fee New */}
            <div className="space-y-1">
              <Label>Consultation Fee 1st Visit</Label>
              <Input
                type="number"
                {...register("consultationFeeNew")}
                disabled={loading}
              />
            </div>

            {/* Consultation Fee Old */}
            <div className="space-y-1">
              <Label>Consultation Fee 2nd Visit</Label>
              <Input
                type="number"
                {...register("consultationFee")}
                disabled={loading}
              />
            </div>

            {/* ✅ FIXED STATUS SELECT */}
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                disabled={loading}
                value={statusValue}
                onValueChange={(value) => setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div className="space-y-1">
              <Label>Order</Label>
              <Input type="number" {...register("order")} disabled={loading} />
            </div>

            {/* License */}
            <div className="space-y-1">
              <Label>License Number</Label>
              <Input {...register("licenseNumber")} disabled={loading} />
            </div>

            {/* NID */}
            <div className="space-y-1">
              <Label>NID Number</Label>
              <Input {...register("nidNumber")} disabled={loading} />
            </div>
            <div className="space-y-1 md:col-span-2"><Label>Languages</Label><Input {...register("languagesText")} placeholder="Bangla, English, Hindi" disabled={loading} /><p className="text-xs text-muted-foreground">Separate multiple values with commas.</p></div>
            <div className="space-y-1 md:col-span-2"><Label>Services</Label><Input {...register("servicesText")} placeholder="Consultation, ECG, Follow-up" disabled={loading} /></div>
            <div className="space-y-1 md:col-span-2"><Label>Conditions Treated</Label><Input {...register("conditionsText")} placeholder="Hypertension, Heart disease" disabled={loading} /></div>
            <div className="space-y-1"><Label>Total Patients</Label><Input type="number" min="0" {...register("totalPatients", { valueAsNumber: true })} disabled={loading} /></div>
            <label className="flex items-center gap-3 rounded-md border p-3"><input type="checkbox" {...register("telemedicine")} disabled={loading} /><span><span className="block font-medium">Telemedicine</span><span className="text-xs text-muted-foreground">Allow video consultations</span></span></label>
            <label className="flex items-center gap-3 rounded-md border p-3"><input type="checkbox" {...register("featured")} disabled={loading} /><span><span className="block font-medium">Featured doctor</span><span className="text-xs text-muted-foreground">Prioritize in discovery</span></span></label>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Professional Info"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
