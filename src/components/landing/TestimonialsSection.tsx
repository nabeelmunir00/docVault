import FadeIn from "@/components/motion/FadeIn";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Designer at Figma",
    avatar: "SJ",
    color:
      "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300",
    text: "DocVault has completely changed how I manage my design files. The interface is clean, fast, and incredibly intuitive.",
  },
  {
    name: "Ahmed Khan",
    role: "Full Stack Developer",
    avatar: "AK",
    color: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    text: "Finally a file storage solution that doesn't feel bloated. DocVault is minimal, secure, and just works.",
  },
  {
    name: "Emily Chen",
    role: "Startup Founder",
    avatar: "EC",
    color:
      "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
    text: "We use DocVault for all our company documents. The security features give us peace of mind.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Loved by thousands of users
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.15} direction="up">
              <div className="p-6 rounded-2xl border border-border/60 bg-background flex flex-col gap-4 h-full">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${t.color}`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
