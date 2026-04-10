import crypto from 'crypto';
import Organization from '../../models/Organization.js';
import User from '../../models/User.js';
import logger from '../../config/logger.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendMail } from '../notifications/notification.service.js';

export async function getOrg(orgId) {
  const org = await Organization.findById(orgId);
  if (!org) throw ApiError.notFound('Organization not found');
  return org;
}

export async function updateOrg(orgId, updates) {
  const allowed = ['name', 'webhookUrl'];
  const filtered = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }

  if (filtered.webhookUrl !== undefined && filtered.webhookUrl !== null && String(filtered.webhookUrl).trim() !== '') {
    try {
      // eslint-disable-next-line no-new
      new URL(String(filtered.webhookUrl).trim());
    } catch {
      throw ApiError.badRequest('Invalid webhook URL');
    }
    filtered.webhookUrl = String(filtered.webhookUrl).trim();
  }

  const org = await Organization.findByIdAndUpdate(orgId, filtered, { new: true, runValidators: true });
  if (!org) throw ApiError.notFound('Organization not found');
  return org;
}

/**
 * Invite a member to the org via magic link email.
 * Creates a pending user record with a random invite token.
 */
export async function inviteMember(orgId, email, role = 'user') {
  const org = await Organization.findById(orgId);
  if (!org) throw ApiError.notFound('Organization not found');

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.badRequest('User already exists');

  const inviteToken = crypto.randomBytes(32).toString('hex');
  const tempPassword = await User.hashPassword(inviteToken);

  const user = await User.create({
    name: email.split('@')[0],
    email,
    passwordHash: tempPassword,
    role,
    orgId,
  });

  try {
    await sendMail(
      email,
      `You've been invited to ${org.name} on SmartSupport`,
      `You've been invited to join ${org.name}.\n\nYour temporary password: ${inviteToken}\n\nPlease log in and change your password.`,
    );
  } catch (err) {
    await User.deleteOne({ _id: user._id });
    logger.error(`Invite email failed for ${email}, user rolled back: ${err.message}`);
    throw ApiError.serviceUnavailable(
      'Invitation email could not be sent. Check MAILTRAP_SMTP_USER and MAILTRAP_SMTP_PASS in your .env (Mailtrap inbox).',
    );
  }

  return { userId: user._id, email, role };
}
