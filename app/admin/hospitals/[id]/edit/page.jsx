// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicInfoTab from "./BasicInfoTab";
import LogoTab from "./LogoTab";
import ImagesTab from "./ImagesTab";
import AddressTab from "./AddressTab";
import ContactTab from "./ContactTab";
import DepartmentsTab from "./DepartmentsTab";
import { useParams } from "next/navigation";

const DoctorEditPage = () => {
  const { id } = useParams();

  return (
    <div className="p-4">
      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList>
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <BasicInfoTab hospitalId={id} />
        </TabsContent>
        <TabsContent value="logo">
          <LogoTab hospitalId={id} />
        </TabsContent>
        <TabsContent value="images">
          <ImagesTab hospitalId={id} />
        </TabsContent>
        <TabsContent value="address">
          <AddressTab hospitalId={id} />
        </TabsContent>
        <TabsContent value="contact">
          <ContactTab hospitalId={id} />
        </TabsContent>
        <TabsContent value="departments">
          <DepartmentsTab hospitalId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorEditPage;
