"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/motion/FadeIn";

const faqs = [
  {
    q: "Is DocVault free to use?",
    a: "Yes! DocVault offers a free plan with 5GB storage, perfect for personal use.",
  },
  {
    q: "How secure are my files?",
    a: "All files are encrypted using AES-256 encryption at rest and in transit.",
  },
  {
    q: "What file types are supported?",
    a: "DocVault supports PDF, PNG, JPG, DOCX, and XLSX files on the free plan.",
  },
  {
    q: "Can I share files without an account?",
    a: "Yes! Generate secure share links that anyone can access without creating an account.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Cancel anytime from the Settings page. Files remain accessible until billing period ends.",
  },
  {
    q: "Is there a file size limit?",
    a: "Free plan: 50MB per file. Pro: 500MB. Enterprise: no limit.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 border-t border-border/40">
      <div className="max-w-2xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently asked questions
          </h2>
        </FadeIn>

        <div className="flex flex-col gap-2">
          {faqs.map((faq, index) => (
            <FadeIn key={index} delay={index * 0.08}>
              <div className="border border-border/60 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === index ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground pr-4">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: open === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 border-t border-border/40">
                        <p className="text-sm text-muted-foreground leading-relaxed pt-3">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
