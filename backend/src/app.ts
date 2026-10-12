
import express from "express";
import cors from "cors";
import tasksRouter from "./routes/tasks.js";
import eventsRouter from "./routes/events.js";
import sessionsRouter from "./routes/sessions.js";
import dashboardRouter from "./routes/dashboard.js";
import statsRouter from "./routes/stats.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();


// Define all valid frontend origins running across your network
const allowedOrigins = [
  "http://localhost:5173",       // React Vite web app
  "http://localhost:8081",       // Expo web app
  "http://127.0.0.1:8081",       // Expo alternative web format
  "http://192.168.31.165:8081",  // Expo network route
];

app.use(
  cors({
    origin: function (origin, callback) {
      // 1. Allow mobile client requests or local curls that omit an origin header completely
      if (!origin) return callback(null, true);

      // 2. Dynamically accept the incoming origin if it matches our list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS Blocked: Origin ${origin} not explicitly permitted.`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Permits cookie handshakes if your authentication uses them
  })
);

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
