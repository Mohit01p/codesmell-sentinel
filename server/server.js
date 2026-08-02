require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

// Webhook route needs the RAW body for signature verification,
// so it's mounted here, before express.json() parses everything else.
app.use(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body; // save the raw buffer for signature check
    req.body = JSON.parse(req.body.toString("utf8")); // now parse it for normal use
    next();
  },
  require("./routes/webhookRoutes")
);

app.use(express.json());

// --- Health check (Day 1 goal) ---
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CodeSmell Sentinel API is running",
    timestamp: new Date().toISOString(),
  });
});

// --- Routes (added in later days) ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/repos", require("./routes/repoRoutes"));
app.use("/api/scans", require("./routes/scanRoutes"));
// app.use("/webhook", require("./routes/webhookRoutes"));

// --- Error handler (must be last) ---
app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
    console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
  });
}

start();
