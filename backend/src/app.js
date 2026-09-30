import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { router } from "./routes/index.js";
import { ApiError } from "./utils/errors.js";
import { errorHandler } from "./middleware/errors.js";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    // A required non-simple header + exact Origin check protects cookie sessions from CSRF, including login CSRF. CLI clients may omit Origin, not the header.
    if (
      req.get("X-Portal-Request") !== "1" ||
      (req.get("Origin") && req.get("Origin") !== env.CLIENT_ORIGIN)
    )
      throw new ApiError(403, "Request origin is not allowed.");
    if (req.method !== "DELETE" && !req.is("application/json"))
      throw new ApiError(415, "Use application/json.");
  }
  next();
});

app.get("/api/health", (req, res) =>
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    status: mongoose.connection.readyState === 1 ? "ok" : "unavailable",
  }),
);

app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => env.NODE_ENV === "test",
    message: { message: "Too many requests. Please wait a minute." },
  }),
  router,
);

app.use("/api", (req, res) =>
  res.status(404).json({ message: "Endpoint not found." }),
);

if (env.SERVE_FRONTEND === "true") {
  const dist = fileURLToPath(new URL("../../frontend/dist/", import.meta.url));
  app.use(express.static(dist));
  app.get("/{*path}", (req, res) => res.sendFile(`${dist}index.html`));
}

app.use(errorHandler);
