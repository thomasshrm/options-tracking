import { pgTable, serial, varchar, timestamp, boolean, integer, numeric, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const positions = pgTable('positions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  positionType: varchar('position_type', { length: 40 }).notNull(),
  direction: varchar('direction', { length: 10 }).notNull(),
  strikePrice: numeric('strike_price', { precision: 12, scale: 2 }).notNull(),
  premium: numeric('premium', { precision: 12, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  expirationDate: date('expiration_date').notNull(),
  openDate: date('open_date').notNull(),
  closeDate: date('close_date'),
  status: varchar('status', { length: 10 }).notNull().default('OPEN'),
  pnlRealized: numeric('pnl_realized', { precision: 12, scale: 2 }).notNull().default('0'),
  pnlUnrealized: numeric('pnl_unrealized', { precision: 12, scale: 2 }).notNull().default('0'),
  deletedAt: timestamp('deleted_at', { withTimezone: true })
});
