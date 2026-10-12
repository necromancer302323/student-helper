import "dotenv/config";
import http from "http";
import app from "./app.js";

// Keep your original port config intact for React Web
const REACT_WEB_PORT = Number(process.env.PORT ?? 5000);

// Add a distinct port specifically for React Native
const REACT_NATIVE_PORT = 5002;

// 1. Existing Server for React Web (Kept exactly as you had it)
app.listen(REACT_WEB_PORT, "127.0.0.1", () => {
  console.log(`[React Web Backend] Running at http://localhost:${REACT_WEB_PORT}`);
  console.log(`Health check: http://localhost:${REACT_WEB_PORT}/api/health`);
});

// 2. Additional Server Instance for React Native Mobile
const nativeServer = http.createServer(app);
nativeServer.listen(REACT_NATIVE_PORT, "0.0.0.0", () => {
  console.log(`[React Native Backend] Running at http://192.168.31.165:${REACT_NATIVE_PORT}`);
  console.log(`Health check: http://192.168.31.165:${REACT_NATIVE_PORT}/api/health`);
});