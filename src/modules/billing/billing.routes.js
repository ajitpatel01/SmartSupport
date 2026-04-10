import { Router } from 'express';
import * as billingCtrl from './billing.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { requireSameOrg } from '../../middleware/orgScope.js';

const router = Router();

router.use(verifyToken, requireSameOrg);

router.get('/summary', billingCtrl.summary);
router.post('/checkout', billingCtrl.checkout);

export default router;
