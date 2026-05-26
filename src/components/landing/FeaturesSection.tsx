import { Shield, Zap, Link, Smartphone, Cloud, Lock } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";

const features = [
  {
    icon: Shield,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950",
    title: "End-to-End Encrypted",
    desc: "Your files are encrypted at rest and in transit using AES-256 encryption.",
  },
  {
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950",
    title: "Lightning Fast",
    desc: "CDN-powered global delivery ensures your files load instantly from anywhere.",
  },
  {
    icon: Link,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
    title: "Instant Sharing",
    desc: "Generate secure share links with custom expiry times.",
  },
  {
    icon: Smartphone,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    title: "Works Everywhere",
    desc: "Access your files from any device — desktop, tablet, or mobile.",
  },
  {
    icon: Cloud,
    color: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-950",
    title: "Auto Backup",
    desc: "Your files are automatically backed up across multiple servers.",
  },
  {
    icon: Lock,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950",
    title: "Access Control",
    desc: "Set passwords, expiry dates, and download limits on shared links.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything you need to store files
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            DocVault gives you powerful tools to upload, manage, and share your
            documents securely.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={feature.title} delay={i * 0.1} direction="up">
                <div className="p-6 rounded-2xl border border-border/60 bg-background hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-sm transition-all h-full">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}
                  >
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
