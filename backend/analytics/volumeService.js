const VOLUME_SPIKE_MULTIPLIER = 3;

export function isVolumeSpike(currentVolume, avgVolume) {
  if (!avgVolume || avgVolume <= 0) return false;
  return currentVolume > VOLUME_SPIKE_MULTIPLIER * avgVolume;
}

export function getVolumeSpikeRatio(currentVolume, avgVolume) {
  if (!avgVolume || avgVolume <= 0) return 1;
  return currentVolume / avgVolume;
}
