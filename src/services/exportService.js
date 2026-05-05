import ExcelJS from "exceljs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const exportToExcel = async (reportData, reportType) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data Data");

  sheet.properties.defaultColWidth = 20;

  // Header styling
  const headerStyle = {
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } },
  };

  if (reportData.items.length > 0) {
    const columns = Object.keys(reportData.items[0]).map((key) => ({
      header: key
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      key: key,
    }));
    sheet.columns = columns;

    sheet.getRow(1).eachCell((cell) => {
      cell.font = headerStyle.font;
      cell.fill = headerStyle.fill;
    });

    reportData.items.forEach((item) => {
      sheet.addRow(item);
    });

    // Formatting currency and numbers
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell, colNumber) => {
          if (typeof cell.value === "number") {
            cell.numFmt = "#,##0.00";
          }
        });
      }
    });

    // Summary Sheet
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 20 },
    ];
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.addRow({ metric: "Report Type", value: reportType });
    summarySheet.addRow({
      metric: "Total Records",
      value: reportData.items.length,
    });
    summarySheet.addRow({
      metric: "Generated At",
      value: reportData.timestamp,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

export const exportToPDF = async (reportData, reportType) => {
  // Simple PDF using pdf-lib
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 Landscape
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText("Asstella ERP", {
    x: 50,
    y: height - 50,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.5),
  });
  page.drawText(`Report: ${reportType.replace(/_/g, " ").toUpperCase()}`, {
    x: 50,
    y: height - 80,
    size: 14,
    font: boldFont,
  });
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: height - 100,
    size: 10,
    font,
  });

  let y = height - 140;
  const colWidth = 70;

  if (reportData.items.length > 0) {
    const keys = Object.keys(reportData.items[0]);

    // Header
    keys.forEach((key, i) => {
      page.drawText(key.slice(0, 10).replace(/_/g, " "), {
        // Trimmed header fit
        x: 50 + i * colWidth,
        y,
        size: 9,
        font: boldFont,
      });
    });

    y -= 20;

    // Rows
    for (let i = 0; i < Math.min(reportData.items.length, 20); i++) {
      // Limit 20 for simple demo without pagination
      const item = reportData.items[i];
      keys.forEach((key, j) => {
        let val = item[key];
        if (typeof val === "number") val = val.toFixed(2);
        page.drawText(String(val).slice(0, 12), {
          x: 50 + j * colWidth,
          y,
          size: 8,
          font,
        });
      });
      y -= 15;
    }

    if (reportData.items.length > 20) {
      page.drawText(
        `... and ${reportData.items.length - 20} more records (PDF pagination truncated in simple preview)`,
        { x: 50, y: y - 20, size: 8, font, color: rgb(0.5, 0.5, 0.5) },
      );
    }
  } else {
    page.drawText("No records found.", { x: 50, y, size: 10, font });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
