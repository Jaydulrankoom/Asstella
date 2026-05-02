import admin from "firebase-admin";
import { db } from "../middleware/auth";

export interface AssetData {
  name: string;
  categoryId: string;
  branchId?: string;
  departmentId?: string;
  status: string;
  purchaseValue?: number;
  purchaseDate?: string;
  serial?: string;
  location?: string;
  description?: string;
  qrCode?: string;
  barcode?: string;
}

/**
 * Service to handle business logic for Assets in the multi-tenant environment.
 */
export const assetService = {
  /**
   * Creates a new asset with specialized logic for multi-tenancy.
   */
  async createAsset(tenantId: string, data: any, createdBy: string) {
    // 1. Check Plan Limits (Placeholder for real limit logic)
    const tenantDoc = await db.collection("tenants").doc(tenantId).get();
    const stats = tenantDoc.data()?.stats || { assetCount: 0 };
    const planLimit = tenantDoc.data()?.plan?.assetLimit || 1000;

    if (stats.assetCount >= planLimit) {
      throw new Error("LIMIT_EXCEEDED: Your plan asset limit has been reached.");
    }

    // 2. Generate Unique Asset Code (e.g., AST-123456)
    const codeSuffix = Math.floor(100000 + Math.random() * 900000);
    const assetCode = `AST-${codeSuffix}`;

    // 3. Prepare Asset Document
    const assetRef = db.collection("tenants").doc(tenantId).collection("assets").doc();
    const newAsset = {
      ...data,
      assetCode,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${assetCode}`,
      status: data.status || "active",
      createdBy,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isArchived: false,
    };

    await assetRef.set(newAsset);

    // 4. Update tenant stats (In production, use a distributed counter or background trigger)
    await db.collection("tenants").doc(tenantId).update({
      "stats.assetCount": admin.firestore.FieldValue.increment(1)
    });

    return { id: assetRef.id, ...newAsset };
  },

  /**
   * Fetches assets with filtering and pagination.
   */
  async getAssets(tenantId: string, filters: any) {
    let query: admin.firestore.Query = db.collection("tenants").doc(tenantId).collection("assets")
      .where("isArchived", "==", false);

    if (filters.categoryId) query = query.where("categoryId", "==", filters.categoryId);
    if (filters.status) query = query.where("status", "==", filters.status);
    if (filters.branchId) query = query.where("branchId", "==", filters.branchId);

    // Basic pagination logic
    const limit = parseInt(filters.limit) || 20;
    query = query.orderBy("createdAt", "desc").limit(limit);

    if (filters.cursor) {
      const startAfterDoc = await db.collection("tenants").doc(tenantId).collection("assets").doc(filters.cursor).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    const snapshot = await query.get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return {
      assets: results,
      nextCursor: results.length === limit ? results[results.length - 1].id : null
    };
  },

  /**
   * Fetches a single asset by its database ID.
   */
  async getAssetById(tenantId: string, assetId: string) {
    const doc = await db.collection("tenants").doc(tenantId).collection("assets").doc(assetId).get();
    if (!doc.exists || doc.data()?.isArchived) return null;
    return { id: doc.id, ...doc.data() };
  },

  /**
   * Updates an existing asset and logs the activity.
   */
  async updateAsset(tenantId: string, assetId: string, data: any, updatedBy: string) {
    const assetRef = db.collection("tenants").doc(tenantId).collection("assets").doc(assetId);
    const existing = await assetRef.get();
    
    if (!existing.exists) throw new Error("NOT_FOUND");

    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await assetRef.update(updateData);

    // Activity Log logic would go here
    return { id: assetId, ...updateData };
  },

  /**
   * Soft deletes an asset by changing its status to archived.
   */
  async deleteAsset(tenantId: string, assetId: string) {
    const assetRef = db.collection("tenants").doc(tenantId).collection("assets").doc(assetId);
    await assetRef.update({
      isArchived: true,
      status: "archived",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  },

  /**
   * Scans for an asset by its code (QR or Barcode).
   */
  async scanAsset(tenantId: string, code: string) {
    // Try scanning by assetCode first
    let query = db.collection("tenants").doc(tenantId).collection("assets")
      .where("assetCode", "==", code)
      .limit(1);
    
    let snapshot = await query.get();

    // Fallback to barcode field if not found
    if (snapshot.empty) {
      snapshot = await db.collection("tenants").doc(tenantId).collection("assets")
        .where("barcode", "==", code)
        .limit(1)
        .get();
    }

    if (snapshot.empty) return null;

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
};
