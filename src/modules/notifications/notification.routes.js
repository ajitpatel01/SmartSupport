import { Router } from 'express';
import * as notifCtrl from './notification.controller.js';
import { verifyToken } from '../../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.get('/', notifCtrl.list);
router.patch('/:id/read', notifCtrl.markRead);

export default router;
