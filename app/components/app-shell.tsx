import { AppNavigation } from "./app-navigation";
import { UserMenu } from "./user-menu";
import { type WorkspaceRole } from "@/lib/auth/context";
import { QuickAdd } from "./quick-add";

export function AppShell({ children, displayName, email, workspaceName, role }: { children: React.ReactNode; displayName: string; email: string; workspaceName: string; role: WorkspaceRole }) {
  return (
    <div className="min-h-screen">
      <AppNavigation />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--background)]/90 px-5 py-4 backdrop-blur sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--coral)] text-sm font-black text-white">A</div>
              <div className="min-w-0"><p className="text-lg font-black tracking-[-0.05em] text-[var(--ink)]">A-LSH</p><p className="max-w-[12rem] truncate text-xs text-[var(--muted)] sm:max-w-xs">{workspaceName}</p></div>
            </div>
            <UserMenu displayName={displayName} email={email} role={role} />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 pb-28 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pb-12">{children}</main>
      </div>
      <QuickAdd />
    </div>
  );
}
