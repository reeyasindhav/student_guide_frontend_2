"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Home,
  BookOpen,
  MessageSquare,
  FileText,
  Youtube,
} from "lucide-react";
import { useState } from "react";

export default function YouTubeHeader({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) {
  const path = usePathname();
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/youtube", label: "Videos", icon: Youtube },
    { href: "/summarizer", label: "Summarize", icon: FileText },
    { href: "/chatbot", label: "Chat", icon: MessageSquare },
    { href: "/quiz", label: "Quiz", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center h-14 px-4 gap-4">
        {/* Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} className="text-gray-700 dark:text-gray-300" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
            Student Guide
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit?.();
            }}
            className="flex items-center"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery || ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search videos..."
                className={`w-full h-10 px-4 pr-10 border ${
                  isSearchFocused
                    ? "border-blue-500 dark:border-blue-600"
                    : "border-gray-300 dark:border-gray-700"
                } rounded-l-full bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
              />
            </div>
            <button
              type="submit"
              className="h-10 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-full border border-l-0 border-gray-300 dark:border-gray-700 transition-colors"
            >
              <Search size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          </form>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              path === item.href ||
              (item.href !== "/" && path.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon size={18} />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
