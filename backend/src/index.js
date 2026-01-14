import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { db, pool } from './db.js';
import { users, positions } from './schema.js';
import { authenticate, requireAdmin, signToken } from './auth.js';
import { ensureAdminUser } from './seed.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const positionSchema = z.object({
  symbol: z.string().min(1),
  positionType: z.enum([
    'CASH_SECURED_PUT',
    'COVERED_CALL',
    'NAKED_CALL',
    'NAKED_PUT',
    'NAKED_PUT_SELLING',
    'NAKED_CALL_SELLING'
  ]),
  direction: z.enum(['LONG', 'SHORT']),
  strikePrice: z.number().positive(),
  premium: z.number(),
  quantity: z.number().int().positive(),
  expirationDate: z.string(),
  openDate: z.string(),
  closeDate: z.string().nullable().optional(),
  status: z.enum(['OPEN', 'CLOSED']).default('OPEN'),
  pnlRealized: z.number().default(0),
  pnlUnrealized: z.number().default(0)
});

const updatePositionSchema = positionSchema.partial();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() });
  }
  const { email, username, password } = parsed.data;
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email)
  });
  if (existing) {
    return res.status(409).json({ message: 'Email already used.' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [created] = await db.insert(users).values({
    email,
    username,
    passwordHash,
    role: 'user',
    isActive: true
  }).returning();
  const token = signToken(created);
  res.status(201).json({ token, user: { id: created.id, email: created.email, username: created.username, role: created.role } });
});

app.post('/api/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }
  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }
  const token = signToken(user);
  res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
});

app.get('/api/me', authenticate, async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, req.user.id) });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json({ id: user.id, email: user.email, username: user.username, role: user.role, isActive: user.isActive });
});

app.get('/api/positions', authenticate, async (req, res) => {
  const data = await db.select()
    .from(positions)
    .where(and(eq(positions.userId, req.user.id), isNull(positions.deletedAt)))
    .orderBy(desc(positions.openDate));
  res.json(data);
});

app.post('/api/positions', authenticate, async (req, res) => {
  const parsed = positionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() });
  }
  const payload = parsed.data;
  const [created] = await db.insert(positions).values({
    userId: req.user.id,
    symbol: payload.symbol.toUpperCase(),
    positionType: payload.positionType,
    direction: payload.direction,
    strikePrice: payload.strikePrice.toString(),
    premium: payload.premium.toString(),
    quantity: payload.quantity,
    expirationDate: payload.expirationDate,
    openDate: payload.openDate,
    closeDate: payload.closeDate,
    status: payload.status,
    pnlRealized: payload.pnlRealized.toString(),
    pnlUnrealized: payload.pnlUnrealized.toString()
  }).returning();
  res.status(201).json(created);
});

app.put('/api/positions/:id', authenticate, async (req, res) => {
  const parsed = updatePositionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() });
  }
  const payload = parsed.data;
  const [updated] = await db.update(positions)
    .set({
      ...payload,
      strikePrice: payload.strikePrice?.toString(),
      premium: payload.premium?.toString(),
      pnlRealized: payload.pnlRealized?.toString(),
      pnlUnrealized: payload.pnlUnrealized?.toString()
    })
    .where(and(eq(positions.id, Number(req.params.id)), eq(positions.userId, req.user.id)))
    .returning();
  if (!updated) {
    return res.status(404).json({ message: 'Position not found.' });
  }
  res.json(updated);
});

app.post('/api/positions/:id/close', authenticate, async (req, res) => {
  const [updated] = await db.update(positions)
    .set({ status: 'CLOSED', closeDate: sql`CURRENT_DATE` })
    .where(and(eq(positions.id, Number(req.params.id)), eq(positions.userId, req.user.id)))
    .returning();
  if (!updated) {
    return res.status(404).json({ message: 'Position not found.' });
  }
  res.json(updated);
});

app.delete('/api/positions/:id', authenticate, async (req, res) => {
  const [updated] = await db.update(positions)
    .set({ deletedAt: sql`NOW()` })
    .where(and(eq(positions.id, Number(req.params.id)), eq(positions.userId, req.user.id)))
    .returning();
  if (!updated) {
    return res.status(404).json({ message: 'Position not found.' });
  }
  res.json({ message: 'Position deleted.' });
});

app.get('/api/dashboard', authenticate, async (req, res) => {
  const [totals] = await db.select({
    pnlRealized: sql`COALESCE(SUM(${positions.pnlRealized}), 0)`,
    pnlUnrealized: sql`COALESCE(SUM(${positions.pnlUnrealized}), 0)`
  }).from(positions)
    .where(and(eq(positions.userId, req.user.id), isNull(positions.deletedAt)));

  const [openCount] = await db.select({ count: sql`COUNT(*)` })
    .from(positions)
    .where(and(eq(positions.userId, req.user.id), eq(positions.status, 'OPEN'), isNull(positions.deletedAt)));

  const [winStats] = await db.select({
    wins: sql`SUM(CASE WHEN ${positions.pnlRealized}::numeric > 0 THEN 1 ELSE 0 END)`,
    total: sql`COUNT(*)`
  }).from(positions)
    .where(and(eq(positions.userId, req.user.id), isNull(positions.deletedAt)));

  const strategies = await db.select({
    type: positions.positionType,
    count: sql`COUNT(*)`
  }).from(positions)
    .where(and(eq(positions.userId, req.user.id), isNull(positions.deletedAt)))
    .groupBy(positions.positionType);

  const pnlByMonth = await db.select({
    month: sql`TO_CHAR(${positions.openDate}, 'YYYY-MM')`,
    pnl: sql`SUM(${positions.pnlRealized})`
  })
    .from(positions)
    .where(and(eq(positions.userId, req.user.id), isNull(positions.deletedAt)))
    .groupBy(sql`TO_CHAR(${positions.openDate}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${positions.openDate}, 'YYYY-MM')`);

  res.json({
    pnlTotal: Number(totals.pnlRealized) + Number(totals.pnlUnrealized),
    pnlRealized: Number(totals.pnlRealized),
    pnlUnrealized: Number(totals.pnlUnrealized),
    openPositions: Number(openCount.count),
    winRate: winStats.total ? Number(winStats.wins) / Number(winStats.total) : 0,
    pnlByMonth,
    strategies
  });
});

app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
  const data = await db.select({
    id: users.id,
    email: users.email,
    username: users.username,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt
  }).from(users).orderBy(desc(users.createdAt));
  res.json(data);
});

app.patch('/api/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  const schema = z.object({
    role: z.enum(['user', 'admin']).optional(),
    isActive: z.boolean().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() });
  }
  const [updated] = await db.update(users)
    .set({ ...parsed.data, updatedAt: sql`NOW()` })
    .where(eq(users.id, Number(req.params.id)))
    .returning();
  if (!updated) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json({
    id: updated.id,
    email: updated.email,
    username: updated.username,
    role: updated.role,
    isActive: updated.isActive
  });
});

app.delete('/api/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  const [deleted] = await db.delete(users)
    .where(eq(users.id, Number(req.params.id)))
    .returning();
  if (!deleted) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json({ message: 'User deleted.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

const start = async () => {
  await ensureAdminUser();
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
};

start();

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
