import { ArrowLeft, Compass, Home, Waves } from 'lucide-react';

export function NotFoundPage() {
  return (
    <main className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#031827] px-5 py-12 text-[#e6f8ff]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute -right-32 bottom-[-14rem] h-[38rem] w-[38rem] rounded-full bg-sky-500/10 blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.13]" style={{ backgroundImage: 'radial-gradient(rgba(125,211,252,.7) .7px, transparent .7px)', backgroundSize: '27px 27px' }} />
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className="absolute bottom-[-30px] block rounded-full border border-cyan-200/20 bg-cyan-100/[0.03] animate-[floatUp_12s_linear_infinite]"
            style={{
              left: `${8 + i * 11}%`,
              width: `${8 + (i % 3) * 7}px`,
              height: `${8 + (i % 3) * 7}px`,
              animationDelay: `${i * -1.7}s`,
              animationDuration: `${10 + (i % 4) * 3}s`,
            }}
          />
        ))}
        <svg className="absolute bottom-0 left-0 h-36 w-full opacity-50" viewBox="0 0 1440 180" preserveAspectRatio="none">
          <path d="M0 65 C180 5 300 125 500 75 S820 25 1030 80 S1280 130 1440 55 V180 H0Z" fill="#075985" fillOpacity=".28" />
          <path d="M0 95 C190 35 340 145 560 100 S900 45 1100 100 S1300 145 1440 90 V180 H0Z" fill="#0891b2" fillOpacity=".2" />
          <path d="M0 125 C220 75 360 165 590 125 S930 85 1140 130 S1320 165 1440 120 V180 H0Z" fill="#0e7490" fillOpacity=".2" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <a href="/" aria-label="Abstract ana sayfa" className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-cyan-100/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold tracking-wide text-cyan-50/90 backdrop-blur transition hover:border-cyan-200/35 hover:bg-white/[0.08]">
          <Waves size={17} className="text-cyan-300" />
          ABSTRACT
        </a>

        <div className="relative mb-7 flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
          <div className="absolute inset-3 rounded-full border border-cyan-200/15" />
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan-200/20 animate-[spin_32s_linear_infinite]" />
          <div className="absolute inset-7 rounded-full bg-cyan-400/[0.07] blur-2xl" />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-cyan-100/20 bg-gradient-to-br from-cyan-300/15 to-sky-500/[0.04] shadow-[0_0_70px_rgba(34,211,238,0.12)] backdrop-blur sm:h-36 sm:w-36">
            <Compass size={66} strokeWidth={1.15} className="text-cyan-200 drop-shadow-[0_0_18px_rgba(103,232,249,0.35)]" />
            <span className="absolute -right-2 top-2 h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
          </div>
          <span className="absolute -right-1 top-8 rounded-full border border-cyan-200/20 bg-[#08283a] px-3 py-1 font-mono text-xs tracking-[0.18em] text-cyan-200">LOST</span>
        </div>

        <p className="mb-2 font-mono text-[clamp(5rem,18vw,8.5rem)] font-bold leading-[.85] tracking-[-0.09em] text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500/70">404</p>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-cyan-300/75">BİLİMSEL KEŞİF ROTASI</p>
        <h1 className="max-w-xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">Görünüşe göre rotadan çıktık.</h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-sky-100/65 sm:text-base">
          Aradığın sayfa bu sularda yok. Bağlantı değişmiş, sayfa kaldırılmış ya da hiç var olmamış olabilir.
        </p>

        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <a href="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-6 text-sm font-bold text-[#032033] shadow-lg shadow-cyan-950/40 transition hover:-translate-y-0.5 hover:brightness-110">
            <Home size={17} /> Ana sayfaya dön
          </a>
          <button type="button" onClick={() => window.history.back()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-cyan-100/20 bg-white/[0.04] px-6 text-sm font-semibold text-cyan-50 transition hover:-translate-y-0.5 hover:border-cyan-100/40 hover:bg-white/[0.08]">
            <ArrowLeft size={17} /> Önceki sayfa
          </button>
        </div>

        <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.22em] text-sky-100/30">Abstract · Bilimi kaydırarak keşfet</p>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          12% { opacity: .65; }
          85% { opacity: .35; }
          100% { transform: translate3d(18px, -110vh, 0); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[spin_32s_linear_infinite\\], .animate-\\[floatUp_12s_linear_infinite\\] { animation: none !important; }
        }
      `}</style>
    </main>
  );
}
