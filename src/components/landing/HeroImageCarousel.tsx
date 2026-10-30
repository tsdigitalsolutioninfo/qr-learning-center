'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpenCheck, GraduationCap, Sparkles } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1560785477-d43d2b34e0df?auto=format&fit=crop&w=1400&q=85',
    alt: 'Student concentrating on a school book',
    eyebrow: 'JNV ENTRANCE PREPARATION',
    title: 'Build strong foundations for the next big step.',
    position: 'center 44%',
  },
  {
    image: 'https://images.unsplash.com/photo-1557989048-03456d01a26e?auto=format&fit=crop&w=1400&q=85',
    alt: 'Students learning together in a bright classroom',
    eyebrow: 'OAV PRACTICE EXAMS',
    title: 'Learn together. Grow with every practice.',
    position: 'center 48%',
  },
  {
    image: 'https://images.unsplash.com/photo-1573894998033-c0cef4ed722b?auto=format&fit=crop&w=1400&q=85',
    alt: 'School students focused on their classroom work',
    eyebrow: 'MOCK TESTS & GUIDANCE',
    title: 'Walk into exam day feeling ready.',
    position: 'center 44%',
  },
];

export default function HeroImageCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const goTo = (index: number) => setActive((index + slides.length) % slides.length);

  return (
    <section
      aria-label="Learning at QR Learning Center"
      aria-roledescription="carousel"
      className="relative mx-auto aspect-[.88] w-full max-w-[510px] overflow-hidden rounded-[2.25rem] bg-[#171957] shadow-[0_38px_80px_-38px_rgba(23,25,87,.48)] sm:aspect-[.98]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.eyebrow}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}: ${slide.eyebrow}`}
          aria-hidden={index !== active}
          className={`absolute inset-0 bg-cover transition-opacity duration-700 ${index === active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          style={{ backgroundImage: `linear-gradient(180deg, rgba(12,16,59,.06) 20%, rgba(12,16,59,.26) 47%, rgba(12,16,59,.93) 100%), url("${slide.image}")`, backgroundPosition: slide.position }}
        >
          <div className="absolute inset-0 bg-[#171957]/10" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-6 pb-16 text-white sm:p-9 sm:pb-[4.5rem]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#171957]/55 px-3 py-1.5 text-[10px] font-bold tracking-[.16em] text-[#f2df91] backdrop-blur-sm sm:text-[11px]">
              <Sparkles size={13} aria-hidden="true" /> {slide.eyebrow}
            </span>
            <h2 className="mt-4 max-w-[380px] text-3xl font-semibold leading-tight tracking-[-.035em] drop-shadow sm:text-[2.5rem]">{slide.title}</h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-white/80"><BookOpenCheck size={16} aria-hidden="true" /> Practice, guidance and support</p>
          </div>
        </div>
      ))}

      <span className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-[#171957]/55 text-[#f2df91] backdrop-blur-sm sm:right-7 sm:top-7">
        <GraduationCap size={23} aria-hidden="true" />
      </span>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-white/15 bg-[#11133f]/65 px-5 py-3 backdrop-blur-sm sm:px-7">
        <div className="flex items-center gap-1.5" aria-label="Choose hero image">
          {slides.map((slide, index) => (
            <button key={slide.eyebrow} type="button" aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`} aria-current={index === active ? 'true' : undefined} onClick={() => goTo(index)} className={`h-1.5 rounded-full transition-all ${index === active ? 'w-7 bg-[#ead37a]' : 'w-1.5 bg-white/55 hover:bg-white'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous hero image" onClick={() => goTo(active - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#ead37a]"><ArrowLeft size={15} aria-hidden="true" /></button>
          <button type="button" aria-label="Next hero image" onClick={() => goTo(active + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#ead37a]"><ArrowRight size={15} aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
}
