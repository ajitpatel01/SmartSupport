import mongoose from 'mongoose';
import Ticket from '../../models/Ticket.js';

const ObjectId = mongoose.Types.ObjectId;

/**
 * Ticket analytics: count by status, priority, and category over the last 30 days.
 */
export async function getTicketAnalytics(orgId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const orgObjectId = new ObjectId(orgId);

  const [byStatus, byPriority, byCategory, total] = await Promise.all([
    Ticket.aggregate([
      { $match: { orgId: orgObjectId, createdAt: { $gte: thirtyDaysAgo }, deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Ticket.aggregate([
      { $match: { orgId: orgObjectId, createdAt: { $gte: thirtyDaysAgo }, deletedAt: null } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Ticket.aggregate([
      { $match: { orgId: orgObjectId, createdAt: { $gte: thirtyDaysAgo }, deletedAt: null } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    Ticket.countDocuments({ orgId: orgObjectId, createdAt: { $gte: thirtyDaysAgo }, deletedAt: null }),
  ]);

  return {
    period: '30d',
    total,
    byStatus: Object.fromEntries(byStatus.map((r) => [r._id, r.count])),
    byPriority: Object.fromEntries(byPriority.map((r) => [r._id, r.count])),
    byCategory: Object.fromEntries(byCategory.map((r) => [r._id || 'uncategorized', r.count])),
  };
}

/**
 * Moderator analytics: ticket count and average resolution time per moderator.
 */
export async function getModeratorAnalytics(orgId) {
  const orgObjectId = new ObjectId(orgId);

  const stats = await Ticket.aggregate([
    { $match: { orgId: orgObjectId, assignedTo: { $ne: null }, deletedAt: null } },
    {
      $group: {
        _id: '$assignedTo',
        totalTickets: { $sum: 1 },
        resolvedTickets: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
        },
        openTickets: {
          $sum: { $cond: [{ $in: ['$status', ['open', 'in_progress']] }, 1, 0] },
        },
        avgResolutionMs: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'resolved'] },
              { $subtract: ['$updatedAt', '$createdAt'] },
              null,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'moderator',
      },
    },
    { $unwind: '$moderator' },
    {
      $project: {
        _id: 0,
        moderatorId: '$_id',
        name: '$moderator.name',
        email: '$moderator.email',
        totalTickets: 1,
        resolvedTickets: 1,
        openTickets: 1,
        avgResolutionHours: {
          $cond: [
            { $gt: ['$avgResolutionMs', null] },
            { $divide: ['$avgResolutionMs', 3600000] },
            null,
          ],
        },
      },
    },
  ]);

  return stats;
}
