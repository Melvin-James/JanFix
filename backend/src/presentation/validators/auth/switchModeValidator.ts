import { z } from "zod";

export const switchModeSchema = z.object({
    mode: z.enum(["USER", "SERVICE_PROVIDER"]),
});

export type SwitchModeInput = z.infer<typeof switchModeSchema>;
