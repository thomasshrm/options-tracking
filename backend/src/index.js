import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

const DB_PATH = process.env.DB_PATH || "./data/data.sqlite";
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    symbol TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    premium REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    opened_at TEXT NOT NULL,
    closed_at TEXT,
    pnl REAL DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const ensureAdmin = () => {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(ADMIN_EMAIL);
  if (!existing) {
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    db.prepare(
      "INSERT INTO users (username, email, password_hash, role, active, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(ADMIN_USERNAME, ADMIN_EMAIL, passwordHash, "admin", 1, new Date().toISOString());
  }
};

ensureAdmin();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Token manquant" });
  }
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Accès administrateur requis" });
  }
  return next();
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ message: "Email déjà utilisé" });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare(
      "INSERT INTO users (username, email, password_hash, role, active, created_at) VALUES (?, ?, ?, 'user', 1, ?)"
    )
    .run(username, email, passwordHash, new Date().toISOString());
  return res.status(201).json({ id: info.lastInsertRowid });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    return res.status(401).json({ message: "Identifiants invalides" });
  }
  if (!user.active) {
    return res.status(403).json({ message: "Compte désactivé" });
  }
  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: "Identifiants invalides" });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, username: user.username },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
  return res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role, active: !!user.active }
  });
});

app.get("/api/users", authMiddleware, adminMiddleware, (req, res) => {
  const users = db
    .prepare("SELECT id, username, email, role, active, created_at FROM users ORDER BY created_at DESC")
    .all();
  res.json(users);
});

app.patch("/api/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { role, active } = req.body;
  const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }
  db.prepare("UPDATE users SET role = COALESCE(?, role), active = COALESCE(?, active) WHERE id = ?").run(
    role,
    typeof active === "boolean" ? (active ? 1 : 0) : null,
    id
  );
  const user = db.prepare("SELECT id, username, email, role, active FROM users WHERE id = ?").get(id);
  return res.json(user);
});

app.get("/api/positions", authMiddleware, (req, res) => {
  const positions = db
    .prepare("SELECT * FROM positions WHERE user_id = ? ORDER BY opened_at DESC")
    .all(req.user.id);
  res.json(positions);
});

app.post("/api/positions", authMiddleware, (req, res) => {
  const { type, symbol, quantity, premium, notes } = req.body;
  if (!type || !symbol || !quantity || !premium) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }
  const info = db
    .prepare(
      "INSERT INTO positions (user_id, type, symbol, quantity, premium, status, opened_at, notes) VALUES (?, ?, ?, ?, ?, 'open', ?, ?)"
    )
    .run(req.user.id, type, symbol, quantity, premium, new Date().toISOString(), notes || null);
  const position = db.prepare("SELECT * FROM positions WHERE id = ?").get(info.lastInsertRowid);
  return res.status(201).json(position);
});

app.put("/api/positions/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { type, symbol, quantity, premium, notes } = req.body;
  const position = db.prepare("SELECT * FROM positions WHERE id = ? AND user_id = ?").get(id, req.user.id);
  if (!position) {
    return res.status(404).json({ message: "Position introuvable" });
  }
  db.prepare(
    "UPDATE positions SET type = COALESCE(?, type), symbol = COALESCE(?, symbol), quantity = COALESCE(?, quantity), premium = COALESCE(?, premium), notes = COALESCE(?, notes) WHERE id = ?"
  ).run(type, symbol, quantity, premium, notes, id);
  const updated = db.prepare("SELECT * FROM positions WHERE id = ?").get(id);
  return res.json(updated);
});

app.put("/api/positions/:id/close", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { pnl } = req.body;
  const position = db.prepare("SELECT * FROM positions WHERE id = ? AND user_id = ?").get(id, req.user.id);
  if (!position) {
    return res.status(404).json({ message: "Position introuvable" });
  }
  db.prepare("UPDATE positions SET status = 'closed', closed_at = ?, pnl = ? WHERE id = ?").run(
    new Date().toISOString(),
    pnl || 0,
    id
  );
  const updated = db.prepare("SELECT * FROM positions WHERE id = ?").get(id);
  return res.json(updated);
});

app.delete("/api/positions/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const position = db.prepare("SELECT * FROM positions WHERE id = ? AND user_id = ?").get(id, req.user.id);
  if (!position) {
    return res.status(404).json({ message: "Position introuvable" });
  }
  db.prepare("DELETE FROM positions WHERE id = ?").run(id);
  return res.status(204).send();
});

app.get("/api/dashboard", authMiddleware, (req, res) => {
  const totals = db
    .prepare(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as openCount, SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closedCount, SUM(pnl) as totalPnl FROM positions WHERE user_id = ?"
    )
    .get(req.user.id);
  res.json({
    totalPositions: totals.total || 0,
    openPositions: totals.openCount || 0,
    closedPositions: totals.closedCount || 0,
    totalPnl: totals.totalPnl || 0
  });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
