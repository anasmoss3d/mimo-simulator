import React, { useState } from 'react'
import { Layers, Shield, Target } from 'lucide-react'

const C = { cyan: '#0e7490', amber: '#b45309', dim: '#64748b', slate: '#334155' }

function MiniAnt({ x, y, label, color = C.slate, size = 18 }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={size} fill="rgba(255,255,255,0.95)" stroke={color} strokeWidth={1.6} />
      <line x1={0} y1={-6} x2={0} y2={8} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <path d={`M -5 8 L 0 -6 L 5 8`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <text y={size + 14} textAnchor="middle" fill={color} fontSize={11} fontWeight={700} fontFamily="monospace">{label}</text>
    </g>
  )
}

const dot = (x, y, color, r = 4) => <circle cx={x} cy={y} r={r} fill={color} />

// ------------------------------------------------ A. spatial multiplexing
function SpatialMultiplexing() {
  return (
    <div>
      <svg viewBox="0 0 520 240" className="w-full h-auto rounded-lg bg-[#f3f8fd] border border-navy-700">
        <defs>
          <marker id="arwM" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#64748b" strokeWidth="1.5" />
          </marker>
        </defs>
        {/* blocks */}
        <rect x={14} y={78} width={108} height={84} rx={10} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.2} />
        <text x={68} y={106} textAnchor="middle" fill={C.slate} fontSize={12} fontWeight={700}>TRANSMITTER</text>
        <text x={68} y={124} textAnchor="middle" fill={C.cyan} fontSize={11} fontFamily="monospace">x1 (stream 1)</text>
        <text x={68} y={140} textAnchor="middle" fill={C.amber} fontSize={11} fontFamily="monospace">x2 (stream 2)</text>

        <rect x={398} y={78} width={108} height={84} rx={10} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.2} />
        <text x={452} y={106} textAnchor="middle" fill={C.slate} fontSize={12} fontWeight={700}>RECEIVER</text>
        <text x={452} y={124} textAnchor="middle" fill={C.cyan} fontSize={11} fontFamily="monospace">recovers x1</text>
        <text x={452} y={140} textAnchor="middle" fill={C.amber} fontSize={11} fontFamily="monospace">recovers x2</text>

        {/* antennas */}
        <MiniAnt x={170} y={100} label="Tx1" color={C.cyan} />
        <MiniAnt x={170} y={140} label="Tx2" color={C.amber} />
        <MiniAnt x={350} y={100} label="Rx1" color={C.cyan} />
        <MiniAnt x={350} y={140} label="Rx2" color={C.amber} />

        {/* all four links active, both streams simultaneously */}
        {['M 170 100 Q 260 74 350 100', 'M 170 140 Q 260 116 350 100', 'M 170 100 Q 260 124 350 140', 'M 170 140 Q 260 166 350 140'].map((d, i) => (
          <path key={i} d={d} fill="none" stroke={i % 2 === 0 ? C.cyan : C.amber} strokeWidth={2}
            strokeDasharray="8 7" markerEnd="url(#arwM)" opacity={0.75}>
            <animate attributeName="stroke-dashoffset" from="0" to="-30" dur="0.9s" repeatCount="indefinite" />
          </path>
        ))}
        <text x={260} y={40} textAnchor="middle" fill={C.slate} fontSize={11}>
          same time slot · same frequency · two streams in flight together
        </text>
      </svg>
      <ul className="mt-3 space-y-1.5 text-xs text-slate-500 list-disc pl-4">
        <li><b className="text-cyan-700">Two independent streams</b> are sent at once through the same time–frequency resources — that is "spatial" multiplexing: the extra dimension is space (antennas), not spectrum.</li>
        <li>The 2×2 channel gives <b className="text-slate-800">four propagation links</b>, but at most <b className="text-slate-800">two data streams</b> (rank of H ≤ min(Nt, Nr) = 2).</li>
        <li>Throughput roughly doubles without more bandwidth — the core benefit behind 4G/5G MIMO.</li>
      </ul>
    </div>
  )
}

// ------------------------------------------------ B. spatial diversity
function SpatialDiversity() {
  return (
    <div>
      <svg viewBox="0 0 520 240" className="w-full h-auto rounded-lg bg-[#f3f8fd] border border-navy-700">
        <MiniAnt x={80} y={120} label="Tx1" color={C.cyan} />
        <MiniAnt x={400} y={90} label="Rx1" color={C.slate} />
        <MiniAnt x={400} y={160} label="Rx2" color={C.slate} />

        {/* strong path (to Rx1) */}
        <path d="M 80 120 Q 240 62 400 90" fill="none" stroke={C.cyan} strokeWidth={3} strokeDasharray="10 8" opacity={0.9}>
          <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="0.9s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.8;0.9" dur="1.8s" repeatCount="indefinite" />
        </path>
        <text x={200} y={70} fill={C.cyan} fontSize={10} fontStyle="italic">path A: strong</text>

        {/* fading path (to Rx2) */}
        <path d="M 80 120 Q 240 178 400 160" fill="none" stroke={C.amber} strokeWidth={3} strokeDasharray="10 8" opacity={0.5}>
          <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="0.9s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.85;0.05;0.9" dur="4s" repeatCount="indefinite" />
        </path>
        <text x={210} y={182} fill={C.amber} fontSize={10} fontStyle="italic">path B: deep fading (watch it fade!)</text>

        {/* combining at the receiver */}
        <rect x={446} y={84} width={62} height={92} rx={10} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.2} />
        <text x={477} y={116} textAnchor="middle" fill={C.slate} fontSize={10.5} fontWeight={700}>COMBINE</text>
        <text x={477} y={132} textAnchor="middle" fill={C.slate} fontSize={9.5}>best path</text>
        <text x={477} y={152} textAnchor="middle" fill="#059669" fontSize={12} fontWeight={800}>
          ✓
          <animate attributeName="opacity" values="1;0.4;1" dur="4s" repeatCount="indefinite" />
        </text>

        <text x={250} y={226} textAnchor="middle" fill={C.slate} fontSize={11}>
          The same information travels over two independent paths — if one fades, the other keeps the link alive.
        </text>
      </svg>
      <ul className="mt-3 space-y-1.5 text-xs text-slate-500 list-disc pl-4">
        <li>One data stream is sent, but <b className="text-slate-800">redundant copies ride different physical paths</b> (or a coded version is spread across antennas).</li>
        <li>Deep fades are uncorrelated between paths (they experience different multipath), so the probability that <i>all</i> paths fade together is very small — reliability improves dramatically.</li>
        <li>The receiver combines the observations (selection, MR, MRC, or ML). <b className="text-cyan-700">Diversity buys robustness, not extra data.</b></li>
      </ul>
    </div>
  )
}

