import { createFileRoute } from "@tanstack/react-router";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/AppLayout";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmail, type Tone } from "@/lib/assistant";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI" },
      {
        name: "description",
        content: "Turn a subject, recipient and tone into a ready-to-send professional email you can edit and copy.",
      },
      { property: "og:title", content: "Smart Email Generator — Workplace AI" },
      {
        property: "og:description",
        content: "Formal, friendly or persuasive emails drafted from your own inputs.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [notes, setNotes] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async (regenerate = false) => {
    if (!subject.trim()) {
      setError("Add a subject or topic so the draft has something to work with.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 650));
    try {
      setOutput(generateEmail({ subject, recipient, tone, notes }));
      logActivity("email", `${regenerate ? "Regenerated" : "Drafted"}: ${subject} (${tone})`);
    } catch {
      setError("Something went wrong while drafting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Smart Email Generator"
        description="Give the assistant a subject, who it's for and the tone you want. Edit the draft freely before sending."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card className="shadow-soft h-fit border-0">
          <CardHeader>
            <CardTitle className="text-base">Email brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject / topic</Label>
              <Input
                id="subject"
                placeholder="e.g. Delayed supplier invoice approval"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Recipient / purpose</Label>
              <Input
                id="recipient"
                placeholder="e.g. Thandi Nkosi, finance manager"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Extra context (optional)</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Key points you want covered"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button className="w-full" onClick={() => run(false)} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Writing your email…" : "Generate Email"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Draft</CardTitle>
            <div className="flex gap-2">
              <CopyButton value={output} />
              <Button variant="secondary" onClick={() => run(true)} disabled={loading || !output}>
                <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && !output ? (
              <div className="flex h-72 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Drafting…
              </div>
            ) : (
              <Textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                rows={18}
                placeholder="Your generated email will appear here, fully editable."
                className="resize-y font-normal leading-relaxed"
              />
            )}
            <AiDisclaimer />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
