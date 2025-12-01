"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Youtube,
  FileText,
  MessageSquare,
  BookOpen,
  History,
  Clock,
  ThumbsUp,
  Play,
  Save,
} from "lucide-react";

export default function YouTubeSidebar({ isOpen, onClose }) {
  const path = usePathname();

  const mainItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/youtube", label: "Videos", icon: Youtube },
    { href: "/summarizer", label: "Summarize", icon: FileText },
    { href: "/chatbot", label: "Chat", icon: MessageSquare },
    { href: "/quiz", label: "Quiz", icon: BookOpen },
  ];

  const secondaryItems = [
    { href: "/youtube", label: "Saved Videos", icon: Save },
    { href: "/summarizer", label: "History", icon: History },
    { href: "/chatbot", label: "Chat History", icon: Clock },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-white dark:bg-[#0f0f0f] border-r border-gray-200 dark:border-gray-800 overflow-y-auto z-40 transition-transform duration-200 md:translate-x-0">
        <div className="py-2">
          {/* Main Navigation */}
          <div className="px-3 py-2">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                path === item.href ||
                (item.href !== "/" && path.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-4 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          {/* <div className="border-t border-gray-200 dark:border-gray-800 my-2" /> */}

          {/* Secondary Navigation */}
          {/* <div className="px-3 py-2">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Library
            </h3>
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = path.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-4 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div> */}
        </div>
      </aside>
    </>
  );
}
