import React, { useRef, useState } from 'react'
import { TIMELINE, detect, fmt } from '../model.js'

// ---------------------------------------------------------------- layout
const W = 1200
const VB_H = 470
const TX_BLOCK = { x: 24, y: 178, w: 132, h: 124 }
const RX_BLOCK = { x: 996, y: 178, w: 180, h: 124 }
const TX1 = { x: 244, y: 158 }
const TX2 = { x: 244, y: 312 }
const RX1 = { x: 898, y: 158 }
const RX2 = { x: 898, y: 312 }
const LANE1_Y = 196
const LANE2_Y = 276

const C = { cyan: '#0e7490', amber: '#b45309', slate: '#94a3b8', dim: '#64748b' }

// phase = number of timeline milestones reached: 0 ready, 1 tx, 2 streams,
// 3 air, 4 channel, 5 rx, 6 detect, 7 done
export function phaseAt(t) {
  const marks = [TIMELINE.tx, TIMELINE.streams, TIMELINE.air, TIMELINE.channel, TIMELINE.rx, TIMELINE.detect, TIMELINE.done]
  let p = 0
  for (const m of marks) if (t >= m) p++
  return Math.min(p, 7)
}

const qPoint = (p0, c1, p2, t) => ({
  x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * c1[0] + t ** 2 * p2.x,
  y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * c1[1] + t ** 2 * p2.y,
})

const PATHS = {
  h11: 'M 244 158 Q 570 112 898 158',
  h12: 'M 244 312 Q 570 205 898 158',
  h21: 'M 244 158 Q 570 275 898 312',
  h22: 'M 244 312 Q 570 368 898 312',
}
const CTRL = {
  h11: [570, 112],
  h12: [570, 205],
  h21: [570, 275],
  h22: [570, 368],
}
const LABEL_POS = {
  h11: [570, 122],
  h12: [500, 152],
  h21: [640, 296],
  h22: [570, 384],
}
export const LINKS = [
  { id: 'h11', from: TX1, to: RX1, stream: 1, label: 'h11', sub: 'Tx1 to Rx1' },
  { id: 'h12', from: TX2, to: RX1, stream: 2, label: 'h12', sub: 'Tx2 to Rx1' },
  { id: 'h21', from: TX1, to: RX2, stream: 1, label: 'h21', sub: 'Tx1 to Rx2' },
  { id: 'h22', from: TX2, to: RX2, stream: 2, label: 'h22', sub: 'Tx2 to Rx2' },
]

const BOUNCE_POINTS = {
  h11: [
    [244, 158, 'Tx1 emits x1'],
    [420, 92, 'building scatter'],
    [760, 150, 'ground bounce return'],
    [898, 158, 'Rx1 captures'],
  ],
  h12: [
    [244, 312, 'Tx2 emits x2'],
    [430, 120, 'wall reflection'],
    [750, 160, 'ground bounce'],
    [898, 158, 'Rx1 captures'],
  ],
  h21: [
    [244, 158, 'Tx1 emits x1'],
    [520, 300, 'street scatter'],
    [700, 350, 'ground bounce'],
    [898, 312, 'Rx2 captures'],
  ],
  h22: [
    [244, 312, 'Tx2 emits x2'],
    [470, 370, 'ground reflection'],
    [760, 360, 'building scatter'],
    [898, 312, 'Rx2 captures'],
  ],
}
// straight-line bounce geometry for the multipath overlay
const BOUNCE_PATHS = {
  h11: 'M 244 158 L 420 92 L 760 150 L 898 158',
  h12: 'M 244 312 L 430 120 L 750 160 L 898 158',
  h21: 'M 244 158 L 520 300 L 700 350 L 898 312',
  h22: 'M 244 312 L 470 370 L 760 360 L 898 312',
}

const fadeFactor = (t, k) =>
  [
    0.3 + 0.7 * Math.abs(Math.sin(t / 950 + 0.4)),
    0.3 + 0.7 * Math.abs(Math.sin(t / 1250 + 2.1)),
    0.3 + 0.7 * Math.abs(Math.sin(t / 820 + 4.2)),
    0.3 + 0.7 * Math.abs(Math.sin(t / 1400 + 1.2)),
  ][k]

