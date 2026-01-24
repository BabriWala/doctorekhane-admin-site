// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicInfoTab from "./BasicInfoTab";
import ProfilePictureTab from "./ProfilePictureTab";
import AddressTab from "./AddressTab";
import ContactTab from "./ContactTab";
import AvailabilityTab from "./AvailabilityTab";
import { useParams } from "next/navigation";

const BloodDonorEditPage = () => {
  const { id } = useParams();

  return (
    <div className="p-4">
      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList>
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="profile-picture">Profile Picture</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>
        <TabsContent value="basic-info">
          <BasicInfoTab ambulanceId={id} />
        </TabsContent>
        <TabsContent value="profile-picture">
          <ProfilePictureTab ambulanceId={id} />
        </TabsContent>

        <TabsContent value="address">
          <AddressTab ambulanceId={id} />
        </TabsContent>
        <TabsContent value="contact">
          <ContactTab ambulanceId={id} />
        </TabsContent>
        <TabsContent value="availability">
          <AvailabilityTab ambulanceId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BloodDonorEditPage;
