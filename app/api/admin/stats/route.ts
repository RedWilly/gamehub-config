import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Fetches dashboard statistics for the admin panel.
 *     description: Retrieves key metrics like user counts, config counts, vote totals, and report statuses. Requires ADMIN role.
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     total: { type: 'number' }
 *                     new: { type: 'number' }
 *                 configs:
 *                   type: object
 *                   properties:
 *                     total: { type: 'number' }
 *                     new: { type: 'number' }
 *                 votes:
 *                   type: object
 *                   properties:
 *                     upvotes: { type: 'number' }
 *                     downvotes: { type: 'number' }
 *                     total: { type: 'number' }
 *                 reports:
 *                   type: object
 *                   properties:
 *                     open: { type: 'number' }
 *                     total: { type: 'number' }
 *       403:
 *         description: Forbidden. User is not an admin.
 *       500:
 *         description: Internal Server Error.
 */
export async function GET(request: NextRequest) {
   const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const sevenDaysAgo = subDays(new Date(), 7);

    const [totalUsers, newUsers, totalConfigs, newConfigs, voteCounts, openReports, totalReports] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.config.count(),
      prisma.config.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.config.aggregate({
        _sum: {
          upvotes: true,
          downvotes: true,
        },
      }),
      prisma.report.count({ where: { status: 'OPEN' } }),
      prisma.report.count(),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        new: newUsers,
      },
      configs: {
        total: totalConfigs,
        new: newConfigs,
      },
      votes: {
        upvotes: voteCounts._sum.upvotes || 0,
        downvotes: voteCounts._sum.downvotes || 0,
        total: (voteCounts._sum.upvotes || 0) + (voteCounts._sum.downvotes || 0),
      },
      reports: {
        open: openReports,
        total: totalReports,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[ADMIN_STATS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
