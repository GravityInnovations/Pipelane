import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

const titles: Record<string, string> = {
  "my-work": "My Work",
  goals: "Goals",
  companies: "Companies",
  contacts: "Contacts",
  tasks: "Tasks",
  reviews: "Reviews",
  opportunities: "Opportunities",
  activity: "Activity",
  playbooks: "Playbooks",
  team: "Team",
  imports: "Imports",
  settings: "Settings",
};

export default async function PlannedSectionPage({
  params,
}: PageProps<"/[section]">) {
  const { section } = await params;
  const title = titles[section];
  if (!title) notFound();
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description="This module is planned in the next implementation phase."
      />
      <EmptyState
        icon={Construction}
        title={`${title} is not implemented yet`}
        description="The route is present so the application shell can be reviewed without implying the workflow already exists."
      />
    </div>
  );
}
