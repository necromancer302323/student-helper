
import { Router } from "express";
import db from "../database/db.js";
import { eventSchema } from "../schemas/schemas.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

function getId(id: string) {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n < 1) {
    throw new AppError(400, "Invalid event ID.");
  }
  return n;
}

router.get("/", (req, res) => {
  const filter = String(req.query.filter ?? "all");
  const where = filter === "upcoming"
    ? "WHERE event_date >= date('now', 'localtime')"
    : filter === "past"
      ? "WHERE event_date < date('now', 'localtime')"
      : "";

  const events = db.prepare(
    `SELECT * FROM events ${where} ORDER BY event_date, event_time`
  ).all();

  res.json({ success: true, data: events });
});

router.get("/:id", (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE id = ?")
    .get(getId(req.params.id));

  if (!event) throw new AppError(404, "Event not found.");
  res.json({ success: true, data: event });
});

router.post("/", (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid event.");
  }

  const e = parsed.data;
  const result = db.prepare(`
    INSERT INTO events
      (title, subject, category, event_date, event_time, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    e.title, e.subject, e.category, e.event_date,
    e.event_time || null, e.description || null
  );

  res.status(201).json({
    success: true,
    data: db.prepare("SELECT * FROM events WHERE id = ?")
      .get(result.lastInsertRowid)
  });
});

router.put("/:id", (req, res) => {
  const id = getId(req.params.id);
  const parsed = eventSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid event.");
  }

  const e = parsed.data;
  const result = db.prepare(`
    UPDATE events SET title = ?, subject = ?, category = ?,
      event_date = ?, event_time = ?, description = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    e.title, e.subject, e.category, e.event_date,
    e.event_time || null, e.description || null, id
  );

  if (!result.changes) throw new AppError(404, "Event not found.");

  res.json({
    success: true,
    data: db.prepare("SELECT * FROM events WHERE id = ?").get(id)
  });
});

router.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM events WHERE id = ?")
    .run(getId(req.params.id));

  if (!result.changes) throw new AppError(404, "Event not found.");

  res.json({ success: true, message: "Event deleted." });
});

export default router;
