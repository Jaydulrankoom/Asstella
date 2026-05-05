import * as qrService from "../services/qrService.js";
import * as userService from "../services/userService.js";

export const generateQRCode = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { assetId } = req.params;
    const url = await qrService.generateQRCode(tenant_id, assetId);
    res.json({ success: true, data: { qr_image_url: url } });
  } catch (error) {
    next(error);
  }
};

export const generateBulkQR = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { assetIds } = req.body; // Expecting { assetIds: ['id1', 'id2'] }

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "assetIds must be a non-empty array",
      });
    }

    const results = await qrService.generateBulkQR(tenant_id, assetIds);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const scanAsset = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { code } = req.params;
    const { action } = req.query; // optional, e.g. ?action=audit

    const asset = await qrService.scanAsset(
      tenant_id,
      code,
      req.authUser,
      action || "view",
    );

    // We can also retrieve the user's permissions here to tell the frontend what actions are allowed
    let allowedActions = {
      view: true,
      create_maintenance: false,
      request_transfer: false,
      audit_verify: false,
    };

    try {
      const userPermissions = await userService.loadUserPermissions(uid);
      if (userPermissions.maintenance?.create)
        allowedActions.create_maintenance = true;
      if (userPermissions.transfers?.create)
        allowedActions.request_transfer = true;
      if (userPermissions.audit?.scan) allowedActions.audit_verify = true;
    } catch (permErr) {
      // Ignore if fail to load permissions, default to view only
      console.warn("Could not load user permissions for scan asset response");
    }

    res.json({
      success: true,
      data: {
        asset,
        allowed_actions: allowedActions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const printLabels = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { assetIds } = req.body;

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "assetIds must be a non-empty array",
      });
    }

    const htmlLayout = await qrService.getPrintPDFLayout(tenant_id, assetIds);

    // Send HTML. In a fuller app with PDF rendering, we would set Content-Type: application/pdf
    res.setHeader("Content-Type", "text/html");
    res.send(htmlLayout);
  } catch (error) {
    next(error);
  }
};

export const getScanHistory = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { assetId } = req.params;
    const history = await qrService.getScanHistory(tenant_id, assetId);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
