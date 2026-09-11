import { z } from "zod";

// Contract for the next backend increment. No provider calls or fabricated scores.
export const feedbackSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("evaluated"),
      attemptId: z.string().uuid(),
      transcript: z.string().min(1).max(2000),
      corrections: z
        .array(
          z
            .object({
              original: z.string().max(500),
              suggestion: z.string().max(500),
              explanation: z.string().max(500),
            })
            .strict(),
        )
        .max(2),
      suggestedResponse: z.string().min(1).max(1000),
      nextPrompt: z.string().min(1).max(500),
    })
    .strict(),
  z
    .object({
      status: z.literal("unintelligible"),
      attemptId: z.string().uuid(),
      message: z.string().min(1).max(500),
    })
    .strict(),
]);
export type SpeakingFeedback = z.infer<typeof feedbackSchema>;
