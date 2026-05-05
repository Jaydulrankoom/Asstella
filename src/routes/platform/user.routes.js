import express from 'express';
import { PlatformUserController } from '../../controllers/platform/user.controller.js';

const router = express.Router();

router.get('/', PlatformUserController.list);
router.post('/', PlatformUserController.create);
router.patch('/:id/role', PlatformUserController.updateRole);
router.delete('/:id', PlatformUserController.delete);

export default router;
