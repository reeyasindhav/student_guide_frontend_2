// frontend/src/components/Sidebar.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const path = usePathname();
  const items = [
    { href: "/youtube", label: "Search" },
    { href: "/summarizer", label: "Summarize" },
    { href: "/chatbot", label: "Chat" },
    { href: "/quiz", label: "Quiz" },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-indigo-600">AI Edu</h1>
        <p className="text-sm text-gray-500 mt-1">JEE / NEET helper</p>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((it) => {
          const active = path === it.href;
          return (
            <Link key={it.href} href={it.href} className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 ${active ? "bg-indigo-50 border-l-4 border-indigo-600" : ""}`}>
              <span className="text-sm font-medium">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 text-xs text-gray-500">
        <p>Prototype — features in progress</p>
      </div>
    </aside>
  );
}
