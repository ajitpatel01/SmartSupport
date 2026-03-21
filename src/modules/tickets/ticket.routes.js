import { Router } from 'express';
import * as ticketCtrl from './ticket.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { requireSameOrg } from '../../middleware/orgScope.js';
import { requireMinRole } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { aiRouteLimiter } from '../../middleware/rateLimiter.js';
import { checkTicketQuota } from '../billing/quota.middleware.js';
import { createTicketSchema, updateTicketSchema, ticketQuerySchema } from './ticket.validators.js';

const router = Router();

router.use(verifyToken, requireSameOrg);

router.post('/', aiRouteLimiter, checkTicketQuota, validate(createTicketSchema), ticketCtrl.create);
router.get('/', validate(ticketQuerySchema, 'query'), ticketCtrl.list);
router.get('/:id', ticketCtrl.getById);
router.patch('/:id', requireMinRole('moderator'), validate(updateTicketSchema), ticketCtrl.update);
router.delete('/:id', requireMinRole('admin'), ticketCtrl.remove);

export default router;
