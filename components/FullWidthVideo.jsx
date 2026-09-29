"use client";

import { useEffect, useRef, useState } from "react";
import { apiCached, resolveUploadUrl } from "@/lib/api";

// Homepage video section (tbl_menu_videos) — full-viewport, video-only.
// Sits below the running bar. Renders EVERY active row in display_order:
// autoplay / loop / mute_default honored per row, poster before load,
// play-pause + mute controls per screen, prev/next chevrons between screens
// (hero-style, only when 2+ videos).
const on = (v) => v === 1 || v === true;

function VideoScreen({ row, index, total, screenRef, onNav }) {
  const ref = useRef(null);
  const [muted, setMuted] = useState(!row.muteOff);
  const [playing, setPlaying] = useState(!!row.autoplay);
  const [failed, setFailed] = useState(false);

  const toggleMute = (e) => {
    e.stopPropagation();
    const v = ref.current;
    const next = !muted;
    setMuted(next);
    if (v) v.muted = next;
  };

  const togglePlay = (e) => {
    e?.stopPropagation?.();
    const v = ref.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      v.play().catch(() => {});
      setPlaying(true);
    }
  };

  if (failed) return null;
  return (
    <div
      ref={screenRef}
      className="video-section group/vscreen relative w-full overflow-hidden bg-black"
    >
      <video
        ref={ref}
        src={row.src}
        poster={row.poster || undefined}
        className="responsive-video w-full h-auto block object-cover aspect-video md:aspect-auto md:max-h-[85vh] cursor-pointer"
        autoPlay={row.autoplay}
        muted={!row.muteOff}
        loop={row.loop}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />
      <div className="absolute bottom-2.5 right-2.5 md:bottom-4 md:right-4 flex items-center gap-2 z-10">
        <button
          type="button"
          aria-label={playing ? "Pause video" : "Play video"}
          onClick={togglePlay}
          className="video-ctrl-btn flex h-7 w-7 md:h-9 md:w-9 items-center justify-center border border-white/20 bg-black/60 text-white backdrop-blur-sm transition-all hover:border-[#c6a15b] hover:bg-[#c6a15b] hover:text-black shadow-md cursor-pointer"
        >
          <i className={`bi ${playing ? "bi-pause-fill" : "bi-play-fill"} text-xs md:text-sm leading-none`} />
        </button>
        <button
          type="button"
          aria-label={muted ? "Unmute video" : "Mute video"}
          onClick={toggleMute}
          className="video-ctrl-btn flex h-7 w-7 md:h-9 md:w-9 items-center justify-center border border-white/20 bg-black/60 text-white backdrop-blur-sm transition-all hover:border-[#c6a15b] hover:bg-[#c6a15b] hover:text-black shadow-md cursor-pointer"
        >
          <i className={`bi ${muted ? "bi-volume-mute-fill" : "bi-volume-up-fill"} text-xs md:text-sm leading-none`} />
        </button>
      </div>
      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous video"
            onClick={(e) => {
              e?.stopPropagation?.();
              onNav(-1);
            }}
            className="video-ctrl-btn absolute left-3 md:left-5 top-1/2 flex h-8 w-8 md:h-10 md:w-10 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:border-[#c6a15b] hover:bg-[#c6a15b] hover:text-black focus-visible:opacity-100 group-hover/vscreen:opacity-100 z-10 cursor-pointer"
          >
            <i className="bi bi-chevron-left text-xs md:text-sm leading-none" />
          </button>
          <button
            type="button"
            aria-label="Next video"
            onClick={(e) => {
              e?.stopPropagation?.();
              onNav(1);
            }}
            className="video-ctrl-btn absolute right-3 md:right-5 top-1/2 flex h-8 w-8 md:h-10 md:w-10 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:border-[#c6a15b] hover:bg-[#c6a15b] hover:text-black focus-visible:opacity-100 group-hover/vscreen:opacity-100 z-10 cursor-pointer"
          >
            <i className="bi bi-chevron-right text-xs md:text-sm leading-none" />
          </button>
        </>
      )}
    </div>
  );
}

const isUnrelatedVideo = (url) => {
  if (!url) return true;
  const s = String(url).toLowerCase();
  return (
    s.includes("example.com") ||
    s.includes("w3schools") ||
    s.includes("mov_bbb") ||
    s.includes("bunny") ||
    s.includes("sample") ||
    s.includes("test")
  );
};

export default function FullWidthVideo() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const screensRef = useRef([]);

  useEffect(() => {
    let live = true;
    apiCached("/Menu-Video")
      .then((data) => {
        const list = (Array.isArray(data) ? data : [])
          .filter((v) => on(v.isactive ?? v.is_active) && !v.isdeleted && v.video_url)
          .filter((v) => !isUnrelatedVideo(v.video_url))
          .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0))
          .map((v) => ({
            id: v.menu_video_id,
            src: resolveUploadUrl(v.video_url),
            poster: resolveUploadUrl(v.poster_image_url) || "",
            autoplay: v.autoplay === 0 || v.autoplay === false ? false : true,
            loop: v.loop_video === 0 || v.loop_video === false ? false : true,
            muteOff: v.mute_default === 0 || v.mute_default === false,
          }))
          .filter((v) => v.src && !isUnrelatedVideo(v.src));
        if (live && list.length > 0) setRows(list);
        else if (live) {
          // Fallback to client luxury menswear video
          setRows([{
            id: 'local-luxury',
            src: '/brand/luxury-wedding-home.mp4',
            poster: '',
            autoplay: true,
            loop: true,
            muteOff: false,
          }]);
        }
      })
      .catch(() => {
        // Fallback to client luxury menswear video
        if (live) setRows([{
          id: 'local-luxury',
          src: '/brand/luxury-wedding-home.mp4',
          poster: '',
          autoplay: true,
          loop: true,
          muteOff: false,
        }]);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  if (loading) return null;
  if (rows.length === 0) return null;
  const goScreen = (from, dir) => {
    const el = screensRef.current[(from + dir + rows.length) % rows.length];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <>
      {rows.map((r, i) => (
        <VideoScreen
          key={r.id}
          row={r}
          index={i}
          total={rows.length}
          screenRef={(el) => {
            screensRef.current[i] = el;
          }}
          onNav={(dir) => goScreen(i, dir)}
        />
      ))}
    </>
  );
}
