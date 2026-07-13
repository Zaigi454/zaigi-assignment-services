const features = [
  {
    title: "100% Original Work",
    description:
      "Every assignment is prepared according to your requirements with proper research and quality standards.",
  },
  {
    title: "On-Time Delivery",
    description:
      "We respect your deadlines and always aim to deliver your work before the submission date.",
  },
  {
    title: "Affordable Pricing",
    description:
      "Student-friendly pricing with transparent quotations and no hidden charges.",
  },
  {
    title: "24/7 Support",
    description:
      "Need help? Contact us anytime through WhatsApp or Email for quick assistance.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-slate-950 py-24 text-white">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
            WHY CHOOSE US
          </span>

          <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
  Why Students Choose{" "}
  <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
    Zaigi Assignment Services
  </span>
</h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            We focus on quality, originality, timely delivery and excellent
            customer support to provide the best academic assistance.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-2">

          {features.map((item) => (

            <div
              key={item.title}
              className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/40 hover:bg-white/10"
            >

              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 text-3xl shadow-lg shadow-blue-500/30">
                ⭐
              </div>

              <h3 className="text-3xl font-bold">
                {item.title}
              </h3>

              <p className="mt-5 leading-8 text-slate-300">
                {item.description}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}