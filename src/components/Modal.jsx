import React from "react";

export default function Modal({ open, onClose, title, children, size = "lg" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className={`bg-white rounded-lg shadow-lg overflow-hidden w-full mx-4 ${
          size === "lg" ? "max-w-5xl" : size === "md" ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Close
          </button>
        </div>
        {/* content area: make full height and allow children to manage overflow (we want the graph to handle pan/zoom, not scroll) */}
        <div className="p-0 h-[80vh] flex">{children}</div>
      </div>
    </div>
  );
}