// ---------------------------------------------------------------- pieces
function Antenna({ x, y, label, sub, color, active, dim, onClick, sel }) {
  return (
    <g
      transform={`translate(${x},${y})`}
      className="cursor-pointer"
      onClick={(e) => { e.stopPropagation(); onClick && onClick(e) }}
      opacity={dim ? 0.28 : 1}
      style={{ transition: 'opacity .3s' }}
    >
      {sel && <circle r={30} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 4" className="pulse-glow" />}
      <circle r={26} fill="rgba(255,255,255,0.92)" stroke={active ? color : '#94a3b8'} strokeWidth={active ? 2 : 1.5} />
      <path d="M -6 14 L 0 -4 L 6 14" fill="none" stroke={active ? color : '#64748b'} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={0} y1={-4} x2={0} y2={14} stroke={active ? color : '#64748b'} strokeWidth={2.5} strokeLinecap="round" />
      <circle r={3} cy={-7} fill={active ? color : '#64748b'} />
      {active && (
        <>
          <path d="M -12 -10 A 14 14 0 0 1 12 -10" fill="none" stroke={color} strokeWidth={1.5} opacity={0.7}>
            <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.6s" repeatCount="indefinite" />
          </path>
          <path d="M -18 -16 A 22 22 0 0 1 18 -16" fill="none" stroke={color} strokeWidth={1.2} opacity={0.4}>
            <animate attributeName="opacity" values="0.4;0.05;0.4" dur="1.6s" begin="0.4s" repeatCount="indefinite" />
          </path>
        </>
      )}
      <text y={44} textAnchor="middle" fill={active ? color : C.slate} fontSize={15} fontWeight={700} fontFamily="monospace">{label}</text>
      <text y={60} textAnchor="middle" fill={C.dim} fontSize={10.5}>{sub}</text>
    </g>
  )
}


function Block({ r, title, lines, active, onClick, done, doneLabel, doneFail }) {
  return (
    <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onClick && onClick(e) }}>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={12}
        fill="#ffffff" stroke={done ? (doneFail ? '#dc2626' : '#059669') : active ? C.cyan : '#94a3b8'} strokeWidth={active ? 2 : 1.5} />
      {active && <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={12} fill="none" stroke={C.cyan} strokeWidth={4} opacity={0.18} />}
      <text x={r.x + r.w / 2} y={r.y + 26} textAnchor="middle" fill={active ? C.cyan : '#475569'} fontSize={16} fontWeight={700}>
        {title}
      </text>
      {done && (
        <text x={r.x + r.w / 2} y={r.y + r.h - 10} textAnchor="middle" fill={doneFail ? '#dc2626' : '#059669'} fontSize={13} fontWeight={700}>
          {doneFail ? '✗ ' : '✓ '}{doneLabel || 'data recovered'}
        </text>
      )}
      {lines.map((ln, i) => (
        <text key={i} x={r.x + r.w / 2} y={r.y + 48 + i * 18} textAnchor="middle" fill={C.slate} fontSize={11.5}>
          {ln}
        </text>
      ))}
    </g>
  )
}

function LinkPath({ id, active, dim, highlight, H, fading, t, tChan, onClick }) {
  const meta = LINKS.find((l) => l.id === id)
  const color = meta.stream === 1 ? C.cyan : C.amber
  const opacityBase = !active ? 0.12 : dim ? 0.25 : highlight ? 1 : 0.8
  const f = fading ? fadeFactor(t, LINKS.indexOf(meta)) : 1
  const w = active ? (0.6 + Math.abs(H[id]) * 0.9) * (highlight ? 4.4 : 3) : 1.2
  const dash = active ? '10 8' : '2 6'
  const speed = fading ? 'dashflow-slow' : 'dashflow'
  return (
    <g className={highlight ? 'cursor-pointer' : ''} opacity={opacityBase * f}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(e) }} style={{ transition: 'opacity .25s' }}>
      <path d={PATHS[id]} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round"
        strokeDasharray={dash} className={active ? speed : ''} />
      {active && (
        <circle r={5} fill={color}>
          <animateMotion dur="2.2s" repeatCount="indefinite" path={PATHS[id]} begin={`${LINKS.indexOf(meta) * 0.55}s`} />
        </circle>
      )}
    </g>
  )
}

