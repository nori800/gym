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
}

/**
 * −[ 値 ]+ のStepper。
 * 中央の値をタップすると直接入力モードに切り替わる。
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
  allowDecimal = false,
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

  return (
    <div className="inline-flex h-9 items-stretch overflow-hidden rounded-[10px] bg-chip">
      <button
        type="button"
        onClick={decr}
        disabled={value <= min}
        className="flex w-9 items-center justify-center text-lg font-bold text-primary transition-all duration-100 active:bg-border disabled:opacity-30"
        aria-label="減らす"
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
          className="w-[52px] bg-white text-center text-[14px] font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-w-[52px] px-2 text-center text-[14px] font-bold text-primary transition-colors active:bg-border"
        >
          {value}
          {suffix && <span className="ml-0.5 text-[11px] font-normal text-secondary">{suffix}</span>}
        </button>
      )}
      <button
        type="button"
        onClick={incr}
        disabled={value >= max}
        className="flex w-9 items-center justify-center text-lg font-bold text-primary transition-all duration-100 active:bg-border disabled:opacity-30"
        aria-label="増やす"
      >
        +
      </button>
    </div>
  );
}
