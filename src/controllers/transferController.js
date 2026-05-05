import * as transferService from "../services/transferWorkflowService.js";

export const createTransferRequest = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const transfer = await transferService.createTransferRequest(
      tenant_id,
      req.body,
      uid,
    );
    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

export const getTransfers = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const transfers = await transferService.getTransfers(tenant_id, req.query);
    res.json({ success: true, data: transfers });
  } catch (error) {
    next(error);
  }
};

export const approveTransfer = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const result = await transferService.approveTransfer(tenant_id, id, uid);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const rejectTransfer = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) {
      return res
        .status(400)
        .json({ success: false, message: "Reason is required for rejection." });
    }
    const result = await transferService.rejectTransfer(
      tenant_id,
      id,
      uid,
      reason,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const confirmDispatch = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const { condition } = req.body;
    const result = await transferService.confirmDispatch(
      tenant_id,
      id,
      uid,
      condition || "good",
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const confirmReceipt = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const { condition, notes } = req.body;
    const result = await transferService.confirmReceipt(
      tenant_id,
      id,
      uid,
      condition || "good",
      notes,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getTransferHistory = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { assetId } = req.params;
    const history = await transferService.getTransferHistory(
      tenant_id,
      assetId,
    );
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
