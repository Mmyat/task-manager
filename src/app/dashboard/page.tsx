import { redirect } from "next/navigation";
import { TaskDashboard } from "@/components/tasks/task-dashboard";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  return <TaskDashboard currentUser={user} />;
}
