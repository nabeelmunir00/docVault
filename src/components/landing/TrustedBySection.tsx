const companies = ["Notion", "Vercel", "Linear", "Figma", "Stripe", "GitHub"];

export default function TrustedBySection() {
  return (
    <section className="py-12 px-4 border-t border-border/40">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-8">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {companies.map((company) => (
            <span
              key={company}
              className="text-lg font-bold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
