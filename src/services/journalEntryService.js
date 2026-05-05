import admin from "firebase-admin";

export const generateDepreciationJournal = async (tenantId, runId, params) => {
  const { drAccount, crAccount, totalAmount, period } = params;
  const db = admin.firestore();

  if (totalAmount <= 0) return null;

  const entryRef = db.collection("accounting_journal_entries").doc();
  const entryData = {
    id: entryRef.id,
    tenant_id: tenantId,
    run_id: runId, // Reference to the depreciation run
    date: admin.firestore.FieldValue.serverTimestamp(),
    period: period,
    reference: `Depreciation for ${period.year} - ${period.periodNo}`,
    description: `Automated Depreciation Entry for Period ${period.periodNo}`,
    status: "draft", // Requires posting
    total_amount: totalAmount,
    lines: [
      {
        account_id: drAccount || "default_depreciation_expense_account",
        account_name: "Depreciation Expense",
        type: "debit",
        amount: totalAmount,
      },
      {
        account_id: crAccount || "default_accumulated_depreciation_account",
        account_name: "Accumulated Depreciation",
        type: "credit",
        amount: totalAmount,
      },
    ],
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await entryRef.set(entryData);
  return entryData;
};

export const generateDisposalJournal = async (
  tenantId,
  disposalData,
  assetData,
) => {
  const db = admin.firestore();

  const lines = [];

  const cashAccount = "default_cash_account";
  const accumDepAccount = "default_accumulated_depreciation_account";
  const assetCostAccount = "default_asset_cost_account";
  const lossAccount = "default_loss_on_disposal_account";
  const gainAccount = "default_gain_on_disposal_account";

  const bookValue = disposalData.book_value_at_disposal || 0;
  const disposalValue = disposalData.disposal_value || 0;
  const accumDep = assetData.accumulated_depreciation || 0;
  const assetCost = assetData.purchase_cost || bookValue + accumDep;
  const gainLoss = disposalData.gain_or_loss || 0;

  let totalDr = 0;
  let totalCr = 0;

  if (disposalValue > 0) {
    lines.push({
      account_id: cashAccount,
      account_name: "Cash/Receivables",
      type: "debit",
      amount: disposalValue,
    });
    totalDr += disposalValue;
  }

  if (accumDep > 0) {
    lines.push({
      account_id: accumDepAccount,
      account_name: "Accumulated Depreciation",
      type: "debit",
      amount: accumDep,
    });
    totalDr += accumDep;
  }

  if (assetCost > 0) {
    lines.push({
      account_id: assetCostAccount,
      account_name: "Asset Cost",
      type: "credit",
      amount: assetCost,
    });
    totalCr += assetCost;
  }

  if (gainLoss < 0) {
    const loss = Math.abs(gainLoss);
    lines.push({
      account_id: lossAccount,
      account_name: "Loss on Disposal",
      type: "debit",
      amount: loss,
    });
    totalDr += loss;
  } else if (gainLoss > 0) {
    lines.push({
      account_id: gainAccount,
      account_name: "Gain on Disposal",
      type: "credit",
      amount: gainLoss,
    });
    totalCr += gainLoss;
  }

  const entryRef = db.collection("accounting_journal_entries").doc();
  const entryData = {
    id: entryRef.id,
    tenant_id: tenantId,
    reference: disposalData.disposal_no,
    description: `Disposal of Asset ${assetData.asset_code}`,
    status: "draft",
    total_amount: Math.max(totalDr, totalCr),
    lines,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await entryRef.set(entryData);
  return entryRef.id;
};
