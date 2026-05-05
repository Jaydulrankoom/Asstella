import * as amcService from "../services/amcService.js";

export const createContract = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const contract = await amcService.createContract(tenant_id, req.body, uid);
    res.status(201).json({ success: true, data: contract });
  } catch (error) {
    next(error);
  }
};

export const getContracts = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const contracts = await amcService.getContracts(tenant_id, req.query);
    res.json({ success: true, data: contracts });
  } catch (error) {
    next(error);
  }
};

export const scheduleVisit = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const visit = await amcService.scheduleVisit(tenant_id, id, req.body);
    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    next(error);
  }
};

export const recordVisitCompletion = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { visitId } = req.params;
    const result = await amcService.recordVisitCompletion(
      tenant_id,
      visitId,
      req.body,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getVisits = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const visits = await amcService.getVisits(tenant_id, id);
    res.json({ success: true, data: visits });
  } catch (error) {
    next(error);
  }
};

export const getSLACompliance = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const compliance = await amcService.calculateSLACompliance(tenant_id, id);
    res.json({ success: true, data: compliance });
  } catch (error) {
    next(error);
  }
};

export const getVendorScorecard = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { vendorId } = req.params;
    const scorecard = await amcService.getVendorScorecard(tenant_id, vendorId);
    res.json({ success: true, data: scorecard });
  } catch (error) {
    next(error);
  }
};

export const renewContract = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const { new_end_date } = req.body;
    if (!new_end_date) {
      return res
        .status(400)
        .json({ success: false, message: "new_end_date is required" });
    }
    const contract = await amcService.renewContract(
      tenant_id,
      id,
      new_end_date,
    );
    res.json({ success: true, data: contract });
  } catch (error) {
    next(error);
  }
};
