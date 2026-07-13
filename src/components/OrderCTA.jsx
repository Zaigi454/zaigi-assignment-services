export default function OrderCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white">

      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 px-8 py-16 text-center shadow-2xl backdrop-blur-xl sm:px-12">

        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
          GET STARTED
        </span>

        <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
          Ready to Get Your
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            {" "}Assignment Done?
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Share your requirements, receive a custom quote, and get professional
          academic support with secure communication and on-time delivery.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

          <button className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition hover:scale-105">
            Place Your Order
          </button>

          <a
            href="https://wa.me/923297128816"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur transition hover:bg-white/10"
          >
            WhatsApp Us
          </a>

        </div>

      </div>
    </section>
  );
}