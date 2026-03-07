import { isVolumeSpike, getVolumeSpikeRatio } from './volumeService.js';
import { analyzeOrderBook } from './orderBookService.js';

const VOLUME_WHALE_MULTIPLIER = 5;
const OI_JUMP_PCT = 10;

export function detectWhaleActivity({
  currentVolume,
  avgVolume,
  oiChangePct,
  orderBookImbalance,
}) {
  const alerts = [];
  if (currentVolume && avgVolume && currentVolume > VOLUME_WHALE_MULTIPLIER * avgVolume) {
    alerts.push({
      type: 'VOLUME_SPIKE',
      severity: 'high',
      message: `Volume ${getVolumeSpikeRatio(currentVolume, avgVolume).toFixed(1)}x average`,
    });
  }
  if (oiChangePct != null && Math.abs(oiChangePct) > OI_JUMP_PCT) {
    alerts.push({
      type: 'OPEN_INTEREST_JUMP',
      severity: 'high',
      message: `Open interest ${oiChangePct > 0 ? '+' : ''}${oiChangePct}%`,
    });
  }
  if (orderBookImbalance != null && Math.abs(orderBookImbalance) > 0.3) {
    alerts.push({
      type: 'ORDER_BOOK_IMBALANCE',
      severity: 'medium',
      message: `Order book skewed ${orderBookImbalance > 0 ? 'bid' : 'ask'}`,
    });
  }
  return alerts;
}
