import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/AppLayout";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateResearch } from "@/lib/assistant";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      {
        name: "description",
        content: "Paste a topic, article or link and get an editable summary, key insights and recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant — Workplace AI" },
      {
        property: "og:description",
        content: "Summaries, insights and recommendations from a topic, article text or URL.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [insights, setInsights] = useState("");
  const [recs, setRecs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const combined = summary ? `Summary\n${summary}\n\nKey insights\n${insights}\n\nRecommendations\n${recs}` : "";

  const run = async () => {
    if (input.trim().length < 4) {
      setError("Paste a topic, some article text or a link to get started.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 750));
    try {
      const result = generateResearch(input);
      setSummary(result.summary);
      setInsights(result.insights.map((i) => `• ${i}`).join("\n"));
      setRecs(result.recommendations.map((i) => `• ${i}`).join("\n"));
      logActivity("research", `Summarised: ${input.trim().slice(0, 60)}`);
    } catch {
      setError("That input couldn't be processed. Try shortening it and running again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="AI Research Assistant"
        description="Drop in a topic, a block of article text or a URL. You'll get a summary, insights and next steps you can edit."
      />

      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle className="text-base">Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={7}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a topic, article text or https:// link…"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={run} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Reading and summarising…" : "Summarise"}
          </Button>
        </CardContent>
      </Card>

      {(summary || loading) && (
        <div className="mt-5 space-y-5">
          {loading && !summary ? (
            <div className="flex h-40 items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Working through your source…
            </div>
          ) : (
            <>
              <Card className="shadow-soft border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Summary</CardTitle>
                  <CopyButton value={combined} label="Copy all" />
                </CardHeader>
                <CardContent>
                  <Textarea rows={6} value={summary} onChange={(e) => setSummary(e.target.value)} />
                </CardContent>
              </Card>

              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <CardTitle className="text-base">Key insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea rows={8} value={insights} onChange={(e) => setInsights(e.target.value)} />
                  </CardContent>
                </Card>
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <CardTitle className="text-base">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea rows={8} value={recs} onChange={(e) => setRecs(e.target.value)} />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      <AiDisclaimer className="mt-6" />
    </div>
  );
}
