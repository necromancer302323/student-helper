
import { Router } from "express";
import db from "../database/db.js";
import { sessionSchema } from "../schemas/schemas.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

function getId(id: string) {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n < 1) {
    throw new AppError(400, "Invalid session ID.");
  }
  return n;
}

router.get("/", (req, res) => {
  const subject = String(req.query.subject ?? "").trim();
  const sessions = subject
    ? db.prepare(
        "SELECT * FROM study_sessions WHERE subject = ? ORDER BY study_date DESC, id DESC"
      ).all(subject)
    : db.prepare(
        "SELECT * FROM study_sessions ORDER BY study_date DESC, id DESC"
      ).all();

  res.json({ success: true, data: sessions });
});

router.get("/:id", (req, res) => {
  const session = db.prepare("SELECT * FROM study_sessions WHERE id = ?")
    .get(getId(req.params.id));

  if (!session) throw new AppError(404, "Study session not found.");
  res.json({ success: true, data: session });
});

router.post("/", (req, res) => {
  const parsed = sessionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid session.");
  }

  const s = parsed.data;
  const result = db.prepare(`
    INSERT INTO study_sessions
      (subject, study_date, duration_minutes, description, source)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    s.subject, s.study_date, s.duration_minutes,
    s.description || null, s.source || null
  );

  res.status(201).json({
    success: true,
    data: db.prepare("SELECT * FROM study_sessions WHERE id = ?")
      .get(result.lastInsertRowid)
  });
});

router.put("/:id", (req, res) => {
  const id = getId(req.params.id);
  const parsed = sessionSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid session.");
  }

  const s = parsed.data;
  const result = db.prepare(`
    UPDATE study_sessions SET subject = ?, study_date = ?,
      duration_minutes = ?, description = ?, source = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    s.subject, s.study_date, s.duration_minutes,
    s.description || null, s.source || null, id
  );

  if (!result.changes) throw new AppError(404, "Study session not found.");

  res.json({
    success: true,
    data: db.prepare("SELECT * FROM study_sessions WHERE id = ?").get(id)
  });
});

router.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM study_sessions WHERE id = ?")
    .run(getId(req.params.id));

  if (!result.changes) throw new AppError(404, "Study session not found.");

  res.json({ success: true, message: "Study session deleted." });
});

export default router;
    