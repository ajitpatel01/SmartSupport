import * as orgService from './org.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

/** GET /api/org — get current org details */
export const getOrg = asyncWrapper(async (req, res) => {
  const org = await orgService.getOrg(req.user.orgId);
  ApiResponse.success(res, org);
});

/** PATCH /api/org — update org settings */
export const updateOrg = asyncWrapper(async (req, res) => {
  const org = await orgService.updateOrg(req.user.orgId, req.body);
  ApiResponse.success(res, org, 'Organization updated');
});

/** POST /api/org/invite — invite a member */
export const invite = asyncWrapper(async (req, res) => {
  const result = await orgService.inviteMember(req.user.orgId, req.body.email, req.body.role);
  ApiResponse.created(res, result, 'Invitation sent');
});
