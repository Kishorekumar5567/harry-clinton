"use client";

import { useState } from "react";

// Toggle switch: same behavior as the previous UI.
export default function ActiveToggle({ active, onToggle }) {
  const [busy, setBusy] = useState(false);
  const on = active === true || active === 1;

  const click = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await onToggle(!on);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={click}
      disabled={busy}
      aria-pressed={on}
      title={on ? "Active — click to deactivate" : "Inactive — click to activate"}
      className={`relative inline-flex h-7 w-[68px] shrink-0 items-center rounded-full px-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 ${
        on ? "justify-end bg-emerald-600" : "justify-start bg-red-600"
      } ${busy ? "cursor-wait opacity-50" : ""}`}
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {on ? "ON" : "OFF"}
      </span>
      <span className="relative z-10 h-5 w-5 rounded-full bg-white shadow-md transition-transform" />
    </button>
  );
}
