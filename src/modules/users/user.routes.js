import { Router } from 'express';
import * as userCtrl from './user.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { requireSameOrg } from '../../middleware/orgScope.js';
import { requireMinRole } from '../../middleware/rbac.js';

const router = Router();

router.use(verifyToken, requireSameOrg);

router.get('/me', userCtrl.getProfile);
router.patch('/me', userCtrl.updateProfile);
router.get('/', requireMinRole('moderator'), userCtrl.listUsers);

export default router;
