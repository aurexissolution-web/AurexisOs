// src/components/sections/contact/KLSkyline.tsx
export function KLSkyline() {
  return (
    <svg
      viewBox="0 0 600 110"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 right-0 w-full h-[110px] block"
      aria-hidden
    >
      {/* Background buildings */}
      <rect fill="rgba(255,255,255,0.10)" x="0" y="65" width="40" height="45" />
      <rect fill="rgba(255,255,255,0.10)" x="42" y="78" width="28" height="32" />
      <rect fill="rgba(255,255,255,0.10)" x="72" y="55" width="38" height="55" />
      <rect fill="rgba(255,255,255,0.14)" x="112" y="62" width="50" height="48" />
      <rect fill="rgba(255,255,255,0.10)" x="164" y="74" width="34" height="36" />
      <rect fill="rgba(255,255,255,0.14)" x="200" y="50" width="42" height="60" />
      {/* Petronas Towers */}
      <polygon fill="rgba(0,240,255,0.45)" points="252,40 254,16 258,8 262,16 264,40 264,110 252,110" />
      <polygon fill="rgba(0,240,255,0.45)" points="266,38 268,32 270,28 272,32 274,38 274,110 266,110" />
      <polygon fill="rgba(0,240,255,0.45)" points="280,40 282,16 286,8 290,16 292,40 292,110 280,110" />
      <polygon fill="rgba(0,240,255,0.45)" points="294,38 296,32 298,28 300,32 302,38 302,110 294,110" />
      {/* More background */}
      <rect fill="rgba(255,255,255,0.14)" x="306" y="58" width="44" height="52" />
      <rect fill="rgba(255,255,255,0.10)" x="352" y="72" width="36" height="38" />
      <rect fill="rgba(255,255,255,0.14)" x="390" y="65" width="46" height="45" />
      <rect fill="rgba(255,255,255,0.10)" x="438" y="76" width="32" height="34" />
      <rect fill="rgba(255,255,255,0.14)" x="472" y="60" width="40" height="50" />
      <rect fill="rgba(255,255,255,0.10)" x="514" y="74" width="36" height="36" />
      <rect fill="rgba(255,255,255,0.14)" x="552" y="68" width="48" height="42" />
    </svg>
  );
}
