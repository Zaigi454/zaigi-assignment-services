const services = [
  {
    title: "Assignment Writing",
    description:
      "Well-structured assignments prepared according to your subject and instructions.",
  },
  {
    title: "Research & Referencing",
    description:
      "Help with research, citations, references, and proper academic formatting.",
  },
  {
    title: "Editing & Proofreading",
    description:
      "Grammar correction, formatting improvements, and document review.",
  },
];

export default function Services() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white" id="services">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-semibold text-blue-700">OUR SERVICES</p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            Academic Support You Can Rely On
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Choose the support you need for writing, research, formatting, and
            improving your academic work.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
             className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-blue-500/40"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 text-xl font-bold text-white">
              </div>

              <h3 className="text-2xl font-bold text-white">
                {service.title}
              </h3>

              <p className="mt-4 leading-7 text-slate-300">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}