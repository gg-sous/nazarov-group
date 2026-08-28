import "server-only";

import { cookies } from "next/headers";
import type { AdminBooking, SiteContentBundle } from "@/types/content";

const internalApiUrl =
  process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";

export async function getAdminContent(): Promise<SiteContentBundle | null> {
  const cookieHeader = (await cookies()).toString();
  try {
    const response = await fetch(`${internalApiUrl}/api/admin/content`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as SiteContentBundle;
  } catch {
    return null;
  }
}

export async function getPublicContent(): Promise<SiteContentBundle | null> {
  try {
    const response = await fetch(`${internalApiUrl}/api/content`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as SiteContentBundle;
  } catch {
    return null;
  }
}

export async function getAdminBookings(): Promise<AdminBooking[] | null> {
  const cookieHeader = (await cookies()).toString();
  try {
    const response = await fetch(
      `${internalApiUrl}/api/admin/bookings?limit=200`,
      { headers: { cookie: cookieHeader }, cache: "no-store" },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as { items: AdminBooking[] };
    return payload.items;
  } catch {
    return null;
  }
}
