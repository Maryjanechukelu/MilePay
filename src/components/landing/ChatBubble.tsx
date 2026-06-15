"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([
    "Hi — need help getting started with MilePay?",
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  function send() {
    if (!input.trim()) return;
    setMessages((m) => [...m, input.trim()]);
    setInput("");
  }

  return (
    <div>
      {/* Drawer */}
      <div className="fixed right-4 bottom-6 z-50">
        {open ? (
          <div className="w-100 max-w-[95vw] max-h-[80vh] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-forest-800 text-white">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} />
                <span className="text-sm font-semibold">Chat with us</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-md">
                <X size={16} className="text-white" />
              </button>
            </div>

            <div ref={scrollRef} className="p-3 h-[50vh] md:h-[60vh] overflow-auto bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className="mb-2">
                  <div className="inline-block bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-800">
                    {m}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 border-t border-slate-100 bg-forest-800">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-white focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-transparent transition-colors"
                placeholder="Type a message..."
                aria-label="Chat message"
              />
              <button onClick={send} className="p-2 rounded-lg bg-forest-100 text-forest-700 hover:bg-forest-200 transition-colors" aria-label="Send message">
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="w-12 h-12 rounded-full bg-amber-400 text-white shadow-lg flex items-center justify-center"
            aria-label="Open chat"
          >
            <MessageSquare size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
