"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";

const FRAME_COUNT = 120;

/** Resolve frame URL — prefer .jpg (shipped), fall back to .webp per spec. */
function frameCandidates(index: number): string[] {
  return [`/sequence/frame_${index}.jpg`, `/sequence/frame_${index}.webp`];
}

function loadImageWithFallback(index: number): Promise<HTMLImageElement> {
  const [first, second] = frameCandidates(index);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority =
      index < 8 ? "high" : "low";
    img.onload = () => resolve(img);
    img.onerror = () => {
      if (second) {
        const retry = new Image();
        retry.decoding = "async";
        retry.onload = () => resolve(retry);
        retry.onerror = () => reject(new Error(`Failed to load frame ${index}`));
        retry.src = second;
      } else {
        reject(new Error(`Failed to load frame ${index}`));
      }
    };
    img.src = first;
  });
}

/** Draw with "contain" fit, centered, DPR-aware. Seamless on #000000. */
function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvas: HTMLCanvasElement
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  if (canvas.width !== Math.floor(cw * dpr) || canvas.height !== Math.floor(ch * dpr)) {
    canvas.width = Math.floor(cw * dpr);
    canvas.height = Math.floor(ch * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, cw, ch);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  const scale = Math.min(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function useBeatOpacity(progress: MotionValue<number>, start: number, end: number) {
  return useTransform(progress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
}

function useBeatY(
  progress: MotionValue<number>,
  start: number,
  end: number
): MotionValue<number> {
  return useTransform(progress, [start, end], [20, -20]);
}

export default function CoffeeCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    Array(FRAME_COUNT).fill(null)
  );
  const currentFrameRef = useRef(-1);

  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.4,
  });

  // Text beats — timing per spec (fade in over first 10% of range,
  // stay, fade out over last 10%). Beat A is the hero: visible on load.
  const opacityA = useTransform(smooth, [0, 0.13, 0.17, 0.24], [1, 1, 0, 0]);
  const yA = useTransform(smooth, [0, 0.2], [0, -40]);

  const opacityB = useBeatOpacity(smooth, 0.25, 0.45);
  const yB = useBeatY(smooth, 0.25, 0.45);

  const opacityC = useBeatOpacity(smooth, 0.5, 0.7);
  const yC = useBeatY(smooth, 0.5, 0.7);

  const opacityD = useBeatOpacity(smooth, 0.75, 0.97);
  const yD = useBeatY(smooth, 0.75, 0.97);

  const hintOpacity = useTransform(smooth, [0, 0.1], [1, 0]);
  const progressBarScale = useTransform(smooth, [0, 1], [0, 1]);

  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawContain(ctx, img, canvas);
    currentFrameRef.current = index;
  }, []);

  // Preload all frames with progress
  useEffect(() => {
    let cancelled = false;

    const preload = async () => {
      // Load first frame immediately for instant paint
      try {
        const first = await loadImageWithFallback(0);
        if (cancelled) return;
        imagesRef.current[0] = first;
        setLoaded(1);
        renderFrame(0);
      } catch {
        /* continue — retry loop below */
      }

      // Load the rest concurrently in small batches for throughput + progress
      const BATCH = 8;
      for (let start = 1; start < FRAME_COUNT; start += BATCH) {
        if (cancelled) return;
        const batch: Promise<void>[] = [];
        for (
          let i = start;
          i < Math.min(start + BATCH, FRAME_COUNT);
          i++
        ) {
          if (imagesRef.current[i]) continue;
          batch.push(
            loadImageWithFallback(i)
              .then((img) => {
                imagesRef.current[i] = img;
              })
              .catch(() => {
                imagesRef.current[i] = imagesRef.current[i - 1] ?? imagesRef.current[0];
              })
              .finally(() => {
                if (!cancelled) {
                  setLoaded((prev) => {
                    const next = prev + 1;
                    return next;
                  });
                }
              })
          );
        }
        await Promise.all(batch);
        // Re-paint current position as more frames arrive
        if (!cancelled && currentFrameRef.current < 0) renderFrame(0);
      }

      if (!cancelled) {
        setLoaded(FRAME_COUNT);
        // Small delay for buttery reveal
        requestAnimationFrame(() => {
          if (!cancelled) setReady(true);
        });
      }
    };

    preload();
    return () => {
      cancelled = true;
    };
  }, [renderFrame]);

  // Scroll-driven render (synchronous inside framer's frameloop change
  // handler, so the canvas frame and the text-beat opacity update in the
  // SAME frame — the next element can never lag behind the scroll).
  useEffect(() => {
    const drawForProgress = (v: number) => {
      const clamped = Math.min(0.9999, Math.max(0, v));
      const index = Math.min(
        FRAME_COUNT - 1,
        Math.floor(clamped * FRAME_COUNT)
      );
      if (index !== currentFrameRef.current) {
        if (imagesRef.current[index]) {
          renderFrame(index);
        } else {
          // Fallback: nearest loaded frame below → never a blank flash
          let fallback = index;
          while (fallback > 0 && !imagesRef.current[fallback]) fallback--;
          if (imagesRef.current[fallback]) renderFrame(fallback);
        }
      }
    };

    const unsub = smooth.on("change", drawForProgress);

    const handleResize = () => {
      if (currentFrameRef.current >= 0) {
        renderFrame(currentFrameRef.current);
      } else {
        renderFrame(0);
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Initial paint once mounted
    handleResize();

    return () => {
      unsub();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      imagesRef.current = Array(FRAME_COUNT).fill(null);
    };
  }, [smooth, renderFrame]);

  const progressPct = Math.round((loaded / FRAME_COUNT) * 100);

  return (
    <div ref={wrapperRef} className="relative h-[400vh] bg-black">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-label="Iced latte assembling as you scroll"
        />

        {/* Cinematic vignette — keeps edges invisible on pure black */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 75% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Scroll progress hairline */}
        <motion.div
          className="absolute left-0 top-0 h-[2px] w-full origin-left bg-[#D4AF37]/80"
          style={{ scaleX: progressBarScale }}
        />

        {/* ——— Beat A ——— */}
        <motion.div
          style={{ opacity: opacityA, y: yA }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-start pt-[9vh] px-6 text-center"
        >
          {/* legibility scrim so type never collides with the cup */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[42vh]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)",
            }}
          />
          <p className="eyebrow text-[#D4AF37] mb-4 sm:mb-5 relative">Latte Soul · Hamden, CT</p>
          <h1 className="relative font-semibold tracking-tight text-white/90 leading-[0.95] text-5xl sm:text-7xl md:text-8xl lg:text-9xl">
            THE ART
            <br />
            OF THE POUR
          </h1>
          <p className="relative mt-5 sm:mt-6 max-w-xl text-sm sm:text-lg text-white/60 font-light leading-relaxed">
            Elevating your daily ritual into a cinematic experience.
          </p>
        </motion.div>

        {/* ——— Beat B ——— */}
        <motion.div
          style={{ opacity: opacityB, y: yB }}
          className="pointer-events-none absolute inset-0 flex items-start px-6 pt-[11vh] sm:items-center sm:px-12 sm:pt-0 lg:px-24"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[42vh] sm:hidden"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)",
            }}
          />
          <div className="relative max-w-md text-left">
            <p className="eyebrow text-[#D4AF37] mb-3 sm:mb-4">01 — Intensity</p>
            <h2 className="font-semibold tracking-tight text-white/90 leading-none text-4xl sm:text-6xl md:text-7xl">
              PURE
              <br />
              INTENSITY
            </h2>
            <p className="mt-4 sm:mt-5 text-sm sm:text-base text-white/60 font-light leading-relaxed">
              Single-origin espresso cascades through pure, slow-melting ice.
            </p>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-white/40 font-light leading-relaxed">
              The espresso swirls deep into chilled milk — condensation forming
              on the clear cup.
            </p>
          </div>
        </motion.div>

        {/* ——— Beat C ——— */}
        <motion.div
          style={{ opacity: opacityC, y: yC }}
          className="pointer-events-none absolute inset-0 flex items-start justify-start px-6 pt-[11vh] sm:items-center sm:justify-end sm:px-12 sm:pt-0 lg:px-24"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[42vh] sm:hidden"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)",
            }}
          />
          <div className="relative max-w-md text-left sm:text-right">
            <p className="eyebrow text-[#D4AF37] mb-3 sm:mb-4">02 — Finish</p>
            <h2 className="font-semibold tracking-tight text-white/90 leading-none text-4xl sm:text-6xl md:text-7xl">
              THE GOLDEN
              <br />
              TOUCH
            </h2>
            <p className="mt-4 sm:mt-5 text-sm sm:text-base text-white/60 font-light leading-relaxed">
              Finished with hand-placed edible gold leaf and a delicate twist
              of fresh orange peel.
            </p>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-white/40 font-light leading-relaxed">
              The light catches the textured garnish on the pristine lid.
            </p>
          </div>
        </motion.div>

        {/* ——— Beat D ——— */}
        <motion.div
          style={{ opacity: opacityD, y: yD }}
          className="absolute inset-0 flex flex-col items-center justify-end pb-[10vh] px-6 text-center"
        >
          <p className="eyebrow text-[#D4AF37] mb-4">03 — Indulge</p>
          <h2 className="font-semibold tracking-tight text-white/90 leading-none text-5xl sm:text-7xl md:text-8xl">
            TASTE THE LUXURY
          </h2>
          <p className="mt-4 text-white/60 font-light">
            Experience the premium artisan latte.
          </p>
          <div className="pointer-events-auto mt-8 flex flex-col sm:flex-row items-center gap-4">
            <a
              href="#visit"
              className="gold-glow rounded-full bg-[#D4AF37] px-8 py-3.5 text-sm font-semibold tracking-wide text-black transition-all duration-300 hover:bg-[#E8C86A]"
            >
              VISIT LATTE SOUL
            </a>
            <a
              href="#menu"
              className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium tracking-wide text-white/80 transition-all duration-300 hover:border-[#D4AF37]/60 hover:text-white"
            >
              EXPLORE MENU
            </a>
          </div>
        </motion.div>

        {/* Scroll to Pour hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[11px] tracking-[0.3em] text-white/50 font-medium">
            SCROLL TO POUR
          </span>
          <div className="animate-float-hint flex h-10 w-6 justify-center rounded-full border border-white/25 pt-2">
            <div className="h-2 w-1 rounded-full bg-[#D4AF37]" />
          </div>
        </motion.div>

        {/* Loading overlay */}
        {!ready && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
            <div className="animate-spin-slow mb-8 h-10 w-10 rounded-full border border-white/10 border-t-[#D4AF37]" />
            <p className="eyebrow text-white/40 mb-2">Brewing experience</p>
            <p className="text-5xl font-semibold tracking-tight text-white/90 tabular-nums">
              {progressPct}
              <span className="text-[#D4AF37]">%</span>
            </p>
            <div className="mt-6 h-[2px] w-56 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-200 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-4 text-xs text-white/30 font-light">
              Preloading {FRAME_COUNT} cinematic frames…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
