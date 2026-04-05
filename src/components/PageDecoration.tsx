import React from 'react';

interface PageDecorationProps {
  pageIndex: number;
  width: number;
  height: number;
}

const DECORATION_SETS = [
  // Abstract background flourish 1
  (w: number, h: number) => (
    <g>
      {/* Soft rounded corner accents */}
      <path d={`M${w * 0.05},${h * 0.05} L${w * 0.1},${h * 0.05}`} stroke="#e2d9c8" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d={`M${w * 0.05},${h * 0.05} L${w * 0.05},${h * 0.1}`} stroke="#e2d9c8" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </g>
  ),
  // Abstract background flourish 2
  (w: number, h: number) => (
    <g>
      <circle cx={w * 0.5} cy={h * 0.5} r={min(w,h) * 0.3} fill="none" stroke="#ddd0bb" strokeWidth="1" strokeDasharray="10 20" opacity="0.3" />
    </g>
  ),
  // Empty
  () => <g />,
];

function min(a: number, b: number) { return a < b ? a : b; }

export const PageDecoration: React.FC<PageDecorationProps> = ({ pageIndex, width, height }) => {
  const setIndex = pageIndex % 3;
  const DecoSet = DECORATION_SETS[setIndex];
  const safeW = isNaN(Number(width)) ? 500 : Number(width);
  const safeH = isNaN(Number(height)) ? 700 : Number(height);
  
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={safeW}
      height={safeH}
      style={{ zIndex: 1, opacity: 0.7 }}
    >
      {DecoSet(safeW, safeH)}
      {/* Subtle corner flourish */}
      <path d={`M12,12 Q30,8 40,20`} stroke="#c8bfaf" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d={`M${safeW - 12},12 Q${safeW - 30},8 ${safeW - 40},20`} stroke="#c8bfaf" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" transform={`scale(-1,1) translate(-${safeW},0)`} />
    </svg>
  );
};
