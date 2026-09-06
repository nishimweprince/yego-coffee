import { AccountNotConfigured } from "@/components/account/not-configured";
import { ProfileForm } from "@/components/account/profile-form";
import { Contour } from "@/components/ui/contour";
import { getCustomerOverview } from "@/lib/customer/account";
import { hasCustomerAccountCredentials } from "@/lib/customer/env";
import { requireCustomerSession } from "@/lib/customer/guard";

/** Profile (plan.md §11). */
export default async function ProfilePage() {
  if (!hasCustomerAccountCredentials()) return <AccountNotConfigured />;
  await requireCustomerSession("/account/profile");

  const overview = await getCustomerOverview();
  if (!overview) return <AccountNotConfigured />;

  return (
    <div>
      <h1 className="text-h1">Profile</h1>
      <Contour className="mt-section-sm" />
      <div className="mt-section-sm">
        <ProfileForm profile={overview.profile} />
      </div>
    </div>
  );
}
