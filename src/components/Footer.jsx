export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-white">

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">

        {/* Logo */}

        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Zaigi
          </h2>

          <p className="mt-5 leading-8 text-slate-400">
            Professional Assignment Writing, Research Assistance,
            Academic Guidance and Student Support with quality service.
          </p>
        </div>

        {/* Links */}

        <div>
          <h3 className="mb-5 text-xl font-bold">
            Quick Links
          </h3>

          <ul className="space-y-3 text-slate-400">

            <li><a href="#" className="hover:text-blue-400 transition">Home</a></li>

            <li><a href="#services" className="hover:text-blue-400 transition">Services</a></li>

            <li><a href="#pricing" className="hover:text-blue-400 transition">Pricing</a></li>

            <li><a href="#contact" className="hover:text-blue-400 transition">Contact</a></li>

          </ul>
        </div>

        {/* Services */}

        <div>
          <h3 className="mb-5 text-xl font-bold">
            Services
          </h3>

          <ul className="space-y-3 text-slate-400">

            <li>Assignment Writing</li>

            <li>Research Support</li>

            <li>Presentation Design</li>

            <li>Proofreading</li>

          </ul>

        </div>

        {/* Contact */}

        <div id="contact">

          <h3 className="mb-5 text-xl font-bold">
            Contact
          </h3>

          <ul className="space-y-4 text-slate-400">

            <li>📧 zkcalligraphy6@gmail.com</li>

            <li>📱 +92 329 7128816</li>

            <li>📍 Pakistan</li>

          </ul>

          <a
            href="https://wa.me/923297128816"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3 font-semibold text-white transition hover:scale-105"
          >
            Chat on WhatsApp
          </a>

        </div>

      </div>

      <div className="border-t border-white/10 py-6 text-center text-slate-500">
        © 2026 Zaigi Assignment Services. All Rights Reserved.
      </div>

    </footer>
  );
}