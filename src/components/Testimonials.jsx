const testimonials = [
  {
    name: "Ali Raza",
    course: "BS Computer Science",
    review:
      "The assignment was well structured, properly formatted, and delivered before the deadline.",
  },
  {
    name: "Ayesha Khan",
    course: "BBA Student",
    review:
      "Communication was quick and the work was prepared exactly according to my instructions.",
  },
  {
    name: "Hamza Ahmed",
    course: "University Student",
    review:
      "I received proper guidance, references, and revisions. The overall experience was very professional.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-950 px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="text-center">
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
            STUDENT FEEDBACK
          </span>

          <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
            What Our
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {" "}Clients Say
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Real feedback from students who received academic writing support
            and guidance.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-blue-500/40"
            >
              <div className="text-lg tracking-widest text-yellow-400">
                ★★★★★
              </div>

              <p className="mt-6 leading-8 text-slate-300">
                “{item.review}”
              </p>

              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-white">
                  {item.name}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {item.course}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}