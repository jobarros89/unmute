import { randomUUID } from "expo-crypto";
import { Platform } from "react-native";
import { z } from "zod";
import { requireBackend } from "../../lib/supabase";

export const coachSchema = z.object({
  transcript: z.string().max(4000),
  corrected: z.string().max(4000),
  explanation: z.string().max(2000),
  reply: z.string().max(2000),
  followup: z.string().max(1000),
  hasCorrection: z.boolean(),
});
export type CoachFeedback = z.infer<typeof coachSchema>;
export type CoachInput = {
  mode: "drill" | "room";
  topic: string;
  conversationId: string;
  reference?: string;
  text?: string;
  uri?: string;
};
export async function askCoach(input: CoachInput): Promise<CoachFeedback> {
  const db = requireBackend();
  const { data, error } = await db.auth.getSession();
  if (error || !data.session)
    throw new Error("Entre na sua conta para conversar com o coach.");
  const body = new FormData();
  body.append("requestId", randomUUID());
  body.append("conversationId", input.conversationId);
  body.append("mode", input.mode);
  body.append("topic", input.topic);
  body.append("reference", input.reference ?? "");
  body.append("text", input.text ?? "");
  body.append("consent", "true");
  if (input.uri) {
    if (Platform.OS === "web") {
      const blob = await (await fetch(input.uri)).blob();
      if (blob.size > 4 * 1024 * 1024)
        throw new Error("Grave uma tentativa menor, de até 30 segundos.");
      body.append(
        "audio",
        blob,
        blob.type.includes("mp4") ? "take.m4a" : "take.webm",
      );
    } else
      body.append("audio", {
        uri: input.uri,
        name: "take.m4a",
        type: "audio/mp4",
      } as unknown as Blob);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/coach`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          apikey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
        },
        body,
        signal: controller.signal,
      },
    );
    const result = await response.json();
    if (!response.ok)
      throw new Error(
        result.error ??
          "O coach está indisponível. Tente novamente em alguns instantes.",
      );
    return coachSchema.parse(result);
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError")
      throw new Error(
        "A resposta demorou mais que o esperado. Tente novamente.",
      );
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
