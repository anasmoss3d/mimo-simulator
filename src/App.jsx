import React, { useEffect, useState } from 'react'
import { Cpu } from 'lucide-react'
import { defaultState, TIMELINE } from './model.js'
import MIMOScene, { phaseAt } from './components/MIMOScene.jsx'
import Controls from './components/Controls.jsx'
import InfoPanel from './components/InfoPanel.jsx'
import Techniques from './components/Techniques.jsx'
import HowItWorks from './components/HowItWorks.jsx'

const TABS = [
  { id: 'sim', label: 'Simulation' },
  { id: 'how', label: 'How it works' },
  { id: 'tech', label: 'Techniques' },
]

export default function App() {
  const [state, setState] = useState(defaultState)
  const [tab, setTab] = useState('sim')
  const [selected, setSelected] = useState(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  // animation clock
  useEffect(() => {
    if (!running) return
    let raf
    let last = performance.now()
    const tick = (ts) => {
      setProgress((p) => p + (ts - last))
      last = ts
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  const phase = phaseAt(progress)
  const done = phase >= 7

  useEffect(() => {
    if (running && progress >= TIMELINE.done) setRunning(false)
  }, [progress, running])

  const patch = (p) => setState((s) => ({ ...s, ...p }))
  const setH = (k, v) => setState((s) => ({ ...s, H: { ...s.H, [k]: v } }))

  const toggleRun = () => {
    if (running) { setRunning(false); return }
    if (done) setProgress(0)
    setRunning(true)
  }
  // draw fresh ±1 symbols + a fresh noise realization so the result visibly changes
  const newSymbols = () => {
    const sx = () => (Math.random() < 0.5 ? -1 : 1)
    setState((s) => ({ ...s, X: [sx(), sx()], seed: Math.floor(Math.random() * 1e9) }))
  }
  const reset = () => {
    setRunning(false)
    setProgress(0)
    setState(defaultState())
    setSelected(null)
  }

  const total = TIMELINE.done
  const pct = Math.min(100, (progress / total) * 100)

  return (
    <div className="min-h-screen bg-navy-950 text-slate-800" onClick={() => setSelected(null)}>
      {/* header */}
      <header className="border-b border-navy-700 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-cyan-50 border border-cyan-200 p-1.5">
              <Cpu size={17} className="text-cyan-600" />
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900">
              MIMO <span className="text-cyan-600">Simulator</span>
            </h1>
            <nav className="flex items-center gap-1 sm:ml-6">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`rounded-md px-3 py-1 text-xs font-bold transition-colors ${tab === t.id
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'}`}>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-1 font-mono text-[11px] font-semibold text-cyan-800">
            y = Hx + n
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-4 flex flex-col gap-4">
        {tab === 'sim' && (
          <>
            {/* ============ main simulation (the star) ============ */}
            <div className="panel p-2.5" onClick={(e) => e.stopPropagation()}>
              <MIMOScene
                config={state.config}
                H={state.H}
                X={state.X}
                noise={state.noise}
                seed={state.seed}
                noisy={{ multipath: state.multipath, fading: state.fading }}
                t={progress}
                running={running}
                selected={selected}
                onSelect={(id) => setSelected((s) => (s === id ? null : id))}
                onHatchClick={(e, id) => { e.stopPropagation(); setSelected((s) => (s === id ? null : id)) }}
              />

              {/* transport + timeline */}
              <div className="mt-1.5 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <button onClick={toggleRun}
                    className={`btn ${done || !running ? 'btn-primary' : 'btn-ghost'} !px-5 !py-1.5`}>
                    {running ? 'Pause' : done ? 'Replay' : 'Start Simulation'}
                    <span className="font-mono text-base leading-none">
                      {running ? '❚❚' : done ? '↺' : '▶'}
                    </span>
                  </button>
                  <button onClick={reset} className="btn-ghost !px-4 !py-1.5">Reset</button>
                  <button onClick={newSymbols} className="btn-ghost !px-4 !py-1.5"
                    title="Draw x1, x2 again from {−1, +1} and a fresh noise realization">↻ New Symbols</button>
                  <span className="ml-auto font-mono text-[11px] text-slate-500">
                    {progress > 0 && !done ? `${Math.max(0, (total - progress) / 1000).toFixed(1)} s left` : done ? '' : ''}
                  </span>
                </div>
                <div className="relative h-5 rounded-full bg-navy-800 ring-1 ring-navy-700">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-600 to-teal-500"
                    style={{ width: `${pct}%` }} />
                  <div className="absolute inset-0 flex justify-between items-center px-2">
                    {['TX', 'STREAMS', 'CHANNEL', 'RX MIX', 'DETECT', 'DONE'].map((l) => (
                      <span key={l} className="font-mono text-[8.5px] tracking-wider text-slate-600">{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ============ bottom row: settings + click-to-explain ============ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div onClick={(e) => e.stopPropagation()}>
                <Controls
                  running={running} phaseDone={done}
                  onToggleRun={toggleRun} onReset={reset}
                  config={state.config} onConfig={(c) => patch({ config: c })}
                  noise={state.noise} onNoise={(v) => patch({ noise: v })}
                  H={state.H} onHCoeff={setH}
                  multipath={state.multipath} onMultipath={(v) => patch({ multipath: v })}
                  fading={state.fading} onFading={(v) => patch({ fading: v })}
                />
              </div>
              <div className="lg:col-span-2" onClick={(e) => e.stopPropagation()}>
                <InfoPanel phase={phase} running={running || progress > 0} selected={selected} config={state.config} />
              </div>
            </div>
          </>
        )}

        {tab === 'how' && (
          <div className="panel p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-cyan-700 mb-3">How the system works — simple, step by step</h3>
            <HowItWorks />
          </div>
        )}

        {tab === 'tech' && (
          <div className="panel p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-cyan-700 mb-3">MIMO Techniques — same hardware, three goals</h3>
            <Techniques />
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-[1400px] px-5 pb-5 text-center text-[10px] text-slate-600">
        Simplified real-valued baseband model · educational MIMO presentation
      </footer>
    </div>
  )
}
