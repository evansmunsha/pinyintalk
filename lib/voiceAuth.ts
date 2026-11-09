import "server-only";
import { auth } from "@/lib/auth";

// Voice calls cost money, so they need a signed-in user in production.
// In local development they are open so Evans can test /test-ai and /test-voice before the database is ready.
export async function voiceAllowed(): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return true;
  const session = await auth();
  return !!session?.user?.id;
}

// The signed-in user's id, or null (for example on the public test page). Used to save conversations.
export async function voiceUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
