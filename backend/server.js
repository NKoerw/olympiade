"use strict";

const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const express = require("express");
const cors = require("cors");

const PORT = Number(process.env.PORT || 8787);
const APP_PASSWORD = process.env.APP_PASSWORD || "";
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data", "state.json");
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const app = express();
app.use(express.json({ limit: "1mb" }));

const corsOrigin = ALLOWED_ORIGIN === "*"
  ? true
  : ALLOWED_ORIGIN.split(",").map(function (item) { return item.trim(); }).filter(Boolean);

app.use(cors({
  origin: corsOrigin,
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-App-Password", "Authorization"]
}));

app.use(function (_req, res, next) {
  res.setHeader("Cache-Control", "no-store");
  next();
});

let writeQueue = Promise.resolve();

function sanitizeRoom(room) {
  const clean = String(room || "default").trim();
  if (!clean) return "default";
  return clean.slice(0, 64);
}

function getProvidedPassword(req) {
  const headerPass = req.get("X-App-Password");
  if (headerPass) return String(headerPass);
  const auth = req.get("Authorization") || "";
  const bearer = auth.match(/^Bearer\s+(.+)$/i);
  return bearer ? bearer[1] : "";
}

function secureEqual(a, b) {
  const aBuf = Buffer.from(String(a), "utf8");
  const bBuf = Buffer.from(String(b), "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function requirePassword(req, res, next) {
  if (!APP_PASSWORD) {
    res.status(500).json({ error: "APP_PASSWORD is not configured on the server." });
    return;
  }
  const provided = getProvidedPassword(req);
  if (!provided || !secureEqual(APP_PASSWORD, provided)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

async function readStore() {
  try {
    const text = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object") return { rooms: {} };
    if (!parsed.rooms || typeof parsed.rooms !== "object") parsed.rooms = {};
    return parsed;
  } catch (err) {
    if (err && err.code === "ENOENT") return { rooms: {} };
    throw err;
  }
}

async function writeStore(store) {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  const tempFile = DATA_FILE + ".tmp";
  await fs.writeFile(tempFile, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tempFile, DATA_FILE);
}

function queueWrite(task) {
  const run = writeQueue.then(task);
  writeQueue = run.catch(function () {});
  return run;
}

app.get("/health", function (_req, res) {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post("/api/login", requirePassword, function (_req, res) {
  res.json({ ok: true });
});

app.get("/api/state", requirePassword, async function (req, res) {
  try {
    const room = sanitizeRoom(req.query.room);
    const store = await readStore();
    const entry = store.rooms[room];
    if (!entry) {
      res.json({ state: null, updatedAt: null });
      return;
    }
    res.json({ state: entry.state || null, updatedAt: entry.updatedAt || null });
  } catch (err) {
    console.error("GET /api/state failed", err);
    res.status(500).json({ error: "Failed to read state" });
  }
});

app.put("/api/state", requirePassword, async function (req, res) {
  try {
    const room = sanitizeRoom(req.query.room);
    if (!req.body || typeof req.body.state !== "object" || req.body.state === null) {
      res.status(400).json({ error: "Body must contain { state: object }" });
      return;
    }

    const updatedAt = new Date().toISOString();
    await queueWrite(async function () {
      const store = await readStore();
      store.rooms[room] = {
        state: req.body.state,
        updatedAt: updatedAt
      };
      await writeStore(store);
    });

    res.json({ ok: true, updatedAt: updatedAt });
  } catch (err) {
    console.error("PUT /api/state failed", err);
    res.status(500).json({ error: "Failed to save state" });
  }
});

app.listen(PORT, function () {
  console.log("Bierolympiade backend running on port " + PORT);
  console.log("Data file: " + DATA_FILE);
  if (!APP_PASSWORD) {
    console.warn("Warning: APP_PASSWORD is empty. All requests will fail until set.");
  }
});
