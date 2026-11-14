// Simplified real-valued MIMO baseband model:  y = Hx + n
// Educational only; not a physical RF model.

export const CONFIGS = {
  SISO: { key: 'SISO', label: 'SISO', tx: 1, rx: 1, name: 'Single-Input Single-Output' },
  SIMO: { key: 'SIMO', label: 'SIMO', tx: 1, rx: 2, name: 'Single-Input Multiple-Output' },
  MISO: { key: 'MISO', label: 'MISO', tx: 2, rx: 1, name: 'Multiple-Input Single-Output' },
  MIMO: { key: 'MIMO', label: 'MIMO', tx: 2, rx: 2, name: 'Multiple-Input Multiple-Output' },
}

export const CONFIG_INFO = {
  SISO: {
    title: 'SISO · 1 Tx, 1 Rx',
    streams: 1,
    text: 'A single transmit antenna feeds a single receive antenna. One data stream at a time. This is the classic baseline link against which MIMO gain is measured.',
  },
  SIMO: {
    title: 'SIMO · 1 Tx, 2 Rx',
    streams: 1,
    text: 'One transmit antenna, two receive antennas. Every path from the Tx antenna is observed at the receiver, providing spatial diversity — the receiver picks the best combination to fight fading. No extra data stream is sent.',
  },
  MISO: {
    title: 'MISO · 2 Tx, 1 Rx',
    streams: 1,
    text: 'Two transmit antennas, one receive antenna. The transmitter can steer energy toward the receiver (beamforming) or send a coded copy (diversity), but only one independent data stream is produced.',
  },
  MIMO: {
    title: 'MIMO · 2 Tx, 2 Rx',
    streams: 2,
    text: 'Two transmit and two receive antennas create four independent propagation links (h11…h22). If the two columns of H are linearly independent, the receiver can separate up to min(Nt, Nr) = 2 spatial streams — not four. The four links are the physical paths that make separation possible; they are not four data streams.',
  },
}

export const defaultChannel = () => ({
  h11: 1 - 0.42,
  h12: -0.35,
  h21: 0.62,
  h22: 1 - 0.3,
})

export const defaultState = () => ({
  config: 'MIMO',
  X: [1, -1],
  H: defaultChannel(),
  noise: 0.15,
  seed: 7,
  multipath: true,
  fading: false,
})

// Deterministic "noise" — same seed + level = same sample, so the readout
// is stable until the user changes something (New Symbols gives a new seed).
export function noiseSamples(noiseLevel, seed = 7) {
  const s1 = Math.sin(seed * 12.9898) * 43758.5453
  const s2 = Math.sin(seed * 78.233 + 1.7) * 43758.5453
  const r1 = s1 - Math.floor(s1) - 0.5
  const r2 = s2 - Math.floor(s2) - 0.5
  return [r1 * 2 * noiseLevel, r2 * 2 * noiseLevel]
}

// y = Hx + n
export function computeY(H, X, noise, seed) {
  const [n1, n2] = noiseSamples(noise, seed)
  const y1 = H.h11 * X[0] + H.h12 * X[1] + n1
  const y2 = H.h21 * X[0] + H.h22 * X[1] + n2
  const det = H.h11 * H.h22 - H.h12 * H.h21
  let xhat = null
  let err = null
  if (Math.abs(det) > 1e-6) {
    const x1h = (H.h22 * y1 - H.h12 * y2) / det
    const x2h = (-H.h21 * y1 + H.h11 * y2) / det
    xhat = [x1h, x2h]
    err = Math.hypot(xhat[0] - X[0], xhat[1] - X[1])
  }
  return { y1, y2, n1, n2, det, xhat, err }
}

