import React, { useRef, useState } from 'react';

// Continuous slide indices keep edge cards moving in the same direction.
export default function FeatureCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const pointer = useRef(null);
  const suppressClick = useRef(0);
  const count = items.length;
  const current = ((index % count) + count) % count;
  const select = (next) => { setIndex(next); setDrag(0); };
  const release = (event, cancelled = false) => {
    const start = pointer.current;
    pointer.current = null;
    if (start?.horizontal) {
      const distance = event.clientX - start.x;
      const velocity = Math.abs(distance) / Math.max(1, performance.now() - start.time);
      if (!cancelled && (Math.abs(distance) > 45 || (Math.abs(distance) > 14 && velocity > .35))) {
        setIndex(value => value + (distance < 0 ? 1 : -1));
      }
      suppressClick.current = performance.now() + 300;
    }
    setDrag(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return <div className="showcase-row feature-coverflow" role="region" aria-roledescription="carousel" aria-label="UniGuide features" tabIndex={0}
    onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); select(index + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); select(index - 1); }
      if (event.key === 'Home') { event.preventDefault(); select(index - current); }
      if (event.key === 'End') { event.preventDefault(); select(index + count - 1 - current); }
    }}
    onPointerDown={event => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      pointer.current = { x:event.clientX, y:event.clientY, time:performance.now(), horizontal:false };
    }}
    onPointerMove={event => {
      const start = pointer.current;
      if (!start) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (!start.horizontal && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { pointer.current = null; return; }
      if (!start.horizontal && Math.abs(dx) > 8) { start.horizontal = true; event.currentTarget.setPointerCapture(event.pointerId); }
      if (start.horizontal) setDrag(Math.max(-1.2, Math.min(1.2, dx / (event.currentTarget.clientWidth * .2))));
    }}
    onPointerUp={event => release(event)} onPointerCancel={event => release(event, true)}>
    {Array.from({ length:9 }, (_, slot) => index + slot - 4).map(slide => {
      const item = items[((slide % count) + count) % count];
      const offset = slide - index;
      const position = offset + drag;
      const distance = Math.min(Math.abs(position), 3);
      const visible = Math.abs(offset) <= 2;
      return <button key={slide} type="button" className="hero-carousel-card coverflow-slide" aria-hidden={!visible} tabIndex={offset === 0 ? 0 : -1} aria-pressed={offset === 0}
        aria-label={`${item.title}, ${offset === 0 ? 'selected' : 'move to center'}`}
        onClick={() => { if (performance.now() >= suppressClick.current) select(slide); }}
        style={{background:item.color, color:item.textColor || '#fff', '--slide-x':position, '--slide-z':`${-distance * 130}px`, '--slide-rotation':`${-Math.max(-42,Math.min(42,position * 30))}deg`, '--slide-scale':1.12-Math.min(distance, 1)*.12-distance*.08, opacity:visible?1:0, zIndex:10-Math.abs(offset), pointerEvents:visible?'auto':'none', transition:drag?'none':undefined, filter:`brightness(${1-distance*.09})`}}>
        <img src={item.src} alt="" draggable={false}/><div><span>{item.title}</span><strong>{item.subtitle}</strong></div>
      </button>;
    })}
    <span className="carousel-announcement" aria-live="polite">{items[current].title}, {current+1} of {count}</span>
  </div>;
}
