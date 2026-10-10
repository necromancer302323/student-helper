
import { Router } from "express";
import db from "../database/db.js";
import { taskSchema } from "../schemas/schemas.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

function validateId(id: string): number {
  const value = Number(id);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new AppError(400, "Invalid task ID.");
  }
  return value;
}

router.get("/", (req, res) => {
  const filter = String(req.query.filter ?? "all");
  const search = String(req.query.search ?? "").trim();
  const sort = String(req.query.sort ?? "due_date");

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filter === "completed") conditions.push("completed = 1");
  if (filter === "pending") conditions.push("completed = 0");
  if (filter === "today") {
    conditions.push("due_date = ?");
    params.push(new Date().toLocaleDateString("en-CA"));
  }
  if (filter === "upcoming") {
    conditions.push("completed = 0 AND due_date > ?");
    params.push(new Date().toLocaleDateString("en-CA"));
  }

  if (search) {
    conditions.push("(title LIKE ? OR subject LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const order = sort === "priority"
    ? "CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, due_date"
    : "due_date, due_time";

  const tasks = db.prepare(
    `SELECT * FROM tasks ${where} ORDER BY ${order}`
  ).all(...params);

  res.json({ success: true, data: tasks });
});

router.get("/:id", (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?")
    .get(validateId(req.params.id));

  if (!task) throw new AppError(404, "Task not found.");
  res.json({ success: true, data: task });
});

router.post("/", (req, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid task.");
  }

  const t = parsed.data;

  const result = db.prepare(`
    INSERT INTO tasks
      (title, description, subject, due_date, due_time, priority, completed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    t.title,
    t.description || null,
    t.subject,
    t.due_date,
    t.due_time || null,
    t.priority,
    Number(t.completed)
  );

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({ success: true, data: task });
});

router.put("/:id", (req, res) => {
  const id = validateId(req.params.id);
  const parsed = taskSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid task.");
  }

  const t = parsed.data;
  const result = db.prepare(`
    UPDATE tasks SET title = ?, description = ?, subject = ?,
      due_date = ?, due_time = ?, priority = ?, completed = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    t.title,
    t.description || null,
    t.subject,
    t.due_date,
    t.due_time || null,
    t.priority,
    Number(t.completed),
    id
  );

  if (!result.changes) throw new AppError(404, "Task not found.");

  res.json({
    success: true,
    data: db.prepare("SELECT * FROM tasks WHERE id = ?").get(id)
  });
});

router.patch("/:id/complete", (req, res) => {
  const id = validateId(req.params.id);

  if (typeof req.body.completed !== "boolean") {
    throw new AppError(400, "completed must be true or false.");
  }

  const result = db.prepare(`
    UPDATE tasks SET completed = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(Number(req.body.completed), id);

  if (!result.changes) throw new AppError(404, "Task not found.");

  res.json({
    success: true,
    data: db.prepare("SELECT * FROM tasks WHERE id = ?").get(id)
  });
});

router.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM tasks WHERE id = ?")
    .run(validateId(req.params.id));

  if (!result.changes) throw new AppError(404, "Task not found.");

  res.json({ success: true, message: "Task deleted." });
});

export default router;
