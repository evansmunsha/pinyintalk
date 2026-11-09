import { NextResponse } from "next/server";
import { z } from "zod";
import { GEMINI_MODEL } from "@/lib/ai/config";
import { aiErrorResponse } from "@/lib/gemini";
import { askMei } from "@/lib/mei/reply";
import { voiceAllowed } from "@/lib/voiceAuth";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "model"]), text: z.string().trim().min(1).max(500) }))
    .min(1)
    .max(12),
});

// Voice-test reply: no database needed. Same two-part rule as the main Mei chat.
export async function POST(request: Request) {
  if (!(await voiceAllowed())) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  try {
    return NextResponse.json({ reply: await askMei(parsed.data.messages, []) });
  } catch (error) {
    return aiErrorResponse("voice/reply", GEMINI_MODEL, error);
  }
}
