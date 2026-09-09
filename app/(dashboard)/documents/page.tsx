import { redirect } from "next/navigation";
import { requirePermission, PermissionError } from "@/lib/permissions";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default async function DocumentsPage() {
  try {
    await requirePermission("DOCUMENTS", "VIEW");
  } catch (err) {
    if (err instanceof PermissionError) redirect("/dashboard");
    throw err;
  }

  return <ComingSoon moduleName="Documents" phase={4} />;
}
