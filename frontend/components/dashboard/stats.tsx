"use client";

import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react";

const stats = [
  { name: "Active Employees", value: "128", icon: Users, change: "+4%", changeType: "positive" },
  { name: "Open Projects", value: "42", icon: Briefcase, change: "+12%", changeType: "positive" },
  { name: "Monthly Revenue", value: "$84,200", icon: TrendingUp, change: "+18%", changeType: "positive" },
  { name: "Support Tickets", value: "14", icon: AlertCircle, change: "-5%", changeType: "negative" },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
        >
          <dt>
            <div className="absolute rounded-xl bg-primary/5 p-3">
              <stat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-muted-foreground">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-0">
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p
              className={cn(
                "ml-2 flex items-baseline text-xs font-semibold",
                stat.changeType === "positive" ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {stat.change}
            </p>
          </dd>
        </div>
      ))}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