// ------------------------------------------------ C. beamforming
function Beamforming() {
  const arc = (x, y, r, c) => <path d={`M ${x + r * 0.72} ${y - r * 0.69} A ${r} ${r} 0 0 1 ${x + r * 0.72} ${y + r * 0.69}`} fill="none" stroke={c} strokeWidth={1.4} opacity={0.5} />
  return (
    <div>
      <svg viewBox="0 0 520 240" className="w-full h-auto rounded-lg bg-[#f3f8fd] border border-navy-700">
        {/* transmit array */}
        <rect x={18} y={64} width={92} height={112} rx={10} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.2} />
        <text x={64} y={88} textAnchor="middle" fill={C.slate} fontSize={11} fontWeight={700}>TX ARRAY</text>
        <text x={64} y={103} textAnchor="middle" fill={C.dim} fontSize={9}>n antennas</text>
        <MiniAnt x={64} y={122} label="1" color={C.cyan} size={10} />
        <MiniAnt x={64} y={150} label="2" color={C.cyan} size={10} />
        <MiniAnt x={64} y={178} label="3" color={C.cyan} size={10} />

        {/* scattered waves */}
        <g opacity={0.8}>
          {[26, 44, 62].map((r, i) => (
            <g key={i}>
              {arc(76, 122, r, C.cyan)}
              {arc(76, 150, r, C.cyan)}
              <animate attributeName="opacity" values="0.55;0.1;0.55" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            </g>
          ))}
        </g>

        {/* focused main beam */}
        <polygon points="90,120 500,96 500,144 90,176" fill="rgba(8,145,178,0.12)" />
        <line x1={92} y1={118} x2={452} y2={118} stroke={C.cyan} strokeWidth={2.4} strokeDasharray="12 8" className="dashflow" />
        <line x1={92} y1={132} x2={452} y2={138} stroke={C.cyan} strokeWidth={1.6} strokeDasharray="12 8" className="dashflow" opacity={0.7} />
        <text x={280} y={92} textAnchor="middle" fill={C.cyan} fontSize={11} fontWeight={700}>
          phased signals add constructively → focused main lobe
          <animate attributeName="opacity" values="1;0.55;1" dur="2s" repeatCount="indefinite" />
        </text>
        <text x={280} y={176} textAnchor="middle" fill={C.dim} fontSize={10} fontStyle="italic">
          side lobes are weak: less energy wasted elsewhere
        </text>

        {/* target */}
        <MiniAnt x={474} y={128} label="Target Rx" color="#059669" />
        <circle cx={474} cy={128} r={30} fill="none" stroke="#059669" strokeWidth={1.4}>
          <animate attributeName="r" values="26;38" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </svg>
      <ul className="mt-3 space-y-1.5 text-xs text-slate-500 list-disc pl-4">
        <li>Each antenna radiates the <b className="text-slate-800">same</b> stream but with a carefully chosen <b className="text-cyan-700">phase (and amplitude) shift</b>.</li>
        <li>In the target direction the waves arrive in phase and reinforce each other; in other directions they mostly cancel. The array acts like a steerable radio-wave "spotlight".</li>
        <li>Benefits: stronger signal at the receiver (beamforming gain), less interference to / from others, and better energy efficiency. It can be done at the transmitter, the receiver, or both.</li>
      </ul>
    </div>
  )
}

const TABS = [
  { id: 'mux', label: 'Spatial Multiplexing', icon: Layers, body: SpatialMultiplexing, tag: 'more data, same spectrum' },
  { id: 'div', label: 'Spatial Diversity', icon: Shield, body: SpatialDiversity, tag: 'reliability against fading' },
  { id: 'beam', label: 'Beamforming', icon: Target, body: Beamforming, tag: 'steer energy with phase' },
]

export default function Techniques() {
  const [tab, setTab] = useState('mux')
  const active = TABS.find((t) => t.id === tab)
  return (
    <div>
      <div className="flex gap-1.5 border-b border-navy-700 pb-2.5">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`chip flex items-center gap-1.5 ${tab === t.id ? 'border-cyan-400 bg-cyan-100 text-cyan-700' : 'border-navy-600 text-slate-500 hover:border-slate-500'}`}>
              <Icon size={13} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 mb-3 text-[11px] text-slate-500">
        Three classic ways multiple antennas are exploited: <b className="text-cyan-700">{active.tag}</b> — the same
        hardware, three different goals.
      </p>
      <div className="panel p-4">
        <active.body />
      </div>
    </div>
  )
}
