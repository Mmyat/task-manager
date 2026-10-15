import Link from "next/link";
import { ListTodo } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <ListTodo className="size-5" />
            Task Manager
          </Link>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" nextPath={next ?? "/dashboard"} />
        </CardContent>
      </Card>
    </div>
  );
}
