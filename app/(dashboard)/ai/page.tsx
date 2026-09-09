import { redirect } from "next/navigation";
import { requirePermission, PermissionError } from "@/lib/permissions";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default async function AiPage() {
  try {
    await requirePermission("AI", "VIEW");
  } catch (err) {
    if (err instanceof PermissionError) redirect("/dashboard");
    throw err;
  }

  return <ComingSoon moduleName="DealSphere AI" phase={6} />;
}
