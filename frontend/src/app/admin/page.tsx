import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminBookings, getAdminContent } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Админ-панель — NazarovGroup",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [content, bookings] = await Promise.all([
    getAdminContent(),
    getAdminBookings(),
  ]);
  if (!content || !bookings) redirect("/admin/login");
  return <AdminDashboard initialContent={content} initialBookings={bookings} />;
}
