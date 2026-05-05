import express from "express";
import * as transferController from "../controllers/transferController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);

// Transfers require transfers module
router.use(checkModule("transfers"));

router.post("/transfers", transferController.createTransferRequest);
router.get("/transfers", transferController.getTransfers);
router.put("/transfers/:id/approve", transferController.approveTransfer);
router.put("/transfers/:id/reject", transferController.rejectTransfer);
router.put("/transfers/:id/dispatch", transferController.confirmDispatch);
router.put("/transfers/:id/receive", transferController.confirmReceipt);

// History on specific asset
router.get("/assets/:assetId/transfers", transferController.getTransferHistory);

export default router;
