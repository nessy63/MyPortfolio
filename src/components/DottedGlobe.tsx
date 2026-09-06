"use client";

import { useEffect, useRef } from "react";

type Dot = {
  /** 3D unit-sphere position */
  v: [number, number, number];
  /** Visited regions are highlighted in amber */
  visited: boolean;
};

/**
 * Lightweight rotating dotted globe drawn on a canvas — no 3D library.
 * Dots on the far hemisphere are dimmed to fake depth; "visited"
 * regions (rough band around Southeast Asia / Europe) glow amber.
 */
export default function DottedGlobe({ size = 220 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Fibonacci sphere for evenly-distributed dots
    const dots: Dot[] = [];
    const N = 700;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const v: [number, number, number] = [
        Math.cos(theta) * r,
        y,
        Math.sin(theta) * r,
      ];
      // Rough landmask-ish bands: SE Asia + Europe + Americas west coast
      const lat = Math.asin(y) * (180 / Math.PI);
      const lon = Math.atan2(v[2], v[0]) * (180 / Math.PI);
      const visited =
        (lat > -12 && lat < 8 && lon > 90 && lon < 145) || // SE Asia
        (lat > 38 && lat < 60 && lon > -10 && lon < 40); // Europe
      dots.push({ v, visited });
    }

    let raf = 0;
    let rot = 0;
    const R = size * 0.42;
    const tilt = (-18 * Math.PI) / 180;

    const draw = () => {
      rot += 0.0028;
      ctx.clearRect(0, 0, size, size);

      // Sphere outline
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,180,84,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Equator ring
      ctx.beginPath();
      ctx.ellipse(size / 2, size / 2, R, R * 0.28, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,180,84,0.12)";
      ctx.stroke();

      for (const { v, visited } of dots) {
        const [x, y, z] = v;
        // Tilt around X axis
        const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
        const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
        // Rotate around Y axis
        const x3 = x * Math.cos(rot) + z2 * Math.sin(rot);
        const z3 = -x * Math.sin(rot) + z2 * Math.cos(rot);

        const px = size / 2 + x3 * R;
        const py = size / 2 + y2 * R;
        const depth = (z3 + 1) / 2; // 0 = back, 1 = front

        if (z3 < -0.15) continue; // hide far hemisphere

        const alpha = 0.12 + depth * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, visited && depth > 0.45 ? 1.9 : 1.1, 0, Math.PI * 2);
        ctx.fillStyle = visited
          ? `rgba(255,180,84,${Math.min(1, alpha + 0.35)})`
          : `rgba(139,144,155,${alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      aria-label="Rotating globe of places visited"
      role="img"
    />
  );
}
