/**
 * Local, deterministic "assistant" generators.
 * Everything runs in the browser: no backend, no API keys.
 * Output is composed from the user's own input so it is never a fixed placeholder.
 */

export type Tone = "formal" | "friendly" | "persuasive";

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","if","then","than","that","this","these","those","of","to","in","on","for","with",
  "as","by","at","from","is","are","was","were","be","been","being","it","its","we","our","you","your","they","their",
  "i","me","my","he","she","his","her","about","into","over","after","before","can","will","would","should","could",
  "have","has","had","do","does","did","not","no","so","such","also","more","most","very","just","please","help",
]);

export function keywords(text: string, limit = 6): string[] {
  const counts = new Map<string, number>();
  for (const raw of text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? []) {
    if (STOP_WORDS.has(raw)) continue;
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([w]) => w);
}

export function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function isUrl(value: string) {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

/* ---------------------------------- email --------------------------------- */

export function generateEmail(input: { subject: string; recipient: string; tone: Tone; notes?: string }) {
  const subject = input.subject.trim();
  const recipient = input.recipient.trim();
  const points = keywords(`${subject} ${input.notes ?? ""}`, 4);
  const who = recipient.split(/[,(]/)[0].trim() || "there";
  const name = who.split(/\s+/).slice(0, 2).join(" ");

  const openings: Record<Tone, string> = {
    formal: `Dear ${titleCase(name)},\n\nI hope this message finds you well. I am writing regarding ${subject.toLowerCase() || "the matter below"}.`,
    friendly: `Hi ${titleCase(name)},\n\nHope you're having a good week! I wanted to reach out about ${subject.toLowerCase() || "something on my mind"}.`,
    persuasive: `Hi ${titleCase(name)},\n\nI'll keep this short because I think ${subject.toLowerCase() || "this"} is genuinely worth your time.`,
  };

  const bodies: Record<Tone, string> = {
    formal: `Below is a summary of the key points for your consideration:`,
    friendly: `Here's the short version of what I'm thinking:`,
    persuasive: `Here's why this matters right now:`,
  };

  const bullets = (points.length ? points : ["next steps", "timing", "ownership"]).map((p, i) => {
    const framing: Record<Tone, string[]> = {
      formal: [
        `${titleCase(p)}: I would appreciate your view on how this should be handled.`,
        `${titleCase(p)}: I have outlined the current position and the options available.`,
        `${titleCase(p)}: please confirm whether the proposed approach is acceptable.`,
        `${titleCase(p)}: any constraints you are aware of would be helpful to know.`,
      ],
      friendly: [
        `${titleCase(p)} — happy to walk you through this whenever suits you.`,
        `${titleCase(p)} — I've made a start, so just shout if you'd like it changed.`,
        `${titleCase(p)} — let me know if you'd rather handle it differently.`,
        `${titleCase(p)} — nothing urgent, but worth a quick look.`,
      ],
      persuasive: [
        `${titleCase(p)} is where we lose the most time today, and it's fixable this month.`,
        `${titleCase(p)} gives us a measurable win with very little disruption.`,
        `${titleCase(p)} is the one decision that unlocks the rest of the plan.`,
        `${titleCase(p)} costs us more the longer it waits.`,
      ],
    };
    const options = framing[input.tone];
    return `• ${options[i % options.length]}`;
  });

  const context = input.notes?.trim()
    ? `\n\nFor context: ${input.notes.trim()}`
    : "";

  const purpose = recipient
    ? `\n\nI'm sending this to ${recipient} so we stay aligned on ownership.`
    : "";

  const closings: Record<Tone, string> = {
    formal: `\n\nPlease let me know if you require any further detail. I look forward to your response.\n\nKind regards,\n[Your name]`,
    friendly: `\n\nLet me know what you think — happy to jump on a quick call if that's easier.\n\nThanks so much,\n[Your name]`,
    persuasive: `\n\nCan I get a yes or no from you by end of week? If yes, I'll take it from there.\n\nBest,\n[Your name]`,
  };

  return `Subject: ${subject || "Quick note"}\n\n${openings[input.tone]}\n\n${bodies[input.tone]}\n\n${bullets.join("\n")}${context}${purpose}${closings[input.tone]}`;
}

/* --------------------------------- research -------------------------------- */

export function generateResearch(raw: string) {
  const input = raw.trim();
  const url = isUrl(input);
  const topic = url
    ? decodeURIComponent(input.replace(/^https?:\/\//i, "").split("/").filter(Boolean).slice(-1)[0] ?? input)
        .replace(/[-_]+/g, " ")
        .replace(/\.(html?|php|aspx)$/i, "")
    : input;
  const words = input.split(/\s+/).length;
  const terms = keywords(topic + " " + input, 6);
  const picked = sentences(input).slice(0, 3);

  const summary = url
    ? `This source (${input}) appears to focus on ${terms.slice(0, 3).join(", ") || topic}. Based on the address alone, treat the following as a working brief rather than a reading of the page: the material most likely covers ${topic.toLowerCase()}, why it matters to teams working in this space, and what should change as a result. Open the link and confirm the specifics before circulating.`
    : picked.length
      ? `The text runs to roughly ${words} words and centres on ${terms.slice(0, 3).join(", ") || topic}. ${picked.join(" ")} Taken together, the argument is that ${terms[0] ?? "the topic"} is the deciding factor, with ${terms[1] ?? "delivery"} and ${terms[2] ?? "timing"} shaping how quickly results show up.`
      : `"${topic}" is a compact brief rather than a full article. Reading it as a research question, the core issue is ${terms[0] ?? topic}, and the useful angles are how it is measured, who owns it, and what a good outcome looks like in the next quarter.`;

  const insights = [
    `${titleCase(terms[0] ?? topic)} is the anchor of this material — most other points depend on it.`,
    `${titleCase(terms[1] ?? "Execution")} determines pace: it is where effort turns into visible results.`,
    `${titleCase(terms[2] ?? "Ownership")} is the most common failure point, because responsibility is often implied rather than assigned.`,
    url
      ? `The source is a link, so evidence quality still needs to be checked at the page itself.`
      : `The input is ${words} words, so the conclusions are only as strong as the detail supplied.`,
  ];

  const recommendations = [
    `Write a one-line decision statement about ${terms[0] ?? topic} and circulate it before the next meeting.`,
    `Assign a named owner for ${terms[1] ?? "the next step"} with a date, not a sprint.`,
    `Pick one measure for ${terms[2] ?? "progress"} and review it in two weeks.`,
    `Verify the underlying facts${url ? " on the original page" : " with a second source"} before using this in a client or exec document.`,
  ];

  return { summary, insights, recommendations };
}

/* ---------------------------------- chat ---------------------------------- */

export function generateChatReply(prompt: string, history: number) {
  const text = prompt.trim();
  const terms = keywords(text, 4);
  const focus = terms[0] ?? "this";
  const lower = text.toLowerCase();

  if (/\bemail|write to|reply to|draft\b/.test(lower)) {
    return `Here's a draft you can adapt for ${focus}:\n\n**Subject:** ${titleCase(terms.slice(0, 3).join(" ")) || "Quick update"}\n\nHi [name],\n\nI wanted to update you on ${terms.slice(0, 2).join(" and ") || "the work in progress"}. The current position is stable, and the next step is a short decision from your side.\n\nCould you confirm by Thursday? I'll handle the rest.\n\nBest,\n[Your name]\n\nWant it more formal, friendlier or more persuasive? The Smart Email Generator page gives you those tones directly.`;
  }

  if (/summar|article|report|paper|read/.test(lower)) {
    const r = generateResearch(text);
    return `Summary\n${r.summary}\n\nKey insights\n${r.insights.map((i) => `• ${i}`).join("\n")}\n\nIf you paste the full text into the Research Assistant, you'll also get recommendations you can edit and copy.`;
  }

  if (/productiv|focus|time|busy|overwhelm|prioriti/.test(lower)) {
    return `Looking at what you described around ${terms.slice(0, 2).join(" and ") || "your workload"}, three things usually move the needle:\n\n1. Name the single outcome for the week. If ${focus} is it, everything else is negotiable.\n2. Block two 90-minute windows for ${focus} before the calendar fills.\n3. End each day by writing tomorrow's first task — it removes the morning decision cost.\n\nWhich of those is hardest to hold in your week?`;
  }

  if (/meeting|agenda|prepare|present|pitch|interview/.test(lower)) {
    return `Here's a prep structure for ${focus}:\n\n• Purpose — one sentence on what must be true when the meeting ends.\n• Context — two facts about ${terms.slice(0, 2).join(" and ") || "the situation"} everyone must share.\n• Decision — the exact question you need answered.\n• Risks — the objection most likely to come up, and your one-line response.\n• Next steps — owner and date, agreed in the room.\n\nTell me who's attending and I'll tighten the wording for that audience.`;
  }

  if (/\?$/.test(text) || /^(what|why|how|when|who|which|can|should|is|are|do|does)\b/.test(lower)) {
    return `Short answer on ${focus}: it depends mainly on ${terms[1] ?? "scope"} and ${terms[2] ?? "timing"}.\n\nA practical way to think about it:\n• What outcome would make ${focus} clearly worthwhile?\n• What's the smallest version you could test this week?\n• Who needs to agree before it sticks?\n\nGive me a bit more detail on your situation and I'll get more specific.`;
  }

  return `Got it${history > 2 ? ", picking up from what we've covered" : ""} — you're focused on ${terms.slice(0, 3).join(", ") || "this"}.\n\nHere's how I'd approach it:\n• Clarify what "done" looks like for ${focus}.\n• Strip it to the one step that unblocks everything else.\n• Put a date and an owner on that step today.\n\nWant me to turn this into an email, a summary, or a meeting agenda?`;
}
