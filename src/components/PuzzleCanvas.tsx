"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight puzzle scene drawn on a canvas — no 3D library.
 * Left zone: slowly spinning Rubik's Cube (isometric 3×3, pastel stickers,
 * simple top-down lighting). Right zone: sudoku grid that fills itself
 * cell by cell, pauses when complete, then resets.
 *
 * Layout guarantee: the sudoku is pinned `pad` from the right edge and the
 * cube's widest (corner-on) silhouette is anchored `pad` from the left edge —
 * symmetric margins at any container width. The cube's half-extent is derived
 * from the zone divided by the corner-on silhouette factor (√2), so the two
 * can never overlap.
 */

const GAP = "rgba(13, 16, 23, 0.95)"; // cubie gaps — matches the card bg
const AMBER = "255, 196, 120"; // softened accent
const INK = "244, 244, 242";
const MUTED = "139, 144, 155";

/* ── Scene layout constants ───────────────────────────────── */
const PAD = 14; // outer margin on both sides (8 on small screens)
const ZONE_GAP = 18; // breathing room between cube zone and sudoku (10 on small screens)
const CUBE_MAX_H = 35; // half-cubie cap — keeps the cube bigger, not huge
const TILT_BASE = (20 * Math.PI) / 180;
/** Vertical silhouette factor: h·(cos tilt + √2·sin tilt) per half-extent. */
const VERT_F = Math.cos(TILT_BASE) + Math.SQRT2 * Math.sin(TILT_BASE);

/** Pastel-leaning sticker palette (softer than classic cube colors). */
const STICKERS = [
  `rgba(${AMBER},0.9)`, // amber
  "rgba(240, 235, 225, 0.88)", // cream
  "rgba(146, 196, 158, 0.85)", // sage
  "rgba(126, 166, 214, 0.85)", // dusty blue
  "rgba(196, 158, 205, 0.85)", // mauve
  "rgba(238, 156, 145, 0.85)", // coral
];

/** Scrambled facelets: 6 faces × 9 stickers, fixed for the session. */
const facelets: string[][] = Array.from({ length: 6 }, () =>
  Array.from({ length: 9 }, () => STICKERS[Math.floor(Math.random() * STICKERS.length)]),
);

type Vec3 = [number, number, number];
const FACES: { normal: Vec3; u: Vec3; v: Vec3 }[] = [
  { normal: [0, 0, 1], u: [1, 0, 0], v: [0, -1, 0] }, // front
  { normal: [0, 0, -1], u: [-1, 0, 0], v: [0, -1, 0] }, // back
  { normal: [1, 0, 0], u: [0, 0, -1], v: [0, -1, 0] }, // right
  { normal: [-1, 0, 0], u: [0, 0, 1], v: [0, -1, 0] }, // left
  { normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, -1] }, // top (screen-up)
  { normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] }, // bottom
];

/** Light from upper-left-front (screen-up = -y). */
const LIGHT: Vec3 = [-0.3, -0.5, 0.8];

function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
}
const LIGHT_N = normalize(LIGHT);

function rotY(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}
function rotX(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}

