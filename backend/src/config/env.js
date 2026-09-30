import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  quiet: true,
});

export const env = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),
    MONGODB_URI: z.string().min(1),
    CLIENT_ORIGIN: z.url().default("http://localhost:5173"),
    SESSION_DAYS: z.coerce.number().int().min(1).max(30).default(7),
    TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
    SERVE_FRONTEND: z.enum(["true", "false"]).default("false"),
  })
  .parse(process.env);
