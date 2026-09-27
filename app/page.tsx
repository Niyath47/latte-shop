"use client";

import CoffeeCanvas from "../components/CoffeeCanvas";

const MENU = [
  { name: "Honey Bun Latte", tag: "Signature", desc: "Warm honey, brown sugar, double espresso over silk-steamed milk." },
  { name: "Matcha Latte", tag: "Ceremonial", desc: "Stone-ground matcha whisked to order — vibrant, smooth, earthy." },
  { name: "Iced Coffee", tag: "Classic", desc: "Slow-steeped, poured over pure slow-melting ice." },
  { name: "Iced Matcha with Foam", tag: "House Favorite", desc: "Topped with hand-whipped cold foam." },
  { name: "Cold Brew Coffee", tag: "18-Hour", desc: "Single-origin, steeped low and slow for pure intensity." },
  { name: "Cinnamon Pecan Roll", tag: "Fresh Baked", desc: "Warm pastry, the perfect pairing." },
];

const HOURS = [
  { d: "Monday — Friday", h: "7:30 AM — 6:00 PM" },
  { d: "Saturday", h: "8:00 AM — 5:00 PM" },
  { d: "Sunday", h: "Closed" },
];

export default function Page() {
  return (
    <main className="grain relative bg-black text-white overflow-x-clip">
      {/* Fixed nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/60 text-[13px] font-bold text-[#D4AF37]">
              LS
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-[0.2em]">LATTE SOUL</p>
              <p className="text-[11px] text-white/40 tracking-widest">HAMDEN · CT</p>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-8 text-[13px] tracking-[0.15em] text-white/60">
            <a href="#experience" className="hover:text-white transition-colors">EXPERIENCE</a>
            <a href="#menu" className="hover:text-white transition-colors">MENU</a>
            <a href="#visit" className="hover:text-white transition-colors">VISIT</a>
          </nav>
          <a
            href="#visit"
            className="rounded-full border border-[#D4AF37]/50 px-5 py-2 text-xs font-semibold tracking-[0.15em] text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:text-black"
          >
            ORDER AHEAD
          </a>
        </div>
      </header>

      {/* Scrollytelling hero */}
      <section id="experience">
        <CoffeeCanvas />
      </section>

      {/* Social proof strip */}
      <section className="border-y border-white/5 bg-black">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/5 sm:grid-cols-4">
          {[
            ["5.0", "232 Google reviews"],
            ["$1–10", "Craft, accessible"],
            ["100%", "LGBTQ+ friendly"],
            ["Dine-in", "Takeaway · Delivery"],
          ].map(([big, small]) => (
            <div key={small} className="px-6 py-10 text-center">
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white/90">{big}</p>
              <p className="mt-2 text-xs tracking-[0.2em] uppercase text-white/40">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Craft statement */}
      <section className="mx-auto max-w-5xl px-6 py-28 sm:py-36 text-center">
        <p className="eyebrow text-[#D4AF37] mb-6">Why Latte Soul</p>
        <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white/90 leading-[1.02]">
          Delicious, carefully crafted lattes.
          <br />
          <span className="text-white/40">Unique seasonal drinks.</span>
        </h2>
        <p className="mx-auto mt-8 max-w-2xl text-white/60 font-light leading-relaxed">
          Guests call out our flavorful energy drinks, fresh pastries, and the
          cozy, welcoming atmosphere — plus friendly, attentive staff who
          remember your order. This is craft coffee with soul.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3 text-xs tracking-widest">
          {["SINGLE-ORIGIN ESPRESSO", "SLOW-MELTING ICE", "HAND-PLACED GOLD", "FRESH ORANGE PEEL"].map((t) => (
            <span key={t} className="rounded-full border border-white/10 px-4 py-2 text-white/50">{t}</span>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="border-t border-white/5 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <p className="eyebrow text-[#D4AF37] mb-4">Menu Highlights</p>
              <h2 className="text-5xl sm:text-7xl font-semibold tracking-tight text-white/90">Poured with intent.</h2>
            </div>
            <p className="max-w-sm text-white/50 font-light text-sm leading-relaxed">
              From the Honey Bun Latte to ceremonial matcha — every cup is built
              like the film above: ice first, espresso cascading, finished golden.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {MENU.map((m) => (
              <div key={m.name} className="group bg-black p-8 transition-colors hover:bg-[#0b0b0b]">
                <p className="text-[11px] tracking-[0.25em] text-[#D4AF37] uppercase mb-4">{m.tag}</p>
                <h3 className="text-2xl font-semibold tracking-tight text-white/90">{m.name}</h3>
                <p className="mt-3 text-sm text-white/50 font-light leading-relaxed">{m.desc}</p>
                <div className="mt-6 h-px w-8 bg-[#D4AF37]/60 transition-all duration-500 group-hover:w-16 group-hover:bg-[#D4AF37]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="border-t border-white/5">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 sm:py-32 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-[#D4AF37] mb-4">Visit Us</p>
            <h2 className="text-5xl sm:text-6xl font-semibold tracking-tight text-white/90 leading-none">
              Latte Soul<br />Coffee Shop
            </h2>
            <div className="mt-8 space-y-4 text-white/60 font-light">
              <p>3450 Whitney Ave<br />Hamden, CT 06518, United States</p>
              <p>
                <a href="tel:+12035985102" className="text-white/90 hover:text-[#D4AF37] transition-colors">+1 203-598-5102</a>
              </p>
              <p className="text-sm">C3CW+33 Hamden, Connecticut</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Latte+Soul+Coffee+Shop+3450+Whitney+Ave+Hamden+CT"
                target="_blank"
                rel="noreferrer"
                className="gold-glow rounded-full bg-[#D4AF37] px-7 py-3 text-sm font-semibold text-black hover:bg-[#E8C86A] transition-all"
              >
                GET DIRECTIONS
              </a>
              <a
                href="tel:+12035985102"
                className="rounded-full border border-white/20 px-7 py-3 text-sm text-white/80 hover:border-[#D4AF37]/60 hover:text-white transition-all"
              >
                CALL AHEAD
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#080808] p-8">
            <p className="text-xs tracking-[0.25em] uppercase text-white/40 mb-6">Hours</p>
            <div className="divide-y divide-white/5">
              {HOURS.map((r) => (
                <div key={r.d} className="flex items-center justify-between py-4">
                  <span className="text-white/80">{r.d}</span>
                  <span className={r.h === "Closed" ? "text-white/30" : "text-[#D4AF37]"}>{r.h}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-white/30 font-light leading-relaxed">
              Closed Sundays — pick another day. $1–10 per person. Dine-in ·
              Takeaway · Delivery.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-6 py-8 text-xs text-white/30">
          <p className="tracking-[0.2em]">© 2026 LATTE SOUL · HAMDEN CT</p>
          <p className="font-light">The Art of the Pour — a cinematic scrollytelling experience.</p>
        </div>
      </footer>
    </main>
  );
}
