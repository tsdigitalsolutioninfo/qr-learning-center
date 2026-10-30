import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Mail,
  MapPin,
  NotebookPen,
  Phone,
  Sparkles,
} from 'lucide-react';

const services = [
  {
    number: '01',
    title: 'JNV Entrance Exam Practice',
    detail: 'Build confidence for Jawahar Navodaya Vidyalaya entrance exams with focused practice for Class 4 and 5 students.',
    icon: BookOpenCheck,
    tone: 'bg-[#f5edcf] text-[#7b6415]',
  },
  {
    number: '02',
    title: 'OAV Entrance Exam Practice',
    detail: 'Get ready for Odisha Adarsha Vidyalaya entrance exams with practice tests and helpful learning support.',
    icon: GraduationCap,
    tone: 'bg-[#e9edff] text-[#343c83]',
  },
  {
    number: '03',
    title: 'Online Application Assistance',
    detail: 'Get guidance through the online application process, from filling out the form to submitting it.',
    icon: ClipboardCheck,
    tone: 'bg-[#e4f2e7] text-[#34714a]',
  },
  {
    number: '04',
    title: 'Admit Card & Study Materials',
    detail: 'Find support accessing your admit card and useful study materials to keep preparation on track.',
    icon: FileCheck2,
    tone: 'bg-[#f7e9e3] text-[#a45736]',
  },
];

