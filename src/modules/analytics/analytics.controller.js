import * as analyticsService from './analytics.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

/** GET /api/analytics/tickets — ticket counts by status/priority/category */
export const tickets = asyncWrapper(async (req, res) => {
  const data = await analyticsService.getTicketAnalytics(req.user.orgId);
  ApiResponse.success(res, data);
});

/** GET /api/analytics/moderators — per-moderator performance stats */
export const moderators = asyncWrapper(async (req, res) => {
  const data = await analyticsService.getModeratorAnalytics(req.user.orgId);
  ApiResponse.success(res, data);
});
