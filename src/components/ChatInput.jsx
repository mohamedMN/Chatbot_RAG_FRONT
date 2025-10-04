import React, { useRef, useState } from "react";

export default function ChatInput({ onSend, onUpload, loading }) {
  const [text, setText] = useState("");
  const fileRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    if (!loading) {
      onSend?.(text);
      setText("");
    }
  };

  const pickFile = () => fileRef.current?.click();
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) onUpload?.(f);
    e.target.value = "";
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 p-3 border-t border-white/10 bg-white/5"
    >
      <button type="button" className="btn-ghost" onClick={pickFile}>
        Ajouter document
      </button>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".pdf,.txt,.doc,.docx"
        onChange={onFile}
      />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tapez votre question…"
        className="flex-1 rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ff7900]/40"
      />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "…" : "Envoyer"}
      </button>
    </form>
  );
}