// Result-aware detection used by the scene readout so the on-screen result
// actually reacts to the h sliders and the noise level.
export function detect(H, X, noise, config, seed) {
  const [n1, n2] = noiseSamples(noise, seed)
  if (config === 'MIMO') {
    const r = computeY(H, X, noise, seed)
    if (!r.xhat) return { x1: NaN, x2: NaN, e1: 1, e2: 1, ok: false }
    const e1 = Math.abs(r.xhat[0] - X[0])
    const e2 = Math.abs(r.xhat[1] - X[1])
    return { x1: r.xhat[0], x2: r.xhat[1], e1, e2, ok: e1 < 0.25 && e2 < 0.25 }
  }
  // single-stream configs: matched filtering on the effective link(s)
  if (config === 'SIMO') {
    const y1 = H.h11 * X[0] + n1
    const y2 = H.h21 * X[0] + n2
    const den = H.h11 ** 2 + H.h21 ** 2
    const xh = den > 1e-6 ? (H.h11 * y1 + H.h21 * y2) / den : NaN
    const e1 = Math.abs(xh - X[0])
    return { x1: xh, e1, ok: den > 0.02 && e1 < 0.25 }
  }
  if (config === 'MISO') {
    // transmit beamforming: effective gain = ||[h11, h12]||
    const g = Math.hypot(H.h11, H.h12)
    const y = g * X[0] + n1
    const xh = g > 1e-6 ? y / g : NaN
    const e1 = Math.abs(xh - X[0])
    return { x1: xh, e1, ok: g > 0.05 && e1 < 0.25 }
  }
  // SISO
  const h = H.h11
  const y = h * X[0] + n1
  const xh = Math.abs(h) > 1e-6 ? y / h : NaN
  const e1 = Math.abs(xh - X[0])
  return { x1: xh, e1, ok: Math.abs(h) > 0.05 && e1 < 0.25 }
}

// Rank check for stream count messaging (educational).
export function streamCapacity(H) {
  const det = H.h11 * H.h22 - H.h12 * H.h21
  return Math.abs(det) > 0.05 ? 2 : 1
}

export const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—')

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// ---- animation timing -------------------------------------------------
// Total timeline in ms; phases are sequential milestones.
export const TIMELINE = {
  tx: 400,        // tx block lit
  streams: 2600,  // data streams leave transmitter
  air: 2600,      // signals in flight through antennas
  channel: 4800,  // multipath propagation inside channel
  rx: 7000,       // rx antennas capture mixed signals
  detect: 8600,   // receiver estimates channel + separates
  done: 10200,    // "Data Successfully Recovered!"
}

export const STAGE_STEPS = [
  { id: 'tx', at: 0, label: '1 · Transmitter', text: 'The transmitter takes two independent data streams (x1, x2), encodes and modulates them, then feeds one baseband signal to each transmit antenna. In spatial multiplexing both streams share the same time slot and frequency.' },
  { id: 'streams', at: TIMELINE.tx, label: '2 · Data Streams', text: 'Stream 1 (cyan) and Stream 2 (amber) leave the transmitter simultaneously. There is no time-sharing and no extra spectrum — that is the point of spatial multiplexing.' },
  { id: 'air', at: TIMELINE.streams, label: '3 · Radiation', text: 'Each antenna radiates its assigned stream into the air. Tx1 sends x1 and Tx2 sends x2 at the same time, on the same carrier.' },
  { id: 'channel', at: TIMELINE.air, label: '4 · Multipath Channel', text: 'Signals do not travel in straight lines. Every wavefront bounces off buildings, walls and the ground. Each transmit antenna therefore reaches each receive antenna through a unique channel coefficient h — four links in a 2×2 system.' },
  { id: 'rx', at: TIMELINE.channel, label: '5 · Reception', text: 'Each receive antenna hears a mixture. Rx1 hears h11·x1 + h12·x2; Rx2 hears h21·x1 + h22·x2. Both antennas capture contributions from both transmitters.' },
  { id: 'detect', at: TIMELINE.rx, label: '6 · Channel Estimation & Detection', text: 'The receiver first estimates H (typically from a known pilot sequence), then performs signal detection — for example y×Hᵀ (ZF) or MMSE — to invert the mixing and pull x1 and x2 back out of the two received signals.' },
  { id: 'done', at: TIMELINE.done, label: '7 · Data Successfully Recovered', text: 'Both original streams are correctly recovered at the receiver using the same time-frequency resources. That is spatial multiplexing: doubled throughput from smarter spatial processing, not from more bandwidth.' },
]
