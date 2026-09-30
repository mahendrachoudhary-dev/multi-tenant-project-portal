import mongoose from "mongoose";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

try {
  await connectDB();
  // Ensure the unique indexes exist before accepting requests.
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.init()),
  );

  const server = app.listen(env.PORT, () =>
    console.log(`MULTI-TENANT PROJECT API listening on port ${env.PORT}`),
  );
  
  const shutdown = () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
} catch (error) {
  console.error("Startup failed:", error.message);
  process.exit(1);
}
