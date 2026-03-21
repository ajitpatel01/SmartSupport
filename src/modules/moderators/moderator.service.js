import User from '../../models/User.js';
import Ticket from '../../models/Ticket.js';
import { ApiError } from '../../utils/ApiError.js';
import logger from '../../config/logger.js';

const MIN_SCORE_THRESHOLD = 0.4;

/**
 * Scores a moderator based on how many required skills they match.
 * Uses case-insensitive regex for flexible matching (e.g. "nodejs" matches "Node.js").
 */
function scoreModerator(moderator, requiredSkills) {
  if (!requiredSkills.length) return 0;

  const matched = requiredSkills.filter((skill) =>
    moderator.skills.some((modSkill) => new RegExp(skill, 'i').test(modSkill)),
  ).length;

  return matched / requiredSkills.length;
}

/**
 * Finds the best moderator for a ticket based on skill matching.
 *
 * Algorithm:
 *   1. Fetch all moderators in the org
 *   2. Score each by skill overlap (case-insensitive regex)
 *   3. Filter by minimum threshold (0.4)
 *   4. Tie-break: fewest open assigned tickets
 *   5. Fallback: org admin
 *
 * @param {string[]} requiredSkills - Skills needed for the ticket
 * @param {string} orgId           - Organization ID
 * @returns {Promise<Object>}      - The selected moderator user document
 */
export async function findBestModerator(requiredSkills, orgId) {
  const moderators = await User.find({ orgId, role: 'moderator' });

  const scored = moderators
    .map((mod) => ({ mod, score: scoreModerator(mod, requiredSkills) }))
    .filter(({ score }) => score >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    logger.info(`No moderator meets threshold for skills [${requiredSkills}] in org ${orgId}, falling back to admin`);
    return getFallbackAdmin(orgId);
  }

  const topScore = scored[0].score;
  const tied = scored.filter(({ score }) => score === topScore);

  if (tied.length === 1) return tied[0].mod;

  const tiedIds = tied.map(({ mod }) => mod._id);
  const workloads = await Ticket.aggregate([
    { $match: { orgId: orgId, assignedTo: { $in: tiedIds }, status: { $in: ['open', 'in_progress'] }, deletedAt: null } },
    { $group: { _id: '$assignedTo', openCount: { $sum: 1 } } },
  ]);

  const workloadMap = new Map(workloads.map((w) => [w._id.toString(), w.openCount]));

  tied.sort((a, b) => {
    const aLoad = workloadMap.get(a.mod._id.toString()) || 0;
    const bLoad = workloadMap.get(b.mod._id.toString()) || 0;
    return aLoad - bLoad;
  });

  return tied[0].mod;
}

async function getFallbackAdmin(orgId) {
  const admin = await User.findOne({ orgId, role: 'admin' });
  if (!admin) throw ApiError.internal(`No admin found for org ${orgId}`);
  return admin;
}

/**
 * List all moderators in an org with their open ticket count.
 */
export async function listModerators(orgId) {
  const moderators = await User.find({ orgId, role: 'moderator' }).select('-passwordHash');

  const workloads = await Ticket.aggregate([
    { $match: { orgId, assignedTo: { $in: moderators.map((m) => m._id) }, status: { $in: ['open', 'in_progress'] }, deletedAt: null } },
    { $group: { _id: '$assignedTo', openTickets: { $sum: 1 } } },
  ]);

  const workloadMap = new Map(workloads.map((w) => [w._id.toString(), w.openTickets]));

  return moderators.map((mod) => ({
    ...mod.toObject(),
    openTickets: workloadMap.get(mod._id.toString()) || 0,
  }));
}

/**
 * Update a moderator's skills list.
 */
export async function updateSkills(userId, orgId, skills) {
  const user = await User.findOne({ _id: userId, orgId, role: 'moderator' });
  if (!user) throw ApiError.notFound('Moderator not found');

  user.skills = skills;
  await user.save();
  return user;
}
