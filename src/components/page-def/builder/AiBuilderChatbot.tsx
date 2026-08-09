"use client";

import { useEffect, useRef, useState } from "react";
import { generateFormFromPrompt } from "@/src/utils/geminiService";
import type { FormDef, FormPageDef } from "./pageDef";
import { notifyError, notifySuccess } from "@/src/components/ui/AppToast";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  formSnapshot?: FormDef;
}

interface AiBuilderChatbotProps {
  open?: boolean;
  onToggle?: () => void;
  currentFormDef: FormDef;
  onApplyFormDef: (newFormDef: FormDef) => void;
  onOpenPublish?: () => void;
  onOpenJson?: () => void;
  embedded?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    sender: "ai",
    text: "Hi! I'm Formvity AI Copilot 🪄\n\nTell me what form you want to build or edit! For example:\n• \"Create a customer feedback form with rating 1-5\"\n• \"Add a phone number and job title field\"\n• \"Change title to Event RSVP\"",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

const PRESET_CHIPS = [
  "📋 Customer Feedback",
  "💼 Job Application",
  "📅 Event RSVP",
  "📈 Lead Intake",
  "➕ Add Rating Field",
  "➕ Add Phone Number",
];

export function AiBuilderChatbot({
  open = true,
  onToggle,
  currentFormDef,
  onApplyFormDef,
  onOpenPublish,
  onOpenJson,
  embedded = false,
}: AiBuilderChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [previousSnapshots, setPreviousSnapshots] = useState<FormDef[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendPrompt = async (promptText?: string) => {
    const textToUse = (promptText || inputPrompt).trim();
    if (!textToUse || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: textToUse,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInputPrompt("");
    setLoading(true);

    // Save snapshot for undo
    setPreviousSnapshots((prev) => [...prev, currentFormDef]);

    try {
      // Build context prompt
      const hasExistingComponents = currentFormDef.pages.some((p) => p.components.length > 0);
      let fullPrompt = textToUse;

      if (hasExistingComponents) {
        fullPrompt = `Current Form Title: "${currentFormDef.title}". Existing fields: ${currentFormDef.pages
          .flatMap((p) => p.components.map((c) => `${c.label} (${c.type})`))
          .join(", ")}. User request: ${textToUse}`;
      }

      const result = await generateFormFromPrompt(fullPrompt, { defaultTitle: currentFormDef.title || "AI Form" });

      onApplyFormDef(result.formDef);

      const fieldCount = result.formDef.pages.reduce((acc: number, p: FormPageDef) => acc + p.components.length, 0);

      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: "ai",
        text: `I've updated your form on the builder canvas! ✨\n\nTitle: "${result.formDef.title}" (${fieldCount} fields).\nYou can edit, drag-and-drop, or customize any field directly on the canvas!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        formSnapshot: result.formDef,
      };

      setMessages((prev) => [...prev, aiMsg]);
      notifySuccess("Form updated on builder canvas!");
    } catch (err) {
      console.error("AI Chatbot error:", err);
      const errorMsg: ChatMessage = {
        id: `msg_ai_err_${Date.now()}`,
        sender: "ai",
        text: `Sorry, I couldn't complete that update: ${err instanceof Error ? err.message : "Unknown error"}. Please try again!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      notifyError("Failed to update form with AI");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    if (previousSnapshots.length === 0) return;
    const lastSnapshot = previousSnapshots[previousSnapshots.length - 1]!;
    onApplyFormDef(lastSnapshot);
    setPreviousSnapshots((prev) => prev.slice(0, -1));

    const undoMsg: ChatMessage = {
      id: `msg_ai_undo_${Date.now()}`,
      sender: "ai",
      text: "Undid last AI changes. Restored previous form state on canvas.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, undoMsg]);
    notifySuccess("Reverted to previous form state");
  };

  const content = (
    <div className={`flex flex-col bg-white overflow-hidden ${embedded ? "h-full w-full" : "h-[560px] w-96 sm:w-[420px] rounded-3xl border border-slate-200/90 shadow-2xl ring-1 ring-slate-900/10"}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="size-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold leading-none">Formvity AI Copilot</h3>
            <span className="text-[10px] text-violet-200">Live Canvas Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {previousSnapshots.length > 0 ? (
            <button
              type="button"
              onClick={handleUndo}
              title="Undo last AI change"
              className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold text-white hover:bg-white/20"
            >
              ↩ Undo
            </button>
          ) : null}
          {!embedded && onToggle ? (
            <button
              type="button"
              onClick={onToggle}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white"
              title="Minimize AI Chatbot"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3 shadow-sm whitespace-pre-wrap leading-relaxed ${
                  isUser
                    ? "bg-violet-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
                }`}
              >
                {msg.text}

                {!isUser && msg.formSnapshot ? (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2 text-[10px]">
                    {onOpenPublish ? (
                      <button
                        type="button"
                        onClick={onOpenPublish}
                        className="rounded-md bg-violet-50 px-2 py-1 font-semibold text-violet-700 hover:bg-violet-100"
                      >
                        🚀 Publish Form
                      </button>
                    ) : null}
                    {onOpenJson ? (
                      <button
                        type="button"
                        onClick={onOpenJson}
                        className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        📄 View JSON
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <span className="mt-1 px-1 text-[9px] text-slate-400">{msg.timestamp}</span>
            </div>
          );
        })}

        {loading ? (
          <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs text-slate-500 shadow-sm w-fit">
            <svg className="size-4 animate-spin text-violet-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI is updating form on canvas...
          </div>
        ) : null}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Preset Chips */}
      <div className="border-t border-slate-100 bg-white px-3 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {PRESET_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSendPrompt(chip.replace(/^[^\s]+\s+/, ""))}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="border-t border-slate-200 bg-white p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask AI to create or edit form fields..."
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md transition hover:bg-violet-700 disabled:opacity-50"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Open AI Copilot Chatbot"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-5 py-3 text-xs font-bold text-white shadow-2xl shadow-indigo-500/40 transition-all hover:scale-105 hover:shadow-indigo-500/60"
        >
          <div className="relative flex size-5 items-center justify-center">
            <svg className="size-5 text-white animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            <span className="absolute -right-1 -top-1 size-2 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
          <span>AI Form Copilot</span>
        </button>
      ) : null}

      {open ? (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          {content}
        </div>
      ) : null}
    </>
  );
}
