'use client';

import React, { useEffect, useRef } from 'react';

interface HubNode {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  size: number;
  importance: 'major' | 'medium' | 'minor';
  rings: number[];
  driftAmpX: number;
  driftAmpY: number;
  phase: number;
  phaseSpeed: number;
  waveSeed: number;
  color: string;
}

interface SquidSprite {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  targetAngle: number;
  pulsePhase: number;
}

export default function VectorFieldBackground({ isProcessing = false }: { isProcessing?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isProcessingRef = useRef(isProcessing);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

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

      const config = [
        { rx: 0.50, ry: 0.48, importance: 'major' as const, size: 4.8, ringCount: 6, spacing: 36, driftX: 6, driftY: 4, speed: 0.0008 },
        { rx: 0.24, ry: 0.70, importance: 'major' as const, size: 4.2, ringCount: 5, spacing: 34, driftX: 65, driftY: 45, speed: 0.0016 },
        { rx: 0.76, ry: 0.30, importance: 'major' as const, size: 4.2, ringCount: 5, spacing: 34, driftX: 55, driftY: 50, speed: 0.0014 },
        { rx: 0.22, ry: 0.25, importance: 'medium' as const, size: 3.2, ringCount: 4, spacing: 30, driftX: 70, driftY: 35, speed: 0.0018 },
        { rx: 0.75, ry: 0.75, importance: 'medium' as const, size: 3.2, ringCount: 4, spacing: 30, driftX: 60, driftY: 55, speed: 0.0015 },
        { rx: 0.50, ry: 0.85, importance: 'medium' as const, size: 3.0, ringCount: 4, spacing: 28, driftX: 8, driftY: 6, speed: 0.0010 },
        { rx: 0.48, ry: 0.16, importance: 'medium' as const, size: 3.0, ringCount: 4, spacing: 28, driftX: 10, driftY: 8, speed: 0.0011 },
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

    // ---- Retro Pixel Squid Easter Egg State (Continuous Ambient Swimming) -----
    const squid: SquidSprite = {
      active: false,
      x: W * 0.5,
      y: H * 0.5,
      vx: 0.8,
      vy: 0.4,
      angle: 0,
      targetAngle: 0,
      pulsePhase: 0,
    };

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      buildHubs();
    };
    window.addEventListener('resize', onResize);

    // ---- Flow Vector Field -------------------------------------------
    const getFlowVector = (px: number, py: number, time: number) => {
      let fx = 0.28;
      let fy = Math.sin(py * 0.002 + time * 0.8) * 0.12;

      for (const h of hubs) {
        const dx = px - h.x;
        const dy = py - h.y;
        const dist2 = dx * dx + dy * dy + 400;
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

    // ---- Draw Retro Pixel Squid Character (Continuous Ambient Swimming) -----
    const drawSquid = (time: number) => {
      if (!squid.active) return;

      // Update Squid Physics & Motion
      squid.pulsePhase += 0.08;
      const speed = 0.9 + Math.sin(squid.pulsePhase) * 0.4;

      // Gentle continuous organic steering across the whole canvas
      if (Math.random() < 0.02) {
        squid.targetAngle += (Math.random() - 0.5) * 1.1;
      }
      squid.angle += (squid.targetAngle - squid.angle) * 0.04;

      squid.vx = Math.cos(squid.angle) * speed;
      squid.vy = Math.sin(squid.angle) * speed;

      squid.x += squid.vx;
      squid.y += squid.vy;

      // Screen wrapping (smooth continuous presence across and outside canvas)
      if (squid.x < -40) squid.x = W + 30;
      if (squid.x > W + 40) squid.x = -30;
      if (squid.y < -40) squid.y = H + 30;
      if (squid.y > H + 40) squid.y = -30;

      ctx.save();
      ctx.translate(squid.x, squid.y);
      ctx.rotate(squid.angle + Math.PI / 2);

      // Draw Retro Pixel / 8-Bit Squid (Scale ~ 1.5x)
      const P = 2.2; // Pixel size
      const mainColor = '#7c3aed';
      const eyeWhite = '#ffffff';
      const pupil = '#3b0764';
      const tentacleColor = '#9333ea';

      ctx.fillStyle = mainColor;

      // 8-bit Bell / Dome shape
      // Row 1 (Top cap)
      ctx.fillRect(-2 * P, -6 * P, 4 * P, P);
      // Row 2
      ctx.fillRect(-3 * P, -5 * P, 6 * P, P);
      // Row 3-4 (Main Body)
      ctx.fillRect(-4 * P, -4 * P, 8 * P, 3 * P);
      // Row 5 (Mantle base)
      ctx.fillRect(-3 * P, -1 * P, 6 * P, P);

      // Cute Pixel Eyes
      ctx.fillStyle = eyeWhite;
      ctx.fillRect(-3 * P, -4 * P, 2 * P, 2 * P);
      ctx.fillRect(1 * P, -4 * P, 2 * P, 2 * P);
      // Pupils
      ctx.fillStyle = pupil;
      ctx.fillRect(-2 * P, -3 * P, P, P);
      ctx.fillRect(2 * P, -3 * P, P, P);

      // Animated Undulating Tentacles
      ctx.fillStyle = tentacleColor;
      const tentacleWave1 = Math.sin(squid.pulsePhase * 1.5) * 1.8;
      const tentacleWave2 = Math.cos(squid.pulsePhase * 1.5) * 1.8;

      // Tentacle 1 (Left)
      ctx.fillRect(-3 * P + tentacleWave1, 0, P, 3 * P);
      // Tentacle 2 (Mid-Left)
      ctx.fillRect(-1 * P + tentacleWave2, 0, P, 4 * P);
      // Tentacle 3 (Mid-Right)
      ctx.fillRect(1 * P - tentacleWave1, 0, P, 4 * P);
      // Tentacle 4 (Right)
      ctx.fillRect(3 * P - tentacleWave2, 0, P, 3 * P);

      ctx.restore();
    };

    let time = 0;

    const render = () => {
      time += 0.009;

      // Activate squid once prompt processing starts
      if (isProcessingRef.current && !squid.active) {
        squid.active = true;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1.05;

      // 1. Move Traveling Dots & Anchors
      for (const hub of hubs) {
        hub.phase += hub.phaseSpeed;
        hub.x = hub.baseX + Math.sin(hub.phase) * hub.driftAmpX;
        hub.y = hub.baseY + Math.cos(hub.phase * 0.85) * hub.driftAmpY;
      }

      // 2. Draw Gentle Connecting Streamlines
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

      // 3. Draw Concentric Wavy Circles Traveling with Moving Dots
      const NUM_RING_SEGMENTS = 72;

      for (let hIdx = 0; hIdx < hubs.length; hIdx++) {
        const hub = hubs[hIdx];

        hub.rings.forEach((baseRadius, rIdx) => {
          const breath = Math.sin(time * 1.2 + hub.waveSeed + rIdx * 0.5) * 4;
          const effectiveRadius = baseRadius + breath;

          const baseAlpha = hub.importance === 'major' ? 0.12 : 0.08;
          const ringAlpha = Math.max(0.02, baseAlpha * (1 - rIdx / (hub.rings.length + 1.2)));

          ctx.beginPath();
          ctx.strokeStyle = `${hub.color}${ringAlpha})`;
          ctx.lineWidth = hub.importance === 'major' ? 1.05 : 0.85;

          for (let s = 0; s <= NUM_RING_SEGMENTS; s++) {
            const theta = (s / NUM_RING_SEGMENTS) * Math.PI * 2;

            const wave1 = Math.sin(theta * 3 + time * 1.0 + hub.waveSeed) * (3.5 + rIdx * 1.1);
            const wave2 = Math.cos(theta * 5 - time * 0.8 + rIdx) * (2.0 + rIdx * 0.7);
            let r = effectiveRadius + wave1 + wave2;

            let px = hub.x + Math.cos(theta) * r;
            let py = hub.y + Math.sin(theta) * r;

            for (let otherIdx = 0; otherIdx < hubs.length; otherIdx++) {
              if (otherIdx === hIdx) continue;
              const other = hubs[otherIdx];
              const ox = px - other.x;
              const oy = py - other.y;
              const oDist = Math.sqrt(ox * ox + oy * oy) + 1;

              const mergeThreshold = other.rings[other.rings.length - 1] || 160;
              if (oDist < mergeThreshold) {
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

      // 4. Draw Center Settlement Hub Dots
      for (const hub of hubs) {
        const pulse = Math.sin(hub.phase * 2.5) * 0.6;
        const r = hub.size + pulse;

        ctx.beginPath();
        ctx.arc(hub.x, hub.y, Math.max(1, r), 0, Math.PI * 2);
        ctx.fillStyle = hub.importance === 'major'
          ? 'rgba(109, 40, 217, 0.48)'
          : hub.importance === 'medium'
          ? 'rgba(109, 40, 217, 0.32)'
          : 'rgba(30, 41, 59, 0.22)';
        ctx.fill();

        if (hub.importance === 'major') {
          ctx.beginPath();
          ctx.arc(hub.x, hub.y, r * 2.4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(109, 40, 217, 0.16)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 5. Render Retro Squid (Smooth continuous ambient swimming)
      drawSquid(time);

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
