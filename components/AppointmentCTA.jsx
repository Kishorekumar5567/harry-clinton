"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function AppointmentCTA() {
  return (
    <section className="w-full bg-[#fbfaf7] py-16 md:py-20 px-4 border-y border-neutral-200/60">
      <div className="max-w-2xl mx-auto text-center">
        <Reveal>
          <div className="relative bg-white border border-[#c6a15b]/30 shadow-[0_10px_35px_rgba(0,0,0,0.03)] p-8 sm:p-12 md:p-14 flex flex-col items-center">
            {/* Atelier Brand Monogram Seal */}
            <div className="mb-4 relative">
              <div className="w-14 h-14 rounded-full border border-[#c6a15b]/40 bg-[#fbfaf7] shadow-[0_2px_10px_rgba(198,161,91,0.15)] flex items-center justify-center p-2.5 mx-auto">
                <Image
                  src="/brand/logo-black.png"
                  alt="Harry Clinton Atelier"
                  width={42}
                  height={42}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Eyebrow with Tailored Hairlines */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="w-6 sm:w-8 h-[1px] bg-[#c6a15b]/40" />
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#c6a15b]">
                Bespoke Experience
              </span>
              <span className="w-6 sm:w-8 h-[1px] bg-[#c6a15b]/40" />
            </div>

            {/* Heading */}
            <h2 className="font-display text-[26px] sm:text-[30px] md:text-[32px] font-bold text-neutral-950 tracking-tight mb-3">
              Your Perfect Suit Awaits
            </h2>

            {/* Subtitle */}
            <p className="text-neutral-600 text-[14px] sm:text-[15px] leading-relaxed max-w-lg mx-auto mb-8 font-normal">
              Book a private consultation with our master tailors. We will guide you through fabric selection, measurements, and design — crafting a garment that is uniquely yours.
            </p>

            {/* Primary Action Button with Hover Flow */}
            <Link
              href="/book-appointment"
              className="group inline-flex items-center justify-center gap-2.5 bg-neutral-950 text-white hover:bg-[#c6a15b] hover:text-neutral-950 border border-neutral-950 hover:border-[#c6a15b] px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_rgba(198,161,91,0.3)] cursor-pointer mb-5"
            >
              <span>Book Your Appointment</span>
              <svg
                className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            {/* Direct Contact with Email Icon */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-neutral-500 text-[13px]">
              <span>Or reach us directly at</span>
              <a
                href="mailto:connect@harryclinton.com"
                className="text-[#a8823f] hover:text-neutral-950 font-semibold tracking-wide border-b border-[#a8823f]/50 hover:border-neutral-950 transition-colors inline-flex items-center gap-1 pb-0.5"
              >
                <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                connect@harryclinton.com
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
