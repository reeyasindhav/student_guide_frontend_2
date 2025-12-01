// frontend/src/components/HistoryListItem.jsx
"use client";

export default function HistoryListItem({ item, subtitle, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded transition-colors flex gap-3 ${
        active
          ? "bg-blue-100 dark:bg-blue-900/30 border-l-2 border-blue-600 dark:border-blue-400"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {/* Thumbnail if available */}
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-16 h-10 object-cover rounded flex-shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        <div
          className={`font-medium text-sm truncate ${
            active
              ? "text-blue-900 dark:text-blue-100"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {item.title || `Item ${item.id}`}
        </div>

        {subtitle && (
          <div
            className={`text-xs mt-1 truncate ${
              active
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {subtitle}
          </div>
        )}
      </div>

      <div
        className={`text-xs whitespace-nowrap flex-shrink-0 ${
          active
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {item.saved_at
          ? new Date(item.saved_at).toLocaleDateString()
          : item.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : ""}
      </div>
    </button>
  );
}
