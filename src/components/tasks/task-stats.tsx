import { AlertTriangle, CheckCircle2, ListChecks, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TaskStatsDTO } from "@/lib/types";

export function TaskStats({ stats }: { stats: TaskStatsDTO | null }) {
  const items = [
    { label: "Total tasks", value: stats?.total ?? 0, icon: ListChecks },
    {
      label: "In progress",
      value: stats?.byStatus.InProgress ?? 0,
      icon: Loader2,
    },
    {
      label: "Completed",
      value: stats?.byStatus.Completed ?? 0,
      icon: CheckCircle2,
    },
    { label: "Overdue", value: stats?.overdue ?? 0, icon: AlertTriangle },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold">{item.value}</p>
            </div>
            <item.icon className="size-8 text-muted-foreground/60" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
