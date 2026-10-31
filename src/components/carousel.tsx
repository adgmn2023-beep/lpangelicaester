"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const slides = Children.toArray(children);
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [pointerHeld, setPointerHeld] = useState(false);
  const resume = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const running = overflow && visible && !hidden && !reduced && !paused && !hovered && !focused && !expanded && !interacting && !pointerHeld;

  const interact = useCallback(() => {
    setInteracting(true);
    clearTimeout(resume.current);
    resume.current = setTimeout(() => setInteracting(false), 8_000);
  }, []);

  const move = useCallback((direction: number) => {
    const element = track.current;
    if (!element) return;
    const items = Array.from(element.children) as HTMLElement[];
    const position = element.scrollLeft;
    const step = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : element.clientWidth;
    const end = element.scrollWidth - element.clientWidth;
    const target = direction > 0 && position >= end - 2 ? 0 : direction < 0 && position <= 2 ? end : Math.max(0, Math.min(end, position + direction * step));
    element.scrollTo({ left: target, behavior: reduced ? "instant" : "smooth" });
  }, [reduced]);

  useEffect(() => {
    if (!pointerHeld) return;
    const release = () => { setPointerHeld(false); interact(); };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => { window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release); };
  }, [pointerHeld, interact]);

  useEffect(() => {
    const element = track.current;
    const region = root.current;
    if (!element || !region) return;
    const measure = () => setOverflow(element.scrollWidth > element.clientWidth + 2);
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    const intersection = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    intersection.observe(region);
    const expansion = new MutationObserver(() => setExpanded(!!region.querySelector('[data-carousel-expanded="true"]')));
    expansion.observe(region, { subtree: true, attributes: true, attributeFilter: ["data-carousel-expanded"] });
    const visibility = () => setHidden(document.hidden);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(preference.matches);
    visibility(); motion(); measure();
    document.addEventListener("visibilitychange", visibility);
    preference.addEventListener("change", motion);
    return () => {
      resize.disconnect(); intersection.disconnect(); expansion.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", motion);
      clearTimeout(resume.current);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => move(1), 5_000);
    return () => clearInterval(timer);
  }, [running, move]);

  return (
    <div ref={root} role="region" aria-roledescription="carousel" aria-label={label} className="min-w-0 max-w-full"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); interact(); }}
      onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(false); interact(); } }}
      onPointerDown={() => { setPointerHeld(true); interact(); }} onPointerUp={interact} onTouchMove={interact} onKeyDown={interact} onWheel={interact}>
      <div ref={track} className="carousel-track" aria-live={running ? "off" : "polite"} tabIndex={overflow ? 0 : -1}>
        {slides.map((slide, index) => <div key={index} className="carousel-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${slides.length}`}>{slide}</div>)}
      </div>
      <div className={`mt-4 flex min-h-12 justify-end gap-2 ${overflow ? "" : "invisible"}`} aria-hidden={!overflow}>
        <button type="button" className="carousel-control" aria-label="Anterior" tabIndex={overflow ? 0 : -1} onClick={() => { interact(); move(-1); }}>←</button>
        <button type="button" className="carousel-control px-4 text-sm" aria-label={reduced ? "Rotação desativada por preferência de movimento reduzido" : paused ? "Retomar rotação" : "Pausar rotação"} aria-pressed={paused || reduced} disabled={reduced} tabIndex={overflow ? 0 : -1} onClick={() => { setPaused(!paused); interact(); }}>{reduced ? "Rotação desativada" : paused ? "Retomar" : "Pausar"}</button>
        <button type="button" className="carousel-control" aria-label="Próximo" tabIndex={overflow ? 0 : -1} onClick={() => { interact(); move(1); }}>→</button>
      </div>
    </div>
  );
}
