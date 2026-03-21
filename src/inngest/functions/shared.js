import AuditLog from '../../models/AuditLog.js';
import User from '../../models/User.js';
import { sendMail } from '../../modules/notifications/notification.service.js';
import logger from '../../config/logger.js';

/**
 * Shared onFailure handler for all Inngest workflows.
 * Logs the failure as an audit entry and emails the org admin.
 */
export async function handleWorkflowFailure({ event, error }) {
  const ticketId = event?.data?.event?.data?.ticketId;
  const orgId = event?.data?.event?.data?.orgId;

  logger.error(`Inngest workflow failed: ${error.message}`, {
    ticketId,
    functionId: event?.data?.function_id,
  });

  if (ticketId) {
    await AuditLog.create({
      ticketId,
      action: 'workflow_failed',
      actor: null,
      meta: {
        functionId: event?.data?.function_id,
        error: error.message,
      },
    }).catch((err) => logger.error('Failed to write failure audit log', err));
  }

  if (orgId) {
    const admin = await User.findOne({ orgId, role: 'admin' }).catch(() => null);
    if (admin) {
      await sendMail(
        admin.email,
        'SmartSupport — Workflow Failure Alert',
        `A background workflow failed.\n\nTicket: ${ticketId || 'N/A'}\nError: ${error.message}\nFunction: ${event?.data?.function_id || 'unknown'}`,
      ).catch((err) => logger.error('Failed to send failure alert email', err));
    }
  }
}
