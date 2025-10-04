import React from "react";

export default function MessageBubble({ role, children }) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "text-right" : "text-left"}>
      <div
        className={
          "inline-block max-w-[70ch] surface px-4 py-2 leading-relaxed " +
          (isUser ? "bg-white/10" : "")
        }
      >
        <div className="whitespace-pre-wrap">{children}</div>
      </div>
    </div>
  );
}
