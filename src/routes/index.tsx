import { createFileRoute, Link } from "@tanstack/react-router";
import { BotMessageSquare, Mail, Search, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/AppLayout";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { timeAgo, useActivity, type ActivityKind } from "@/lib/activity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workplace AI Productivity Assistant" },
      {
        name: "description",
        content: "See your emails generated, research tasks, AI chats and recent activity at a glance.",
      },
      { property: "og:title", content: "Dashboard — Workplace AI Productivity Assistant" },
      {
        property: "og:description",
        content: "Emails generated, research tasks, AI chats and recent activity in one view.",
      },
    ],
  }),
  component: Dashboard,
});

const SAMPLE = { email: 128, research: 46, chat: 312 };

const KIND_META: Record<ActivityKind, { icon: typeof Mail; label: string }> = {
  email: { icon: Mail, label: "Email" },
  research: { icon: Search, label: "Research" },
  chat: { icon: BotMessageSquare, label: "Chat" },
};

const SAMPLE_ACTIVITY = [
  { kind: "email" as const, label: "Quarterly budget follow-up (Persuasive)", at: Date.now() - 26 * 60000 },
  { kind: "research" as const, label: "Summarised: hybrid work policy report", at: Date.now() - 3 * 3600000 },
  { kind: "chat" as const, label: "Prepared agenda for Monday leadership sync", at: Date.now() - 7 * 3600000 },
  { kind: "email" as const, label: "Supplier onboarding welcome note (Friendly)", at: Date.now() - 26 * 3600000 },
];

function Dashboard() {
  const activity = useActivity();
  const counts = {
    email: SAMPLE.email + activity.filter((a) => a.kind === "email").length,
    research: SAMPLE.research + activity.filter((a) => a.kind === "research").length,
    chat: SAMPLE.chat + activity.filter((a) => a.kind === "chat").length,
  };
  const feed = activity.length ? activity : SAMPLE_ACTIVITY;

  const cards = [
    { key: "email", title: "Emails Generated", value: counts.email, delta: "+12 this week", to: "/email" },
    { key: "research", title: "Research Tasks", value: counts.research, delta: "+5 this week", to: "/research" },
    { key: "chat", title: "AI Chats", value: counts.chat, delta: "+34 this week", to: "/chat" },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Good day — here's your workspace"
        description="Draft emails, condense research and think out loud with an assistant. Everything runs locally in your browser."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = KIND_META[c.key].icon;
          return (
            <Card key={c.key} className="shadow-soft border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
                <span className="bg-brand-soft flex size-9 items-center justify-center rounded-xl">
                  <Icon className="size-4.5 text-primary" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">{c.value}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="size-3.5 text-primary" />
                  {c.delta}
                </p>
                <Button asChild variant="ghost" className="mt-3 h-8 px-2 text-primary">
                  <Link to={c.to}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-soft mt-6 border-0">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {feed.slice(0, 8).map((item, i) => {
            const Icon = KIND_META[item.kind].icon;
            return (
              <div
                key={`${item.at}-${i}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted"
              >
                <span className="bg-brand-soft flex size-8 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="size-4 text-primary" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{item.label}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.at)}</span>
              </div>
            );
          })}
          {!activity.length && (
            <p className="px-2 pt-2 text-xs text-muted-foreground">
              Sample activity shown. Your own actions appear here as you use the tools.
            </p>
          )}
        </CardContent>
      </Card>

      <AiDisclaimer className="mt-6" />
    </div>
  );
}
