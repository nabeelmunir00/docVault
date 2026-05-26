import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignInButton } from "@clerk/nextjs";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for personal use",
    badge: null,
    features: [
      "5 GB Storage",
      "50 MB max file size",
      "PDF, Image, DOCX, XLSX",
      "Secure file sharing",
      "Basic dashboard",
      "Email support",
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    desc: "For power users and freelancers",
    badge: "Most Popular",
    features: [
      "50 GB Storage",
      "500 MB max file size",
      "All file types",
      "Password protected links",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$29",
    period: "per month",
    desc: "For teams and businesses",
    badge: null,
    features: [
      "Unlimited Storage",
      "No file size limit",
      "All file types",
      "Advanced analytics",
      "Team collaboration",
      "Dedicated support",
    ],
    cta: "Contact us",
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section className="py-20 px-4 border-t border-border/40">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-sm text-muted-foreground">
            Start free, upgrade when you need more
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-2xl border flex flex-col gap-6 ${
                plan.highlighted
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 shadow-lg shadow-violet-100 dark:shadow-violet-900/20"
                  : "border-border/60 bg-background"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-violet-600 text-white text-[10px] px-3">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              {/* Plan Info */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-xs text-muted-foreground mb-1">
                    /{plan.period}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{plan.desc}</p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <SignInButton mode="modal">
                <Button
                  className={`w-full rounded-xl text-sm ${
                    plan.highlighted
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "variant-outline"
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </SignInButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
