import { Router } from "express";
import { db } from "../db.js";
import { positions } from "../schema.js";
import { and, eq, isNull, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const userId = req.user.id;
  const rows = await db
    .select({
      totalRealized: sql`COALESCE(SUM(${positions.pnlRealized}), 0)`.mapWith(Number),
      totalUnrealized: sql`COALESCE(SUM(${positions.pnlUnrealized}), 0)`.mapWith(Number),
      openPositions: sql`COUNT(*) FILTER (WHERE ${positions.status} = 'OPEN')`.mapWith(Number),
      totalPositions: sql`COUNT(*)`.mapWith(Number),
      wins: sql`COUNT(*) FILTER (WHERE ${positions.pnlRealized} > 0)`.mapWith(Number)
    })
    .from(positions)
    .where(and(eq(positions.userId, userId), isNull(positions.deletedAt)));

  const stats = rows[0] || {
    totalRealized: 0,
    totalUnrealized: 0,
    openPositions: 0,
    totalPositions: 0,
    wins: 0
  };

  const pnlByMonth = await db.execute(sql`
    SELECT
      TO_CHAR(open_date, 'YYYY-MM') AS month,
      COALESCE(SUM(pnl_realized), 0) AS pnl
    FROM positions
    WHERE user_id = ${userId} AND deleted_at IS NULL
    GROUP BY month
    ORDER BY month DESC
  `);

  const distribution = await db.execute(sql`
    SELECT position_type AS type, COUNT(*)::int AS count
    FROM positions
    WHERE user_id = ${userId} AND deleted_at IS NULL
    GROUP BY position_type
  `);

  const winRate = stats.totalPositions > 0 ? (stats.wins / stats.totalPositions) * 100 : 0;

  return res.json({
    totals: {
      pnlTotal: stats.totalRealized + stats.totalUnrealized,
      pnlRealized: stats.totalRealized,
      pnlUnrealized: stats.totalUnrealized
    },
    openPositions: stats.openPositions,
    winRate,
    pnlByMonth: pnlByMonth.rows,
    strategyDistribution: distribution.rows
  });
});

export default router;
