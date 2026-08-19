import {
  CalendarClock,
  CheckSquare,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { getCurrentIdentity } from "@/server/auth/identity";

export default async function DashboardPage() {
  const identity = await getCurrentIdentity();
  const manager = identity?.profile.role !== "sales_rep";
  return (
    <div className="space-y-6">
      <PageHeader
        title={manager ? "Sales overview" : "My work today"}
        description={
          manager
            ? "Team delivery, reviews, and current bottlenecks."
            : "Your assigned outreach work in priority order."
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={manager ? "Active goals" : "Overdue"}
          value={0}
          icon={CalendarClock}
        />
        <StatCard
          label={manager ? "Prospects in progress" : "Due today"}
          value={0}
          icon={CheckSquare}
        />
        <StatCard
          label={manager ? "Reviews waiting" : "Changes requested"}
          value={0}
          icon={ShieldCheck}
        />
        <StatCard
          label={manager ? "Conversations" : "Approved to send"}
          value={0}
          icon={MessageSquare}
        />
      </div>
      <EmptyState
        icon={CheckSquare}
        title="No work yet"
        description="Goals, prospects, and tasks will appear here as the workflow modules are delivered."
      />
    </div>
  );
}
