import { CAFE } from "@/content/cafe";

/**
 * §91's launch guard: the café's placeholder phone and hours must not
 * reach the public.
 *
 * §91 asks for a build-time assertion that fails production builds
 * while the placeholders stand. This fires on a real production
 * *deployment* rather than on every local `pnpm build`, because the
 * risk §91 describes is publishing — a wrong number reaching a
 * stranger, wrong hours turning someone away — not compiling. Blocking
 * local builds would only teach the next person to delete the check.
 *
 * Nothing renders a provisional value in any case (see the components);
 * this is the second lock, for the day someone flips a flag without
 * replacing the value behind it.
 */
export function assertCafeDetailsAreReal(): void {
  const isProductionDeploy =
    process.env.VERCEL_ENV === "production" ||
    process.env.YEGO_ASSERT_LAUNCH_READY === "1";

  if (!isProductionDeploy) return;

  const unresolved = Object.entries(CAFE.provisional)
    .filter(([, provisional]) => provisional)
    .map(([field]) => field);

  if (unresolved.length > 0) {
    throw new Error(
      `plan.md §91: café ${unresolved.join(" and ")} ${
        unresolved.length === 1 ? "is" : "are"
      } still a carried-over placeholder and cannot be published. ` +
        `Confirm the real values with the owners, put them in ` +
        `src/content/cafe.ts, and clear the matching provisional flag.`,
    );
  }
}
