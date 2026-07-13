import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white sm:py-32">
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200 backdrop-blur">
            Professional Academic Support
          </div>

          <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Get Quality Assignment
            <span className="block bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Support On Time
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Submit your requirements, receive a custom quote, and track your
            order from one secure dashboard.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/orders"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-7 py-4 text-center font-bold shadow-xl shadow-blue-500/20 transition hover:scale-105"
            >
              Place Your Order
            </Link>

            <Link
              href="/#services"
              className="rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-center font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              View Services
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-6 text-sm text-slate-300">
            <span>✓ Original Work</span>
            <span>✓ On-Time Delivery</span>
            <span>✓ Secure & Confidential</span>
            <span>✓ Revisions Available</span>
          </div>
        </div>
      </div>
    </section>
  );
}