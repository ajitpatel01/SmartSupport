import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import User from '../../models/User.js';
import Organization from '../../models/Organization.js';
import RefreshToken from '../../models/RefreshToken.js';
import { ApiError } from '../../utils/ApiError.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user._id, orgId: user.orgId, role: user.role },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
}

async function generateRefreshToken(userId) {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({ userId, token, expiresAt });
  return token;
}

/**
 * Register a new user. If orgName is provided, create a new org and make the
 * user admin. If orgId is provided, join that org as a regular user.
 */
export async function register({ name, email, password, orgName, orgId }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.badRequest('Email already registered');
  }

  let org;
  let role = 'user';

  if (orgName) {
    org = await Organization.create({ name: orgName });
    role = 'admin';
  } else if (orgId) {
    org = await Organization.findById(orgId);
    if (!org) throw ApiError.notFound('Organization not found');
  } else {
    throw ApiError.badRequest('Provide either orgName (to create) or orgId (to join)');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role, orgId: org._id });

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return { user: { _id: user._id, name, email, role, orgId: org._id }, accessToken, refreshToken };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const valid = await user.comparePassword(password);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, orgId: user.orgId },
    accessToken,
    refreshToken,
  };
}

/**
 * Rotate refresh token. If the presented token was already revoked, revoke ALL
 * tokens for that user (reuse detection — possible token theft).
 */
export async function refresh(oldToken) {
  const stored = await RefreshToken.findOne({ token: oldToken });

  if (!stored) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  if (stored.revoked) {
    await RefreshToken.updateMany({ userId: stored.userId }, { revoked: true });
    throw ApiError.unauthorized('Refresh token reuse detected — all sessions revoked');
  }

  if (stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token expired');
  }

  stored.revoked = true;
  await stored.save();

  const user = await User.findById(stored.userId);
  if (!user) throw ApiError.unauthorized('User not found');

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return { accessToken, refreshToken };
}

export async function logout(tokenString) {
  await RefreshToken.findOneAndUpdate({ token: tokenString }, { revoked: true });
}
