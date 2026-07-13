const stats = [
  {
    number: "500+",
    label: "Assignments Completed",
  },
  {
    number: "300+",
    label: "Happy Students",
  },
  {
    number: "98%",
    label: "Client Satisfaction",
  },
  {
    number: "24/7",
    label: "Customer Support",
  },
];

export default function Stats() {
  return (
    <section className="bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">

        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur"
          >
            <h3 className="text-4xl font-extrabold text-blue-700">
              {item.number}
            </h3>

           <p className="mt-3 font-medium text-slate-300">
              {item.label}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
}