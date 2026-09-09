import { redirect } from "next/navigation";
import { requirePermission, PermissionError } from "@/lib/permissions";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default async function CrmPage() {
  try {
    await requirePermission("CRM", "VIEW");
  } catch (err) {
    if (err instanceof PermissionError) redirect("/dashboard");
    throw err;
  }

  return <ComingSoon moduleName="CRM" phase={2} />;
}
