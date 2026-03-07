const DEFAULT_RR = 2;
const RISK_PCT = 0.01;

export function computeRiskLevels(entryPrice, atr, bias, options = {}) {
  const { riskRewardRatio = DEFAULT_RR, atrMultiplier = 2 } = options;
  if (!entryPrice || !atr || atr <= 0) {
    return {
      entryPrice,
      stopLoss: null,
      takeProfit: null,
      riskRewardRatio: null,
      positionSizePct: null,
    };
  }

  const slDistance = atr * atrMultiplier;
  const tpDistance = slDistance * riskRewardRatio;

  const stopLoss = bias === 'LONG'
    ? entryPrice - slDistance
    : entryPrice + slDistance;
  const takeProfit = bias === 'LONG'
    ? entryPrice + tpDistance
    : entryPrice - tpDistance;

  const riskPerUnit = Math.abs(entryPrice - stopLoss);
  const rewardPerUnit = Math.abs(takeProfit - entryPrice);
  const rr = riskPerUnit > 0 ? rewardPerUnit / riskPerUnit : 0;

  return {
    entryPrice,
    stopLoss,
    takeProfit,
    riskRewardRatio: Math.round(rr * 100) / 100,
    positionSizePct: RISK_PCT * 100,
  };
}
