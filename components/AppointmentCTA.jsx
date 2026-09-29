"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function AppointmentCTA() {
  return (
    <section className="w-full bg-[#fbfaf7] py-20 md:py-24 px-4 border-y border-neutral-200/60">
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        <Reveal>
          <div className="flex flex-col items-center">
            {/* Atelier Brand Monogram */}
            <div className="mb-5">
              <Image
                src="/brand/logo-black.png"
                alt="Harry Clinton"
                width={56}
                height={56}
                className="object-contain mx-auto"
              />
            </div>

            {/* Eyebrow */}
            <span className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#c6a15b] block mb-2">
              Bespoke Experience
            </span>

            {/* Heading */}
            <h2 className="font-display text-[28px] md:text-[32px] font-bold text-neutral-950 tracking-tight mb-4">
              Your Perfect Suit Awaits
            </h2>

            {/* Subtitle */}
            <p className="text-neutral-600 text-[15px] leading-relaxed max-w-xl mx-auto mb-8 font-normal">
              Book a private consultation with our master tailors. We will guide you through fabric selection, measurements, and design — crafting a garment that is uniquely yours.
            </p>

            {/* Primary Action Button */}
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center gap-2 bg-neutral-950 text-white hover:bg-[#c6a15b] hover:text-neutral-950 px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-sm hover:shadow cursor-pointer mb-6"
            >
              <span>Book Your Appointment</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            {/* Direct Contact */}
            <p className="text-neutral-500 text-[13px]">
              Or reach us directly at{" "}
              <a
                href="mailto:connect@harryclinton.com"
                className="text-[#c6a15b] hover:text-neutral-950 font-bold underline underline-offset-4 transition-colors duration-200"
              >
                connect@harryclinton.com
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
