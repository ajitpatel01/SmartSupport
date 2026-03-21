import { inngest } from '../client.js';
import { analyzeTicketWithGemini } from '../../modules/ai/gemini.service.js';
import { findBestModerator } from '../../modules/moderators/moderator.service.js';
import Ticket from '../../models/Ticket.js';
import AuditLog from '../../models/AuditLog.js';
import { sendAssignmentNotification } from '../../modules/notifications/notification.service.js';
import { handleWorkflowFailure } from './shared.js';
import logger from '../../config/logger.js';

/**
 * Triggered when a new ticket is created.
 * Steps:
 *   1. Analyze ticket with Gemini AI
 *   2. Find the best-matching moderator
 *   3. Assign ticket and persist AI analysis
 *   4. Send assignment notification
 */
export const aiAnalysisWorkflow = inngest.createFunction(
  {
    id: 'ai-analysis-workflow',
    onFailure: handleWorkflowFailure,
  },
  { event: 'ticket/created' },
  async ({ event, step }) => {
    const { ticketId, title, description, orgId } = event.data;

    const analysis = await step.run('analyze-ticket', async () => {
      logger.info(`AI analysis started for ticket ${ticketId}`);
      return analyzeTicketWithGemini(title, description);
    });

    const moderator = await step.run('find-best-moderator', async () => {
      return findBestModerator(analysis.requiredSkills, orgId);
    });

    await step.run('assign-ticket', async () => {
      await Ticket.findByIdAndUpdate(ticketId, {
        category: analysis.category,
        priority: analysis.priority,
        skills: analysis.requiredSkills,
        aiNotes: analysis.helpfulNotes,
        assignedTo: moderator._id,
        status: 'in_progress',
      });

      await AuditLog.insertMany([
        {
          ticketId,
          action: 'ai_analyzed',
          actor: null,
          meta: {
            category: analysis.category,
            priority: analysis.priority,
            confidence: analysis.confidence,
          },
        },
        {
          ticketId,
          action: 'assigned',
          actor: null,
          meta: { moderatorId: moderator._id, moderatorName: moderator.name },
        },
      ]);

      logger.info(`Ticket ${ticketId} assigned to ${moderator.name}`);
    });

    await step.run('send-assignment-notification', async () => {
      await sendAssignmentNotification(moderator, { ticketId, title, orgId });
    });

    return { ticketId, assignedTo: moderator._id, analysis };
  },
);
