import { Response } from "express";
import { SaaSRequest } from "../middleware/auth";
import { depreciationEngine } from "../services/depreciationEngine";
import Joi from "joi";

const runSchema = Joi.object({
  financialYear: Joi.string().required(),
  periodNo: Joi.number().min(1).max(12).required(),
  periodType: Joi.string().valid("monthly", "quarterly", "yearly").required(),
  categoryId: Joi.string().optional(),
});

export const financeController = {
  /**
   * POST /api/finance/depreciation/run
   */
  async runDepreciation(req: SaaSRequest, res: Response) {
    const { error, value } = runSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    try {
      const tenantId = req.authUser!.tenantId;
      const userId = req.authUser!.uid;
      
      const result = await depreciationEngine.runDepreciation(tenantId, value, userId);
      
      res.json({ 
        success: true, 
        data: result, 
        message: `Depreciation run successful. Processed ${result.processed} assets.` 
      });
    } catch (error: any) {
      const status = error.message.includes("DEP_ALREADY_RUN") ? 409 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/finance/depreciation/preview
   */
  async preview(req: SaaSRequest, res: Response) {
    try {
      const tenantId = req.authUser!.tenantId;
      const result = await depreciationEngine.previewDepreciation(tenantId, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
