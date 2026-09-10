"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown, ChevronUp, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { tracks } from "@/lib/data";

const STORAGE_KEY = "nessy-music-player";

function formatTime(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/**
 * Music player, two responsive themes sharing one open/audio state:
 * - Mobile (<sm): floating circle → full-width blurred bottom bar with
 *   spinning round art, amber progress, and transport controls.
 * - Desktop (sm+): compact floating pill (art + title + white play +
 *   equalizer + chevron) that expands into a small card with gradient
 *   progress bar, timestamps, and centered transport controls.
 * Both themes always render; CSS decides which is visible, so resizing
 * the window (or rotating a device) never unmounts the <audio> element
 * or interrupts playback.
 */
export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [open, setOpen] = useState(false);

  const track = tracks[index];

  /* ── Persistence: remember track + position across navigations ── */
  const pendingSeekRef = useRef<number | null>(null);
  const lastSaveRef = useRef(0);
  const mountedRef = useRef(false);
  const stateRef = useRef({ index, playing });

  // Keep the ref in sync after commit instead of writing it during render.
  // Declared first so it runs before the persist effect below reads it.
  useEffect(() => {
    stateRef.current = { index, playing };
  }, [index, playing]);

  const saveState = (force = false) => {
    const now = Date.now();
    if (!force && now - lastSaveRef.current < 3000) return;
    lastSaveRef.current = now;
    try {
      const { index: i, playing: p } = stateRef.current;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          index: i,
          // Keep the not-yet-applied restored position if one is pending.
          time: pendingSeekRef.current ?? audioRef.current?.currentTime ?? 0,
          playing: p,
        })
      );
    } catch {
      /* storage unavailable — ignore */
    }
  };

  // Restore the last session once on mount. Deferred to a microtask so the
  // setState calls don't fire synchronously inside the effect body.
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const s = JSON.parse(raw) as { index?: number; time?: number; playing?: boolean };
        if (Number.isInteger(s.index) && (s.index as number) >= 0 && (s.index as number) < tracks.length) {
          pendingSeekRef.current =
            Number.isFinite(s.time) && (s.time as number) > 0 ? (s.time as number) : null;
          setIndex(s.index as number);
          // Try to resume; if the browser blocks autoplay there is no gesture
          // yet, so we stay paused at the restored position until the user
          // hits play.
          if (s.playing) setPlaying(true);
        }
      } catch {
        /* corrupt or unavailable storage — start fresh */
      }
    });
  }, []);

  // Flush the exact position when the tab is hidden or closed.
  useEffect(() => {
    const onHide = () => saveState(true);
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  // Pause the music whenever any <video> on the page starts playing.
  // Media events don't bubble, so listen on the capture phase.
  useEffect(() => {
    const onMediaPlay = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (!el || el.tagName !== "VIDEO") return;
      if (stateRef.current.playing) {
        audioRef.current?.pause();
        setPlaying(false);
      }
    };
    document.addEventListener("play", onMediaPlay, true);
    return () => document.removeEventListener("play", onMediaPlay, true);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Don't zero the counter while a restored position is pending.
    if (pendingSeekRef.current == null) setCurrent(0);
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Persist on track / play-state changes (skip the very first mount run
  // so we don't overwrite the saved session before restoring it).
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    saveState(true);
  }, [index, playing]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const prev = () => setIndex((i) => (i - 1 + tracks.length) % tracks.length);
  const next = () => setIndex((i) => (i + 1) % tracks.length);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={track.src}
        preload="metadata"
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (!audio) return;
          setDuration(audio.duration ?? 0);
          // Jump back to the remembered position once the track is ready.
          const t = pendingSeekRef.current;
          if (t != null && Number.isFinite(audio.duration) && audio.duration > 0) {
            audio.currentTime = Math.min(t, Math.max(0, audio.duration - 0.5));
            setCurrent(audio.currentTime);
          }
          pendingSeekRef.current = null;
        }}
        onTimeUpdate={(e) => {
          setCurrent(e.currentTarget.currentTime);
          saveState(); // throttled to once every ~3s
        }}
        onEnded={next}
      />

      {/* ══ MOBILE (<sm) ════════════════════════════════════════ */}

      {/* Collapsed floating circle */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="collapsed-mobile"
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            onClick={() => setOpen(true)}
            aria-label="Open music player"
            className="h-[72px] w-[72px] overflow-hidden rounded-full border-2 border-hairline bg-surface shadow-lg shadow-black/40 sm:hidden bottom-6 left-6 fixed"
          >
            <Art src={track.art} className={`h-full w-full rounded-full ${playing ? "animate-[spin_8s_linear_infinite]" : ""}`} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Full-width blurred bottom bar */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop-mobile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-base/50 backdrop-blur-sm sm:hidden"
            />

            {/* Bottom bar */}
            <motion.div
              key="bar-mobile"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.12, duration: 0.5 }}
              className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface/95 px-5 pb-5 pt-4 shadow-2xl shadow-black/50 backdrop-blur-xl sm:hidden"
            >
              {/* Top row: art + info + play button */}
              <div className="flex items-center gap-4">
                {/* Spinning round album art */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-hairline shadow-md shadow-black/30">
                  <SpinWrap playing={playing}>
                    <Art src={track.art} className="rounded-full" />
                  </SpinWrap>
                </div>

                {/* Track info + equalizer */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold text-ink">{track.title}</p>
                    {playing && <EqBars />}
                  </div>
                  <p className="truncate text-xs text-muted">{track.artist}</p>
                </div>

                {/* Play/Pause */}
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={playing ? "Pause" : "Play"}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-base shadow-md shadow-accent/20 transition-colors hover:bg-accent-press"
                >
                  {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div
                  role="progressbar"
                  aria-label="Seek"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  onClick={seek}
                  className="group h-1 w-full cursor-pointer rounded-full bg-hairline"
                >
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted">
                  <span>{formatTime(current)}</span>
                  <span>-{formatTime(Math.max(0, duration - current))}</span>
                </div>
              </div>

              {/* Skip controls */}
              <div className="mt-2 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous track"
                  className="rounded-full p-1.5 text-muted transition-colors hover:text-accent"
                >
                  <SkipBack size={16} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next track"
                  className="rounded-full p-1.5 text-muted transition-colors hover:text-accent"
                >
                  <SkipForward size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ DESKTOP (sm+) ═══════════════════════════════════════ */}

      {/* Collapsed floating pill */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="pill-desktop"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            className="fixed bottom-8 left-8 z-40 hidden sm:block"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface/90 py-2 pl-2 pr-3 shadow-xl shadow-black/40 backdrop-blur-xl">
              {/* Square album art */}
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-hairline">
                <SpinWrap playing={playing}>
                  <Art src={track.art} />
                </SpinWrap>
              </div>

              {/* Title + artist + equalizer */}
              <div className="min-w-0 max-w-[110px]">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-bold leading-tight text-ink">
                    {track.title}
                  </p>
                  {playing && <EqBars />}
                </div>
                <p className="truncate text-[11px] leading-tight text-muted">
                  {track.artist}
                </p>
              </div>

              {/* Play/Pause — white circle */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-base shadow-md shadow-black/30 transition-transform hover:scale-105 active:scale-95"
              >
                {playing ? (
                  <Pause size={15} fill="currentColor" />
                ) : (
                  <Play size={15} fill="currentColor" className="ml-0.5" />
                )}
              </button>

              {/* Expand chevron */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Expand music player"
                className="rounded-full p-1 text-muted transition-colors hover:text-ink"
              >
                <ChevronUp size={14} strokeWidth={2.2} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded card */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="card-desktop"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="fixed bottom-8 left-8 z-40 hidden w-[340px] rounded-2xl border border-hairline bg-surface/90 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl sm:block"
          >
            {/* Header row: art + info + collapse */}
            <div className="flex items-center gap-3.5">
              {/* Square album art */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-hairline shadow-md shadow-black/30">
                <SpinWrap playing={playing}>
                  <Art src={track.art} />
                </SpinWrap>
              </div>

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-ink">{track.title}</p>
                <p className="truncate text-xs text-muted">{track.artist}</p>
              </div>

              {/* Collapse chevron */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Collapse music player"
                className="rounded-full p-1.5 text-muted transition-colors hover:text-ink"
              >
                <ChevronDown size={14} strokeWidth={2.2} />
              </button>
            </div>

            {/* Progress bar with times on both sides */}
            <div className="mt-4 flex items-center gap-2.5">
              <span className="text-[11px] tabular-nums text-muted">
                {formatTime(current)}
              </span>
              <div
                role="progressbar"
                aria-label="Seek"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                onClick={seek}
                className="h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-hairline"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet via-pink to-accent transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] tabular-nums text-muted">
                {formatTime(duration)}
              </span>
            </div>

            {/* Centered transport controls */}
            <div className="mt-4 flex items-center justify-center gap-7">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous track"
                className="rounded-full p-1.5 text-ink transition-colors hover:text-accent"
              >
                <SkipBack size={18} fill="currentColor" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-base shadow-lg shadow-black/30 transition-transform hover:scale-105 active:scale-95"
              >
                {playing ? (
                  <Pause size={17} fill="currentColor" />
                ) : (
                  <Play size={17} fill="currentColor" className="ml-0.5" />
                )}
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next track"
                className="rounded-full p-1.5 text-ink transition-colors hover:text-accent"
              >
                <SkipForward size={18} fill="currentColor" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Album art (hoisted: components created during render reset state) ── */

function Art({ src, className = "" }: { src: string; className?: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="72px"
      className={`object-cover ${className}`}
      onError={(e) => (e.currentTarget.style.opacity = "0.25")}
    />
  );
}

function SpinWrap({ playing, children }: { playing: boolean; children: React.ReactNode }) {
  return (
    <span className={playing ? "block animate-[spin_8s_linear_infinite]" : "block"}>
      {children}
    </span>
  );
}

/* ── Mini equalizer (shown in the pill while playing) ─────── */

function EqBars() {
  const bars = [
    { delay: "0s", height: "10px" },
    { delay: "0.25s", height: "12px" },
    { delay: "0.1s", height: "8px" },
    { delay: "0.35s", height: "11px" },
  ];
  return (
    <span aria-hidden className="flex h-3 shrink-0 items-end gap-[2px]">
      {bars.map((b, i) => (
        <span
          key={i}
          className="eq-bar w-[2.5px] rounded-full bg-accent"
          style={{ animationDelay: b.delay, height: b.height }}
        />
      ))}
    </span>
  );
}
