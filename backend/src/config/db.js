import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

const dnsServers = (process.env.DNS_SERVERS || "")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

mongoose.set("strictQuery", true);

let connectionPromise = null;

export async function connectDB() {
  if (connectionPromise) {
    return connectionPromise;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  connectionPromise = (async () => {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    // Ensure model indexes exist before handling database requests.
    await Promise.all(
      Object.values(mongoose.models).map((model) => model.init()),
    );

    return mongoose;
  })();

  try {
    return await connectionPromise;
  } finally {
    // Allow another attempt if connection setup fails.
    connectionPromise = null;
  }
}