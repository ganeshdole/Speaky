/**
 * Speaky's bubble as a line icon, drawn like the Lucide icons beside it in the sidebar (24px, a 2px round stroke in
 * the current colour): the speech bubble with its eyes and an open mouth.
 */
const SpeakyBubble = ({
  width = 24,
  height = 24,
  className = "",
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M12 3.5c5 0 8.5 3.1 8.5 7.2S17 18 12.3 18H10.4c-1.1 1.6-2.9 2.8-5.4 3.4 1-1.3 1.5-2.6 1.4-4.1C4.5 16 3.5 13.6 3.5 10.7 3.5 6.6 7 3.5 12 3.5Z" />
    <path d="M9.5 9.5v.5M14.5 9.5v.5" />
    <path d="M10 13.2a2.2 2.2 0 0 0 4 0" />
  </svg>
);

export default SpeakyBubble;
