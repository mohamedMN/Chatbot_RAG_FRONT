import React, { useEffect, useRef } from "react";

export default function ChatMessages({ messages = [] }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.scrollTo({
      top: ref.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);
  return (
    <div
      ref={ref}
      className="h-[420px] overflow-auto p-4 space-y-3 bg-black/20"
    >
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex ${
            m.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
              m.role === "user"
                ? "bg-[#ff7900] text-white"
                : "bg-white/5 border border-white/10"
            }`}
          >
            <div className="whitespace-pre-wrap">{m.content}</div>
            {m.context && (
              <details className="mt-2">
                <summary className="text-xs text-white/60 cursor-pointer">
                  Contexte
                </summary>
                <pre className="mt-1 p-2 text-xs bg-black/20 rounded">
                  {m.context}
                </pre>
              </details>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
