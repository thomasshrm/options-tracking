import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/users", async (_req, res) => {
  const data = await db.select({
    id: users.id,
    email: users.email,
    username: users.username,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt
  }).from(users);
  return res.json({ users: data });
});

const roleSchema = z.object({ role: z.enum(["user", "admin"]) });
router.patch("/users/:id/role", async (req, res) => {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides.", errors: parsed.error.flatten() });
  }

  const userId = Number(req.params.id);
  const [updated] = await db
    .update(users)
    .set({ role: parsed.data.role, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    return res.status(404).json({ message: "Utilisateur introuvable." });
  }

  return res.json({ user: updated });
});

const statusSchema = z.object({ isActive: z.boolean() });
router.patch("/users/:id/status", async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides.", errors: parsed.error.flatten() });
  }

  const userId = Number(req.params.id);
  const [updated] = await db
    .update(users)
    .set({ isActive: parsed.data.isActive, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    return res.status(404).json({ message: "Utilisateur introuvable." });
  }

  return res.json({ user: updated });
});

router.delete("/users/:id", async (req, res) => {
  const userId = Number(req.params.id);
  const [deleted] = await db.delete(users).where(eq(users.id, userId)).returning();
  if (!deleted) {
    return res.status(404).json({ message: "Utilisateur introuvable." });
  }
  return res.json({ user: deleted });
});

export default router;
