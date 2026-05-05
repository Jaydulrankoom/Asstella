import express from 'express';
import { PlatformSettingsController } from '../../controllers/platform/settings.controller.js';

const router = express.Router();

router.get('/', PlatformSettingsController.get);
router.put('/', PlatformSettingsController.update);
router.post('/gps-providers', PlatformSettingsController.addGps);

export default router;
