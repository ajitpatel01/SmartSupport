import * as moderatorService from './moderator.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

/** GET /api/moderators — list moderators with workload stats */
export const list = asyncWrapper(async (req, res) => {
  const moderators = await moderatorService.listModerators(req.user.orgId);
  ApiResponse.success(res, moderators);
});

/** PATCH /api/moderators/:id/skills — update a moderator's skills */
export const updateSkills = asyncWrapper(async (req, res) => {
  const moderator = await moderatorService.updateSkills(
    req.params.id,
    req.user.orgId,
    req.body.skills,
  );
  ApiResponse.success(res, moderator, 'Skills updated');
});
