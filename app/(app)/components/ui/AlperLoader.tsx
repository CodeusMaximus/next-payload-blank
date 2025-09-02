// app/(app)/components/ui/AlperLoader.tsx
'use client'

/**
 * Elegant plain-red handwriting loader for "Alper".
 * - Full-width (100vw), responsive height.
 * - No glow, no gradient—just a deep red stroke.
 * - Gentle write-on animation with subtle optional fill.
 * - Respects prefers-reduced-motion.
 */
export default function AlperLoader({
  heightVh = 36,    // height as % of viewport height
  duration = 3.6,   // seconds per loop (slower = calmer)
  stroke = 10,      // px stroke thickness (relative to 1200x300 viewBox)
  color = '#b91c1c',// elegant deep red (Tailwind red-700)
  fillOpacity = 0.10,
  label = 'Loading…',
}: {
  heightVh?: number
  duration?: number
  stroke?: number
  color?: string
  fillOpacity?: number
  label?: string
}) {
  return (
    <div
      aria-label={label}
      role="img"
      className="w-screen"
      style={{ height: `${heightVh}vh`, display: 'grid', placeItems: 'center' }}
    >
      <svg
        viewBox="0 0 1200 300"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <style>{`
            :root { --dur: ${duration}s; --stroke: ${stroke}px; }

            .trace {
              fill: none;
              stroke: ${color};
              stroke-width: var(--stroke);
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-dasharray: 4000;
              stroke-dashoffset: 4000;
              animation: draw var(--dur) cubic-bezier(.55,.06,.32,.98) infinite;
            }

            .fillAfter {
              fill: ${color};
              opacity: 0;
              animation: fadeIn calc(var(--dur) * .45) ease-out calc(var(--dur) * .55) infinite;
            }

            @keyframes draw {
              0%   { stroke-dashoffset: 4000; opacity: 1; }
              60%  { stroke-dashoffset: 0;    opacity: 1; }
              85%  { stroke-dashoffset: 0;    opacity: .95; }
              100% { stroke-dashoffset: 4000; opacity: 1; }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to   { opacity: ${fillOpacity}; }
            }

            /* Smaller screens: slightly reduce scale for balance */
            @media (max-width: 480px) {
              .word { font-size: 180px; }
            }

            /* Motion accessibility */
            @media (prefers-reduced-motion: reduce) {
              .trace, .fillAfter { animation: none !important; }
              .trace { stroke-dashoffset: 0; }
              .fillAfter { opacity: ${fillOpacity}; }
            }
          `}</style>
        </defs>

        {/* Word outline (stroke-only) */}
        <g transform="translate(0, 8)">
          <text
            x="50%" y="58%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="220"
            className="word trace"
            fontFamily="Pacifico, 'Segoe Script', 'Brush Script MT', cursive"
          >
            Alper
          </text>

          {/* Subtle fill that fades in after the stroke is drawn */}
          <text
            x="50%" y="58%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="220"
            className="word fillAfter"
            fontFamily="Pacifico, 'Segoe Script', 'Brush Script MT', cursive"
          >
            Alper
          </text>
        </g>
      </svg>
    </div>
  )
}
