import { Router } from 'express';
import * as authCtrl from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.validators.js';

const router = Router();

router.post('/register', validate(registerSchema), authCtrl.register);
router.post('/login', validate(loginSchema), authCtrl.login);
router.post('/refresh', validate(refreshSchema), authCtrl.refresh);
router.post('/logout', authCtrl.logout);

export default router;
