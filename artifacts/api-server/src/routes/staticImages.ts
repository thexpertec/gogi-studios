import { Router } from "express";
import { getObject } from "../lib/r2";

const router = Router();

/** GET /api/static-images/:filename — serve a named static image from R2 */
router.get("/static-images/:filename", async (req, res) => {
  const { filename } = req.params;

  // Basic safety check — no path traversal
  if (!/^[\w.\-]+$/.test(filename)) {
    res.status(400).json({ error: "Invalid filename." });
    return;
  }

  try {
    const obj = await getObject(`static-images/${filename}`);
    if (!obj) {
      res.status(404).json({ error: "Not found." });
      return;
    }
    res.setHeader("Content-Type", obj.contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // 24h
    res.send(obj.body);
  } catch {
    res.status(500).json({ error: "Failed to serve image." });
  }
});

export default router;
