const EXTREME_FUNDING_LONG = 0.01;
const EXTREME_FUNDING_SHORT = -0.01;

export function isCrowdedLongs(fundingRate) {
  return fundingRate != null && fundingRate > EXTREME_FUNDING_LONG;
}

export function isCrowdedShorts(fundingRate) {
  return fundingRate != null && fundingRate < EXTREME_FUNDING_SHORT;
}

export function getFundingSignal(fundingRate, priceUp) {
  if (fundingRate == null) return null;
  if (fundingRate > EXTREME_FUNDING_LONG) {
    return priceUp ? 'crowded longs, potential long squeeze' : 'crowded longs';
  }
  if (fundingRate < EXTREME_FUNDING_SHORT) {
    return !priceUp ? 'crowded shorts, potential short squeeze' : 'crowded shorts';
  }
  return null;
}
