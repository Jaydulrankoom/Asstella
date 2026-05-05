export function calcStraightLine(
  purchaseValue,
  salvageValue,
  usefulLifeYears,
  periodsPerYear,
) {
  const annualDep = (purchaseValue - salvageValue) / usefulLifeYears;
  return parseFloat((annualDep / periodsPerYear).toFixed(2));
}

export function calcReducingBalance(
  currentBookValue,
  annualRatePercent,
  periodsPerYear,
) {
  return parseFloat(
    ((currentBookValue * (annualRatePercent / 100)) / periodsPerYear).toFixed(
      2,
    ),
  );
}

export function calcUnitsOfProduction(
  purchaseValue,
  salvageValue,
  totalUnits,
  unitsThisPeriod,
) {
  if (totalUnits === 0) return 0;
  const ratePerUnit = (purchaseValue - salvageValue) / totalUnits;
  return parseFloat((ratePerUnit * unitsThisPeriod).toFixed(2));
}

export function ensureNotBelowSalvage(
  currentBookValue,
  depAmount,
  salvageValue,
) {
  const maxDep = Math.max(0, currentBookValue - salvageValue);
  return Math.min(depAmount, maxDep);
}
