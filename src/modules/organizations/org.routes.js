import { Router } from 'express';
import * as orgCtrl from './org.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { requireSameOrg } from '../../middleware/orgScope.js';
import { requireMinRole } from '../../middleware/rbac.js';

const router = Router();

router.use(verifyToken, requireSameOrg);

router.get('/', orgCtrl.getOrg);
router.patch('/', requireMinRole('admin'), orgCtrl.updateOrg);
router.post('/invite', requireMinRole('admin'), orgCtrl.invite);

export default router;
