import { requireLearner } from "@/features/auth/session";
import { AppShell } from "@/components/app-shell";
export const dynamic = "force-dynamic";
export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireLearner();
  return (
    <AppShell displayName={user.email ?? "Tài khoản của bạn"}>
      {children}
    </AppShell>
  );
}
