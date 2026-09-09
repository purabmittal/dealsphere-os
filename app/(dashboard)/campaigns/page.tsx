import { redirect } from "next/navigation";
import { requirePermission, PermissionError } from "@/lib/permissions";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default async function CampaignsPage() {
  try {
    await requirePermission("CAMPAIGNS", "VIEW");
  } catch (err) {
    if (err instanceof PermissionError) redirect("/dashboard");
    throw err;
  }

  return <ComingSoon moduleName="Campaigns" phase={3} />;
}
