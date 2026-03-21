import User from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function updateProfile(userId, updates) {
  const allowed = ['name'];
  const filtered = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }

  const user = await User.findByIdAndUpdate(userId, filtered, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function listOrgUsers(orgId) {
  return User.find({ orgId }).select('-passwordHash');
}
