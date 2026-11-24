import { useState, useEffect, useRef } from 'react';
import { formatINR } from '../../utils/format';

/*
 * Smoothly counts from the previous value to the new value.
 * useRef keeps the last shown value between renders WITHOUT causing a re-render,
 * and also stores the animation frame id so it can be cancelled in cleanup.
 */
function AnimatedNumber({ value, format = formatINR, duration = 450 }) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);
  const frame = useRef(null);

  useEffect(() => {
    const from = previous.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = from + (to - from) * eased;
      setDisplay(current);
      previous.current = current;
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return <span className="tabular">{format(display)}</span>;
}

export default AnimatedNumber;
