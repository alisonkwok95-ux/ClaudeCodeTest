// Honeycomb layout: 1 center hex + 6 surrounding hexes
// Uses SVG polygons for crisp hexagon shapes

const HEX_SIZE = 50; // circumradius
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;
const GAP = 6;

// Flat-top hexagon polygon points centered at (0,0)
function hexPoints(size) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${size * Math.cos(angle)},${size * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

// Positions for center + 6 outer hexes (pointy-top layout)
// Center at origin; outer hexes at 60° intervals
function outerPosition(idx) {
  const angle = (Math.PI / 180) * (60 * idx - 90);
  const dist = HEX_WIDTH + GAP;
  return {
    x: dist * Math.cos(angle),
    y: dist * Math.sin(angle),
  };
}

const VIEWBOX_SIZE = (HEX_WIDTH + GAP) * 2 + HEX_WIDTH + 20;
const VB_HALF = VIEWBOX_SIZE / 2;

export default function Honeycomb({ centerLetter, outerLetters, onLetterClick }) {
  const pts = hexPoints(HEX_SIZE - 2);

  return (
    <svg
      viewBox={`${-VB_HALF} ${-VB_HALF} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      width={VIEWBOX_SIZE}
      height={VIEWBOX_SIZE}
      className="max-w-xs mx-auto select-none"
      aria-label="Honeycomb letter grid"
    >
      {/* Outer 6 letters */}
      {outerLetters.map((letter, i) => {
        const { x, y } = outerPosition(i);
        return (
          <g
            key={letter}
            transform={`translate(${x},${y})`}
            onClick={() => onLetterClick(letter)}
            className="cursor-pointer"
            role="button"
            aria-label={`Letter ${letter.toUpperCase()}`}
          >
            <polygon
              points={pts}
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="2"
              className="hover:fill-slate-300 transition-colors duration-100"
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={HEX_SIZE * 0.55}
              fontWeight="700"
              fill="#1e293b"
              style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
            >
              {letter.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Center letter */}
      <g
        onClick={() => onLetterClick(centerLetter)}
        className="cursor-pointer"
        role="button"
        aria-label={`Center letter ${centerLetter.toUpperCase()}`}
      >
        <polygon
          points={pts}
          fill="#facc15"
          stroke="#eab308"
          strokeWidth="2"
          className="hover:fill-yellow-300 transition-colors duration-100"
        />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={HEX_SIZE * 0.55}
          fontWeight="700"
          fill="#1e293b"
          style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
        >
          {centerLetter.toUpperCase()}
        </text>
      </g>
    </svg>
  );
}
