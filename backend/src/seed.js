import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from './db.js';
import { users } from './schema.js';

export const ensureAdminUser = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_USERNAME || 'Admin';

  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin seed.');
    return;
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    email,
    username,
    passwordHash,
    role: 'admin',
    isActive: true
  });
};
