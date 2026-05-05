import * as warrantyService from "../services/warrantyService.js";

export const checkClaimEligibility = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { assetId, ticketId } = req.query;
    const eligibility = await warrantyService.checkClaimEligibility(
      tenant_id,
      assetId,
      ticketId,
    );
    res.json({ success: true, data: eligibility });
  } catch (error) {
    next(error);
  }
};

export const createClaim = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const claim = await warrantyService.createClaim(tenant_id, req.body, uid);
    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

export const updateVendorResponse = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const result = await warrantyService.updateVendorResponse(
      tenant_id,
      id,
      req.body,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const resolveClaim = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const result = await warrantyService.resolveClaim(
      tenant_id,
      id,
      req.body,
      uid,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getClaims = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const claims = await warrantyService.getClaims(tenant_id, req.query);
    res.json({ success: true, data: claims });
  } catch (error) {
    next(error);
  }
};

export const getWarrantyAnalytics = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const analytics = await warrantyService.getWarrantyAnalytics(tenant_id);
    res.json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
};
