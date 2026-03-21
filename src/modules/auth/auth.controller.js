import * as authService from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

/** POST /api/auth/register */
export const register = asyncWrapper(async (req, res) => {
  const result = await authService.register(req.body);
  ApiResponse.created(res, result, 'Registration successful');
});

/** POST /api/auth/login */
export const login = asyncWrapper(async (req, res) => {
  const result = await authService.login(req.body);
  ApiResponse.success(res, result, 'Login successful');
});

/** POST /api/auth/refresh */
export const refresh = asyncWrapper(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  ApiResponse.success(res, result, 'Token refreshed');
});

/** POST /api/auth/logout */
export const logout = asyncWrapper(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  ApiResponse.success(res, null, 'Logged out');
});
