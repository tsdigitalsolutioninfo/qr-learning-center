import Image from 'next/image';
import Link from 'next/link';
import ExamBannerCarousel from '@/components/landing/ExamBannerCarousel';
import HeroImageCarousel from '@/components/landing/HeroImageCarousel';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Check,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';

const services = [
  {
    number: '01',
    title: 'JNV entrance preparation',
    detail: 'Build confidence for Jawahar Navodaya Vidyalaya entrance exams with focused practice for Classes 4 and 5.',
    icon: BookOpenCheck,
    tone: 'bg-[#f8edc9] text-[#866819]',
  },
  {
    number: '02',
    title: 'OAV entrance preparation',
    detail: 'Get ready for Odisha Adarsha Vidyalaya entrance exams with practice tests and friendly learning support.',
    icon: GraduationCap,
    tone: 'bg-[#e7edff] text-[#343c83]',
  },
  {
    number: '03',
    title: 'Application assistance',
    detail: 'Get guidance through the online application process, from filling out the form to submitting it.',
    icon: ClipboardCheck,
    tone: 'bg-[#e6f2e8] text-[#34714a]',
  },
  {
    number: '04',
    title: 'Admit cards & study materials',
    detail: 'Find support accessing your admit card and useful study resources to keep preparation on track.',
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
    <main className="landing-page overflow-hidden bg-[#fbfaf6] text-[#20213f]">
      <header className="relative z-10 border-b border-[#e9e4cf] bg-[#fbfaf6]">
        <div className="mx-auto flex min-h-[78px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <Link href="/" aria-label="QR Learning Center home" className="flex shrink-0 items-center gap-3">
            <Image src="/brand-logo.png" alt="" width={52} height={52} priority className="h-12 w-12 object-contain" />
            <span className="text-sm font-bold leading-tight tracking-tight text-[#171957] sm:text-base">
              QR Learning Center
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">Deogarh, Odisha</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
            <a className="transition hover:text-[#171957]" href="#about">Our story</a>
            <a className="transition hover:text-[#171957]" href="#services">What we do</a>
            <a className="transition hover:text-[#171957]" href="#why-us">Why QR</a>
            <a className="transition hover:text-[#171957]" href="#contact">Contact</a>
          </nav>

          <Link href="/login" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ded8bf] bg-white px-4 text-sm font-semibold text-[#171957] transition hover:border-[#c8b66e] hover:bg-[#fcfaef]">
            Staff login <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <nav aria-label="Mobile navigation" className="flex items-center justify-center gap-6 overflow-x-auto border-t border-[#e9e4cf]/80 px-4 py-2.5 text-xs font-medium text-neutral-600 md:hidden">
          <a className="shrink-0" href="#about">Our story</a>
          <a className="shrink-0" href="#services">Services</a>
          <a className="shrink-0" href="#why-us">Why QR</a>
          <a className="shrink-0" href="#contact">Contact</a>
        </nav>
      </header>

      <ExamBannerCarousel />

      <section className="relative isolate overflow-hidden bg-[#f5f1e4]">
        <div aria-hidden="true" className="absolute -right-40 -top-48 -z-10 h-[42rem] w-[42rem] rounded-full border border-[#e0d7b7]" />
        <div aria-hidden="true" className="absolute right-[-8rem] top-[-10rem] -z-10 h-[31rem] w-[31rem] rounded-full border border-[#e0d7b7]" />
        <div aria-hidden="true" className="absolute -bottom-36 -left-32 -z-10 h-80 w-80 rounded-full bg-[#e1e9df] blur-2xl" />
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.02fr_.98fr] lg:gap-14">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e5d9ad] bg-white/80 px-3.5 py-2 text-xs font-semibold tracking-wide text-[#6c5818] shadow-sm">
              <Sparkles size={14} aria-hidden="true" /> A brighter path starts here
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#171957] sm:text-4xl lg:text-5xl">
              Practice Exam For:
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">
              We provide block-level mock tests for JNV and OAV aspirants.
            </p>
            <div className="mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
              <article className="group flex items-center gap-4 rounded-2xl border border-[#e9e4cf] bg-white/90 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#d8c77e] hover:shadow-lg">
                <Image src="/home/jnv-logo.png" alt="Jawahar Navodaya Vidyalaya logo" width={80} height={80} className="h-16 w-16 shrink-0 object-contain transition duration-300 group-hover:scale-110 sm:h-20 sm:w-20" />
                <span className="text-sm font-semibold leading-snug text-[#171957] sm:text-base">Jawahar Navodaya Vidyalaya</span>
              </article>
              <article className="group flex items-center gap-4 rounded-2xl border border-[#e9e4cf] bg-white/90 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#d8c77e] hover:shadow-lg">
                <Image src="/home/adarsha-vidyala-logo.jpg" alt="Odisha Adarsha Vidyalaya logo" width={80} height={80} className="h-16 w-16 shrink-0 object-contain transition duration-300 group-hover:scale-110 sm:h-20 sm:w-20" />
                <span className="text-sm font-semibold leading-snug text-[#171957] sm:text-base">Odisha Adarsha Vidyalaya</span>
              </article>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#services" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d3b13b] px-6 text-sm font-semibold text-[#171957] shadow-[0_12px_24px_-14px_rgba(115,91,16,.6)] transition hover:bg-[#e0c65c] focus:outline-none focus:ring-4 focus:ring-[#d3b13b]/25">
                Explore our support <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d9d1b7] bg-white/80 px-6 text-sm font-semibold text-[#171957] transition hover:border-[#c8b66e] hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#171957]/10">
                Talk to our team
              </a>
            </div>
            <div className="mt-10 flex items-center gap-3 text-sm text-neutral-500">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#80691c] shadow-sm"><MapPin size={16} aria-hidden="true" /></span>
              Here for families across Deogarh, Odisha
            </div>
          </div>

          <HeroImageCarousel />
        </div>
      </section>

      <section id="about" className="scroll-mt-8 border-y border-[#ece8db] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[.78fr_1.22fr] md:items-center md:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#92771d]">A little about us</p>
            <h2 className="mt-3 max-w-sm text-3xl font-semibold tracking-tight text-[#171957] sm:text-4xl">Every child deserves a chance to shine.</h2>
          </div>
          <div className="max-w-2xl md:pl-10">
            <p className="text-base leading-7 text-neutral-600">
              QR Learning Center helps students and families navigate entrance exam preparation with confidence. From regular practice to application guidance and study resources, we make the journey to JNV and OAV admission easier, one step at a time.
            </p>
            <p className="mt-5 text-sm font-semibold tracking-wide text-[#171957]">Learning <span className="mx-2 text-[#d3b13b]">/</span> Growth <span className="mx-2 text-[#d3b13b]">/</span> Opportunity</p>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-8 bg-[#fbfaf6]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#92771d]">How we can help</p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-[#171957] sm:text-4xl">The right support for every step.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-neutral-500">Practical preparation and family support for students aiming for their next opportunity.</p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {services.map(({ number, title, detail, icon: Icon, tone }) => (
              <article key={number} className="group flex min-h-[265px] flex-col rounded-2xl border border-[#e9e4cf] bg-white p-5 shadow-[0_8px_24px_-22px_rgba(23,25,87,.3)] transition hover:-translate-y-1 hover:border-[#d8c77e] hover:shadow-[0_18px_38px_-24px_rgba(23,25,87,.24)] sm:p-6">
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#92771d]">Why families choose QR</p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-[#171957] sm:text-4xl">Encouragement and guidance that make a difference.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-neutral-600">Good preparation is more than a practice paper. We help families with the essential steps from getting ready to exam day.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {reasons.map((reason) => (
              <li key={reason} className="flex min-h-[86px] items-center gap-3 rounded-2xl border border-[#e4dfcd] bg-white px-4 py-4 text-sm font-medium text-[#333452]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2edda] text-[#80691c]"><Check size={17} aria-hidden="true" /></span>
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
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ead37a]">Let&apos;s take the next step</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your child&apos;s journey starts with a conversation.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Talk with the QR Learning Center team about preparation and support for your family.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <a href="tel:+918018894975" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#d3b13b] px-6 text-sm font-semibold text-[#171957] transition hover:bg-[#e0c65c] focus:outline-none focus:ring-4 focus:ring-[#d3b13b]/25">
                <Phone size={16} aria-hidden="true" /> Call our team
              </a>
              <a href="mailto:admin.qrlearning@gmail.com" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/20">
                <Mail size={16} aria-hidden="true" /> Send us an email <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="relative mt-8 flex items-center gap-2 border-t border-white/10 pt-5 text-sm text-white/65">
            <MapPin size={16} className="text-[#ead37a]" aria-hidden="true" />
            QR Learning Center <span className="text-[#ead37a]">/</span> Deogarh, Odisha
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
          <p className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} QR Learning Center. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
