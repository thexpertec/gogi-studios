import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "./lib/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  // Schema guard: ensure the content_overrides table exists before serving
  // requests, in every environment (dev and production).
  try {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS content_overrides (id text PRIMARY KEY, value text NOT NULL)",
    );
  } catch (err) {
    logger.error({ err }, "Failed to ensure content_overrides table");
    process.exit(1);
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

void start();
