import React from 'react'

const C = { cyan: '#0891b2', amber: '#d97706', slate: '#334155', dim: '#64748b', green: '#059669' }

function Ant({ x, y, color, label }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={14} fill="#ffffff" stroke={color} strokeWidth={1.6} />
      <path d="M -4 8 L 0 -3 L 4 8" fill="none" stroke={C.dim} strokeWidth={2} strokeLinecap="round" />
      <line x1={0} y1={-3} x2={0} y2={8} stroke={C.dim} strokeWidth={2} strokeLinecap="round" />
      <text y={30} textAnchor="middle" fill={color} fontSize={11.5} fontWeight={700}>{label}</text>
    </g>
  )
}

function Box({ x, y, w, h, title, sub, color }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} fill="#ffffff" stroke={color || '#cbd5e1'} strokeWidth={1.3} />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -2 : 4)} textAnchor="middle" fill={C.slate} fontSize={13} fontWeight={700}>{title}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fill={C.dim} fontSize={9.5}>{sub}</text>}
    </g>
  )
}

const L = (p) => <line {...p} />

/* step 1 — the message becomes 2 parallel streams */
const F1 = (
  <svg viewBox="0 0 520 132" className="w-full h-auto">
    <Box x={14} y={38} w={92} h={56} title="Message" sub="2 symbols" />
    <L x1={106} y1={52} x2={238} y2={48} stroke={C.cyan} strokeWidth={2} />
    <text x={150} y={40} fill={C.cyan} fontSize={13} fontWeight={700}>x₁ = 1</text>
    <Ant x={262} y={48} color={C.cyan} label="Tx1" />
    <L x1={106} y1={80} x2={238} y2={96} stroke={C.amber} strokeWidth={2} />
    <text x={150} y={126} fill={C.amber} fontSize={13} fontWeight={700}>x₂ = −1</text>
    <Ant x={262} y={96} color={C.amber} label="Tx2" />
    <text x={330} y={52} fill={C.dim} fontSize={11}>each antenna sends its own</text>
    <text x={330} y={68} fill={C.dim} fontSize={11}>symbol — at the same time,</text>
    <text x={330} y={84} fill={C.dim} fontSize={11}>on the same frequency</text>
  </svg>
)

/* step 2 — the channel: 2 transmit × 2 receive = 4 links */
const F2 = (
  <svg viewBox="0 0 520 132" className="w-full h-auto">
    <Ant x={70} y={38} color={C.cyan} label="Tx1" />
    <Ant x={70} y={94} color={C.cyan} label="Tx2" />
    <Ant x={450} y={38} color={C.amber} label="Rx1" />
    <Ant x={450} y={94} color={C.amber} label="Rx2" />
    <L x1={90} y1={38} x2={430} y2={38} stroke={C.cyan} strokeWidth={1.6} strokeDasharray="5 4" />
    <L x1={90} y1={94} x2={430} y2={94} stroke={C.cyan} strokeWidth={1.6} strokeDasharray="5 4" />
    <L x1={90} y1={38} x2={430} y2={94} stroke={C.amber} strokeWidth={1.6} strokeDasharray="5 4" />
    <L x1={90} y1={94} x2={430} y2={38} stroke={C.amber} strokeWidth={1.6} strokeDasharray="5 4" />
    {[['h₁₁', 200, 34], ['h₂₁', 200, 88], ['h₁₂', 320, 58], ['h₂₂', 320, 74]].map(([t, x, y]) => (
      <text key={t} x={x} y={y} textAnchor="middle" fill={C.slate} fontSize={11.5} fontWeight={700}>{t}</text>
    ))}
    <text x={260} y={126} textAnchor="middle" fill={C.dim} fontSize={10.5}>4 separate links — each with its own strength (h)</text>
  </svg>
)

/* step 3 — each receiver hears BOTH transmitters mixed */
const F3 = (
  <svg viewBox="0 0 520 132" className="w-full h-auto">
    <Ant x={70} y={38} color={C.cyan} label="Tx1" />
    <Ant x={70} y={94} color={C.cyan} label="Tx2" />
    <Ant x={450} y={38} color={C.amber} label="Rx1" />
    <Ant x={450} y={94} color={C.amber} label="Rx2" />
    <text x={330} y={52} fill={C.cyan} fontSize={11.5} fontWeight={700}>y₁ = h₁₁·x₁ + h₁₂·x₂ + n</text>
    <text x={330} y={108} fill={C.amber} fontSize={11.5} fontWeight={700}>y₂ = h₂₁·x₁ + h₂₂·x₂ + n</text>
    <L x1={90} y1={38} x2={428} y2={48} stroke={C.cyan} strokeWidth={2} />
    <L x1={90} y1={94} x2={428} y2={50} stroke={C.cyan} strokeWidth={2} opacity={0.55} />
    <L x1={90} y1={94} x2={428} y2={104} stroke={C.amber} strokeWidth={2} />
    <L x1={90} y1={38} x2={428} y2={102} stroke={C.amber} strokeWidth={2} opacity={0.55} />
    <text x={130} y={126} fill={C.dim} fontSize={10.5}>every receiver hears BOTH — that&#39;s why the receiver must separate them</text>
  </svg>
)

