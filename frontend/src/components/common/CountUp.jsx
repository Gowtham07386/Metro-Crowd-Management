import { useEffect, useRef, useState } from "react";

/** Lightweight count-up animation for KPI numbers — no extra dependency. */
export default function CountUp({ value, duration = 900, formatter = (v) => Math.round(v).toLocaleString("en-IN") }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    let frame;

    function step(timestamp) {
      if (startRef.current === null) startRef.current = timestamp;
      const progress = Math.min(1, (timestamp - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(fromRef.current + (value - fromRef.current) * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <>{formatter(display)}</>;
}
