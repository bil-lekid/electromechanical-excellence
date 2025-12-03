const clientLogos = [
  { name: "Manufacturing Corp", initials: "MC" },
  { name: "Industrial Group", initials: "IG" },
  { name: "Tech Industries", initials: "TI" },
  { name: "Power Systems", initials: "PS" },
  { name: "Auto Parts Ltd", initials: "AP" },
  { name: "Steel Works", initials: "SW" },
];

const Clients = () => {
  return (
    <section className="py-16 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-muted-foreground text-sm uppercase tracking-wider">
            Trusted by Leading Industries
          </span>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
          {clientLogos.map((client, index) => (
            <div
              key={index}
              className="flex items-center justify-center h-16 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
            >
              <div className="w-16 h-16 border-2 border-border flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground">{client.initials}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;
