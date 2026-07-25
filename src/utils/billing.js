export function calcBillingValue(consumption, settings) {
  const extrasSum = (settings.extraCharges || []).reduce((sum, c) => sum + (Number(c.value) || 0), 0);
  const usageValue = (Number(consumption) || 0) * (Number(settings.pricePerM3) || 0);
  return (Number(settings.minValue) || 0) + usageValue + extrasSum;
}
