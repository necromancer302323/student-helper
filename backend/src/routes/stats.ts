
import { Router } from "express";
import db from "../database/db.js";

const router = Router();

router.get("/weekly", (_req, res) => {
  const data = db.prepare(`
    WITH RECURSIVE days(day, n) AS (
      SELECT date('now', 'localtime', '-6 days'), 0
      UNION ALL
      SELECT date(day, '+1 day'), n + 1 FROM days WHERE n < 6
    )
    SELECT days.day AS date,
      ROUND(COALESCE(SUM(s.duration_minutes), 0) / 60.0, 2) AS hours
    FROM days
    LEFT JOIN study_sessions s ON s.study_date = days.day
    GROUP BY days.day
    ORDER BY days.day
  `).all();

  res.json({ success: true, data });
});

router.get("/subjects", (_req, res) => {
  const data = db.prepare(`
    SELECT subject,
      SUM(duration_minutes) AS minutes,
      ROUND(SUM(duration_minutes) / 60.0, 2) AS hours,
      COUNT(*) AS sessions
    FROM study_sessions
    GROUP BY subject
    ORDER BY minutes DESC
  `).all();

  res.json({ success: true, data });
});

export default router;
