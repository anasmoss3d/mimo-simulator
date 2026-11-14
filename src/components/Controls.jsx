import React from 'react'
import { Waves, Activity, Zap, Antenna } from 'lucide-react'
import { CONFIGS } from '../model.js'

function Slider({ label, value, min, max, step, onChange, color, fmt = (v) => v.toFixed(2), hint }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-mono font-bold" style={{ color }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-navy-600 accent-cyan-600" />
      {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
    </div>
  )
}

function Toggle({ label, hint, checked, onChange, icon }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`flex items-center justify-between w-full rounded-lg border px-3 py-2 text-left transition-colors ${checked ? 'border-cyan-500/70 bg-cyan-100' : 'border-navy-600 bg-navy-800/40 hover:border-slate-500'}`}>
      <span className="flex items-center gap-2">
        {icon}
        <span>
          <span className={`block text-xs font-semibold ${checked ? 'text-cyan-700' : 'text-slate-600'}`}>{label}</span>
          <span className="block text-[10px] text-slate-500">{hint}</span>
        </span>
      </span>
      <span className={`relative inline-block h-5 w-9 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-navy-600'}`}>
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }} />
      </span>
    </button>
  )
}

export default function Controls({
  config, onConfig,
  noise, onNoise,
  H, onHCoeff,
  multipath, onMultipath,
  fading, onFading,
}) {
  return (
    <div className="panel p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-cyan-700 flex items-center gap-2">
          <Antenna size={15} /> CONTROLS
        </h3>
      </div>

      {/* configuration */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-2">Antenna configuration</p>
        <div className="grid grid-cols-4 gap-1.5">
          {Object.values(CONFIGS).map((c) => (
            <button key={c.key} onClick={() => onConfig(c.key)}
              className={`chip flex-col items-center gap-0.5 !px-1 ${config === c.key ? 'border-cyan-400 bg-cyan-100 text-cyan-700' : 'border-navy-600 text-slate-500 hover:border-slate-500'}`}
              title={c.name}>
              <span className="whitespace-nowrap text-xs font-bold">{c.label}</span>
              <span className="whitespace-nowrap text-[8.5px] opacity-70">{c.tx} Tx · {c.rx} Rx</span>
            </button>
          ))}
        </div>
      </div>

      {/* channel coefficients */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-2 flex items-center gap-1.5">
          Channel coefficients <span className="text-slate-600">(H matrix, per antenna pair)</span>
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Slider label="h₁₁  Tx1→Rx1" value={H.h11} min={-2} max={2} step={0.05}
            onChange={(v) => onHCoeff('h11', v)} color="#0891b2" />
          <Slider label="h₁₂  Tx2→Rx1" value={H.h12} min={-2} max={2} step={0.05}
            onChange={(v) => onHCoeff('h12', v)} color="#0891b2" />
          <Slider label="h₂₁  Tx1→Rx2" value={H.h21} min={-2} max={2} step={0.05}
            onChange={(v) => onHCoeff('h21', v)} color="#d97706" />
          <Slider label="h₂₂  Tx2→Rx2" value={H.h22} min={-2} max={2} step={0.05}
            onChange={(v) => onHCoeff('h22', v)} color="#d97706" />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
          <Zap size={11} className="text-cyan-700" />
          Draggable on the Channel Matrix panel — link brightness & width track |h|.
        </p>
      </div>

      {/* environment */}
      {
        <div className="grid grid-cols-1 gap-2">
          <Toggle label="Multipath" hint="show bounce paths in the channel" checked={multipath}
            onChange={onMultipath} icon={<Waves size={15} className="text-cyan-700" />} />
          <Toggle label="Fading" hint="randomly attenuate each link over time" checked={fading}
            onChange={onFading} icon={<Activity size={15} className="text-cyan-700" />} />
          <Slider label="Noise level σ" value={noise} min={0} max={0.6} step={0.01}
            onChange={onNoise} color="#7c3aed" hint="additive Gaussian noise on each receiver input" />
        </div>
      }
    </div>
  )
}
