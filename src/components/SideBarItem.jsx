"use client";

export default function SideBarItem({ item }) {
  return (
    <button
      onClick={item.onClick}
      className="w-full text-left px-3 py-2 rounded hover:bg-gray-200 mb-1 text-sm"
    >
      {item.icon} {item.label}
    </button>
  );
}