export default function PuzzleCanvas({ height = 168 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const H = height;
    let W = 0;

    /* Track the container width so the scene stretches edge-to-edge. */
    const resize = () => {
      const nextW = Math.max(1, canvas.clientWidth || 320);
      if (nextW === W) return;
      W = nextW;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    /* ── Sudoku state ─────────────────────────────────────── */
    // Plausible sudoku-esque fill: (r + c) mod 9 + 1, with a few holes.
    const digitAt = (r: number, c: number) => ((r + c) % 9) + 1;
    let grid: (number | null)[] = [];
    let gridStep = 0; // cells revealed so far
    let holdFrames = 0; // pause at completion before resetting
    const GRID_TICK = 3; // frames between revealed cells (≈4s full solve)
    const HOLD_TICKS = 150; // ≈2.5s pause on the completed grid

    const resetGrid = () => {
      grid = Array.from({ length: 81 }, (_, i) => {
        const r = Math.floor(i / 9);
        const c = i % 9;
        return (r + c) % 7 === 3 ? null : digitAt(r, c);
      });
      gridStep = 0;
      holdFrames = 0;
    };
    resetGrid();

    let raf = 0;
    let frame = 0;
    let rot = -0.55; // cube yaw
    let visible = false; // rAF runs only while the canvas is on screen
    let sudokuFade = 0; // eases 0→1 on first entry — sudoku "solves in"

    const draw = () => {
      frame++;
      if (visible) {
        sudokuFade = Math.min(1, sudokuFade + 0.035); // ≈0.5s fade-in
        raf = requestAnimationFrame(draw);
      }
      ctx.clearRect(0, 0, W, H);

      /* ── Layout (recomputed per frame so resizes stay clean) ── */
      // Tighter margins on narrow cards so both puzzles keep breathing room
      const pad = W < 480 ? 8 : PAD;
      const gap = W < 480 ? 10 : ZONE_GAP;

      const S = H - 24; // sudoku side length — unchanged size
      const gx = W - S - pad; // sudoku left edge — pinned to the right
      const gy = (H - S) / 2;
      const cell = S / 9;

      /* Cube zone: everything left of the sudoku, minus a gap. */
      const zoneLeft = pad;
      const zoneRight = gx - gap;
      const h = Math.min(
        CUBE_MAX_H, // "a little bigger" cap
        (zoneRight - zoneLeft) / (2 * Math.SQRT2), // corner-on half-width = h√2
        (H / 2 - 14) / VERT_F, // vertical fit
      );
      // Anchor the cube so its widest (corner-on) silhouette sits exactly
      // `pad` from the left edge — mirroring the sudoku's `pad` gap on the
      // right. Symmetric edge margins at any width, overlap impossible.
      const ccx = zoneLeft + h * Math.SQRT2;

      /* ── Sudoku (right zone) ─────────────────────────────── */
      ctx.globalAlpha = sudokuFade; // fade in on first scroll into view
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      ctx.fillRect(gx, gy, S, S);

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${MUTED},0.22)`;
      for (let i = 0; i <= 9; i++) {
        ctx.beginPath();
        ctx.moveTo(gx + i * cell, gy);
        ctx.lineTo(gx + i * cell, gy + S);
        ctx.moveTo(gx, gy + i * cell);
        ctx.lineTo(gx + S, gy + i * cell);
        ctx.stroke();
      }
      // Slightly stronger 3×3 box lines
      ctx.strokeStyle = `rgba(${MUTED},0.5)`;
      for (let i = 0; i <= 3; i++) {
        const p = i * cell * 3;
        ctx.beginPath();
        ctx.moveTo(gx + p, gy);
        ctx.lineTo(gx + p, gy + S);
        ctx.moveTo(gx, gy + p);
        ctx.lineTo(gx + S, gy + p);
        ctx.stroke();
      }

      // Reveal one cell every GRID_TICK frames; hold when complete
      if (gridStep < 81) {
        if (frame % GRID_TICK === 0) gridStep++;
      } else if (++holdFrames >= HOLD_TICKS) {
        resetGrid();
      }

      ctx.font = `${cell * 0.6}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < gridStep && i < 81; i++) {
        const val = grid[i];
        if (val == null) continue;
        const r = Math.floor(i / 9);
        const c = i % 9;
        const x = gx + c * cell;
        const y = gy + r * cell;
        const fresh = i === gridStep - 1;
        if (fresh) {
          ctx.fillStyle = `rgba(${AMBER},0.16)`;
          ctx.fillRect(x, y, cell, cell);
        }
        ctx.fillStyle = fresh ? `rgba(${AMBER},0.95)` : `rgba(${INK},0.6)`;
        ctx.fillText(String(val), x + cell / 2, y + cell / 2 + 0.5);
      }
      // Amber border while the completed grid is on display
      if (gridStep >= 81) {
        ctx.strokeStyle = `rgba(${AMBER},0.7)`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(gx + 0.5, gy + 0.5, S - 1, S - 1);
        ctx.lineWidth = 1;
      }
      ctx.globalAlpha = 1;

      /* ── Rubik's Cube (left zone) ────────────────────────── */
      rot += 0.0065; // lazy spin, a touch quicker for the bigger cube (~16s/rev)
      const tilt = -(TILT_BASE + (4 * Math.PI / 180) * Math.sin(frame * 0.013));
      const ccy = H / 2 + Math.sin(frame * 0.02) * 3; // gentle bob

      type Poly = { pts: Vec3[]; color: string; depth: number; bright: number };
      const polys: Poly[] = [];

      for (let f = 0; f < 6; f++) {
        const { normal, u, v } = FACES[f];
        const rn = rotX(rotY(normal, rot), tilt);

        // Back-face cull early — whole face is invisible
        if (rn[2] < 0.05) continue;

        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const s = h / 1.5;
            const lu = (c - 1.5) * s;
            const lv = (r - 1.5) * s;
            const corner = (du: number, dv: number): Vec3 => [
              normal[0] * h + u[0] * du + v[0] * dv,
              normal[1] * h + u[1] * du + v[1] * dv,
              normal[2] * h + u[2] * du + v[2] * dv,
            ];
            const p0 = rotX(rotY(corner(lu, lv), rot), tilt);
            const p1 = rotX(rotY(corner(lu + s, lv), rot), tilt);
            const p2 = rotX(rotY(corner(lu + s, lv + s), rot), tilt);
            const p3 = rotX(rotY(corner(lu, lv + s), rot), tilt);
            const center: Vec3 = [
              (p0[0] + p1[0] + p2[0] + p3[0]) / 4,
              (p0[1] + p1[1] + p2[1] + p3[1]) / 4,
              (p0[2] + p1[2] + p2[2] + p3[2]) / 4,
            ];

            // Simple lambert shading from the fixed light
            const bright = 0.72 + 0.28 * Math.max(0, rn[0] * LIGHT_N[0] + rn[1] * LIGHT_N[1] + rn[2] * LIGHT_N[2]);

            polys.push({
              pts: [p0, p1, p2, p3],
              color: facelets[f][r * 3 + c],
              depth: center[2],
              bright,
            });
          }
        }
      }

      // Painter's algorithm: farthest first
      polys.sort((a, b) => a.depth - b.depth);

      for (const poly of polys) {
        const drawQuad = (pts: Vec3[]) => {
          ctx.beginPath();
          pts.forEach(([px, py], idx) => {
            const sx = ccx + px;
            const sy = ccy + py;
            if (idx === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          });
          ctx.closePath();
        };

        // Full quad in gap color, then inset sticker, then shade overlay
        drawQuad(poly.pts);
        ctx.fillStyle = GAP;
        ctx.fill();

        const pcx = poly_center_x(poly);
        const pcy = poly_center_y(poly);
        const inset = poly.pts.map(
          (p): Vec3 => [pcx + (p[0] - pcx) * 0.86, pcy + (p[1] - pcy) * 0.86, p[2]],
        );
        drawQuad(inset);
        ctx.fillStyle = poly.color;
        ctx.fill();

        ctx.fillStyle = `rgba(10, 10, 15, ${1 - poly.bright})`;
        ctx.fill();
      }
    };

    /* Animate only while the card is in the viewport; the sudoku's
       fill-in starts from zero on the first entry. */
    const start = () => {
      if (visible) return;
      visible = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      visible = false;
      cancelAnimationFrame(raf);
    };

    if (typeof IntersectionObserver === "undefined") {
      start(); // very old browsers: just run always
    } else {
      const io = new IntersectionObserver(
        (entries) => (entries.some((e) => e.isIntersecting) ? start() : stop()),
        { threshold: 0.2 },
      );
      io.observe(canvas);

      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      return () => {
        stop();
        io.disconnect();
        ro.disconnect();
      };
    }

    return () => stop();
  }, [height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height }}
      aria-label="Slowly spinning Rubik's Cube beside a self-solving sudoku grid"
      role="img"
    />
  );
}

function poly_center_x(poly: { pts: Vec3[] }) {
  return (poly.pts[0][0] + poly.pts[1][0] + poly.pts[2][0] + poly.pts[3][0]) / 4;
}
function poly_center_y(poly: { pts: Vec3[] }) {
  return (poly.pts[0][1] + poly.pts[1][1] + poly.pts[2][1] + poly.pts[3][1]) / 4;
}
