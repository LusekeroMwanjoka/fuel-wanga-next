import React from "react";

/**
 * Recognizable fuel-pump SVG icon used as the brand mark throughout the app.
 * Also used as the browser-tab favicon via app/icon.svg.
 */
export function PumpIcon({
  size = 24,
  color = "currentColor",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Pump body */}
      <rect x="3" y="4" width="11" height="17" rx="1.5" />
      {/* Pump window / display */}
      <rect x="5" y="6" width="7" height="4" rx="0.75" />
      {/* Nozzle arm */}
      <path d="M14 8h3.5a1 1 0 0 1 1 1v5a1.5 1.5 0 0 1-3 0v-2H14" />
      {/* Nozzle tip */}
      <line x1="19.5" y1="14" x2="19.5" y2="16.5" />
    </svg>
  );
}

/** Branded square icon — green background, white pump — for header brand marks. */
export function BrandIcon({ size = 37 }: { size?: number }) {
  return (
    <span
      className="brand-icon"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}
      aria-hidden="true"
    >
      <PumpIcon size={Math.round(size * 0.55)} color="#fff" />
    </span>
  );
}
