/**
 * The admin portal is a desktop layout (1200px minimum). On a phone the artist
 * mode inside the mobile view is the management surface instead, so signed-in
 * phone users go to the home page rather than /admin.
 *
 * Must match the `md` breakpoint that switches the two designs in app/page.tsx.
 */
export const DESKTOP_MIN_WIDTH = 768;

export function isPhoneViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < DESKTOP_MIN_WIDTH;
}

/** Where a signed-in admin should land, given the current viewport. */
export function adminLandingPath(): string {
  return isPhoneViewport() ? "/" : "/admin";
}
