const steps = [
  {
    number: "01",
    title: "Place Your Order",
    description:
      "Fill out the order form with your assignment requirements.",
  },
  {
    number: "02",
    title: "Make Payment",
    description:
      "Complete your payment and upload the payment proof.",
  },
  {
    number: "03",
    title: "Receive Assignment",
    description:
      "Our team will complete and deliver your assignment on time.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white" id="process">
      <div className="max-w-7xl mx-auto">

        <div className="text-center">
          <p className="text-blue-700 font-semibold">
            HOW IT WORKS
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            Simple 3-Step Process
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-14">

          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-violet-500/40"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
                {step.number}
              </div>
                
                
               <h3 className="mt-6 text-2xl font-bold text-white">
                {step.title}
              </h3>

              <p className="mt-4 leading-7 text-slate-300">
                {step.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}