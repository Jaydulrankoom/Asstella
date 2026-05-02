import { Response } from "express";
import { SaaSRequest } from "../middleware/auth";
import { assetService } from "../services/assetService";
import Joi from "joi";

const assetSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  categoryId: Joi.string().required(),
  branchId: Joi.string().optional(),
  departmentId: Joi.string().optional(),
  status: Joi.string().valid("active", "maintenance", "repair", "lost", "disposed").default("active"),
  purchaseValue: Joi.number().min(0).optional(),
  purchaseDate: Joi.date().iso().optional(),
  serial: Joi.string().allow("").optional(),
  location: Joi.string().max(200).optional(),
  description: Joi.string().max(1000).allow("").optional(),
  barcode: Joi.string().allow("").optional(),
});

export const assetController = {
  /**
   * GET /api/assets
   */
  async list(req: SaaSRequest, res: Response) {
    try {
      const tenantId = req.authUser!.tenantId;
      const filters = req.query;
      const data = await assetService.getAssets(tenantId, filters);
      
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/assets
   */
  async create(req: SaaSRequest, res: Response) {
    const { error, value } = assetSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    try {
      const tenantId = req.authUser!.tenantId;
      const userId = req.authUser!.uid;
      const data = await assetService.createAsset(tenantId, value, userId);
      
      res.status(201).json({ success: true, data, message: "Asset registered successfully" });
    } catch (error: any) {
      const status = error.message.includes("LIMIT_EXCEEDED") ? 403 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/assets/:id
   */
  async getDetail(req: SaaSRequest, res: Response) {
    try {
      const tenantId = req.authUser!.tenantId;
      const asset = await assetService.getAssetById(tenantId, req.params.id);
      
      if (!asset) {
        return res.status(404).json({ success: false, message: "Asset not found" });
      }

      res.json({ success: true, data: asset });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * PUT /api/assets/:id
   */
  async update(req: SaaSRequest, res: Response) {
    const { error, value } = assetSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    try {
      const tenantId = req.authUser!.tenantId;
      const userId = req.authUser!.uid;
      const data = await assetService.updateAsset(tenantId, req.params.id, value, userId);
      
      res.json({ success: true, data, message: "Asset updated successfully" });
    } catch (error: any) {
      const status = error.message === "NOT_FOUND" ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE /api/assets/:id
   */
  async remove(req: SaaSRequest, res: Response) {
    try {
      const tenantId = req.authUser!.tenantId;
      await assetService.deleteAsset(tenantId, req.params.id);
      res.json({ success: true, message: "Asset archived successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/assets/scan/:code
   */
  async scan(req: SaaSRequest, res: Response) {
    try {
      const tenantId = req.authUser!.tenantId;
      const asset = await assetService.scanAsset(tenantId, req.params.code);
      
      if (!asset) {
        return res.status(404).json({ success: false, message: "No asset found with this code" });
      }

      res.json({ success: true, data: asset });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
