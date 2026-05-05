import * as reportService from "../services/reportService.js";
import * as exportService from "../services/exportService.js";

export const generateReport = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { reportType, filters } = req.body;

    if (!reportType)
      return res
        .status(400)
        .json({ success: false, message: "reportType is required" });

    const data = await reportService.generateReport(
      tenant_id,
      reportType,
      filters || {},
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const exportToPdf = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { reportType, filters } = req.body;

    if (!reportType)
      return res
        .status(400)
        .json({ success: false, message: "reportType is required" });

    const data = await reportService.generateReport(
      tenant_id,
      reportType,
      filters || {},
    );
    const pdfBuffer = await exportService.exportToPDF(data, reportType);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report_${reportType}.pdf`,
    );
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    next(error);
  }
};

export const exportToExcel = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { reportType, filters } = req.body;

    if (!reportType)
      return res
        .status(400)
        .json({ success: false, message: "reportType is required" });

    const data = await reportService.generateReport(
      tenant_id,
      reportType,
      filters || {},
    );
    const excelBuffer = await exportService.exportToExcel(data, reportType);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report_${reportType}.xlsx`,
    );
    res.send(Buffer.from(excelBuffer));
  } catch (error) {
    next(error);
  }
};

export const getSavedReports = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const reports = await reportService.getSavedReports(tenant_id, uid);
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

export const saveReportFilters = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const saved = await reportService.saveReportFilters(
      tenant_id,
      uid,
      req.body,
    );
    res.json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};
