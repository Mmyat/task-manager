import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
