/** The app name: a brand, so never translated. */
const WORDMARK = "Speaky";

/** The "Speaky" wordmark, in the display font and the wordmark colours. */
const SpeakyTextLogo = ({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 330 100"
      role="img"
      aria-label={WORDMARK}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="165"
        y="74"
        textAnchor="middle"
        fontSize="88"
        fontWeight="700"
        letterSpacing="-2"
        className="logo-primary"
        stroke="var(--color-wordmark-stroke)"
        strokeWidth="5"
        paintOrder="stroke"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {WORDMARK}
      </text>
    </svg>
  );
};

export default SpeakyTextLogo;
