'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpenCheck, ClipboardCheck, GraduationCap } from 'lucide-react';

const slides = [
  {
    tag: 'JNV entrance exam',
    title: 'Get ready for your JNV entrance exam',
    detail: 'Focused practice and guidance for Classes 4 and 5',
    icon: GraduationCap,
    accent: 'bg-[#d3b13b] text-[#171957]',
  },
  {
    tag: 'OAV practice exam',
    title: 'Build confidence with OAV practice',
    detail: 'Prepare for Odisha Adarsha Vidyalaya admission',
    icon: BookOpenCheck,
    accent: 'bg-[#c5d9c7] text-[#214b33]',
  },
  {
    tag: 'Mock test series',
    title: 'Practice under exam-style conditions',
    detail: 'Use mock tests to strengthen your preparation',
    icon: ClipboardCheck,
    accent: 'bg-[#e9c3a4] text-[#72421f]',
  },
];

export default function ExamBannerCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = slides[active];
  const Icon = slide.icon;
  const goTo = (index: number) => setActive((index + slides.length) % slides.length);

  return (
    <section
      aria-label="Exam announcements"
      aria-roledescription="carousel"
      className="relative w-full bg-[#171957] text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="mx-auto flex min-h-[104px] max-w-7xl items-center gap-3 px-4 py-3 sm:min-h-[96px] sm:gap-5 sm:px-8">
        <span className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:flex ${slide.accent}`}>
          <Icon size={23} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1" aria-live="polite" aria-atomic="true">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#ead37a] sm:text-[11px]">{slide.tag}</span>
            <span className="h-px w-7 bg-white/25" aria-hidden="true" />
            <span className="text-[10px] text-white/50">{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          </div>
          <p className="mt-1 truncate text-sm font-semibold sm:text-base">{slide.title}</p>
          <p className="mt-0.5 truncate text-xs text-white/60 sm:text-sm">{slide.detail}</p>
        </div>
        <a href="#services" className="hidden shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#171957] transition hover:bg-[#f3e6a9] focus:outline-none focus:ring-4 focus:ring-white/20 sm:inline-flex">
          Explore preparation <ArrowRight size={15} aria-hidden="true" />
        </a>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" aria-label="Previous announcement" onClick={() => goTo(active - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ead37a]">
            <ArrowLeft size={15} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Next announcement" onClick={() => goTo(active + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ead37a]">
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 pb-1" aria-label="Choose announcement">
        {slides.map((item, index) => (
          <button
            key={item.tag}
            type="button"
            aria-label={`Show ${item.tag}`}
            aria-current={index === active ? 'true' : undefined}
            onClick={() => goTo(index)}
            className={`h-1 rounded-full transition-all ${index === active ? 'w-7 bg-[#d3b13b]' : 'w-2 bg-white/35 hover:bg-white/65'}`}
          />
        ))}
      </div>
    </section>
  );
}
