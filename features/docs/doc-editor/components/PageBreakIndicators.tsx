import React, { useEffect, useRef, useState } from "react";

export const PAGE_HEIGHT = 1369; // px (matches your CSS)

/**
 * Renders dashed lines at every A4 page boundary inside the editor container.
 * Usage: Place as a child of .editorContainer, passing the container's height.
 */
export function PageBreakIndicators({ containerRef, offsetTop = 0 }: { containerRef: React.RefObject<HTMLDivElement>, offsetTop?: number }) {
  const [containerHeight, setContainerHeight] = useState(0);
  const [topPadding, setTopPadding] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      setContainerHeight(containerRef.current!.scrollHeight);
      const style = window.getComputedStyle(containerRef.current!);
      setTopPadding(parseInt(style.paddingTop, 10) || 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [containerRef]);

  const breaks = [];
  // Subtract topPadding so breaks start after visible content area
  const numBreaks = Math.floor((containerHeight - topPadding) / PAGE_HEIGHT);
  for (let i = 1; i <= numBreaks; i++) {
    breaks.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: containerRef.current ? containerRef.current.offsetLeft : 0,
          width: containerRef.current ? containerRef.current.offsetWidth : '100%',
          top: topPadding + i * PAGE_HEIGHT + offsetTop - 1,
          height: 0,
          borderTop: "2px dashed #bbb",
          opacity: 0.5,
          pointerEvents: "none",
          zIndex: 10,
          background: 'transparent',
        }}
      />
    );
  }
  return <>{breaks}</>;
}
