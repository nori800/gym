"use client";

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-200 ${
        enabled ? "bg-ios-toggle" : "bg-[#d8d8d8]"
      }`}
    >
      <span
        className={`absolute top-[2px] h-7 w-7 rounded-full bg-white shadow-sm transition-[left] duration-200 ${
          enabled ? "left-[22px]" : "left-[2px]"
        }`}
      />
    </button>
  );
}
