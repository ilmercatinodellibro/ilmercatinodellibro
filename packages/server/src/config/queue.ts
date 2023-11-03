import { ConfigType, registerAs } from "@nestjs/config";
import { z } from "zod";

const queueSchema = z.object({
  host: z.string(),
  port: z.coerce.number(),
});

export const queueConfiguration = registerAs("queue", () =>
  queueSchema.parse({
    host: process.env.QUEUE_HOST,
    port: process.env.QUEUE_PORT,
  }),
);

export type QueueConfiguration = ConfigType<typeof queueConfiguration>;
