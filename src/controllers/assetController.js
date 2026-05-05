import * as assetService from "../services/assetService.js";

export const createCategory = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const category = await assetService.createCategory(tenant_id, req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const categories = await assetService.getCategories(tenant_id);
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createAsset = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const asset = await assetService.createAsset(tenant_id, req.body, uid);
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

export const getAssets = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { limit = 20, cursor, ...filters } = req.query;

    // Parse numeric limits safely
    const parsedLimit = parseInt(limit, 10) || 20;

    const result = await assetService.getAssets(
      tenant_id,
      filters,
      cursor,
      parsedLimit,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getAssetById = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const asset = await assetService.getAssetById(tenant_id, id);
    res.json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const result = await assetService.updateAsset(tenant_id, id, req.body, uid);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const result = await assetService.deleteAsset(tenant_id, id, uid);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const scanAsset = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { qr_code } = req.params;
    // scanAsset is mildly public inside the tenant, it doesn't need to check specific write permissions here
    const assetData = await assetService.scanAsset(tenant_id, qr_code);
    res.json({ success: true, data: assetData });
  } catch (error) {
    next(error);
  }
};

export const addAssetDocument = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    // In a real app, multipart/form-data with file upload would be handled, and URL saved.
    // For now we assume req.body.document_url is passed
    res.json({ success: true, message: "Document added placeholder" });
  } catch (error) {
    next(error);
  }
};

export const getAssetHistory = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const history = await assetService.getAssetHistory(tenant_id, id);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
