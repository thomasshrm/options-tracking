const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const dotenv = require("dotenv");
const { and, eq, isNull } = require("drizzle-orm");

const { db, pool } = require("./db");
const { users, positions } = require("./schema");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const positionSchema = z.object({
  symbol: z.string().min(1),
  positionType: z.enum([
    "CASH_SECURED_PUT",
    "COVERED_CALL",
    "NAKED_CALL",
    "NAKED_PUT",
    "NAKED_PUT_SELLING",
    "NAKED_CALL_SELLING",
  ]),
  direction: z.enum(["LONG", "SHORT"]),
  strikePrice: z.number().nonnegative(),
  premium: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  expirationDate: z.string(),
  openDate: z.string(),
});

const updatePositionSchema = positionSchema.partial();

const createToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "12h" });

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Missing token" });
  }
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  return next();
};

const ensureAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME || "Admin";

  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set; admin user not created.");
    return;
  }

  const existing = await db.select().from(users).where(eq(users.email, adminEmail));
  if (existing.length > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await db.insert(users).values({
    email: adminEmail,
    username: adminUsername,
    passwordHash,
    role: "admin",
    isActive: true,
  });
};

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const payload = registerSchema.parse(req.body);
    const existing = await db.select().from(users).where(eq(users.email, payload.email));
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already used" });
    }
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const [created] = await db
      .insert(users)
      .values({
        email: payload.email,
        username: payload.username,
        passwordHash,
        role: "user",
        isActive: true,
      })
      .returning();

    return res.status(201).json({
      token: createToken(created),
      user: { id: created.id, email: created.email, username: created.username, role: created.role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid payload", details: error.errors });
    }
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const payload = loginSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, payload.email));
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account inactive" });
    }
    const ok = await bcrypt.compare(payload.password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    return res.json({
      token: createToken(user),
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid payload", details: error.errors });
    }
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/users/me", authMiddleware, async (req, res) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({ id: user.id, email: user.email, username: user.username, role: user.role });
});

app.get("/api/positions", authMiddleware, async (req, res) => {
  const rows = await db
    .select()
    .from(positions)
    .where(and(eq(positions.userId, req.user.id), isNull(positions.deletedAt)));
  return res.json(rows);
});

app.post("/api/positions", authMiddleware, async (req, res) => {
  try {
    const payload = positionSchema.parse(req.body);
    const [created] = await db
      .insert(positions)
      .values({
        userId: req.user.id,
        symbol: payload.symbol,
        positionType: payload.positionType,
        direction: payload.direction,
        strikePrice: payload.strikePrice,
        premium: payload.premium,
        quantity: payload.quantity,
        expirationDate: payload.expirationDate,
        openDate: payload.openDate,
        status: "OPEN",
      })
      .returning();
    return res.status(201).json(created);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid payload", details: error.errors });
    }
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/positions/:id", authMiddleware, async (req, res) => {
  try {
    const payload = updatePositionSchema.parse(req.body);
    const [updated] = await db
      .update(positions)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(and(eq(positions.id, Number(req.params.id)), eq(positions.userId, req.user.id)) )
      .returning();
    if (!updated) {
      return res.status(404).json({ message: "Position not found" });
    }
    return res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid payload", details: error.errors });
    }
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/positions/:id/close", authMiddleware, async (req, res) => {
  const { pnlRealized = 0 } = req.body || {};
  const [updated] = await db
    .update(positions)
    .set({
      status: "CLOSED",
      closeDate: new Date().toISOString().slice(0, 10),
      pnlRealized,
      updatedAt: new Date(),
    })
    .where(and(eq(positions.id, Number(req.params.id)), eq(positions.userId, req.user.id)))
    .returning();
  if (!updated) {
    return res.status(404).json({ message: "Position not found" });
  }
  return res.json(updated);
});

app.delete("/api/positions/:id", authMiddleware, async (req, res) => {
  const [updated] = await db
    .update(positions)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(positions.id, Number(req.params.id)), eq(positions.userId, req.user.id)))
    .returning();
  if (!updated) {
    return res.status(404).json({ message: "Position not found" });
  }
  return res.json({ success: true });
});

app.get("/api/dashboard", authMiddleware, async (req, res) => {
  const rows = await db
    .select()
    .from(positions)
    .where(and(eq(positions.userId, req.user.id), isNull(positions.deletedAt)));

  const totalPnl = rows.reduce((sum, row) => sum + Number(row.pnlRealized || 0), 0);
  const openPositions = rows.filter((row) => row.status === "OPEN").length;
  const wins = rows.filter((row) => Number(row.pnlRealized || 0) > 0).length;
  const winRate = rows.length ? Math.round((wins / rows.length) * 100) : 0;
  const strategyBreakdown = rows.reduce((acc, row) => {
    acc[row.positionType] = (acc[row.positionType] || 0) + 1;
    return acc;
  }, {});

  return res.json({
    totalPnl,
    openPositions,
    winRate,
    strategyBreakdown,
    positions: rows,
  });
});

app.get("/api/admin/users", authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.select().from(users);
  return res.json(rows);
});

app.patch("/api/admin/users/:id", authMiddleware, adminOnly, async (req, res) => {
  const payload = z
    .object({
      role: z.enum(["user", "admin"]).optional(),
      isActive: z.boolean().optional(),
    })
    .parse(req.body);

  const [updated] = await db
    .update(users)
    .set({
      ...payload,
      updatedAt: new Date(),
    })
    .where(eq(users.id, Number(req.params.id)))
    .returning();
  if (!updated) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json(updated);
});

app.delete("/api/admin/users/:id", authMiddleware, adminOnly, async (req, res) => {
  const [deleted] = await db.delete(users).where(eq(users.id, Number(req.params.id))).returning();
  if (!deleted) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({ success: true });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

const start = async () => {
  try {
    await pool.query("SELECT 1");
    await ensureAdmin();
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
