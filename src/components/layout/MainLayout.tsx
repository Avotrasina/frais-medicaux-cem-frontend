import type { ReactNode } from "react";
import { AuthProvider } from "../../features/auth";
import { useAuth } from "../../features/auth";
import type { Role } from "../../types/auth";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </AuthProvider>
  );
}

function MainLayoutContent({ children }: { children: ReactNode }) {
  const { role, setRole } = useAuth();
  const selectedRole = role ?? "X";

  return (
    <>
      {children}
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-lg">
        <span className="pl-2 text-xs font-semibold text-slate-600">Mode démo</span>
        {(["X", "Y"] as const satisfies readonly Role[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={selectedRole === option}
            className={`h-9 min-w-9 rounded-full px-3 text-sm font-bold transition ${
              selectedRole === option
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setRole(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </>
  );
}
