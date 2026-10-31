"use client";

import { useEffect, useId, useRef, useState } from "react";
export function ReviewText({ text, lines = 5 }: { text: string; lines?: 3 | 5 }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const paragraph = useRef<HTMLParagraphElement>(null);
  const id = useId();

  useEffect(() => {
    const element = paragraph.current;
    if (!element || expanded) return;
    const measure = () => setOverflows(element.scrollHeight > element.clientHeight + 1);
    let active = true;
    void document.fonts.ready.then(() => { if (active) measure(); });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => { active = false; observer.disconnect(); };
  }, [expanded, text]);

  return (
    <div data-carousel-expanded={expanded} className="text-base leading-7 text-body">
      <p ref={paragraph} id={id} className={expanded ? "" : lines === 3 ? "line-clamp-2 sm:line-clamp-3" : "line-clamp-4 sm:line-clamp-5"}>{text}</p>
      {(expanded || overflows) && (
        <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(!expanded)} className="mt-2 flex min-h-12 cursor-pointer items-center rounded-sm font-semibold text-accent underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-bronze-dark focus-visible:outline-offset-2">
          {expanded ? "Ler menos" : "Ler mais"}
        </button>
      )}
    </div>
  );
}
