const plans = [
  {
    name: "Basic",
    price: "Starting from Rs. 500",
    description: "Best for short and simple assignment tasks.",
    features: [
      "1–2 Pages",
      "Basic Formatting",
      "On-Time Delivery",
      "1 Free Revision",
    ],
  },
  {
    name: "Standard",
    price: "Custom Quote",
    description: "Suitable for detailed assignments and research work.",
    features: [
      "3–10 Pages",
      "Research Included",
      "Proper Referencing",
      "Priority Support",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "Custom Quote",
    description: "Ideal for reports, projects, and complete academic support.",
    features: [
      "Reports & Projects",
      "Advanced Research",
      "Presentation Support",
      "Highest Priority",
    ],
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="bg-slate-950 px-6 py-24 text-white"
    >
      <div className="mx-auto max-w-7xl">

        <div className="text-center">
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
            PRICING
          </span>

          <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Flexible Pricing for Every
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {" "}Assignment
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Final pricing depends on subject, pages, deadline, difficulty,
            and assignment requirements.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">

          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? "border-blue-500/50 bg-gradient-to-b from-blue-500/15 to-white/5 shadow-2xl shadow-blue-500/10"
                  : "border-white/10 bg-white/5 hover:border-violet-500/40"
              }`}
            >
              {plan.popular && (
                <span className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-1 text-xs font-bold text-white">
                  MOST POPULAR
                </span>
              )}

              <h3 className="text-3xl font-bold">
                {plan.name}
              </h3>

              <p className="mt-4 text-2xl font-extrabold text-blue-400">
                {plan.price}
              </p>

              <p className="mt-4 leading-7 text-slate-300">
                {plan.description}
              </p>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-slate-300"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-sm text-blue-400">
                      ✓
                    </span>

                    {feature}
                  </li>
                ))}
              </ul>

              <button className="mt-10 w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition hover:scale-105">
                Get Custom Quote
              </button>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}