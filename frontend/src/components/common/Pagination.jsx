import React from "react";

export default function Pagination({ page, totalPages, total, limit, onChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
            <span>
                Trang {page} / {totalPages}
                {total !== undefined && <span className="ml-2">({total} mục)</span>}
            </span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onChange(1)}
                    disabled={page <= 1}
                    className="px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    «
                </button>
                <button
                    onClick={() => onChange(page - 1)}
                    disabled={page <= 1}
                    className="px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    ‹
                </button>
                {pages[0] > 1 && <span className="px-1 text-gray-700">…</span>}
                {pages.map((p) => (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        className={`px-2.5 py-1 rounded border transition ${
                            p === page
                                ? "bg-red-500 border-red-500 text-white"
                                : "border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
                        }`}
                    >
                        {p}
                    </button>
                ))}
                {pages[pages.length - 1] < totalPages && <span className="px-1 text-gray-700">…</span>}
                <button
                    onClick={() => onChange(page + 1)}
                    disabled={page >= totalPages}
                    className="px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    ›
                </button>
                <button
                    onClick={() => onChange(totalPages)}
                    disabled={page >= totalPages}
                    className="px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    »
                </button>
            </div>
        </div>
    );
}
