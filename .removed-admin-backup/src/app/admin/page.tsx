import { redirect } from "next/navigation";

/**
 * /admin — short URL for the admin entry point.
 *
 * The actual portal lives at /portal/admin (which has its own auth gate
 * in src/app/portal/layout.tsx — if not signed in, it bounces to /login).
 * This file just exists so that typing 'aurexissolution.com/admin' lands
 * you in the right place without needing to remember the longer path.
 */
export default function AdminShortcut() {
  redirect("/portal/admin");
}
