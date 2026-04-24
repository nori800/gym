"use client";

import { useState, useEffect, useRef } from "react";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  allowDecimal?: boolean;
  label?: string;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
  allowDecimal = false,
  label,
}: StepperProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setText(String(value));
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const parsed = allowDecimal ? parseFloat(text) : parseInt(text, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
    setEditing(false);
  };

  const decr = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const incr = () => onChange(Math.min(max, +(value + step).toFixed(2)));

  const ariaPrefix = label ? `${label}を` : "";

  return (
    <div className="inline-grid h-10 grid-cols-[42px_56px_42px] overflow-hidden rounded-[10px] border border-[#d8d8d8]">
      <button
        type="button"
        onClick={decr}
        disabled={value <= min}
        className="flex items-center justify-center text-lg font-bold text-primary transition-colors duration-100 active:bg-surface disabled:opacity-30"
        aria-label={`${ariaPrefix}減らす`}
      >
        −
      </button>
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          inputMode={allowDecimal ? "decimal" : "numeric"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setText(String(value));
              setEditing(false);
            }
          }}
          className="bg-inverse text-center text-base font-bold text-on-inverse outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="bg-inverse text-center text-base font-bold text-on-inverse transition-opacity active:opacity-80"
        >
          {value}
          {suffix && <span className="ml-0.5 text-xs font-normal text-on-inverse/60">{suffix}</span>}
        </button>
      )}
      <button
        type="button"
        onClick={incr}
        disabled={value >= max}
        className="flex items-center justify-center text-lg font-bold text-primary transition-colors duration-100 active:bg-surface disabled:opacity-30"
        aria-label={`${ariaPrefix}増やす`}
      >
        +
      </button>
    </div>
  );
}
