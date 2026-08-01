import { Router } from "express";

const router = Router();

const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/** POST /api/auth/login */
router.post("/auth/login", (req, res) => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    res.status(500).json({ ok: false, error: "ADMIN_PASSWORD is not configured." });
    return;
  }

  if (!password || password !== adminPassword) {
    res.status(401).json({ ok: false, error: "Invalid password." });
    return;
  }

  res.cookie(COOKIE_NAME, COOKIE_VALUE, {
    signed: true,
    httpOnly: true,
    sameSite: "none",   // needed so the Replit proxy can forward the cookie cross-origin
    secure: true,
    maxAge: COOKIE_MAX_AGE,
  });

  res.json({ ok: true });
});

/** GET /api/auth/me */
router.get("/auth/me", (req, res) => {
  const isAdmin = (req as any).signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
  res.json({ isAdmin });
});

/** POST /api/auth/logout */
router.post("/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { sameSite: "none", secure: true });
  res.json({ ok: true });
});

export default router;
