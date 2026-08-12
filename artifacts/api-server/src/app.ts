import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    // Allow the Replit dev proxy and any deployed origin
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
// Signed cookies — SESSION_SECRET is required
app.use(cookieParser(process.env.SESSION_SECRET));

app.use("/api", router);

// Production single-process mode: serve the built frontend from this server.
// Enabled when STATIC_DIR is set (or defaults to the sibling frontend build in
// production). Not used in Replit development, where Vite serves the frontend.
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const staticDirCandidates = [
  process.env.STATIC_DIR,
  ...(process.env.NODE_ENV === "production"
    ? [
        // Flat prebuilt bundle: public/ next to the server file
        path.resolve(serverDir, "public"),
        // Monorepo layout: sibling frontend build
        path.resolve(serverDir, "../../gogi-studios/dist/public"),
      ]
    : []),
];
const staticDir = staticDirCandidates
  .filter((dir): dir is string => Boolean(dir))
  .map((dir) => path.resolve(dir))
  .find((dir) => fs.existsSync(dir));

if (staticDir) {
  app.use(express.static(staticDir, { maxAge: "1h", index: "index.html" }));
  // SPA fallback: any non-API GET that wasn't matched serves index.html
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      res.sendFile(path.join(staticDir, "index.html"));
    } else {
      next();
    }
  });
  logger.info({ staticDir }, "Serving static frontend");
}

export default app;
