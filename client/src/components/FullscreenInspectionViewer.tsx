import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type Point = { x: number; y: number };

export function FullscreenInspectionViewer({ open, onOpenChange, title, description, children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; children: ReactNode }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const zoomRef = useRef(1);
  const panRef = useRef<Point>({ x: 0, y: 0 });
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);
  const dragStart = useRef<{ point: Point; pan: Point } | null>(null);

  const resetViewer = () => {
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    pointers.current.clear();
    pinchStart.current = null;
    dragStart.current = null;
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const commitPan = (next: Point, atZoom = zoomRef.current) => {
    const stage = stageRef.current;
    const maxX = ((stage?.clientWidth ?? 0) * Math.max(0, atZoom - 1)) / 2;
    const maxY = ((stage?.clientHeight ?? 0) * Math.max(0, atZoom - 1)) / 2;
    const bounded = { x: Math.max(-maxX, Math.min(maxX, next.x)), y: Math.max(-maxY, Math.min(maxY, next.y)) };
    panRef.current = bounded;
    setPan(bounded);
  };
  const commitZoom = (next: number) => {
    const bounded = Math.max(1, Math.min(4, Number(next.toFixed(2))));
    zoomRef.current = bounded;
    setZoom(bounded);
    commitPan(bounded === 1 ? { x: 0, y: 0 } : panRef.current, bounded);
  };
  const pointerDistance = () => {
    const [first, second] = Array.from(pointers.current.values());
    return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0;
  };
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2) {
      pinchStart.current = { distance: pointerDistance(), zoom: zoomRef.current };
      dragStart.current = null;
    } else if (zoomRef.current > 1) {
      dragStart.current = { point: { x: event.clientX, y: event.clientY }, pan: panRef.current };
    }
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2 && pinchStart.current) {
      const distance = pointerDistance();
      if (distance > 0 && pinchStart.current.distance > 0) commitZoom(pinchStart.current.zoom * (distance / pinchStart.current.distance));
      return;
    }
    if (pointers.current.size === 1 && dragStart.current && zoomRef.current > 1) {
      commitPan({ x: dragStart.current.pan.x + event.clientX - dragStart.current.point.x, y: dragStart.current.pan.y + event.clientY - dragStart.current.point.y });
    }
  };
  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (pointers.current.size === 1 && zoomRef.current > 1) {
      dragStart.current = { point: Array.from(pointers.current.values())[0], pan: panRef.current };
    } else if (pointers.current.size === 0) {
      pinchStart.current = null;
      dragStart.current = null;
    }
  };

  return <Dialog open={open} onOpenChange={(next) => { if (!next) resetViewer(); onOpenChange(next); }}>
    <DialogContent className="artwork-fullscreen-dialog" showCloseButton={false}>
      <div className="artwork-fullscreen-header"><div><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></div><DialogClose className="artwork-fullscreen-close" aria-label="Close full-screen artwork viewer"><X size={20} /><span>Close</span></DialogClose></div>
      <div ref={stageRef} className={`artwork-fullscreen-canvas${zoom > 1 ? " is-zoomed" : ""}`} role="region" aria-label="Full-screen framed artwork viewer. Pinch with two fingers to zoom and drag to inspect the complete layout." onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={finishPointer} onPointerCancel={finishPointer} onDoubleClick={() => commitZoom(zoomRef.current > 1 ? 1 : 2)}><div className="artwork-fullscreen-content" style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}>{children}</div></div>
      <p className="artwork-fullscreen-hint">Pinch the complete framed layout with two fingers, then drag to inspect it. Double-tap resets the view.</p>
    </DialogContent>
  </Dialog>;
}
