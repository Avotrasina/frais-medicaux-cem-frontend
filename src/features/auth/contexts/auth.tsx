import { useEffect, useState, type ReactNode } from "react";
import { fetchMe } from "../services/auth";
import type { User } from "../../../types/auth";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchMe()
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}