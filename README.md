# MIMO Simulator

Interactive, educational 2x2 MIMO simulator built with **React + Tailwind CSS + SVG**.
All the math runs client-side — no backend.

**Live demo:** https://anasmoss3d.github.io/mimo-simulator/

## What it shows

- Simplified real-valued baseband model — `y = Hx + n`
- 2 transmit antennas, 2 receive antennas, **2 spatial streams** (rank(H) <= 2, not 4)
- Both receivers hear both transmitters: `y1 = h11*x1 + h12*x2 + n1`, `y2 = h21*x1 + h22*x2 + n2`
- Channel estimation + zero-forcing detection: `x_hat = H^-1 y`
- Live detection readout: recovered symbols, per-stream error, check mark / cross
- Interactive H matrix sliders, noise level, multipath / fading toggles, SISO / SIMO / MISO / MIMO
- Animated 7-stage signal journey: transmitter -> streams -> channel -> reception -> detection -> done
- Tabs: **Simulation**, **How it works**, **Techniques**

## Example (defaults)

H = [[0.58, -0.35], [0.62, 0.70]], x = [1, -1]

- y = [0.83, -0.12]
- det H = 0.623
- x_hat = [0.86, -0.94] with error [0.14, 0.06] -> recovered

Make the channel nearly singular (e.g. h11 = -0.55) or raise the noise and the
estimate blows up (x_hat = [2.53, -2.55]) — the receiver shows a cross instead of a check.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

Every push to `main` builds the app and publishes `dist/` via GitHub Actions
(see `.github/workflows/deploy.yml`).
