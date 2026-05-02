import admin from "firebase-admin";
import { db } from "../middleware/auth";

/**
 * Service to handle automated Double-Entry accounting records.
 */
export const journalEntryService = {
  /**
   * Crates a journal entry following standard accounting principles.
   */
  async createEntry(tenantId: string, data: {
    reference: string;
    description: string;
    amount: number;
    entries: { accountId: string; type: "debit" | "credit"; amount: number }[];
    financialYear: string;
    periodNo: number;
  }, userId: string) {
    const journalRef = db.collection("tenants").doc(tenantId).collection("journal_entries").doc();
    
    const entry = {
      ...data,
      status: "draft",
      source: "system_generated",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userId,
    };

    await journalRef.set(entry);
    return { id: journalRef.id, ...entry };
  },

  /**
   * Specifically handles the generation of a Depreciation Journal.
   */
  async postDepreciationJournal(tenantId: string, amount: number, period: string, userId: string) {
    return this.createEntry(tenantId, {
      reference: `DEP-${period}`,
      description: `Automated depreciation posting for period ${period}`,
      amount: amount,
      financialYear: period.split('-')[0],
      periodNo: parseInt(period.split('-')[2]) || 0,
      entries: [
        { accountId: "ACC-DEP-EXPENSE", type: "debit", amount: amount },
        { accountId: "ACC-ACCUM-DEP", type: "credit", amount: amount }
      ]
    }, userId);
  }
};
