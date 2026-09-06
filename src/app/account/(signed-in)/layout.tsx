import { AccountNav } from "@/components/account/account-nav";

/**
 * The shell for the signed-in account area (plan.md §11, §64).
 *
 * A Server Component. §64 warns against desktop-dashboard conventions
 * on mobile, so this is a page with navigation above it rather than a
 * sidebar squeezed onto a phone.
 */
export default function SignedInLayout({
  children,
}: LayoutProps<"/account">) {
  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto max-w-5xl">
        <AccountNav />
        <div className="mt-section-sm">{children}</div>
      </div>
    </main>
  );
}
