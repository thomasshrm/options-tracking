import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db, initializeDatabase } from "./db.js";
import { users } from "./schema.js";
import { eq } from "drizzle-orm";
import authRoutes from "./routes/auth.js";
import positionsRoutes from "./routes/positions.js";
import dashboardRoutes from "./routes/dashboard.js";
import adminRoutes from "./routes/admin.js";
import { authenticate, requireAdmin } from "./middleware/auth.js";
import { hashPassword } from "./utils/password.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/positions", authenticate, positionsRoutes);
app.use("/dashboard", authenticate, dashboardRoutes);
app.use("/admin", authenticate, requireAdmin, adminRoutes);

const ensureAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return;
  }

  const existing = await db.select().from(users).where(eq(users.email, adminEmail));
  if (existing.length > 0) {
    return;
  }

  const passwordHash = await hashPassword(adminPassword);
  await db.insert(users).values({
    email: adminEmail,
    username: "Admin",
    passwordHash,
    role: "admin",
    isActive: true
  });
};

const port = process.env.PORT || 4000;

const start = async () => {
  await initializeDatabase();
  await ensureAdmin();
  app.listen(port, () => {
    console.log(`Backend listening on ${port}`);
  });
};

start();
