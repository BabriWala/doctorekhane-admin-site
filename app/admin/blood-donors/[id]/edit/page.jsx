// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicInfoTab from "./BasicInfoTab";
import ProfilePictureTab from "./ProfilePictureTab";
import AddressTab from "./AddressTab";
import ContactTab from "./ContactTab";
import DonationInfoTab from "./DonationInfoTab";
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
          <TabsTrigger value="donation-info">Donation Info</TabsTrigger>
        </TabsList>
        <TabsContent value="basic-info">
          <BasicInfoTab donorId={id} />
        </TabsContent>
        <TabsContent value="profile-picture">
          <ProfilePictureTab donorId={id} />
        </TabsContent>

        <TabsContent value="address">
          <AddressTab donorId={id} />
        </TabsContent>
        <TabsContent value="contact">
          <ContactTab donorId={id} />
        </TabsContent>
        <TabsContent value="donation-info">
          <DonationInfoTab donorId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BloodDonorEditPage;
