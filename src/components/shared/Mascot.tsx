import React from "react";
import SpeakyMascot from "../icons/SpeakyMascot";

interface MascotProps {
  /** Height in px. */
  size: number;
  /** Wave once on arrival, or high-five (re-key it to play again). */
  animation?: "wave" | "slap" | null;
}

// The mascot's own 240×210 box, so `size` is its height; the wave pivots at its bottom centre.
const BOX_ASPECT = 240 / 210;

/** Speaky's mascot, a speech bubble saying something, optionally animated. */
export const Mascot: React.FC<MascotProps> = ({ size, animation = null }) => (
  <span
    style={{ width: size * BOX_ASPECT, height: size }}
    className={`relative block origin-[50%_90%] rotate-[-8deg] select-none ${animation === "wave" ? "animate-wave" : animation === "slap" ? "animate-slap" : ""}`}
  >
    <SpeakyMascot className="absolute inset-0 h-full w-full" />
  </span>
);
