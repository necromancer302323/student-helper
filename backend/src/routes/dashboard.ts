
import { Router } from "express";
import db from "../database/db.js";

const router = Router();

router.get("/", (_req, res) => {
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  const tasks = db.prepare(`
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(completed), 0) AS completed
    FROM tasks WHERE due_date = ?
  `).get(todayString) as { total: number; completed: number };

  const study = db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) AS minutes
    FROM study_sessions WHERE study_date = ?
  `).get(todayString) as { minutes: number };

  const totalStudy = db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) AS minutes
    FROM study_sessions
  `).get() as { minutes: number };

  const upcomingEvents = db.prepare(`
    SELECT * FROM events
    WHERE event_date >= ?
    ORDER BY event_date, event_time
    LIMIT 5
  `).all(todayString);

  const todayTasks = db.prepare(`
    SELECT * FROM tasks
    WHERE due_date = ?
    ORDER BY completed, due_time
    LIMIT 5
  `).all(todayString);

  const weekly = db.prepare(`
    SELECT study_date AS date,
      ROUND(SUM(duration_minutes) / 60.0, 2) AS hours
    FROM study_sessions
    WHERE study_date >= date(?, '-6 days')
      AND study_date <= ?
    GROUP BY study_date
    ORDER BY study_date
  `).all(todayString, todayString);

  res.json({
    success: true,
    data: {
      todayTasks: {
        total: tasks.total,
        completed: tasks.completed,
        pending: tasks.total - tasks.completed
      },
      todayStudyMinutes: study.minutes,
      totalStudyMinutes: totalStudy.minutes,
      overallStudyHours: Math.round(totalStudy.minutes / 60 * 100) / 100,
      todayTasksPreview: todayTasks,
      upcomingEvents,
      weeklyStudyHours: weekly
    }
  });
});

export default router;
