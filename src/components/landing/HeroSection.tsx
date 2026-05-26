"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Users,
  Star,
  CheckCircle,
  Cloud,
  FileText,
  ImageIcon,
  FileSpreadsheet,
} from "lucide-react";

const files = [
  {
    name: "Q3 Report 2024.pdf",
    size: "2.4 MB",
    progress: 100,
    done: true,
    icon: FileText,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950",
  },
  {
    name: "Banner design.png",
    size: "1.1 MB",
    progress: 68,
    done: false,
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  {
    name: "Budget 2024.xlsx",
    size: "820 KB",
    progress: 0,
    done: false,
    icon: FileSpreadsheet,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
];

export default function HeroSection() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-fit"
            >
              <Badge
                variant="secondary"
                className="gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800"
              >
                <Sparkles className="w-3 h-3" />
                Powered by Supabase + Clerk
              </Badge>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-3"
            >
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground leading-tight">
                Store your files{" "}
                <span className="text-violet-600 dark:text-violet-400">
                  safely
                </span>{" "}
                in cloud
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Upload, manage, and access your documents from anywhere. Secure,
                fast, and beautifully designed for professionals.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button
                size="lg"
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2 rounded-xl px-6 shadow-lg shadow-violet-200 dark:shadow-violet-900"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-violet-600 hover:bg-violet-700 text-white gap-2 rounded-xl px-6 shadow-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Button variant="outline" size="lg" className="rounded-xl px-6">
                Learn more
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-5 pt-2"
            >
              {[
                {
                  icon: Shield,
                  color: "text-emerald-500",
                  label: "End-to-end encrypted",
                },
                { icon: Users, color: "text-violet-500", label: "12k+ users" },
                { icon: Star, color: "text-amber-500", label: "4.9 rating" },
                { icon: Zap, color: "text-blue-500", label: "99.9% uptime" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Side — macOS Window */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-violet-400/10 dark:bg-violet-600/10 rounded-3xl blur-3xl" />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-md bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* macOS Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="flex-1 text-center text-xs text-muted-foreground font-medium">
                  DocVault — My Files
                </span>
              </div>

              <div className="p-4 flex flex-col gap-3">
                {/* Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={() => setIsDragging(false)}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40"
                      : "border-border hover:border-violet-400 hover:bg-muted/40"
                  }`}
                >
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Cloud className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Drop files here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, PNG, DOCX, XLSX — up to 50MB
                  </p>
                </div>

                {/* File Items */}
                <div className="flex flex-col gap-2">
                  {files.map((file, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${file.bg}`}
                      >
                        <file.icon className={`w-4 h-4 ${file.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.size}
                        </p>
                        <div className="mt-1.5 h-1 bg-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                            transition={{ duration: 1, delay: 0.8 + i * 0.2 }}
                            className="h-full rounded-full bg-violet-500"
                          />
                        </div>
                      </div>
                      {file.done && (
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      )}
                      {!file.done && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {file.progress > 0 ? `${file.progress}%` : "—"}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
