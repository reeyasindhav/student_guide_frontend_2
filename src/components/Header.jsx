"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react"; // drawer icon

export default function Header({ onToggleDrawer }) {
  const path = usePathname();

  const items = [
    { href: "/youtube", label: "Search" },
    { href: "/summarizer", label: "Summarize" },
    { href: "/chatbot", label: "Chat" },
    { href: "/quiz", label: "Quiz" },
  ];

  return (
    <header className="w-full bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* LEFT: Logo + Drawer */}
      <div className="flex items-center gap-3">

        {/* SHOW DRAWER ONLY ON QUIZ PAGE */}
        {path.startsWith("/quiz") && (
          <button
            onClick={onToggleDrawer}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>
        )}

        <div>
          <h1 className="text-xl font-bold text-indigo-600">AI Edu</h1>
          <p className="text-xs text-gray-500 -mt-1">JEE / NEET helper</p>
        </div>
      </div>

      {/* RIGHT: Navigation */}
      <nav className="flex gap-6 text-sm font-medium">
        {items.map((it) => {
          const active = path === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`hover:text-indigo-600 ${
                active ? "text-indigo-600 font-semibold" : "text-gray-700"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