// ---------------------------------------------------------------- scene
export default function MIMOScene({
  config, H, X, noisy, t, noise, seed, running, selected, onSelect, onHatchClick,
}) {
  const nTx = config === 'SISO' || config === 'SIMO' ? 1 : 2
  const nRx = config === 'SISO' || config === 'MISO' ? 1 : 2
  const phase = phaseAt(t)
  const isMIMO = config === 'MIMO'
  const chanStart = TIMELINE.air
  const chanDur = TIMELINE.channel - TIMELINE.air
  const tChan = Math.max(0, Math.min(1, (t - chanStart) / chanDur))

  const activeLinks = isMIMO
    ? LINKS
    : LINKS.filter((l) => (nTx > 1 || l.id !== 'h12' && l.id !== 'h22') && (nRx > 1 || l.id !== 'h21' && l.id !== 'h22'))

  const streamsActive = phase >= 2
  const chanActive = phase >= 4
  const rxActive = phase >= 5
  const done = phase >= 7

  // live detection result — updates whenever the h sliders, noise or seed change
  const resD = done ? detect(H, X, noise ?? 0, config, seed ?? 7) : null
  const ok1 = resD ? resD.e1 < 0.25 : false
  const ok2 = resD ? ((resD.e2 !== undefined ? resD.e2 : resD.e1) < 0.25) : false

  const lane1 = phase >= 2 ? (phase >= 3 ? 'full' : 'grow') : 'none'
  const lane2 = phase >= 2 ? (phase >= 3 ? 'full' : 'grow') : 'none'
  const laneDash = '14 10'

  return (
    <svg viewBox={`0 0 ${W} ${VB_H}`} className="w-full h-auto select-none"
      style={{ background: 'linear-gradient(180deg, #f7fafe 0%, #eef4fb 60%, #e8f0fa 100%)' }}>
      <defs>
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#dbe5f1" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width={W} height={VB_H} fill="url(#grid)" />

      {/* channel zone */}
      <rect x={318} y={48} width={564} height={374} rx={16}
        fill={chanActive ? 'rgba(8,145,178,0.07)' : 'rgba(226,236,248,0.55)'}
        stroke="#b9cbe2" strokeWidth={1.2} strokeDasharray="6 6"
        className="cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onSelect('channel') }} />
      <text x={600} y={72} textAnchor="middle" fill={C.slate} fontSize={13} fontWeight={600}
        className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelect('channel') }}>
        WIRELESS MULTI-FADED CHANNEL
      </text>
      <text x={330} y={414} fill={C.dim} fontSize={10.5} className="cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onSelect('channel') }}>
        buildings · ground reflections · scattering  —  every path has its own coefficient h
      </text>

      {/* transmitter -> antenna lanes */}
      {[{ y: LANE1_Y, c: C.cyan, lbl: 'x1', s: X[0], st: lane1, a: true },
        { y: LANE2_Y, c: C.amber, lbl: 'x2', s: X[1], st: lane2, a: nTx > 1 }].map((ln, i) => (
        <g key={i} opacity={ln.a ? 1 : 0.15}>
          <line x1={156} y1={ln.y} x2={210} y2={ln.y} stroke={ln.c} strokeWidth={2.4}
            strokeDasharray={laneDash} className={ln.st === 'full' ? 'dashflow' : ''}
            strokeDashoffset={ln.st === 'grow' ? 24 : 0} style={ln.st === 'grow' ? undefined : {}} />
          <circle cx={ln.y === LANE1_Y ? 183 : 183} cy={ln.y} r={12} fill="none" stroke={ln.c} strokeWidth={1}>
            <animate attributeName="r" values="12;26" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <text x={183} y={ln.y - 16} textAnchor="middle" fill={ln.c} fontSize={13} fontFamily="monospace" fontWeight={700}>
            {ln.lbl} = {ln.s}
          </text>
        </g>
      ))}

      {/* receiver -> block lanes (mixed signals) */}
      {[{ y: LANE1_Y, c: C.cyan, a: true }, { y: LANE2_Y, c: C.amber, a: nRx > 1 }].map((ln, i) => (
        <line key={i} x1={924} y1={ln.y} x2={988} y2={ln.y} stroke="#64748b" strokeWidth={1.6}
          strokeDasharray="4 6" opacity={rxActive && ln.a ? 0.8 : 0.15} className={rxActive && ln.a ? 'dashflow-slow' : ''} />
      ))}
      {rxActive && (
        <text x={962} y={(LANE1_Y + LANE2_Y) / 2 + 34} textAnchor="middle" fill={C.slate} fontSize={10}>
          {nRx > 1 ? 'y1, y2 (mixed)' : 'y1 (mixed)'}
        </text>
      )}

      {/* channel links */}
      {LINKS.map((l) => (
        <LinkPath key={l.id} id={l.id} active={isMIMO || activeLinks.includes(l)}
          dim={selected === l.id ? false : selected !== null && selected !== 'channel' && selected !== l.id}
          highlight={selected === l.id} H={H} fading={noisy.fading && chanActive} t={t} tChan={tChan}
          onClick={(e) => onHatchClick(e, l.id)} />
      ))}

      {/* multipath overlay (4x4 only, during channel phase) */}
      {isMIMO && noisy.multipath && chanActive && !noisy.fading && (
        <g>
          {LINKS.map((l, i) => (
            <g key={l.id}>
              <path d={BOUNCE_PATHS[l.id]} fill="none" stroke={l.stream === 1 ? C.cyan : C.amber}
                strokeWidth={0.8} strokeDasharray="3 5" opacity={0.4 + 0.5 * tChan} />
              {tChan > 1 - 0.12 * (i + 1) && (
                <g>
                  {BOUNCE_POINTS[l.id].map(([bx, by, bl], j) => (
                    <g key={j} opacity={Math.min(1, (tChan - (1 - 0.12 * (i + 1))) * 12)}>
                      <circle cx={bx} cy={by} r={3} fill={l.stream === 1 ? C.cyan : C.amber} />
                      <text x={bx} y={by + (j === 0 || j === 3 ? 20 : -10)} textAnchor="middle"
                        fill={C.slate} fontSize={9.5} fontStyle="italic">{bl}</text>
                    </g>
                  ))}
                </g>
              )}
            </g>
          ))}
        </g>
      )}

      {/* block bodies */}
      <Block r={TX_BLOCK} title="TRANSMITTER" active={phase >= 1 && phase < 3}
        lines={nTx > 1 ? ['x1, x2 encoded', '2 modulators', 'same time + freq'] : ['x1 encoded', '1 modulator']}
        onClick={() => onSelect('tx')} done={done} doneLabel="x1, x2 sent" />
      <Block r={RX_BLOCK} title="RECEIVER" active={rxActive}
        lines={['channel estimate', 'signal detection', nRx > 1 ? 'separates x1, x2' : 'decodes x1']}
        onClick={() => onSelect('rx')} done={done}
        doneLabel={resD && ok1 && ok2 ? 'data recovered' : 'errors found'} doneFail={done && !(ok1 && ok2)} />

      {/* antennas */}
      <Antenna x={TX1.x} y={TX1.y} label="Tx1" sub="antenna 1"
        color={C.cyan} active={streamsActive && nTx >= 1 && X[0] !== 0}
        dim={config === 'SISO' || config === 'SIMO' ? false : false}
        onClick={() => onSelect('tx1')} sel={selected === 'tx1'} />
      {nTx > 1 && (
        <Antenna x={TX2.x} y={TX2.y} label="Tx2" sub="antenna 2"
          color={C.amber} active={streamsActive && X[1] !== 0}
          dim={false} onClick={() => onSelect('tx2')} sel={selected === 'tx2'} />
      )}
      {config === 'SISO' || config === 'SIMO' ? (
        <text x={TX1.x + 60} y={340} fill={C.dim} fontSize={11} fontStyle="italic">1 transmit antenna</text>
      ) : null}
      <Antenna x={RX1.x} y={RX1.y} label="Rx1" sub="antenna 1"
        color={C.cyan} active={rxActive} dim={false} onClick={() => onSelect('rx1')} sel={selected === 'rx1'} />
      {nRx > 1 && (
        <Antenna x={RX2.x} y={RX2.y} label="Rx2" sub="antenna 2"
          color={C.amber} active={rxActive} dim={false} onClick={() => onSelect('rx2')} sel={selected === 'rx2'} />
      )}
      {nRx <= 1 && <text x={RX1.x - 78} y={340} fill={C.dim} fontSize={11} fontStyle="italic">1 receive antenna</text>}

      {/* receiver detection readout */}
      {(rxActive || done) && (
        <g>
          {(() => {
            const has2 = nRx > 1 && isMIMO
            const hgt = done ? (has2 ? 118 : 96) : 76
            const good = done && resD && ok1 && ok2
            const bad = done && !good
            const eTxt = resD
              ? `error: ${fmt(resD.e1)}${has2 ? ' / ' + fmt(resD.e2) : ''}`
              : ''
            return (
              <>
                <rect x={942} y={52} width={244} height={hgt} rx={10}
                  fill="rgba(255,255,255,0.94)"
                  stroke={done ? (good ? '#059669' : '#dc2626') : C.cyan} strokeWidth={1.2} />
                <text x={1064} y={74} textAnchor="middle" fontSize={13} fontWeight={700}
                  fill={done ? (good ? '#059669' : '#dc2626') : C.cyan}>
                  {done ? (good ? 'DATA RECOVERED ✓' : 'RECEIVED — CHECK ERROR') : 'RECEIVER PROCESSING'}
                </text>
                <text x={956} y={96} fill={done ? '#64748b' : C.slate} fontSize={11} fontFamily="monospace">
                  {done ? eTxt : (t >= TIMELINE.rx && t < TIMELINE.detect ? '1. estimating Ĥ from pilot' : '2. detection: x̂ = H⁻¹y (ZF)')}
                </text>
                {done && resD && (
                  <>
                    <text x={956} y={has2 ? 116 : 118} fill={ok1 ? '#059669' : '#dc2626'} fontSize={12} fontFamily="monospace" fontWeight={700}>
                      x̂1 ≈ {fmt(resD.x1)}  {ok1 ? '✓' : '✗'}
                    </text>
                    {has2 && (
                      <text x={956} y={134} fill={ok2 ? '#059669' : '#dc2626'} fontSize={12} fontFamily="monospace" fontWeight={700}>
                        x̂2 ≈ {fmt(resD.x2)}  {ok2 ? '✓' : '✗'}
                      </text>
                    )}
                  </>
                )}
              </>
            )
          })()}
        </g>
      )}

      {/* status ribbon */}
      <g>
        <rect x={330} y={436} width={540} height={26} rx={13}
          fill={done ? ((resD && ok1 && ok2) ? 'rgba(5,150,105,0.10)' : 'rgba(220,38,38,0.07)') : 'rgba(255,255,255,0.7)'}
          stroke={done ? ((resD && ok1 && ok2) ? '#059669' : '#dc2626') : '#b9cbe2'} strokeWidth={1} />
        <text x={600} y={454} textAnchor="middle"
          fill={done ? ((resD && ok1 && ok2) ? '#059669' : '#dc2626') : running ? C.cyan : C.slate} fontSize={14} fontWeight={700}>
          {done ? (resD && ok1 && ok2
            ? (isMIMO ? '✓ DATA SUCCESSFULLY RECOVERED — x1 and x2 separated at the receiver' : '✓ DATA RECOVERED AT THE RECEIVER')
            : '✗ RECEPTION DEGRADED — try different h values or lower the noise')
            : running ? 'SIMULATING…' : 'READY — press Start Simulation'}
        </text>
      </g>
    </svg>
  )
}

