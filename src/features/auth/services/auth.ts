import type { User } from "../../../types/auth";

export async function fetchMe(): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { email: "test@example.com", role: "X" }; // mets "Y" pour tester

}