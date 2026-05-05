import admin from "firebase-admin";
import QRCode from "qrcode";

/**
 * 1. generateQRCode: generates a QR code for the asset's qr_code property (UUID).
 * In a fully configured environment, this uploads to Firebase Storage.
 * We fallback to returning a Data URI if no bucket is configured.
 * @param {string} tenantId
 * @param {string} assetId
 * @returns {Promise<string>} The URL or Data URI of the generated QR code
 */
export const generateQRCode = async (tenantId, assetId) => {
  const db = admin.firestore();
  const assetRef = db.collection("assets").doc(assetId);
  const assetDoc = await assetRef.get();

  if (!assetDoc.exists || assetDoc.data().tenant_id !== tenantId) {
    throw new Error("Asset not found.");
  }

  const asset = assetDoc.data();
  if (!asset.qr_code) {
    throw new Error("Asset does not have a qr_code tracking UUID.");
  }

  // Generate QR code as Data URI
  const qrDataUri = await QRCode.toDataURL(asset.qr_code, {
    errorCorrectionLevel: "M",
    type: "image/png",
    margin: 2,
    width: 200,
  });

  try {
    // Attempt to upload to Firebase Storage if bucket exists
    const bucket = admin.storage().bucket();
    if (bucket && bucket.name) {
      const buffer = Buffer.from(qrDataUri.split(",")[1], "base64");
      const file = bucket.file(`tenants/${tenantId}/qr/${assetId}.png`);

      await file.save(buffer, {
        metadata: { contentType: "image/png" },
        public: true, // Requires bucket to allow public read, or use signed URLs
      });

      // Get signed URL (valid for a long time, or we can just make it public)
      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires: "01-01-2100", // Far future
      });

      await assetRef.update({ qr_image_url: signedUrl });
      return signedUrl;
    }
  } catch (err) {
    // Storage might not be configured, fallback to data URI
    console.warn(
      "Storage not configured or failed, falling back to data URI:",
      err.message,
    );
  }

  // Fallback update
  await assetRef.update({ qr_image_url: qrDataUri });
  return qrDataUri;
};

/**
 * 2. generateBulkQR(tenantId, assetIds[])
 * @param {string} tenantId
 * @param {string[]} assetIds
 * @returns {Promise<Array>} Array of objects with asset info and QR URLs
 */
export const generateBulkQR = async (tenantId, assetIds) => {
  const results = [];
  // For production with many IDs, consider batching or Promise.all limits
  for (const assetId of assetIds) {
    try {
      const url = await generateQRCode(tenantId, assetId);
      results.push({ asset_id: assetId, url, success: true });
    } catch (err) {
      results.push({ asset_id: assetId, error: err.message, success: false });
    }
  }
  return results;
};

/**
 * 3. scanAsset(tenantId, code): lookup asset log to qr_scan_logs
 * returning asset + permitted actions based on user role would technically happen in the controller or combining services,
 * but we'll return the base asset data here and let the route layer compose permissions.
 * @param {string} tenantId
 * @param {string} code
 * @param {object} authUser - user context for logging
 * @param {string} action - action taken (view, audit, transfer_request, maintenance)
 * @returns {Promise<object>} Asset data
 */
export const scanAsset = async (tenantId, code, authUser, action = "view") => {
  const db = admin.firestore();

  // Search by qr_code or barcode (requires compound query capabilities, or parallel queries if no index on both)
  let assetSnap = await db
    .collection("assets")
    .where("tenant_id", "==", tenantId)
    .where("qr_code", "==", code)
    .limit(1)
    .get();

  if (assetSnap.empty) {
    assetSnap = await db
      .collection("assets")
      .where("tenant_id", "==", tenantId)
      .where("barcode", "==", code)
      .limit(1)
      .get();
  }

  if (assetSnap.empty) {
    throw new Error("Asset not found for the provided code.");
  }

  const asset = assetSnap.docs[0].data();

  // Log the scan
  const logRef = db.collection("qr_scan_logs").doc();
  await logRef.set({
    id: logRef.id,
    tenant_id: tenantId,
    asset_id: asset.id,
    scanned_by_user_id: authUser.uid,
    scan_location: null, // Could be provided from client if GPS was gathered
    scan_timestamp: admin.firestore.FieldValue.serverTimestamp(),
    action_taken: action,
  });

  return asset;
};

