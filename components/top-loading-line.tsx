"use client";
import React from "react";

export default function TopLoadingLine({ progress = 100, loading = false }: { progress?: number; loading?: boolean }) {
  return loading ? (
    <div className="fixed top-0 left-0 w-full z-[9999] pointer-events-none">
      <div
        className="h-1 bg-blue-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  ) : null;
}
