import { z } from "zod";

export const quizSearchSchema = z.object({
  a: z
    .string()
    .regex(/^[0-3]*$/)
    .optional(),
});
