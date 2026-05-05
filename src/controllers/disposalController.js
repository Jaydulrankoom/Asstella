import * as disposalService from "../services/disposalService.js";

export const calculateGainLoss = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { assetId, disposalValue } = req.query;

    if (!assetId || disposalValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "assetId and disposalValue are required.",
      });
    }

    const result = await disposalService.calculateGainLoss(
      tenant_id,
      assetId,
      Number(disposalValue),
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createDisposalRequest = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const disposal = await disposalService.createDisposalRequest(
      tenant_id,
      req.body,
      uid,
    );
    res.status(201).json({ success: true, data: disposal });
  } catch (error) {
    next(error);
  }
};

export const getDisposals = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const disposals = await disposalService.getDisposals(tenant_id, req.query);
    res.json({ success: true, data: disposals });
  } catch (error) {
    next(error);
  }
};

export const approveDisposal = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const { notes } = req.body;
    const result = await disposalService.approveDisposal(
      tenant_id,
      id,
      uid,
      notes,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const completeDisposal = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const result = await disposalService.completeDisposal(tenant_id, id, uid);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