const reasons = [
  'Regular practice examinations',
  'Support for JNV and OAV aspirants',
  'Online application guidance',
  'Admit card and study material support',
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#fbfaf6] text-[#20213f]">
      <header className="relative z-10 border-b border-[#e9e4cf] bg-[#fbfaf6]/95">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <Link href="/" aria-label="QR Learning Center home" className="flex shrink-0 items-center gap-3">
            <Image src="/brand-logo.png" alt="" width={48} height={48} priority className="h-11 w-11 object-contain" />
            <span className="text-sm font-bold leading-tight tracking-tight text-[#171957] sm:text-base">
              QR Learning Center
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">Deogarh, Odisha</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium text-neutral-600 md:flex">
            <a className="transition hover:text-[#171957]" href="#about">About</a>
            <a className="transition hover:text-[#171957]" href="#services">Our Services</a>
            <a className="transition hover:text-[#171957]" href="#why-us">Why Choose Us</a>
            <a className="transition hover:text-[#171957]" href="#contact">Contact</a>
          </nav>

          <Link href="/login" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ded8bf] bg-white px-4 text-sm font-semibold text-[#171957] transition hover:border-[#c8b66e] hover:bg-[#fcfaef]">
            Staff login <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <nav aria-label="Mobile navigation" className="flex items-center justify-center gap-5 overflow-x-auto border-t border-[#e9e4cf]/80 px-4 py-2.5 text-xs font-medium text-neutral-600 md:hidden">
          <a className="shrink-0" href="#about">About</a>
          <a className="shrink-0" href="#services">Services</a>
          <a className="shrink-0" href="#why-us">Why choose us</a>
          <a className="shrink-0" href="#contact">Contact</a>
        </nav>
      </header>

      <section className="relative isolate">
        <div aria-hidden="true" className="absolute -right-36 -top-32 -z-10 h-[35rem] w-[35rem] rounded-full bg-[#f2e8c1]/55 blur-3xl" />
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e8dfbd] bg-white/80 px-3.5 py-2 text-xs font-semibold tracking-wide text-[#6c5818] shadow-sm">
              <Sparkles size={14} aria-hidden="true" /> Your preparation partner
            </span>
            <h1 className="mt-7 text-[2.8rem] font-semibold leading-[1.06] tracking-[-0.045em] text-[#171957] sm:text-6xl lg:text-[4.25rem]">
              Big goals start with <span className="text-[#a88925]">the right preparation.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
              Helping students prepare for Jawahar Navodaya Vidyalaya (JNV) and Odisha Adarsha Vidyalaya (OAV) entrance examinations with practice, guidance and support.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#services" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d3b13b] px-6 text-sm font-semibold text-[#171957] shadow-[0_12px_24px_-14px_rgba(115,91,16,.6)] transition hover:bg-[#e0c65c] focus:outline-none focus:ring-4 focus:ring-[#d3b13b]/25">
                Explore Our Services <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#ded8bf] bg-white/80 px-6 text-sm font-semibold text-[#171957] transition hover:border-[#c8b66e] hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#171957]/10">
                Contact Us
              </a>
            </div>
            <div className="mt-10 flex items-center gap-3 text-sm text-neutral-500">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2edda] text-[#80691c]"><MapPin size={16} aria-hidden="true" /></span>
              Supporting students and families in Deogarh, Odisha
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[500px]">
            <div aria-hidden="true" className="absolute -left-7 top-16 h-28 w-28 rounded-full border border-[#d6c477]/70" />
            <div aria-hidden="true" className="absolute -bottom-5 -right-4 h-40 w-40 rounded-full bg-[#dfe8dc] opacity-70" />
            <div className="relative rounded-[2rem] border border-[#e9e4cf] bg-white p-3 shadow-[0_32px_80px_-40px_rgba(23,25,87,.34)] sm:p-5">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-[#171957] p-6 text-white sm:p-8">
                <div aria-hidden="true" className="absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />
                <div aria-hidden="true" className="absolute -right-1 -top-5 h-32 w-32 rounded-full border border-white/10" />
                <div className="relative flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-[#ead37a]">
                    <Sparkles size={13} aria-hidden="true" /> Learn with confidence
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d3b13b] text-[#171957]">
                    <GraduationCap size={21} aria-hidden="true" />
                  </span>
                </div>
                <p className="relative mt-11 max-w-xs text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Your next chapter begins here.</p>
                <p className="relative mt-3 max-w-xs text-sm leading-6 text-white/65">Practice, prepare and take the next step toward a brighter future.</p>

                <div className="relative mt-8 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2edda] text-[#80691c]"><NotebookPen size={21} aria-hidden="true" /></span>
                    <div>
                      <p className="text-sm font-semibold">Entrance exam preparation</p>
                      <p className="mt-1 text-xs text-white/55">JNV &amp; OAV • Classes 4 &amp; 5</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-2" aria-label="Practice, guidance and learning resources">
                    <span className="h-1.5 flex-1 rounded-full bg-[#d3b13b]" />
                    <span className="h-1.5 flex-1 rounded-full bg-[#d3b13b]/75" />
                    <span className="h-1.5 flex-1 rounded-full bg-[#d3b13b]/50" />
                    <span className="h-1.5 flex-1 rounded-full bg-white/15" />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
                    <span>Practice</span><span>Guidance</span><span>Resources</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 pb-1 pt-4 text-xs font-medium text-neutral-500 sm:px-4">
                <span>Every step of the way</span>
                <a href="#about" className="inline-flex items-center gap-1 text-[#171957] hover:text-[#8a711d]">Get to know us <ArrowDown size={13} aria-hidden="true" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-8 border-y border-[#ece8db] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[.7fr_1.3fr] md:items-center md:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#92771d]">About us</p>
            <h2 className="mt-3 max-w-sm text-3xl font-semibold tracking-tight text-[#171957] sm:text-4xl">A little support can open big doors.</h2>
          </div>
          <div className="max-w-2xl md:pl-10">
            <p className="text-base leading-7 text-neutral-600">
              QR Learning Center helps students and families navigate entrance exam preparation with confidence. From regular practice to application guidance and study resources, we are here to make the journey to JNV and OAV admission easier to take one step at a time.
            </p>
            <p className="mt-4 text-sm font-semibold text-[#171957]">Learning • Growth • Opportunity</p>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-8 bg-[#fbfaf6]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#92771d]">Our services</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#171957] sm:text-4xl">Practical help for the whole journey.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-neutral-500">Focused preparation and useful support for students aiming for their next opportunity.</p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {services.map(({ number, title, detail, icon: Icon, tone }) => (
              <article key={number} className="group flex min-h-[270px] flex-col rounded-2xl border border-[#e9e4cf] bg-white p-5 shadow-[0_8px_24px_-22px_rgba(23,25,87,.3)] transition hover:-translate-y-1 hover:border-[#d8c77e] hover:shadow-[0_18px_38px_-24px_rgba(23,25,87,.24)] sm:p-6">
                <div className="flex items-start justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon size={22} aria-hidden="true" /></span>
                  <span className="text-xs font-semibold tracking-[0.14em] text-neutral-300">{number}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold leading-snug text-[#171957]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why-us" className="scroll-mt-8 bg-[#f2f0e7]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#92771d]">Why QR Learning Center?</p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-[#171957] sm:text-4xl">Thoughtful support, built around your child.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-neutral-600">Good preparation is more than a practice paper. We help families with the essential steps from getting ready to exam day.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {reasons.map((reason) => (
              <li key={reason} className="flex min-h-[86px] items-center gap-3 rounded-2xl border border-[#e4dfcd] bg-white px-4 py-4 text-sm font-medium text-[#333452]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2edda] text-[#80691c]"><BookOpenCheck size={17} aria-hidden="true" /></span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#171957] px-6 py-10 text-white sm:px-12 sm:py-14 lg:px-16">
          <div aria-hidden="true" className="absolute -right-20 -top-36 h-[26rem] w-[26rem] rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-4 -top-20 h-[19rem] w-[19rem] rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ead37a]">Give your child the right preparation</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Every big dream deserves a strong start.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Start your child&apos;s entrance exam preparation with QR Learning Center. We look forward to supporting your family.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <a href="tel:+918018894975" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#d3b13b] px-6 text-sm font-semibold text-[#171957] transition hover:bg-[#e0c65c] focus:outline-none focus:ring-4 focus:ring-[#d3b13b]/25">
                <Phone size={16} aria-hidden="true" /> Contact Us Today
              </a>
              <a href="mailto:admin.qrlearning@gmail.com" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/20">
                <Mail size={16} aria-hidden="true" /> Send us an email <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="relative mt-8 flex items-center gap-2 border-t border-white/10 pt-5 text-sm text-white/65">
            <MapPin size={16} className="text-[#ead37a]" aria-hidden="true" />
            QR Learning Center · Deogarh, Odisha
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e9e4cf] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 text-sm sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brand-logo.png" alt="" width={38} height={38} className="h-9 w-9 object-contain" />
            <span className="font-semibold text-[#171957]">QR Learning Center</span>
          </Link>
          <div className="flex flex-col gap-2 text-neutral-500 sm:flex-row sm:items-center sm:gap-4">
            <a href="tel:+918018894975" className="inline-flex items-center gap-2 hover:text-[#171957]"><Phone size={14} aria-hidden="true" /> +91 80188 94975</a>
            <a href="mailto:admin.qrlearning@gmail.com" className="inline-flex items-center gap-2 hover:text-[#171957]"><Mail size={14} aria-hidden="true" /> admin.qrlearning@gmail.com</a>
            <span className="inline-flex items-center gap-2"><MapPin size={14} aria-hidden="true" /> Deogarh, Odisha</span>
          </div>
          <p className="text-xs text-neutral-400">© {new Date().getFullYear()} QR Learning Center. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
