import Layout from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import ThreeDIcon from "@/components/three-d-icon";
import { useStaff, useClinicSetting, useSetClinicSetting, useUsers } from "@/hooks/use-api";
import GeneralSettingsTab from "@/components/settings/general-tab";
import HoursSettingsTab from "@/components/settings/hours-tab";
import NotificationsSettingsTab from "@/components/settings/notifications-tab";
import StaffSettingsTab from "@/components/settings/staff-tab";
import UsersSettingsTab from "@/components/settings/users-tab";

export default function Settings() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("general");
  const { data: staff = [], isLoading: staffLoading, isError: staffError, refetch: refetchStaff } = useStaff();
  const { data: clinicName, isLoading: clinicNameLoading, isError: clinicNameError, refetch: refetchClinicName } = useClinicSetting("clinicName");
  const { data: clinicAddress } = useClinicSetting("clinicAddress");
  const { data: clinicPhone } = useClinicSetting("clinicPhone");
  const { data: clinicEmail } = useClinicSetting("clinicEmail");
  const { data: clinicDoctorName } = useClinicSetting("clinicDoctorName");
  const { data: clinicHours, isLoading: clinicHoursLoading, isError: clinicHoursError, refetch: refetchClinicHours } = useClinicSetting("clinicHours");
  const setSetting = useSetClinicSetting();
  const { data: users = [], isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useUsers();

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("settings.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("settings.subtitle")}</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-5 gap-1 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="general" className="gap-2"><ThreeDIcon icon="setting" size={18} /> {t("settings.general")}</TabsTrigger>
            <TabsTrigger value="hours" className="gap-2"><ThreeDIcon icon="calender" size={18} /> {t("settings.hours")}</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2"><ThreeDIcon icon="bell" size={18} /> {t("settings.notifications")}</TabsTrigger>
            <TabsTrigger value="staff" className="gap-2"><ThreeDIcon icon="boy" size={18} /> {t("settings.staff")}</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><ThreeDIcon icon="lock" size={18} /> {t("settings.users")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <GeneralSettingsTab
              clinicName={clinicName}
              clinicNameLoading={clinicNameLoading}
              clinicNameError={clinicNameError}
              refetchClinicName={refetchClinicName}
              clinicAddress={clinicAddress}
              clinicPhone={clinicPhone}
              clinicEmail={clinicEmail}
              clinicDoctorName={clinicDoctorName}
              setSetting={setSetting}
            />
          </TabsContent>

          <TabsContent value="hours" className="mt-6">
            <HoursSettingsTab
              clinicHours={clinicHours}
              clinicHoursLoading={clinicHoursLoading}
              clinicHoursError={clinicHoursError}
              refetchClinicHours={refetchClinicHours}
              setSetting={setSetting}
            />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationsSettingsTab setSetting={setSetting} />
          </TabsContent>

          <TabsContent value="staff" className="mt-6">
            <StaffSettingsTab staff={staff} staffLoading={staffLoading} staffError={staffError} refetchStaff={refetchStaff} />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UsersSettingsTab users={users} usersLoading={usersLoading} usersError={usersError} refetchUsers={refetchUsers} staff={staff} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}