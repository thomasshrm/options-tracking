import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { positions } from "../schema.js";
import { and, eq, isNull } from "drizzle-orm";

const router = Router();

const positionSchema = z.object({
  symbol: z.string().min(1),
  positionType: z.enum([
    "CASH_SECURED_PUT",
    "COVERED_CALL",
    "NAKED_CALL",
    "NAKED_PUT",
    "NAKED_PUT_SELLING",
    "NAKED_CALL_SELLING"
  ]),
  direction: z.enum(["LONG", "SHORT"]),
  strikePrice: z.number().positive(),
  premium: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  expirationDate: z.string(),
  openDate: z.string(),
  closeDate: z.string().nullable().optional(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  pnlRealized: z.number().optional(),
  pnlUnrealized: z.number().optional()
});

router.get("/", async (req, res) => {
  const userId = req.user.id;
  const data = await db
    .select()
    .from(positions)
    .where(and(eq(positions.userId, userId), isNull(positions.deletedAt)));
  return res.json({ positions: data });
});

router.post("/", async (req, res) => {
  const parsed = positionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides.", errors: parsed.error.flatten() });
  }

  const payload = parsed.data;
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
      closeDate: payload.closeDate ?? null,
      status: payload.status ?? "OPEN",
      pnlRealized: payload.pnlRealized ?? 0,
      pnlUnrealized: payload.pnlUnrealized ?? 0
    })
    .returning();

  return res.status(201).json({ position: created });
});

router.put("/:id", async (req, res) => {
  const parsed = positionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides.", errors: parsed.error.flatten() });
  }

  const positionId = Number(req.params.id);
  const payload = parsed.data;

  const [updated] = await db
    .update(positions)
    .set({
      symbol: payload.symbol,
      positionType: payload.positionType,
      direction: payload.direction,
      strikePrice: payload.strikePrice,
      premium: payload.premium,
      quantity: payload.quantity,
      expirationDate: payload.expirationDate,
      openDate: payload.openDate,
      closeDate: payload.closeDate ?? null,
      status: payload.status ?? "OPEN",
      pnlRealized: payload.pnlRealized ?? 0,
      pnlUnrealized: payload.pnlUnrealized ?? 0
    })
    .where(and(eq(positions.id, positionId), eq(positions.userId, req.user.id)))
    .returning();

  if (!updated) {
    return res.status(404).json({ message: "Position introuvable." });
  }

  return res.json({ position: updated });
});

router.patch("/:id/close", async (req, res) => {
  const closeSchema = z.object({
    closeDate: z.string(),
    pnlRealized: z.number().optional()
  });
  const parsed = closeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides.", errors: parsed.error.flatten() });
  }

  const positionId = Number(req.params.id);
  const [updated] = await db
    .update(positions)
    .set({
      closeDate: parsed.data.closeDate,
      status: "CLOSED",
      pnlRealized: parsed.data.pnlRealized ?? 0
    })
    .where(and(eq(positions.id, positionId), eq(positions.userId, req.user.id)))
    .returning();

  if (!updated) {
    return res.status(404).json({ message: "Position introuvable." });
  }

  return res.json({ position: updated });
});

router.delete("/:id", async (req, res) => {
  const positionId = Number(req.params.id);
  const [deleted] = await db
    .update(positions)
    .set({ deletedAt: new Date() })
    .where(and(eq(positions.id, positionId), eq(positions.userId, req.user.id)))
    .returning();

  if (!deleted) {
    return res.status(404).json({ message: "Position introuvable." });
  }

  return res.json({ position: deleted });
});

export default router;
