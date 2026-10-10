
import express from "express";
import cors from "cors";
import tasksRouter from "./routes/tasks.js";
import eventsRouter from "./routes/events.js";
import sessionsRouter from "./routes/sessions.js";
import dashboardRouter from "./routes/dashboard.js";
import statsRouter from "./routes/stats.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use("/api/tasks", tasksRouter);
app.use("/api/events", eventsRouter);
app.use("/api/study-sessions", sessionsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/stats", statsRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found."
  });
});

app.use(errorHandler);

export default app;
