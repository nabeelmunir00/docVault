import { Cloud } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-violet-600 rounded-lg flex items-center justify-center">
            <Cloud className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm">
            Doc<span className="text-violet-600">Vault</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Support
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground">
          © 2025 DocVault. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
