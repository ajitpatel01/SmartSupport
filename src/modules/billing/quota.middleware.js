import Ticket from '../../models/Ticket.js';
import Organization from '../../models/Organization.js';
import { ApiError } from '../../utils/ApiError.js';

const PLAN_LIMITS = {
  free: 10,
  pro: 500,
  enterprise: Infinity,
};

/**
 * Middleware that checks whether the org has exceeded its monthly
 * ticket creation quota based on plan tier.
 */
export const checkTicketQuota = async (req, _res, next) => {
  const org = await Organization.findById(req.user.orgId);
  if (!org) throw ApiError.notFound('Organization not found');

  const limit = PLAN_LIMITS[org.plan] ?? PLAN_LIMITS.free;
  if (limit === Infinity) return next();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const ticketCount = await Ticket.countDocuments({
    orgId: org._id,
    createdAt: { $gte: startOfMonth },
  });

  if (ticketCount >= limit) {
    throw ApiError.forbidden(
      `Monthly ticket limit reached (${limit} on '${org.plan}' plan). Upgrade to create more tickets.`,
    );
  }

  next();
};
