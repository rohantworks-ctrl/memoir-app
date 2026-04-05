import React from 'react';

// 3 animation states cycling per page (index % 3)
// Cat 1: orange/white — Cat 2: tabby gray

const catStyles = `
@keyframes cat-sit { 0%,100%{transform:translateY(0) scaleX(1)} 50%{transform:translateY(-4px) scaleX(1.04)} }
@keyframes cat-paw { 0%,100%{transform:rotate(0deg)} 30%{transform:rotate(-18deg)} 70%{transform:rotate(12deg)} }
@keyframes cat-tail-1 { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(25deg)} }
@keyframes cat-tail-2 { 0%,100%{transform:rotate(20deg)} 50%{transform:rotate(-20deg)} }
@keyframes cat-blink { 0%,92%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.05)} }
@keyframes cat-stretch { 0%,100%{transform:scaleX(1) scaleY(1)} 40%{transform:scaleX(1.25) scaleY(0.8)} 70%{transform:scaleX(0.85) scaleY(1.15)} }
@keyframes cat-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes cat-head-tilt { 0%,100%{transform:rotate(0deg)} 40%{transform:rotate(-12deg)} }
`;

// Simplified SVG cat with CSS animations
function OrangeCat({ animIndex }: { animIndex: number }) {
  const animations = [
    { body: 'cat-sit 2.8s ease-in-out infinite', tail: 'cat-tail-1 1.5s ease-in-out infinite', head: 'cat-blink 3.5s ease-in-out infinite' },
    { body: 'cat-bounce 1.2s ease-in-out infinite', tail: 'cat-tail-2 0.8s ease-in-out infinite', head: 'cat-paw 1.2s ease-in-out infinite' },
    { body: 'cat-stretch 2s ease-in-out infinite', tail: 'cat-tail-1 1s ease-in-out infinite', head: 'cat-head-tilt 2s ease-in-out infinite' },
  ];
  const anim = animations[animIndex];
  return (
    <svg width="72" height="80" viewBox="0 0 72 80" style={{ animation: anim.body, transformOrigin: 'bottom center', overflow: 'visible' }}>
      {/* Body */}
      <ellipse cx="36" cy="56" rx="22" ry="20" fill="#F4A460" />
      <ellipse cx="36" cy="58" rx="14" ry="13" fill="#FFF5E6" />
      {/* Tail */}
      <path
        d="M56 68 Q72 60 68 48"
        stroke="#F4A460" strokeWidth="5" fill="none" strokeLinecap="round"
        style={{ animation: anim.tail, transformOrigin: '56px 68px' }}
      />
      {/* Head */}
      <g style={{ animation: anim.head, transformOrigin: '36px 34px' }}>
        <ellipse cx="36" cy="34" rx="16" ry="15" fill="#F4A460" />
        {/* Ears */}
        <polygon points="22,24 18,10 30,20" fill="#F4A460" />
        <polygon points="50,24 54,10 42,20" fill="#F4A460" />
        <polygon points="23,22 21,14 29,20" fill="#FFB6C1" />
        <polygon points="49,22 51,14 43,20" fill="#FFB6C1" />
        {/* Face */}
        <ellipse cx="30" cy="32" rx="4" ry="4.5" fill="white" />
        <ellipse cx="42" cy="32" rx="4" ry="4.5" fill="white" />
        <circle cx="30" cy="33" r="2.5" fill="#2d2006" />
        <circle cx="42" cy="33" r="2.5" fill="#2d2006" />
        <circle cx="31" cy="32" r="0.8" fill="white" />
        <circle cx="43" cy="32" r="0.8" fill="white" />
        {/* Nose */}
        <ellipse cx="36" cy="37" rx="2" ry="1.2" fill="#FF8FAB" />
        {/* Mouth */}
        <path d="M34 38.5 Q36 40.5 38 38.5" stroke="#d97090" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        {/* Whiskers */}
        <line x1="18" y1="36" x2="33" y2="37" stroke="#d4a877" strokeWidth="0.7" opacity="0.7" />
        <line x1="18" y1="38.5" x2="33" y2="38.5" stroke="#d4a877" strokeWidth="0.7" opacity="0.7" />
        <line x1="39" y1="37" x2="54" y2="36" stroke="#d4a877" strokeWidth="0.7" opacity="0.7" />
        <line x1="39" y1="38.5" x2="54" y2="38.5" stroke="#d4a877" strokeWidth="0.7" opacity="0.7" />
      </g>
      {/* Paws */}
      <ellipse cx="24" cy="74" rx="7" ry="5" fill="#F4A460" />
      <ellipse cx="48" cy="74" rx="7" ry="5" fill="#F4A460" />
      {/* Belly spot */}
      <ellipse cx="36" cy="60" rx="10" ry="9" fill="rgba(255,245,230,0.7)" />
    </svg>
  );
}

