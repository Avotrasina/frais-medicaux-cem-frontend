import { createContext } from "react";
import type { User, Role } from "../../../types/auth";

export interface AuthContextValue {
  user: User | null;
  role: Role | null;
  loading: boolean;
  setRole: (role: Role) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
