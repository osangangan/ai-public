'use client';

import React, { useEffect, useRef } from 'react';

interface HubNode {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  size: number;
  importance: 'major' | 'medium' | 'minor';
  rings: number[]; // concentric radii attached to this dot
  driftAmpX: number;
  driftAmpY: number;
  phase: number;
  phaseSpeed: number;
  waveSeed: number;
  color: string;
}

export default function VectorFieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    let hubs: HubNode[] = [];

    const buildHubs = () => {
      hubs = [];

      // Balanced distribution: some stationary anchor hubs, some migrating/drifting hubs
      const config = [
        // 1. Major Center Anchor (Calm anchor in middle)
        { rx: 0.50, ry: 0.48, importance: 'major' as const, size: 4.8, ringCount: 6, spacing: 36, driftX: 6, driftY: 4, speed: 0.0008 },
        // 2. Major Migrating Hub (Southwest drifting upward and rightward)
        { rx: 0.24, ry: 0.70, importance: 'major' as const, size: 4.2, ringCount: 5, spacing: 34, driftX: 65, driftY: 45, speed: 0.0016 },
        // 3. Major Migrating Hub (Northeast drifting across quadrant)
        { rx: 0.76, ry: 0.30, importance: 'major' as const, size: 4.2, ringCount: 5, spacing: 34, driftX: 55, driftY: 50, speed: 0.0014 },

        // 4. Medium Traveling Node (Northwest traveling toward center)
        { rx: 0.22, ry: 0.25, importance: 'medium' as const, size: 3.2, ringCount: 4, spacing: 30, driftX: 70, driftY: 35, speed: 0.0018 },
        // 5. Medium Traveling Node (Southeast traveling upward)
        { rx: 0.75, ry: 0.75, importance: 'medium' as const, size: 3.2, ringCount: 4, spacing: 30, driftX: 60, driftY: 55, speed: 0.0015 },
        // 6. Medium Anchor Node (South-Central)
        { rx: 0.50, ry: 0.85, importance: 'medium' as const, size: 3.0, ringCount: 4, spacing: 28, driftX: 8, driftY: 6, speed: 0.0010 },
        // 7. Medium Anchor Node (North-Central)
        { rx: 0.48, ry: 0.16, importance: 'medium' as const, size: 3.0, ringCount: 4, spacing: 28, driftX: 10, driftY: 8, speed: 0.0011 },

        // 8. Minor Migrating Nodes (Margin bridges & trade encounters)
        { rx: 0.10, ry: 0.48, importance: 'minor' as const, size: 2.0, ringCount: 3, spacing: 24, driftX: 45, driftY: 40, speed: 0.0020 },
        { rx: 0.90, ry: 0.52, importance: 'minor' as const, size: 2.0, ringCount: 3, spacing: 24, driftX: 45, driftY: 40, speed: 0.0019 },
        { rx: 0.36, ry: 0.44, importance: 'minor' as const, size: 2.2, ringCount: 3, spacing: 26, driftX: 55, driftY: 45, speed: 0.0022 },
        { rx: 0.64, ry: 0.56, importance: 'minor' as const, size: 2.2, ringCount: 3, spacing: 26, driftX: 50, driftY: 45, speed: 0.0021 },
        { rx: 0.10, ry: 0.88, importance: 'minor' as const, size: 1.8, ringCount: 3, spacing: 22, driftX: 30, driftY: 25, speed: 0.0015 },
        { rx: 0.90, ry: 0.14, importance: 'minor' as const, size: 1.8, ringCount: 3, spacing: 22, driftX: 30, driftY: 25, speed: 0.0016 },
      ];

      config.forEach((c, idx) => {
        const bx = c.rx * W;
        const by = c.ry * H;
        const rings: number[] = [];
        for (let r = 1; r <= c.ringCount; r++) {
          rings.push(r * c.spacing);
        }

        const isPurple = idx % 2 === 0;

        hubs.push({
          baseX: bx,
          baseY: by,
          x: bx,
          y: by,
          size: c.size,
          importance: c.importance,
          rings,
          driftAmpX: c.driftX,
          driftAmpY: c.driftY,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: c.speed,
          waveSeed: Math.random() * 100,
          color: isPurple ? 'rgba(109, 40, 217, ' : 'rgba(30, 41, 59, '
        });
      });
    };

    buildHubs();

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      buildHubs();
    };
    window.addEventListener('resize', onResize);

    // ---- Gentle Ambient Connecting Streamlines across Canvas ---------
    const getFlowVector = (px: number, py: number, time: number) => {
      let fx = 0.28;
      let fy = Math.sin(py * 0.002 + time * 0.8) * 0.12;

      // Soft, non-whirling rotational influence from hubs
      for (const h of hubs) {
        const dx = px - h.x;
        const dy = py - h.y;
        const dist2 = dx * dx + dy * dy + 400; // larger soft core prevents violent center spinning
        const dist = Math.sqrt(dist2);
        const radius = Math.min(W, H) * (h.importance === 'major' ? 0.30 : 0.20);
        const factor = Math.exp(-dist2 / (radius * radius));

        if (factor > 0.001) {
          const strength = h.importance === 'major' ? 1200 : 700;
          const rot = (strength * factor) / (dist + 40);
          fx += (-dy * rot) * 0.0006;
          fy += ( dx * rot) * 0.0006;
        }
      }

      const mag = Math.sqrt(fx * fx + fy * fy) || 1;
      return { vx: fx / mag, vy: fy / mag };
    };

    const STEP = 6.0;
    const MAX_STEPS = 240;

    const traceStreamline = (
      x0: number,
      y0: number,
      time: number,
      color: string,
      lineIdx: number
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = color;

      let cx = x0;
      let cy = y0;

      for (let s = 0; s < MAX_STEPS; s++) {
        const { vx, vy } = getFlowVector(cx, cy, time);

        const perpX = -vy;
        const perpY = vx;
        const wave = Math.sin(s * 0.08 - time * 1.4 + lineIdx * 0.5) * 2.2;

        const drawX = cx + perpX * wave;
        const drawY = cy + perpY * wave;

        if (s === 0) {
          ctx.moveTo(drawX, drawY);
        } else {
          ctx.lineTo(drawX, drawY);
        }

        cx += vx * STEP;
        cy += vy * STEP;

        if (cx < -60 || cx > W + 60 || cy < -60 || cy > H + 60) break;
      }

      ctx.stroke();
    };

    let time = 0;

    const render = () => {
      time += 0.009; // calm, dignified, perceptible flow rate

      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1.05;

      // 1. Move Traveling Dots & Anchors in their Orbits
      for (const hub of hubs) {
        hub.phase += hub.phaseSpeed;
        hub.x = hub.baseX + Math.sin(hub.phase) * hub.driftAmpX;
        hub.y = hub.baseY + Math.cos(hub.phase * 0.85) * hub.driftAmpY;
      }

      // 2. Draw Gentle Connecting Streamlines across Full Canvas
      const seedSpacing = 38;
      const numLines = Math.floor(H / seedSpacing);
      for (let i = 0; i <= numLines; i++) {
        const y = i * seedSpacing;
        const isPurple = i % 3 === 0;
        const alpha = isPurple ? 0.075 : 0.045;
        const color = isPurple
          ? `rgba(109, 40, 217, ${alpha})`
          : `rgba(30, 41, 59, ${alpha})`;
        traceStreamline(-10, y, time, color, i);
      }

      // 3. Draw Concentric Wavy Circles Traveling WITH Each Moving Dot
      // and merging dynamically when dots approach each other
      const NUM_RING_SEGMENTS = 72;

      for (let hIdx = 0; hIdx < hubs.length; hIdx++) {
        const hub = hubs[hIdx];

        hub.rings.forEach((baseRadius, rIdx) => {
          // Dynamic breathing expansion
          const breath = Math.sin(time * 1.2 + hub.waveSeed + rIdx * 0.5) * 4;
          const effectiveRadius = baseRadius + breath;

          const baseAlpha = hub.importance === 'major' ? 0.12 : 0.08;
          const ringAlpha = Math.max(0.02, baseAlpha * (1 - rIdx / (hub.rings.length + 1.2)));

          ctx.beginPath();
          ctx.strokeStyle = `${hub.color}${ringAlpha})`;
          ctx.lineWidth = hub.importance === 'major' ? 1.05 : 0.85;

          for (let s = 0; s <= NUM_RING_SEGMENTS; s++) {
            const theta = (s / NUM_RING_SEGMENTS) * Math.PI * 2;

            // Harmonic topographic wave on the concentric ring
            const wave1 = Math.sin(theta * 3 + time * 1.0 + hub.waveSeed) * (3.5 + rIdx * 1.1);
            const wave2 = Math.cos(theta * 5 - time * 0.8 + rIdx) * (2.0 + rIdx * 0.7);
            let r = effectiveRadius + wave1 + wave2;

            // Point in space attached to the MOVING dot
            let px = hub.x + Math.cos(theta) * r;
            let py = hub.y + Math.sin(theta) * r;

            // 4. Dynamic Merging: When concentric circles from two moving dots meet,
            // they warp toward one another and merge into shared envelopes
            for (let otherIdx = 0; otherIdx < hubs.length; otherIdx++) {
              if (otherIdx === hIdx) continue;
              const other = hubs[otherIdx];
              const ox = px - other.x;
              const oy = py - other.y;
              const oDist = Math.sqrt(ox * ox + oy * oy) + 1;

              // Proximity threshold for circle-merging
              const mergeThreshold = other.rings[other.rings.length - 1] || 160;
              if (oDist < mergeThreshold) {
                // Smooth bell-curve gravitational pull toward the companion node/ring
                const pullFactor = Math.pow(1 - oDist / mergeThreshold, 2) * 16;
                px -= (ox / oDist) * pullFactor;
                py -= (oy / oDist) * pullFactor;
              }
            }

            if (s === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }

          ctx.closePath();
          ctx.stroke();
        });
      }

      // 5. Draw the Moving Dots (Variable sizes and halos)
      for (const hub of hubs) {
        const pulse = Math.sin(hub.phase * 2.5) * 0.6;
        const r = hub.size + pulse;

        // Central Core Dot
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, Math.max(1, r), 0, Math.PI * 2);
        ctx.fillStyle = hub.importance === 'major'
          ? 'rgba(109, 40, 217, 0.48)'
          : hub.importance === 'medium'
          ? 'rgba(109, 40, 217, 0.32)'
          : 'rgba(30, 41, 59, 0.22)';
        ctx.fill();

        // Radiating inner halo for major anchor hubs
        if (hub.importance === 'major') {
          ctx.beginPath();
          ctx.arc(hub.x, hub.y, r * 2.4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(109, 40, 217, 0.16)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: '#ffffff',
      }}
    />
  );
}
