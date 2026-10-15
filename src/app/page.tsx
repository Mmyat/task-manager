import Link from "next/link";
import { ArrowRight, ListTodo, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: ListTodo,
    title: "Organize everything",
    description:
      "Create, assign and track tasks with statuses, priorities, due dates and categories.",
  },
  {
    icon: Zap,
    title: "Backend-for-frontend",
    description:
      "Next.js Route Handlers expose a typed REST API backed by PostgreSQL + Drizzle ORM.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "JWT access/refresh tokens stored in HTTP-only cookies with role-based access.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-b from-background to-muted/40">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <span className="flex items-center gap-2 font-semibold">
          <ListTodo className="size-5" />
          Task Manager
        </span>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="mb-4 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          Next.js · PostgreSQL · Drizzle · BFF
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Manage your tasks, ship your work
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          A full-stack task management system using a backend-for-frontend
          architecture. Built to be typed end-to-end and easy to extend.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/register">
              Create your account
              <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        <div className="mt-16 grid w-full gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-6 text-left shadow-sm"
            >
              <feature.icon className="size-6" />
              <h2 className="mt-3 font-semibold">{feature.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
