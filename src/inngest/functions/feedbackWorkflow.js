import { inngest } from '../client.js';
import User from '../../models/User.js';
import { sendResolutionSurvey } from '../../modules/notifications/notification.service.js';
import { handleWorkflowFailure } from './shared.js';
import logger from '../../config/logger.js';

/**
 * Triggered when a ticket is resolved.
 * Sends a satisfaction survey email to the ticket creator.
 */
export const feedbackWorkflow = inngest.createFunction(
  {
    id: 'feedback-survey',
    onFailure: handleWorkflowFailure,
  },
  { event: 'ticket/resolved' },
  async ({ event, step }) => {
    const { ticketId, title, createdBy } = event.data;

    await step.run('send-survey', async () => {
      const creator = await User.findById(createdBy);
      if (!creator) {
        logger.warn(`Ticket ${ticketId}: creator ${createdBy} not found, skipping survey`);
        return;
      }

      await sendResolutionSurvey(creator, { ticketId, title });
      logger.info(`Feedback survey sent to ${creator.email} for ticket ${ticketId}`);
    });
  },
);
