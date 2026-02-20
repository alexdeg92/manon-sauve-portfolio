import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin-session");
  const adminPassword = process.env.ADMIN_PASSWORD || "manon2024";

  if (!session || session.value !== adminPassword) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
