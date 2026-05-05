import './config/env.js';
import { db, auth } from './config/firebase.js';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { verifyToken, isPlatformAdmin, tenantGuard, subscriptionGuard, checkPermission, activityLogger } from './middleware/index.js';

import authRoutes from './routes/auth.routes.js';
import platformDashboardRoutes from './routes/platform/dashboard.routes.js';
import platformTenantRoutes from './routes/platform/tenant.routes.js';
import platformBillingRoutes from './routes/platform/billing.routes.js';
import platformPlanRoutes from './routes/platform/plan.routes.js';
import platformUserRoutes from './routes/platform/user.routes.js';
import platformIntegrationRoutes from './routes/platform/integration.routes.js';
import platformAnalyticsRoutes from './routes/platform/analytics.routes.js';
import platformSupportRoutes from './routes/platform/support.routes.js';
import platformSecurityRoutes from './routes/platform/security.routes.js';
import platformSettingsRoutes from './routes/platform/settings.routes.js';

import tenantOrgRoutes from './routes/tenant/org.routes.js';
import tenantUserRoutes from './routes/tenant/user.routes.js';
import tenantAssetRoutes from './routes/tenant/asset.routes.js';
import tenantQrRoutes from './routes/tenant/qr.routes.js';
import tenantTransferRoutes from './routes/tenant/transfer.routes.js';
import tenantMaintenanceRoutes from './routes/tenant/maintenance.routes.js';
import tenantWarrantyRoutes from './routes/tenant/warranty.routes.js';
import tenantAmcRoutes from './routes/tenant/amc.routes.js';
import tenantAuditRoutes from './routes/tenant/audit.routes.js';
import tenantFinanceRoutes from './routes/tenant/finance.routes.js';
import tenantGpsRoutes from './routes/tenant/gps.routes.js';
import tenantReportRoutes from './routes/tenant/report.routes.js';
import tenantNotificationRoutes from './routes/tenant/notification.routes.js';
import webhookRoutes from './routes/webhooks.routes.js';

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false } // We already set app.set('trust proxy', 1), this avoids redundant checks
});
const healthHandler = async (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
};

// app.get('/health', healthHandler);

// API-specific middleware
const apiRouter = express.Router();

app.use('/api', apiRouter);

/*
apiRouter.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  frameguard: false,
}));
*/
// apiRouter.use(limiter);
apiRouter.use(activityLogger);

// API Routes
apiRouter.use('/auth', authRoutes);

apiRouter.use('/platform/dashboard', verifyToken, isPlatformAdmin, platformDashboardRoutes);
apiRouter.use('/platform/tenants', verifyToken, isPlatformAdmin, platformTenantRoutes);
apiRouter.use('/platform/billing', verifyToken, isPlatformAdmin, platformBillingRoutes);
apiRouter.use('/platform/plans', verifyToken, isPlatformAdmin, platformPlanRoutes);
apiRouter.use('/platform/users', verifyToken, isPlatformAdmin, platformUserRoutes);
apiRouter.use('/platform/integrations', verifyToken, isPlatformAdmin, platformIntegrationRoutes);
apiRouter.use('/platform/analytics', verifyToken, isPlatformAdmin, platformAnalyticsRoutes);
apiRouter.use('/platform/support', verifyToken, isPlatformAdmin, platformSupportRoutes);
apiRouter.use('/platform/security', verifyToken, isPlatformAdmin, platformSecurityRoutes);
apiRouter.use('/platform/settings', verifyToken, isPlatformAdmin, platformSettingsRoutes);

apiRouter.use('/tenant/org', verifyToken, tenantGuard, tenantOrgRoutes);
apiRouter.use('/tenant/users', verifyToken, tenantGuard, tenantUserRoutes);
apiRouter.use('/tenant/assets', verifyToken, tenantGuard, subscriptionGuard('asset_register'), tenantAssetRoutes);
apiRouter.use('/tenant/qr', verifyToken, tenantGuard, tenantQrRoutes);
apiRouter.use('/tenant/transfers', verifyToken, tenantGuard, tenantTransferRoutes);
apiRouter.use('/tenant/maintenance', verifyToken, tenantGuard, subscriptionGuard('maintenance'), tenantMaintenanceRoutes);
apiRouter.use('/tenant/warranties', verifyToken, tenantGuard, tenantWarrantyRoutes);
apiRouter.use('/tenant/amc', verifyToken, tenantGuard, tenantAmcRoutes);
apiRouter.use('/tenant/audits', verifyToken, tenantGuard, subscriptionGuard('audit'), tenantAuditRoutes);
apiRouter.use('/tenant/finance', verifyToken, tenantGuard, subscriptionGuard('finance'), tenantFinanceRoutes);
apiRouter.use('/tenant/gps', verifyToken, tenantGuard, subscriptionGuard('gps_tracking'), tenantGpsRoutes);
apiRouter.use('/tenant/reports', verifyToken, tenantGuard, tenantReportRoutes);
apiRouter.use('/tenant/notifications', verifyToken, tenantGuard, tenantNotificationRoutes);

app.use('/api/webhooks', webhookRoutes);

app.use((err, req, res, next) => {
  console.error('[Global Error Handler]', err);
  res.status(500).json({ success: false, code: 'INTERNAL_SERVER_ERROR', message: err.message || 'An unexpected error occurred' });
});

export default app;
