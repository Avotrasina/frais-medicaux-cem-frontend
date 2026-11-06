import type { ReactNode } from "react";
import { AuthProvider } from "../../features/auth";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
