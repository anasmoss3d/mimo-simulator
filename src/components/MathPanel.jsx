import React from 'react'
import { computeY } from '../model.js'

const f2 = (v) => (Math.round(v * 100) / 100).toFixed(2)
const coef = (v) => (v < 0 ? '(' : '') + f2(v) + (v < 0 ? ')' : '')
const sign = (v) => (v < 0 ? '−' : '+')
const STREAM_COLOR = { h11: '#0891b2', h12: '#0891b2', h21: '#d97706', h22: '#d97706' }
const SUB = { h11: 'Tx1→Rx1', h12: 'Tx2→Rx1', h21: 'Tx1→Rx2', h22: 'Tx2→Rx2' }
const KEYS = [['h11', 'h12'], ['h21', 'h22']]

function YEq({ label, a, b, c, yv, color }) {
  return (
    <div className="flex items-center justify-between gap-2 font-mono text-[12px]">
      <span className="w-7 shrink-0 font-bold" style={{ color }}>{label}</span>
      <span className="flex-1 text-slate-600">
        {coef(a)}·x₁ {sign(b)} {f2(Math.abs(b))}·x₂ {sign(c)} {f2(Math.abs(c))}
      </span>
      <span className="font-bold text-slate-900">{f2(yv)}</span>
    </div>
  )
}

export default function MathPanel({ H, X, noise, done, selected, onSelect }) {
  const res = computeY(H, X, noise)
  const { y1, y2, det, xhat, err } = res
  const rankMsg = Math.abs(det) > 0.15 ? 'full rank → 2 separable streams'
    : Math.abs(det) > 0.03 ? 'weak — streams barely separable'
    : 'singular — streams collapse to 1'
  const rankColor = Math.abs(det) > 0.15 ? 'text-emerald-600' : Math.abs(det) > 0.03 ? 'text-amber-600' : 'text-rose-600'

  return (
    <div className="panel p-4">
      <h3 className="text-sm font-bold text-cyan-700">Channel Matrix H & y = Hx + n</h3>
      <p className="mt-0.5 mb-3 text-[10px] text-slate-500">
        Real-valued baseband model. Click a coefficient to see that link's role.
      </p>

      <div className="grid grid-cols-2 gap-4 items-start">
        {/* matrix */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl text-slate-500">H</span>
            <span className="text-slate-500">=</span>
            <div className="flex gap-1">
              {KEYS.map((row) => (
                <div key={row[0]} className="flex flex-col gap-1">
                  {row.map((k) => (
                    <button key={k} onClick={() => onSelect(selected === k ? null : k)}
                      title={SUB[k]}
                      className={`rounded-md px-2.5 py-1.5 font-mono text-[13px] font-bold transition-all ${selected === k ? 'ring-2 ring-cyan-500 bg-navy-700' : 'bg-navy-800 hover:bg-navy-700'}`}
                      style={{ color: STREAM_COLOR[k] }}>
                      {f2(H[k])}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex gap-3 text-[9.5px] text-slate-500">
            <span><span className="text-cyan-700">●</span> x₁ row/column</span>
            <span><span className="text-amber-600">●</span> x₂ row/column</span>
          </div>
          <div className="mt-3 font-mono text-[11px] text-slate-500">
            x = <span className="text-cyan-700 font-bold">[{X[0]}, {X[1]}]</span>
          </div>
        </div>

        {/* equations */}
        <div className="flex flex-col gap-1.5">
          <YEq label="y₁" a={H.h11} b={H.h12} c={res.n1} yv={y1} color="#0891b2" />
          <YEq label="y₂" a={H.h21} b={H.h22} c={res.n2} yv={y2} color="#d97706" />

          <div className="mt-1.5 rounded-md bg-navy-800/60 p-2 font-mono text-[11px] flex flex-wrap gap-x-3 gap-y-0.5">
            <span className="text-slate-500">det H = <b className="text-slate-900">{f2(det)}</b></span>
            <span><b className="text-cyan-700">x̂₁</b> {xhat ? f2(xhat[0]) : '—'}</span>
            <span><b className="text-amber-700">x̂₂</b> {xhat ? f2(xhat[1]) : '—'}</span>
          </div>
          <p className={`font-mono text-[10.5px] font-semibold ${rankColor}`}>
            {rankMsg}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-navy-700 bg-navy-800/40 px-3 py-2 text-[10.5px] leading-relaxed text-slate-500">
        The receiver <b className="text-slate-800">estimates H</b> from a pilot, then does <b className="text-slate-800">detection</b>
        (x̂ = H⁻¹y) to undo the mixing and recover both streams — all from the <b className="text-cyan-700">same</b> time & frequency.
      </div>
    </div>
  )
}