/* step 4 — receiver separates and recovers */
const F4 = (
  <svg viewBox="0 0 520 132" className="w-full h-auto">
    <Ant x={70} y={38} color={C.amber} label="Rx1" />
    <Ant x={70} y={94} color={C.amber} label="Rx2" />
    <L x1={90} y1={38} x2={160} y2={66} stroke={C.dim} strokeWidth={1.6} />
    <L x1={90} y1={94} x2={160} y2={66} stroke={C.dim} strokeWidth={1.6} />
    <Box x={162} y={32} w={150} h={68} title="Receiver" sub="estimate H · then x̂ = H⁻¹y" color={C.slate} />
    <L x1={312} y1={52} x2={372} y2={46} stroke={C.cyan} strokeWidth={2} />
    <L x1={312} y1={82} x2={372} y2={86} stroke={C.amber} strokeWidth={2} />
    <text x={378} y={50} fill={C.green} fontSize={13} fontWeight={800}>x̂₁ = 1  ✓</text>
    <text x={378} y={90} fill={C.green} fontSize={13} fontWeight={800}>x̂₂ = −1  ✓</text>
    <text x={378} y={116} fill={C.dim} fontSize={10.5}>original data back — error-free in this clean example</text>
  </svg>
)

const STEPS = [
  {
    t: '1 · Two transmitters, two streams',
    d: 'The message is split into symbols. Antenna Tx1 sends x₁ and antenna Tx2 sends x₂ at the same time — double the data without extra bandwidth.',
    fig: F1,
  },
  {
    t: '2 · The wireless channel',
    d: 'The signal doesn&#39;t travel in one straight line. It bounces off buildings and the ground. Result: 2 Tx × 2 Rx = 4 links, each with its own gain h.',
    fig: F2,
  },
  {
    t: '3 · Mixing at the receiver',
    d: 'Each receiver antenna hears BOTH transmitters, mixed together with a bit of noise. So y₁ and y₂ are mixed equations, not the clean original symbols.',
    fig: F3,
  },
  {
    t: '4 · Separation — the magic part',
    d: 'Because the 4 links are different, the receiver can estimate the channel H and solve the two equations at once (ZF), recovering x₁ and x₂ separately.',
    fig: F4,
  },
]

export default function HowItWorks() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-slate-600 leading-relaxed">
        The whole system in 4 steps — <b className="text-slate-800">send twice in parallel → let the channel mix it → receiver untangles it</b>.
      </p>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {STEPS.map((s) => (
          <div key={s.t} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <h4 className="text-[13px] font-extrabold text-slate-900 mb-1">{s.t}</h4>
            <p className="text-xs text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.d }} />
            <div className="mt-2.5 rounded-lg bg-slate-50/70 border border-slate-100 p-2">{s.fig}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3.5">
        <h4 className="text-[13px] font-extrabold text-cyan-900 mb-1">The math behind it, in one line</h4>
        <p className="text-xs text-cyan-950 leading-relaxed">
          <span className="font-mono font-bold">y = Hx + n</span>&nbsp; — the receiver records <b>y</b>, estimates <b>H</b> from the links it measures,
          then solves for <b>x</b>. One equation per antenna, solved together — that&#39;s all MIMO detection is.
        </p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <h4 className="text-[13px] font-extrabold text-amber-900 mb-1">Why the numbers move in the simulation</h4>
        <p className="text-xs text-amber-950 leading-relaxed">
          <span className="font-mono font-bold">y = Hx + n</span> — so the result depends on the symbols <b>x</b>, the channel <b>H</b>, and the noise <b>n</b>.
          Move any h slider and the received y₁, y₂ change right away. Push the noise up (or make the two columns of H nearly parallel) and x̂ drifts away
          from the true symbols: the receiver shows <b>✗</b> instead of <b>✓</b>. Press <b>New Symbols</b> to draw a fresh x and a fresh noise sample.
        </p>
      </div>
    </div>
  )
}
