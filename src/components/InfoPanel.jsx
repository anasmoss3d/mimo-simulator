import React from 'react'
import { Info, MousePointerClick } from 'lucide-react'
import { STAGE_STEPS, CONFIG_INFO } from '../model.js'

const COMPONENT_INFO = {
  tx: { title: 'Transmitter', text: 'Turns digital data into transmittable signals: each data stream is encoded, modulated and mapped to its own transmit antenna. In spatial multiplexing both streams are generated at once and share the same time slot and frequency band.' },
  tx1: { title: 'Antenna Tx1 — transmits stream x1', text: 'A physical radiator. It converts the baseband signal x1 into an electromagnetic wave. It is deliberately spaced a few wavelengths from Tx2 so that the two antennas experience different multipath conditions.' },
  tx2: { title: 'Antenna Tx2 — transmits stream x2', text: 'Radiates stream x2 at exactly the same time and frequency as Tx1. Both antennas can be active simultaneously — that is what "simultaneous transmission" means in spatial multiplexing.' },
  channel: { title: 'Wireless Multipath Channel', text: 'The physical path between transmitter and receiver. Signals reach each receive antenna through many routes: direct line-of-sight, reflections off buildings, scattering and ground bounce. Each antenna pair gets one combined "fingerprint" — a channel coefficient h. Fading and multipath are properties of this channel.' },
  rx1: { title: 'Antenna Rx1 — receives y1', text: 'Captures the electromagnetic field and converts it into voltage y1, which is a mixture of contributions from Tx1 (h11·x1) and Tx2 (h12·x2). Every receive antenna hears every transmitter.' },
  rx2: { title: 'Antenna Rx2 — receives y2', text: 'Same principle on the second receive path: y2 = h21·x1 + h22·x2 (+ noise). The mixture is not a problem — it is the raw material the receiver uses to separate the streams.' },
  rx: { title: 'Receiver', text: 'Performs the two key MIMO operations: 1) channel estimation — using a known pilot sequence it estimates Ĥ; 2) signal detection — it applies a matrix operation (ZF: x̂ = H⁻¹y, or MMSE when noise is significant) to undo the mixing and recover x1 and x2.' },
  h11: { title: 'h11 — link Tx1 → Rx1', text: 'Channel coefficient between Tx1 and Rx1: it scales stream x1 as it propagates to Rx1. The link in the diagram gets thicker and brighter as |h11| grows. Set it near 0 and that path effectively disappears.' },
  h12: { title: 'h12 — link Tx2 → Rx1', text: 'The cross-link from Tx2 to Rx1. Even though Rx1 "belongs to" stream x1, it also hears x2 through this path — this overlap is what lets the receiver separate the two streams.' },
  h21: { title: 'h21 — link Tx1 → Rx2', text: 'The other cross-link: Tx1 reaching Rx2. For the receiver to untangle x1 and x2, the two rows of H must differ (h11/h12 is not equal to h21/h22) — that is rank 2.' },
  h22: { title: 'h22 — link Tx2 → Rx2', text: 'The direct link from Tx2 to Rx2. If all four links were identical, both receive antennas would see the same mixture and separation would be impossible — the rank of H collapses to 1.' },
}

const PHASE_STEP = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6 }

export default function InfoPanel({ phase, running, selected, config }) {
  const cfg = CONFIG_INFO[config]
  const stepIdx = running ? PHASE_STEP[phase] : 0
  const step = STAGE_STEPS[stepIdx]
  const comp = selected ? COMPONENT_INFO[selected] : null

  return (
    <div className="panel p-4 text-xs flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-bold text-cyan-700 flex items-center gap-2">
          <Info size={15} /> What is happening
        </h3>
        <p className="mt-1.5 font-bold text-slate-900">{step.label}</p>
        <p className="mt-1 leading-relaxed text-slate-500">{step.text}</p>
      </div>

      <div className="rounded-md border border-navy-600 bg-navy-800/40 p-2.5">
        <p className="font-bold text-slate-800">{cfg.title}</p>
        <p className="mt-1 leading-relaxed text-slate-500">{cfg.text}</p>
        <p className="mt-1.5 font-mono text-[10px] text-slate-500">
          max simultaneous streams: {cfg.streams}{config === 'MIMO' ? '  (4 links ≠ 4 streams)' : ''}
        </p>
      </div>

      {comp ? (
        <div className="rounded-md border border-cyan-500/40 bg-cyan-500/5 p-2.5">
          <p className="font-bold text-cyan-700 flex items-center gap-1.5">
            <MousePointerClick size={12} /> {comp.title}
          </p>
          <p className="mt-1 leading-relaxed text-slate-500">{comp.text}</p>
          <p className="mt-1.5 text-[10px] text-slate-500">Click the same item again (or anywhere empty) to clear.</p>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-navy-600 p-2.5 text-slate-500">
          <p className="flex items-center gap-1.5 font-semibold text-slate-500">
            <MousePointerClick size={12} /> Explore: click any part of the diagram
          </p>
          <p className="mt-1">Select the Transmitter, Tx1/Tx2, the Channel zone, Rx1/Rx2 or the Receiver to see its role explained in plain English.</p>
        </div>
      )}
    </div>
  )
}
