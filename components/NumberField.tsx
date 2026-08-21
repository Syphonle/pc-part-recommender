"use client";

import { useState, type CSSProperties } from "react";

/**
 * A number input that tracks its own text while focused, instead of being tightly
 * bound to the parent's numeric state. A plain controlled <input type="number"> re-renders
 * with value={0} the instant the field is cleared (Number("") === 0), which snaps a
 * phantom "0" into the box mid-type and pushes subsequent digits after it. Buffering the
 * raw text locally avoids that, and only commits back up once it parses to a real number.
 */
export function NumberField({
  value,
  onChange,
  id,
  min,
  max,
  step,
  className,
  style,
}: {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [text, setText] = useState(String(value));
  // Resync the local text buffer when `value` changes from outside (e.g. a reset), without
  // clobbering it on every keystroke — adjusted during render per React's "you might not
  // need an effect" guidance, rather than in a useEffect (which would cause an extra render).
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setText(String(value));
  }

  return (
    <input
      id={id}
      type="number"
      min={min}
      max={max}
      step={step}
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw !== "" && !Number.isNaN(Number(raw))) {
          onChange(Number(raw));
        }
      }}
      onBlur={() => {
        if (text === "" || Number.isNaN(Number(text))) {
          setText(String(value));
        }
      }}
      className={className}
      style={style}
    />
  );
}
