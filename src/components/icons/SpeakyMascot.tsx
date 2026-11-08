/**
 * Speaky's mascot: a blue speech bubble saying something, with the words coming off it. Drawn upright; `<Mascot>`
 * leans it at rest and waves it. The master is brand/mascot.svg.
 */
const BUBBLE =
  "M104 18C158 18 190 48 190 92C190 136 158 162 108 162L88 162C78 176 60 188 34 194C46 180 52 168 52 154C30 140 18 118 18 92C18 48 50 18 104 18Z";
const MOUTH = "M88 108Q104 102 120 108Q120 134 104 138Q88 134 88 108Z";

const SpeakyMascot = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 240 210"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <clipPath id="speaky-mascot-body">
        <path d={BUBBLE} />
      </clipPath>
      <clipPath id="speaky-mascot-mouth">
        <path d={MOUTH} />
      </clipPath>
    </defs>
    {/* A darker blue under a lighter one leaves the shade on the lower right; then the shine. */}
    <g clipPath="url(#speaky-mascot-body)">
      <rect width="240" height="210" fill="#3f86f0" />
      <ellipse cx="96" cy="84" rx="92" ry="74" fill="#78b3ff" />
      <ellipse
        cx="62"
        cy="48"
        rx="26"
        ry="14"
        fill="#fff"
        opacity=".55"
        transform="rotate(-24 62 48)"
      />
    </g>
    <path d={BUBBLE} stroke="#16213d" strokeWidth="8" strokeLinejoin="round" />
    <ellipse cx="82" cy="82" rx="10" ry="17" fill="#16213d" />
    <ellipse cx="126" cy="82" rx="10" ry="17" fill="#16213d" />
    <circle cx="79" cy="74" r="4" fill="#fff" />
    <circle cx="123" cy="74" r="4" fill="#fff" />
    <ellipse cx="64" cy="112" rx="10" ry="6" fill="#ffc2d1" />
    <ellipse cx="146" cy="112" rx="10" ry="6" fill="#ffc2d1" />
    {/* The mouth, open mid-word. */}
    <path d={MOUTH} fill="#16213d" />
    <ellipse
      cx="104"
      cy="134"
      rx="11"
      ry="8"
      fill="#ff7c97"
      clipPath="url(#speaky-mascot-mouth)"
    />
    {/* The words coming out. */}
    <g stroke="#16213d" strokeWidth="7" strokeLinecap="round">
      <path d="M204 70Q214 92 204 114" />
      <path d="M220 56Q236 92 220 128" />
    </g>
  </svg>
);

export default SpeakyMascot;
