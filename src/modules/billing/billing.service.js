import Ticket from '../../models/Ticket.js';
import Organization from '../../models/Organization.js';
import { ApiError } from '../../utils/ApiError.js';

const PLAN_LIMITS = {
  free: 10,
  pro: 500,
  enterprise: Infinity,
};

/**
 * Current plan tier and ticket usage vs monthly quota (same window as quota middleware).
 */
export async function getBillingSummary(orgId) {
  const org = await Organization.findById(orgId);
  if (!org) throw ApiError.notFound('Organization not found');

  const limit = PLAN_LIMITS[org.plan] ?? PLAN_LIMITS.free;
  const monthlyTicketLimit = limit === Infinity ? null : limit;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const ticketsThisMonth = await Ticket.countDocuments({
    orgId: org._id,
    createdAt: { $gte: startOfMonth },
  });

  const percentUsed =
    monthlyTicketLimit != null && monthlyTicketLimit > 0
      ? Math.min(100, Math.round((ticketsThisMonth / monthlyTicketLimit) * 100))
      : null;

  return {
    plan: org.plan,
    monthlyTicketLimit,
    ticketsThisMonth,
    percentUsed,
  };
}

/**
 * Placeholder until Stripe Checkout is wired — keeps a stable API contract for the UI.
 */
export async function createCheckoutPlaceholder() {
  return {
    url: null,
    message: 'Stripe billing is not enabled. Contact sales for Enterprise or upgrade paths.',
  };
}
