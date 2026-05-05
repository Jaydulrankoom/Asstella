import * as auditService from "../services/auditService.js";

export const createCampaign = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const campaign = await auditService.createCampaign(
      tenant_id,
      req.body,
      uid,
    );
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

export const getCampaigns = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const campaigns = await auditService.getCampaigns(tenant_id);
    res.json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

export const downloadCampaignData = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const data = await auditService.downloadCampaignData(tenant_id, id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const submitScan = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const result = await auditService.submitScan(tenant_id, id, req.body, uid);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const submitBulkSync = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const { scans } = req.body;
    if (!Array.isArray(scans)) {
      return res
        .status(400)
        .json({ success: false, message: "Scans must be an array." });
    }
    const result = await auditService.submitBulkSync(tenant_id, id, scans, uid);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const completeCampaign = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const result = await auditService.completeCampaign(tenant_id, id, uid);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getCampaignResults = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const result = await auditService.getCampaignResults(tenant_id, id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
