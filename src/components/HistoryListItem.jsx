// frontend/src/components/HistoryListItem.jsx
"use client";

export default function HistoryListItem({ item, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-3 rounded hover:bg-gray-100 flex gap-3"
    >
      {/* Thumbnail if available */}
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-16 h-10 object-cover rounded"
        />
      )}

      <div className="flex-1">
        <div className="font-medium text-sm">
          {item.title || `Video ${item.id}`}
        </div>

        {subtitle && (
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>

      <div className="text-xs text-gray-400 whitespace-nowrap">
        {item.saved_at ? new Date(item.saved_at).toLocaleDateString() : ""}
      </div>
    </button>
  );
}
