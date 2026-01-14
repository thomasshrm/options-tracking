import {
  pgEnum,
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  numeric,
  boolean,
  date
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const positionTypeEnum = pgEnum("position_type", [
  "CASH_SECURED_PUT",
  "COVERED_CALL",
  "NAKED_CALL",
  "NAKED_PUT",
  "NAKED_PUT_SELLING",
  "NAKED_CALL_SELLING"
]);
export const directionEnum = pgEnum("position_direction", ["LONG", "SHORT"]);
export const statusEnum = pgEnum("position_status", ["OPEN", "CLOSED"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  positionType: positionTypeEnum("position_type").notNull(),
  direction: directionEnum("direction").notNull(),
  strikePrice: numeric("strike_price", { precision: 12, scale: 2 }).notNull(),
  premium: numeric("premium", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  expirationDate: date("expiration_date").notNull(),
  openDate: date("open_date").notNull(),
  closeDate: date("close_date"),
  status: statusEnum("status").notNull().default("OPEN"),
  pnlRealized: numeric("pnl_realized", { precision: 12, scale: 2 }).notNull().default("0"),
  pnlUnrealized: numeric("pnl_unrealized", { precision: 12, scale: 2 }).notNull().default("0"),
  deletedAt: timestamp("deleted_at")
});
