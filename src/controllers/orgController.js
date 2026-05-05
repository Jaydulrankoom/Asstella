import * as orgService from "../services/orgService.js";

export const createBranch = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const branch = await orgService.createBranch(tenant_id, req.body);
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const result = await orgService.updateBranch(tenant_id, id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const result = await orgService.deleteBranch(tenant_id, id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getBranches = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const branches = await orgService.getBranches(tenant_id);
    res.json({ success: true, data: branches });
  } catch (error) {
    next(error);
  }
};

export const getBranchById = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const branch = await orgService.getBranchById(tenant_id, id);
    const stats = await orgService.getBranchStats(tenant_id, id);
    res.json({ success: true, data: { branch, stats } });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { branchId } = req.params;
    const dept = await orgService.createDepartment(
      tenant_id,
      branchId,
      req.body,
    );
    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentsByBranch = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { branchId } = req.params;
    const depts = await orgService.getDepartmentsByBranch(tenant_id, branchId);
    res.json({ success: true, data: depts });
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const loc = await orgService.createLocation(tenant_id, req.body);
    res.status(201).json({ success: true, data: loc });
  } catch (error) {
    next(error);
  }
};

export const getLocationTree = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { branch_id } = req.query;
    if (!branch_id) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "branch_id is required",
      });
    }
    const tree = await orgService.getLocationHierarchy(tenant_id, branch_id);
    res.json({ success: true, data: tree });
  } catch (error) {
    next(error);
  }
};

export const getOrgOverview = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const tree = await orgService.getOrgOverviewTree(tenant_id);
    res.json({ success: true, data: tree });
  } catch (error) {
    next(error);
  }
};
