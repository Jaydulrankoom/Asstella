import * as maintenanceService from "../services/maintenanceService.js";

export const createTicket = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const ticket = await maintenanceService.createTicket(
      tenant_id,
      req.body,
      uid,
    );
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const tickets = await maintenanceService.getTickets(tenant_id, req.query);
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const assignTicket = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const assigneeData = req.body; // { technician_id, vendor_id }
    const result = await maintenanceService.assignTicket(
      tenant_id,
      id,
      assigneeData,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const result = await maintenanceService.updateProgress(
      tenant_id,
      id,
      req.body,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const closeTicket = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { id } = req.params;
    const result = await maintenanceService.closeTicket(
      tenant_id,
      id,
      req.body,
      uid,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const schedule = await maintenanceService.createSchedule(
      tenant_id,
      req.body,
    );
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

export const getSchedules = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const schedules = await maintenanceService.getSchedules(tenant_id);
    res.json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};
