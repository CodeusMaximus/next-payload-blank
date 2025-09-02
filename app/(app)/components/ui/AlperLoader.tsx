// app/(app)/components/ui/AlperLoader.tsx
'use client'

/**
 * Large script-style handwriting loader for "Alper".
 * - Full viewport width, much larger text
 * - Script font family for elegant handwriting
 * - Deep red color scheme
 * - Natural handwriting animation
 */
export default function AlperLoader({
  heightVh = 50,    // height as % of viewport height
  duration = 3.2,   // seconds per loop
  stroke = 14,      // px stroke thickness
  color = '#7f1d1d', // deep burgundy red
  fillOpacity = 0.08,
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
      className="w-full min-h-screen flex items-center justify-center"
      style={{ minHeight: `${heightVh}vh` }}
    >
      <div className="w-full">
        <svg
          viewBox="0 0 1200 400"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          className="filter drop-shadow-sm"
        >
          <defs>
            <style>{`
              :root { 
                --dur: ${duration}s; 
                --stroke: ${stroke}px; 
                --primary-color: ${color};
                --secondary-color: #991b1b;
              }

              .trace {
                fill: none;
                stroke: var(--primary-color);
                stroke-width: var(--stroke);
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-dasharray: 4200;
                stroke-dashoffset: 4200;
                opacity: 0.9;
                animation: drawRealistic var(--dur) ease-in-out infinite;
              }

              .fillAfter {
                fill: var(--secondary-color);
                opacity: 0;
                animation: subtleFadeIn calc(var(--dur) * 0.4) ease-out calc(var(--dur) * 0.6) infinite;
              }

              .shadow-trace {
                fill: none;
                stroke: rgba(0, 0, 0, 0.15);
                stroke-width: calc(var(--stroke) + 3px);
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-dasharray: 4200;
                stroke-dashoffset: 4200;
                animation: drawShadow var(--dur) ease-in-out calc(var(--dur) * 0.05) infinite;
                transform: translate(3px, 3px);
              }

              @keyframes drawRealistic {
                0%   { 
                  stroke-dashoffset: 4200; 
                  opacity: 0.9;
                }
                5%   { 
                  stroke-dashoffset: 4200; 
                  opacity: 0.95;
                }
                65%  { 
                  stroke-dashoffset: 0; 
                  opacity: 1;
                }
                90%  { 
                  stroke-dashoffset: 0; 
                  opacity: 0.9;
                }
                100% { 
                  stroke-dashoffset: 4200; 
                  opacity: 0.9;
                }
              }

              @keyframes drawShadow {
                0%   { stroke-dashoffset: 4200; opacity: 0; }
                8%   { stroke-dashoffset: 4200; opacity: 0.1; }
                68%  { stroke-dashoffset: 0; opacity: 0.15; }
                92%  { stroke-dashoffset: 0; opacity: 0.1; }
                100% { stroke-dashoffset: 4200; opacity: 0; }
              }

              @keyframes subtleFadeIn {
                0%   { opacity: 0; }
                50%  { opacity: ${fillOpacity * 0.7}; }
                100% { opacity: ${fillOpacity}; }
              }

              .word {
                font-family: 'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', 'Dancing Script', cursive;
                font-weight: normal;
                letter-spacing: -4px;
                font-style: italic;
              }

              /* Responsive scaling - much larger text */
              @media (min-width: 1400px) {
                .word { 
                  font-size: 380px; 
                  letter-spacing: -6px;
                }
                :root { --stroke: ${stroke + 4}px; }
              }

              @media (min-width: 1200px) and (max-width: 1399px) {
                .word { 
                  font-size: 320px; 
                  letter-spacing: -5px;
                }
                :root { --stroke: ${stroke + 2}px; }
              }

              @media (min-width: 992px) and (max-width: 1199px) {
                .word { 
                  font-size: 280px; 
                  letter-spacing: -4px;
                }
              }

              @media (min-width: 768px) and (max-width: 991px) {
                .word { 
                  font-size: 340px; 
                  letter-spacing: -3px;
                }
                :root { --stroke: ${Math.max(10, stroke - 2)}px; }
              }

              @media (min-width: 480px) and (max-width: 767px) {
                .word { 
                  font-size: 300px; 
                  letter-spacing: -2px;
                }
                :root { --stroke: ${Math.max(8, stroke - 4)}px; }
              }

              @media (max-width: 479px) {
                .word { 
                  font-size: 460px; 
                  letter-spacing: -1px;
                }
                :root { --stroke: ${Math.max(6, stroke - 6)}px; }
              }

              /* High contrast mode support */
              @media (prefers-contrast: high) {
                .trace {
                  stroke: #000000;
                  opacity: 1;
                }
                .fillAfter {
                  fill: #000000;
                }
              }

              /* Dark mode adjustments */
              @media (prefers-color-scheme: dark) {
                .trace {
                  stroke: #dc2626;
                  filter: brightness(1.1);
                }
                .fillAfter {
                  fill: #b91c1c;
                }
                .shadow-trace {
                  stroke: rgba(255, 255, 255, 0.15);
                }
              }

              /* Motion accessibility */
              @media (prefers-reduced-motion: reduce) {
                .trace, .fillAfter, .shadow-trace { 
                  animation: none !important; 
                }
                .trace { 
                  stroke-dashoffset: 0; 
                  opacity: 1;
                }
                .fillAfter { 
                  opacity: ${fillOpacity}; 
                }
                .shadow-trace {
                  stroke-dashoffset: 0;
                  opacity: 0.15;
                }
              }
            `}</style>
          </defs>

          {/* Subtle shadow layer */}
          <g transform="translate(0, 12)">
            <text
              x="50%" y="52%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="00"
              className="word shadow-trace"
            >
              Alper
            </text>

            {/* Main stroke */}
            <text
              x="50%" y="52%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="300"
              className="word trace"
            >
              Alper
            </text>

            {/* Subtle fill */}
            <text
              x="50%" y="52%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="300"
              className="word fillAfter"
            >
              Alper
            </text>
          </g>
        </svg>

        {/* Optional loading text */}
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium tracking-wide">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}