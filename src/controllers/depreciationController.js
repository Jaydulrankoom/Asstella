import * as depreciationRunService from "../services/depreciationRunService.js";

export const previewDepreciation = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { year, periodNo, categoryId } = req.body; // or req.query

    if (!year || !periodNo) {
      return res
        .status(400)
        .json({ success: false, message: "Year and periodNo are required." });
    }

    const preview = await depreciationRunService.previewDepreciation(
      tenant_id,
      {
        year,
        periodNo,
        categoryId,
      },
    );

    res.json({ success: true, data: preview });
  } catch (error) {
    next(error);
  }
};

export const runDepreciation = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { year, periodNo, categoryId, unitsInfo } = req.body;

    if (!year || !periodNo) {
      return res
        .status(400)
        .json({ success: false, message: "Year and periodNo are required." });
    }

    const result = await depreciationRunService.runDepreciation(
      tenant_id,
      {
        year,
        periodNo,
        categoryId,
        unitsInfo,
      },
      uid,
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
