"use client";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function TopNav({ onToggleSidebar, activeTab, setActiveTab }) {
  return (
    <nav className="w-full h-14 bg-white border-b flex items-center justify-between px-4 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 rounded">
          <Menu size={22} />
        </button>

        <div className="font-bold text-xl">
          EduGuideAI
        </div>

        {/* Main nav */}
        <div className="flex gap-6 ml-6">
          {["Discover", "Summaries", "Tutor", "Practice"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium ${
                activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
              } pb-1`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
