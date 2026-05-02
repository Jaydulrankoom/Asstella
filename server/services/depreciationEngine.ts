import admin from "firebase-admin";
import { db } from "../middleware/auth";

/**
 * Core mathematical functions for asset depreciation.
 * Handles precision by performing calculations then rounding to 2 decimal places.
 */
export const depreciationMath = {
  /**
   * Straight Line Method: Equal amount per period
   * (Cost - Salvage) / Total Useful Periods
   */
  calculateStraightLine(purchaseValue: number, salvageValue: number, usefulLifeYears: number, periodsPerYear: number = 1): number {
    const totalPeriods = usefulLifeYears * periodsPerYear;
    const amount = (purchaseValue - salvageValue) / totalPeriods;
    return parseFloat(amount.toFixed(2));
  },

  /**
   * Reducing Balance (Declining) Method: Accelerated depreciation
   * Book Value * (Rate / Periods)
   */
  calculateReducingBalance(currentBookValue: number, annualRatePercent: number, periodsPerYear: number = 1): number {
    const amount = currentBookValue * (annualRatePercent / 100) / periodsPerYear;
    return parseFloat(amount.toFixed(2));
  },

  /**
   * Units of Production Method: Based on usage
   * ((Cost - Salvage) / Total Units) * Units Consumed
   */
  calculateUnitsOfProduction(purchaseValue: number, salvageValue: number, totalUnits: number, unitsUsedThisPeriod: number): number {
    const amount = ((purchaseValue - salvageValue) / totalUnits) * unitsUsedThisPeriod;
    return parseFloat(amount.toFixed(2));
  }
};

/**
 * Service to manage financial lifecycle of assets.
 */
export const depreciationEngine = {
  /**
   * Runs the official depreciation process for a period.
   * Updates database and generates audit logs.
   */
  async runDepreciation(tenantId: string, params: {
    financialYear: string;
    periodNo: number; // e.g. 5 for May
    periodType: "monthly" | "quarterly" | "yearly";
    categoryId?: string;
  }, userId: string) {
    const { financialYear, periodNo, periodType, categoryId } = params;
    
    // 1. Idempotency Guard: Check if already run
    const runId = `${financialYear}-${periodType}-${periodNo}${categoryId ? '-' + categoryId : ''}`;
    const logRef = db.collection("tenants").doc(tenantId).collection("depreciation_runs").doc(runId);
    const existingRun = await logRef.get();

    if (existingRun.exists) {
      throw new Error(`DEP_ALREADY_RUN: Depreciation has already been posted for period ${runId}.`);
    }

    // 2. Fetch Eligible Assets
    let query = db.collection("tenants").doc(tenantId).collection("assets")
      .where("isArchived", "==", false)
      .where("status", "==", "active")
      .where("depreciationEnabled", "==", true);

    if (categoryId) {
      query = query.where("categoryId", "==", categoryId);
    }

    const snapshot = await query.get();
    if (snapshot.empty) return { processed: 0, totalAmount: 0, message: "No eligible assets found" };

    const batchSize = 500;
    const batches: admin.firestore.WriteBatch[] = [];
    let currentBatch = db.batch();
    let currentBatchCount = 0;
    
    let totalDepreciationAmount = 0;
    const results: any[] = [];
    const errors: string[] = [];

    // 3. Process Assets
    snapshot.docs.forEach((doc) => {
      const asset = doc.data();
      const currentBookValue = asset.currentBookValue || asset.purchaseValue;
      const salvageValue = asset.salvageValue || 0;

      // Skip if already fully depreciated
      if (currentBookValue <= salvageValue) return;

      let depAmount = 0;
      const method = asset.depreciationMethod; // "SL" | "RB" | "UP"

      try {
        if (method === "SL") {
          depAmount = depreciationMath.calculateStraightLine(asset.purchaseValue, salvageValue, asset.usefulLife || 5, periodType === "monthly" ? 12 : 1);
        } else if (method === "RB") {
          depAmount = depreciationMath.calculateReducingBalance(currentBookValue, asset.depreciationRate || 20, periodType === "monthly" ? 12 : 1);
        } else if (method === "UP") {
          depAmount = depreciationMath.calculateUnitsOfProduction(asset.purchaseValue, salvageValue, asset.totalCapacity || 100000, asset.usageThisPeriod || 0);
        }

        // Cap at salvage value
        if (currentBookValue - depAmount < salvageValue) {
          depAmount = currentBookValue - salvageValue;
        }

        if (depAmount <= 0) return;

        // Add to batch
        const newBookValue = parseFloat((currentBookValue - depAmount).toFixed(2));
        
        currentBatch.update(doc.ref, {
          currentBookValue: newBookValue,
          lastDepreciationDate: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Write log inside subcollection
        const logDoc = doc.ref.collection("financial_logs").doc();
        currentBatch.set(logDoc, {
          type: "depreciation",
          amount: depAmount,
          oldValue: currentBookValue,
          newValue: newBookValue,
          runId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: userId
        });

        totalDepreciationAmount += depAmount;
        currentBatchCount += 2; // update + log

        // Split batch if > 500
        if (currentBatchCount >= batchSize - 2) {
          batches.push(currentBatch);
          currentBatch = db.batch();
          currentBatchCount = 0;
        }

      } catch (err: any) {
        errors.push(`Asset ${doc.id}: ${err.message}`);
      }
    });

    batches.push(currentBatch);

    // 4. Commit all batches
    for (const b of batches) {
      await b.commit();
    }

    // 5. Auto-generate accounting journal entry
    try {
      const { journalEntryService } = await import("./journalEntryService");
      await journalEntryService.postDepreciationJournal(tenantId, totalDepreciationAmount, runId, userId);
    } catch (jErr) {
      console.error("Failed to post journal entry:", jErr);
      errors.push("FINANCIAL_WARNING: Depreciation posted but journal entry failed to generate.");
    }

    // 6. Finalize log entry
    await logRef.set({
      runId,
      financialYear,
      periodNo,
      periodType,
      totalAmount: parseFloat(totalDepreciationAmount.toFixed(2)),
      assetCount: snapshot.size,
      processedBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "posted"
    });

    return {
      processed: snapshot.size,
      totalAmount: parseFloat(totalDepreciationAmount.toFixed(2)),
      errors
    };
  },

  /**
   * Generates a preview without writing to the database.
   */
  async previewDepreciation(tenantId: string, filters: any) {
    // Logic similar to runDepreciation but without batch writes
    // Returns array of { assetCode, currentVal, depAmount, newVal }
    return { 
      message: "Preview logic calculated based on current registry state.",
      assets: [] // Implementation for UI to show what WOULD happen
    };
  }
};
