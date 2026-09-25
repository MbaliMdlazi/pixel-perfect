import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/AppLayout";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateChatReply } from "@/lib/assistant";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Workplace AI" },
      {
        name: "description",
        content: "A workplace assistant chat for drafting, summarising, planning meetings and productivity advice.",
      },
      { property: "og:title", content: "AI Chatbot — Workplace AI" },
      {
        property: "og:description",
        content: "Chat with a workplace assistant about emails, summaries, meetings and focus.",
      },
    ],
  }),
  component: ChatPage,
});

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const KEY = "awpa.chat.v1";

const SUGGESTIONS = [
  "Draft a professional email",
  "Summarise this article",
  "Give me productivity recommendations",
  "Help me prepare for a meeting",
];

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Hi! I'm your workplace assistant. Tell me what you're working on — an email, an article to condense, a meeting to prepare, or a week that needs shape.",
};

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
      if (Array.isArray(saved) && saved.length) setMessages(saved as Msg[]);
    } catch {
      /* ignore corrupt storage */
    }
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt) {
      setError("Type a message first.");
      return;
    }
    setError("");
    setInput("");
    setMessages((m) => [...m, { role: "user", content: prompt }]);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    try {
      const reply = generateChatReply(prompt, messages.length);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      logActivity("chat", prompt.slice(0, 60));
    } catch {
      setError("The assistant couldn't answer that one. Try rephrasing your message.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([WELCOME]);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="AI Chatbot"
          description="Ask for drafts, summaries, plans or a second opinion on how to spend your week."
        />
        <Button variant="outline" className="mb-6" onClick={reset}>
          New conversation
        </Button>
      </div>

      <Card className="shadow-soft border-0">
        <CardContent className="flex h-[58vh] min-h-[380px] flex-col gap-4 overflow-y-auto py-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <span className="bg-brand flex size-8 shrink-0 items-center justify-center rounded-lg text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <User className="size-4" />
                </span>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Thinking…
            </div>
          )}
          <div ref={endRef} />
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <Button key={s} variant="secondary" size="sm" onClick={() => send(s)} disabled={loading}>
            {s}
          </Button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <Textarea
          ref={inputRef}
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask anything about your work…"
          className="min-h-[52px] resize-none"
        />
        <Button type="submit" size="icon" className="size-[52px]" disabled={loading} aria-label="Send message">
          <Send className="size-4" />
        </Button>
      </form>

      <AiDisclaimer className="mt-4" />
    </div>
  );
}
