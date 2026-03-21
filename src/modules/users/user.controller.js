import * as userService from './user.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

/** GET /api/users/me — current user's profile */
export const getProfile = asyncWrapper(async (req, res) => {
  const user = await userService.getProfile(req.user.userId);
  ApiResponse.success(res, user);
});

/** PATCH /api/users/me — update own profile */
export const updateProfile = asyncWrapper(async (req, res) => {
  const user = await userService.updateProfile(req.user.userId, req.body);
  ApiResponse.success(res, user, 'Profile updated');
});

/** GET /api/users — list all users in the org (admin/moderator) */
export const listUsers = asyncWrapper(async (req, res) => {
  const users = await userService.listOrgUsers(req.user.orgId);
  ApiResponse.success(res, users);
});
