const {
  pgTable,
  serial,
  varchar,
  timestamp,
  boolean,
  text,
  integer,
  numeric,
  date,
} = require("drizzle-orm/pg-core");

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: varchar("symbol", { length: 12 }).notNull(),
  positionType: varchar("position_type", { length: 50 }).notNull(),
  direction: varchar("direction", { length: 10 }).notNull(),
  strikePrice: numeric("strike_price", { precision: 12, scale: 2 }).notNull(),
  premium: numeric("premium", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  expirationDate: date("expiration_date").notNull(),
  openDate: date("open_date").notNull(),
  closeDate: date("close_date"),
  status: varchar("status", { length: 20 }).notNull().default("OPEN"),
  pnlRealized: numeric("pnl_realized", { precision: 12, scale: 2 }).notNull().default("0"),
  pnlUnrealized: numeric("pnl_unrealized", { precision: 12, scale: 2 }).notNull().default("0"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

module.exports = {
  users,
  positions,
};
