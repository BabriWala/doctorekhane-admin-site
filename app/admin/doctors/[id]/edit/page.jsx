// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalDetailsTab from "./PersonalDetailsTab";
import AddressTab from "./AddressTab";
import ProfilePictureTab from "./ProfilePictureTab";
import EducationTab from "./EducationTab";
import ExperienceTab from "./ExperienceTab";
import SpecializationTab from "./SpecializationTab";
import ProfessionalTab from "./ProfessionalTab";
import ChambersTab from "./ChambersTab";
import { useParams } from "next/navigation";

export default function DoctorEditPageClient() {
  const { id } = useParams();
  return (
    <div className="p-4">
      <Tabs defaultValue="personal-details" className="w-full">
        <TabsList>
          <TabsTrigger value="personal-details">Personal Details</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="profile-picture">Profile Picture</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="specialization">Specialization</TabsTrigger>
          <TabsTrigger value="chambers">Chambers</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
        </TabsList>

        <TabsContent value="personal-details">
          <PersonalDetailsTab doctorId={id} />
        </TabsContent>
        <TabsContent value="address">
          <AddressTab doctorId={id} />
        </TabsContent>
        <TabsContent value="profile-picture">
          <ProfilePictureTab doctorId={id} />
        </TabsContent>
        <TabsContent value="education">
          <EducationTab doctorId={id} />
        </TabsContent>
        <TabsContent value="experience">
          <ExperienceTab doctorId={id} />
        </TabsContent>
        <TabsContent value="specialization">
          <SpecializationTab doctorId={id} />
        </TabsContent>
        <TabsContent value="chambers">
          <ChambersTab doctorId={id} />
        </TabsContent>
        <TabsContent value="professional">
          <ProfessionalTab doctorId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
