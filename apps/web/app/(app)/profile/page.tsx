import { requireSession } from "@/lib/auth-server";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Profil \u2014 GPT-ERP" };

export default async function ProfilePage() {
  const user = await requireSession();
  return (
    <ProfileForm
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyCode: user.companyCode,
        divisionCode: user.divisionCode,
      }}
    />
  );
}