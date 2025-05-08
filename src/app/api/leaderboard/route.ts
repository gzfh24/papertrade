// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import { initDB } from '@/lib/helpers';
import Portfolio from '@/lib/models/Portfolio';

export async function GET() {
  await initDB();

  const topTen = await Portfolio.aggregate([
    // only closed positions
    {
      $addFields: {
        closed: {
          $filter: {
            input: '$positions',
            as: 'pos',
            cond: { $eq: ['$$pos.isOpen', false] },
          },
        },
      },
    },

    // stats
    {
      $addFields: {
        pnl: { $sum: '$closed.profit' },
        volume: {
          $sum: {
            $map: {
              input: '$closed',
              as: 'c',
              in: {
                $add: [
                  { $multiply: ['$$c.margin', '$$c.leverage'] },
                  {
                    $multiply: [
                      { $add: ['$$c.margin', '$$c.profit'] },
                      '$$c.leverage',
                    ],
                  },
                ],
              },
            },
          },
        },
        trades: { $size: '$closed' },
        wins: {
          $size: {
            $filter: {
              input: '$closed',
              as: 'c',
              cond: { $gt: ['$$c.profit', 0] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        winRate: {
          $cond: [
            { $eq: ['$trades', 0] },
            0,
            { $multiply: [{ $divide: ['$wins', '$trades'] }, 100] },
          ],
        },
      },
    },

    {
      $addFields: {
        userObjId: { $toObjectId: '$userId' },
      },
    },
    {
      $lookup: {
        from: 'user',
        localField: 'userObjId',
        foreignField: '_id',
        as: 'u',
      },
    },
    { $addFields: { username: { $first: '$u.name' } } },

    // sort and show top 10
    { $sort: { pnl: -1 } },
    { $limit: 10 },

    // return fields
    {
      $project: {
        _id: 0,
        userId: 1,
        username: 1,
        pnl: 1,
        volume: 1,
        trades: 1,
        winRate: 1,
      },
    },
  ]);

  return NextResponse.json({ portfolios: topTen });
}
