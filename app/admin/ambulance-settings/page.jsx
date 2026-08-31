// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const fields = [
  ["title", "Page title"],
  ["subtitle", "Page subtitle"],
  ["emergencyTitle", "Emergency heading"],
  ["emergencyDescription", "Emergency description"],
  ["emergencyPhone", "Primary emergency phone"],
  ["bookingTitle", "Booking heading"],
  ["bookingDescription", "Booking description"],
  ["tipsTitle", "Safety tips heading"],
  ["providersTitle", "Provider list heading"],
];

export default function AmbulanceSettingsPage() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/ambulance-page-settings")
      .then(({ data }) => setForm(data.data))
      .catch(() => toast.error("Could not load ambulance page settings"));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/ambulance-page-settings", form);
      setForm(data.data);
      toast.success("Ambulance page updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p>Loading ambulance page settings...</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ambulance Page</h1>
        <p className="text-muted-foreground">Content saved here is shown immediately on the customer website.</p>
      </div>
      <form onSubmit={save}>
        <Card>
          <CardHeader><CardTitle>Page content and service options</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {fields.map(([name, label]) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={name}>{label}</Label>
                <Input id={name} value={form[name] || ""} onChange={(event) => setForm({ ...form, [name]: event.target.value })} required={name !== "emergencyPhone"} />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="tips">Emergency tips (one per line)</Label>
              <textarea id="tips" className="min-h-40 w-full rounded-md border bg-background px-3 py-2 text-sm" value={(form.emergencyTips || []).join("\n")} onChange={(event) => setForm({ ...form, emergencyTips: event.target.value.split("\n").map((tip) => tip.trim()).filter(Boolean) })} />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Bookable service types</legend>
              <div className="flex flex-wrap gap-4">
                {["Basic", "Advanced", "ICU"].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={(form.serviceTypes || []).includes(type)} onChange={(event) => setForm({ ...form, serviceTypes: event.target.checked ? [...(form.serviceTypes || []), type] : form.serviceTypes.filter((item) => item !== type) })} />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>
            <Button type="submit" disabled={saving || !form.serviceTypes?.length}>{saving ? "Saving..." : "Save and publish"}</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
