import * as notifService from './notification.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

/** GET /api/notifications — list in-app notifications for current user */
export const list = asyncWrapper(async (req, res) => {
  const onlyUnread = req.query.unread === 'true';
  const result = await notifService.getNotifications(req.user.userId, onlyUnread);
  ApiResponse.success(res, result);
});

/** PATCH /api/notifications/:id/read — mark a notification as read */
export const markRead = asyncWrapper(async (req, res) => {
  const notif = await notifService.markAsRead(req.params.id, req.user.userId);
  ApiResponse.success(res, notif, 'Marked as read');
});
