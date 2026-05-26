"use client";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 px-4 border-t border-border/40">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-violet-600 dark:bg-violet-700 rounded-3xl px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start storing your files today
          </h2>
          <p className="text-violet-200 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Join 12,000+ users who trust DocVault to store and manage their
            important documents securely in the cloud.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-violet-700 hover:bg-violet-50 rounded-xl px-8 font-semibold gap-2"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-violet-200 text-xs">No credit card required</p>
          </div>
        </div>
      </div>
    </section>
  );
}
