import { AccountNotConfigured } from "@/components/account/not-configured";
import { AddressBook } from "@/components/account/address-book";
import { Contour } from "@/components/ui/contour";
import { getAddresses } from "@/lib/customer/account";
import { hasCustomerAccountCredentials } from "@/lib/customer/env";
import { requireCustomerSession } from "@/lib/customer/guard";

/** Saved addresses (plan.md §11). */
export default async function AddressesPage() {
  if (!hasCustomerAccountCredentials()) return <AccountNotConfigured />;
  await requireCustomerSession("/account/addresses");

  const addresses = await getAddresses();
  if (addresses === null) return <AccountNotConfigured />;

  return (
    <div>
      <h1 className="text-h1">Addresses</h1>
      <Contour
        label={`${addresses.length} saved`}
        className="mt-section-sm"
      />
      <div className="mt-section-sm">
        <AddressBook addresses={addresses} />
      </div>
    </div>
  );
}
