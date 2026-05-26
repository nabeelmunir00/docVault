"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import FadeIn from "@/components/motion/FadeIn";

const stats = [
  { value: 12000, suffix: "+", label: "Active Users" },
  { value: 2.4, suffix: "M+", label: "Files Stored", decimal: true },
  { value: 99.9, suffix: "%", label: "Uptime", decimal: true },
  { value: 50, suffix: "MB", label: "Max File Size" },
];

function CountUp({
  value,
  suffix,
  decimal,
}: {
  value: number;
  suffix: string;
  decimal?: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {decimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="py-16 px-4 bg-violet-600 dark:bg-violet-800">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1} direction="up">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    decimal={stat.decimal}
                  />
                </p>
                <p className="text-sm text-violet-200">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