function TabbyCat({ animIndex }: { animIndex: number }) {
  const animations = [
    { body: 'cat-bounce 1.5s ease-in-out infinite', tail: 'cat-tail-2 1.2s ease-in-out infinite', head: 'cat-head-tilt 2.5s ease-in-out infinite' },
    { body: 'cat-sit 3s ease-in-out infinite', tail: 'cat-tail-1 1.8s ease-in-out infinite', head: 'cat-blink 4s ease-in-out infinite' },
    { body: 'cat-stretch 2.4s ease-in-out infinite', tail: 'cat-tail-2 0.9s ease-in-out infinite', head: 'cat-paw 1.5s ease-in-out infinite' },
  ];
  const anim = animations[animIndex];
  return (
    <svg width="72" height="80" viewBox="0 0 72 80" style={{ animation: anim.body, transformOrigin: 'bottom center', overflow: 'visible' }}>
      {/* Body */}
      <ellipse cx="36" cy="56" rx="22" ry="20" fill="#B0BEC5" />
      <ellipse cx="36" cy="58" rx="14" ry="13" fill="#ECEFF1" />
      {/* Tabby stripes */}
      <path d="M20 45 Q36 42 52 45" stroke="#78909C" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M18 52 Q36 49 54 52" stroke="#78909C" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* Tail */}
      <path
        d="M58 68 Q74 55 70 42"
        stroke="#B0BEC5" strokeWidth="5" fill="none" strokeLinecap="round"
        style={{ animation: anim.tail, transformOrigin: '58px 68px' }}
      />
      <path d="M58 68 Q74 55 70 42" stroke="#78909C" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="5 4" opacity="0.5"
        style={{ animation: anim.tail, transformOrigin: '58px 68px' }} />
      {/* Head */}
      <g style={{ animation: anim.head, transformOrigin: '36px 34px' }}>
        <ellipse cx="36" cy="34" rx="16" ry="15" fill="#B0BEC5" />
        {/* Tabby head stripes */}
        <path d="M26 22 Q36 20 46 22" stroke="#78909C" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M28 26 Q36 24 44 26" stroke="#78909C" strokeWidth="1.2" fill="none" opacity="0.6" />
        {/* Ears */}
        <polygon points="22,24 18,10 30,20" fill="#B0BEC5" />
        <polygon points="50,24 54,10 42,20" fill="#B0BEC5" />
        <polygon points="23,22 21,14 29,20" fill="#FFB6C1" />
        <polygon points="49,22 51,14 43,20" fill="#FFB6C1" />
        {/* Face */}
        <ellipse cx="30" cy="32" rx="4" ry="4.5" fill="white" />
        <ellipse cx="42" cy="32" rx="4" ry="4.5" fill="white" />
        <circle cx="30" cy="33" r="2.5" fill="#1a1a2e" />
        <circle cx="42" cy="33" r="2.5" fill="#1a1a2e" />
        <circle cx="31" cy="32" r="0.8" fill="white" />
        <circle cx="43" cy="32" r="0.8" fill="white" />
        <ellipse cx="36" cy="37" rx="2" ry="1.2" fill="#FF8FAB" />
        <path d="M34 38.5 Q36 40.5 38 38.5" stroke="#d97090" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <line x1="18" y1="36" x2="33" y2="37" stroke="#9ab" strokeWidth="0.7" opacity="0.7" />
        <line x1="18" y1="38.5" x2="33" y2="38.5" stroke="#9ab" strokeWidth="0.7" opacity="0.7" />
        <line x1="39" y1="37" x2="54" y2="36" stroke="#9ab" strokeWidth="0.7" opacity="0.7" />
        <line x1="39" y1="38.5" x2="54" y2="38.5" stroke="#9ab" strokeWidth="0.7" opacity="0.7" />
      </g>
      {/* Paws */}
      <ellipse cx="24" cy="74" rx="7" ry="5" fill="#B0BEC5" />
      <ellipse cx="48" cy="74" rx="7" ry="5" fill="#B0BEC5" />
    </svg>
  );
}

interface CatCornerProps {
  pageIndex: number;
}

export const CatCorner: React.FC<CatCornerProps> = ({ pageIndex }) => {
  const animIndex = pageIndex % 3;
  return (
    <>
      <style>{catStyles}</style>
      {/* Orange cat — bottom left */}
      <div className="absolute bottom-2 left-4 pointer-events-none z-20 opacity-90" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' }}>
        <OrangeCat animIndex={animIndex} />
      </div>
      {/* Tabby — bottom right */}
      <div className="absolute bottom-2 right-4 pointer-events-none z-20 opacity-90" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))', transform: 'scaleX(-1)' }}>
        <TabbyCat animIndex={animIndex} />
      </div>
    </>
  );
};