/**
 * 4. generatePrintLayout(tenantId, assetIds[])
 * Creates highly styled HTML structure for asset tags (60mm x 40mm) easily printable in browser
 */
export const generatePrintLayout = async (tenantId, assetIds) => {
  const db = admin.firestore();
  const assets = [];

  for (const id of assetIds) {
    const doc = await db.collection("assets").doc(id).get();
    if (doc.exists && doc.data().tenant_id === tenantId) {
      const data = doc.data();
      // Ensure we have a QR code
      if (!data.qr_image_url && data.qr_code) {
        data.qr_image_url = await QRCode.toDataURL(data.qr_code, {
          type: "image/png",
          margin: 1,
        });
      }

      // Fetch branch code if possible
      if (data.branch_id) {
        const branchDoc = await db
          .collection("branches")
          .doc(data.branch_id)
          .get();
        if (branchDoc.exists) data.branch_name = branchDoc.data().name;
      }

      assets.push(data);
    }
  }

  let htmlElements = assets
    .map(
      (asset) => `
    <div class="label-container" style="page-break-inside: avoid; border: 1px solid #ccc; width: 60mm; height: 40mm; padding: 4mm; display: flex; flex-direction: column; justify-content: space-between; font-family: sans-serif; box-sizing: border-box; background: #fff;">
      <div style="font-weight: bold; font-size: 10pt; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 2mm; margin-bottom: 2mm;">
        Asstella Property
      </div>
      <div style="display: flex; gap: 4mm; align-items: center;">
        <img src="${asset.qr_image_url}" alt="QR Code" style="width: 25mm; height: 25mm;" />
        <div style="flex: 1; display: flex; flex-direction: column; gap: 1mm;">
          <div style="font-size: 8pt; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${asset.asset_name || "N/A"}</div>
          <div style="font-size: 7pt; font-family: monospace;">CODE: ${asset.asset_code || "N/A"}</div>
          <div style="font-size: 6pt; color: #555;">BR: ${asset.branch_name || "N/A"}</div>
        </div>
      </div>
    </div>
  `,
    )
    .join("");

  return `
    <html>
      <head>
        <title>Print Asset Labels</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { margin: 0; background-color: #eee; }
          .print-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, 60mm);
            gap: 5mm;
            justify-content: start;
            padding: 10mm;
            background: white;
            min-height: 297mm; /* Ensure it looks like A4 on screen */
            width: 210mm;
            margin: auto;
          }
          @media print {
            body { background-color: white; }
            .print-grid { padding: 0; min-height: auto; width: auto; background: transparent; }
            /* Hide print dialog buttons if any were added */
          }
        </style>
      </head>
      <body>
        <div class="print-grid">
          ${htmlElements}
        </div>
        <script>
          // Automatically prompt print dialog when fully loaded if required
          window.onload = () => { window.print(); }
        </script>
      </body>
    </html>
  `;
};

/**
 * 5. getPrintPDF(tenantId, assetIds[])
 * Simulating the PDF generation since Chromium/Puppeteer in this environment may be heavy.
 * In a real scenario you would pipe the generatePrintLayout HTML output to a PDF renderer.
 * Here we return the raw HTML string but the controller will set Content-Type: text/html.
 */
export const getPrintPDFLayout = async (tenantId, assetIds) => {
  return generatePrintLayout(tenantId, assetIds);
};

export const getScanHistory = async (tenantId, assetId) => {
  const db = admin.firestore();
  const snapshot = await db
    .collection("qr_scan_logs")
    .where("tenant_id", "==", tenantId)
    .where("asset_id", "==", assetId)
    .orderBy("scan_timestamp", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data());
};
