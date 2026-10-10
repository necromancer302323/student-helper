
import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT ?? 5000);

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
