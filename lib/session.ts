import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Returns the signed-in user's id or sends them to sign in.
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  return session.user.id;
}
