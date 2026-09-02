"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDark(document.documentElement.classList.contains("dark")));
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.theme = next ? "dark" : "light";
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="liquid-glass liquid-glass-interactive grid size-10 place-items-center rounded-full text-[var(--foreground)]"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
