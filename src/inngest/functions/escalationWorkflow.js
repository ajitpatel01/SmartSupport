import { inngest } from '../client.js';
import Ticket from '../../models/Ticket.js';
import AuditLog from '../../models/AuditLog.js';
import User from '../../models/User.js';
import { sendEscalationNotification } from '../../modules/notifications/notification.service.js';
import { handleWorkflowFailure } from './shared.js';
import logger from '../../config/logger.js';

const STALE_THRESHOLD_HOURS = 24;

const PRIORITY_ESCALATION = {
  low: 'medium',
  medium: 'high',
  high: 'critical',
  critical: 'critical',
};

/**
 * Runs every hour. Finds stale open tickets (no update in 24h),
 * bumps their priority, and alerts the org admin.
 */
export const escalationWorkflow = inngest.createFunction(
  {
    id: 'ticket-escalation',
    onFailure: handleWorkflowFailure,
  },
  { cron: '0 * * * *' },
  async ({ step }) => {
    const staleTickets = await step.run('find-stale-tickets', async () => {
      const threshold = new Date(Date.now() - STALE_THRESHOLD_HOURS * 60 * 60 * 1000);

      const tickets = await Ticket.find({
        status: 'open',
        updatedAt: { $lt: threshold },
      });

      return tickets.map((t) => ({
        _id: t._id.toString(),
        orgId: t.orgId.toString(),
        priority: t.priority,
        title: t.title,
      }));
    });

    if (!staleTickets.length) {
      logger.info('No stale tickets found');
      return { escalated: 0 };
    }

    for (const ticket of staleTickets) {
      await step.run(`escalate-${ticket._id}`, async () => {
        const newPriority = PRIORITY_ESCALATION[ticket.priority];

        await Ticket.findByIdAndUpdate(ticket._id, { priority: newPriority });

        await AuditLog.create({
          ticketId: ticket._id,
          action: 'escalated',
          actor: null,
          meta: {
            oldPriority: ticket.priority,
            newPriority,
            reason: `No update for ${STALE_THRESHOLD_HOURS}h`,
          },
        });

        const admin = await User.findOne({ orgId: ticket.orgId, role: 'admin' });
        if (admin) {
          await sendEscalationNotification(admin, ticket);
        }

        logger.info(`Ticket ${ticket._id} escalated: ${ticket.priority} → ${newPriority}`);
      });
    }

    return { escalated: staleTickets.length };
  },
);
