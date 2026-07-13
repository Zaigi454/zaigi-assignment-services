import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-xl font-black shadow-lg shadow-blue-500/20">
            Z
          </div>

          <div>
            <h1 className="text-xl font-bold leading-none">Zaigi</h1>

            <p className="mt-1 text-xs text-slate-400">
              Assignment Services
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <Link className="transition hover:text-white" href="/">
            Home
          </Link>

          <Link className="transition hover:text-white" href="/#services">
            Services
          </Link>

          <Link className="transition hover:text-white" href="/#process">
            How It Works
          </Link>

          <Link className="transition hover:text-white" href="/#pricing">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}