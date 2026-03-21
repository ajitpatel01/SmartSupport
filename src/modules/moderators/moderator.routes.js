import { Router } from 'express';
import * as moderatorCtrl from './moderator.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { requireSameOrg } from '../../middleware/orgScope.js';
import { requireMinRole } from '../../middleware/rbac.js';

const router = Router();

router.use(verifyToken, requireSameOrg);

router.get('/', requireMinRole('moderator'), moderatorCtrl.list);
router.patch('/:id/skills', requireMinRole('admin'), moderatorCtrl.updateSkills);

export default router;
