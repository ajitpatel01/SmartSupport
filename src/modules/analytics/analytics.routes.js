import { Router } from 'express';
import * as analyticsCtrl from './analytics.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { requireSameOrg } from '../../middleware/orgScope.js';
import { requireMinRole } from '../../middleware/rbac.js';

const router = Router();

router.use(verifyToken, requireSameOrg, requireMinRole('admin'));

router.get('/tickets', analyticsCtrl.tickets);
router.get('/moderators', analyticsCtrl.moderators);

export default router;
