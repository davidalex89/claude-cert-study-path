# Content authoring guide

All study content lives in `js/data/<track>.js`. Each file registers one certification into `window.CERT_DATA`. There is no build step and no framework — the rendering engine in `js/app.js` reads these objects directly.

If you're adding or correcting content, this is the contract.

## Ground rules

1. **Everything must be original.** Never copy from the live exam item bank, from commercial question banks, or from other people's practice repos (most are unlicensed = all rights reserved). Write questions against Anthropic's **published exam blueprint objectives**, in the style and difficulty of the sample questions Anthropic itself publishes in each Exam Guide.
2. **Only the guide's own sample questions may be reproduced**, tagged `source: "official"`, with their published answer and rationale.
3. **Don't invent APIs.** No fake flags, parameters, tool names, or config keys. If you can't verify it in the official docs or exam guide, don't assert it.
4. **Depth should track exam weight.** A 33%-weight domain deserves substantially more sections, questions, and flashcards than a 3% one.
5. **Validate before committing**: `node --check js/data/<file>.js`.

## Cert object

```js
window.CERT_DATA["developer"] = {
  id: "developer",
  name: "Claude Certified Developer – Foundations",
  code: "CCDV-F",
  cost: "$125 USD",
  questions: 53,              // number — real exam item count
  time: "120 min",
  passingScore: "720/1000",
  validity: "12 months",
  tagline: "…",               // one line, shown on the home lane header
  audience: "…",              // paragraph, shown on the track page
  scenarios: "…",             // OPTIONAL, plain text only (no HTML) — Architect-Foundations only
  domains: [ /* … */ ]
};
```

## Domain object

```js
{
  id: "d1",                   // d1, d2, … in blueprint order
  title: "Agents and Workflows",
  weight: 15,                 // number, % of exam per the official blueprint
  summary: "…",               // one line, shown on the track roadmap
  objectives: ["…"],          // the blueprint's task statements
  lesson: { sections: [ /* … */ ], checks: [ /* … */ ] },
  quiz: [ /* … */ ],
  flashcards: [ /* … */ ]
}
```

### `lesson.sections[]` — one per page in the walkthrough

```js
{
  heading: "The agentic loop: stop_reason is the control signal",
  body: "<p>…</p>",           // HTML string
  interactive: { /* optional — see widgets below */ }
}
```

Each section becomes **its own page**. Aim for one idea per section, explained properly: prose, a concrete worked example, and where it helps, an analogy or an interactive. A section that's a single dry paragraph should either be enriched or merged into its neighbour.

**Multi-line `body` strings must use backticks** (template literals). A literal newline inside a double-quoted JS string is a syntax error — this is the single most common mistake in these files. Single-paragraph bodies can use `"…"`.

Available content primitives inside `body`:

```html
<!-- analogy: a non-AI comparison that makes the concept click -->
<div class="callout analogy"><span class="callout-label">Think of it like...</span>…</div>

<!-- generic callout / warning -->
<div class="callout"><span class="callout-label">Note</span>…</div>
<div class="callout warn"><span class="callout-label">Watch out</span>…</div>

<!-- side-by-side wrong/right -->
<div class="compare-grid">
  <div class="compare-col bad"><span class="cc-label">✗ …</span>…</div>
  <div class="compare-col good"><span class="cc-label">✓ …</span>…</div>
</div>

<pre><code>// short, illustrative — under ~10 lines</code></pre>
```

### Interactive widgets

Four types, all data-driven. Attach one to a section via `interactive:`.

**`stepThrough`** — walk a process one turn at a time; the transcript accumulates.
```js
interactive: {
  type: "stepThrough",
  title: "Watch the loop run",
  steps: [{
    label: "Turn 1",
    stopReason: "tool_use",      // optional: "tool_use" | "end_turn" → renders a badge
    narration: "…",              // what's happening and why it matters
    messages: [{ role: "assistant", kind: "tool_call", text: "get_customer(…)" }]
    // kind: "tool_call" | "tool_result" | "final"
  }]
}
```

**`scenario`** — a branching decision with consequences.
```js
interactive: {
  type: "scenario",
  title: "You're the coordinator",
  setup: "…",
  choices: [
    { text: "…", outcome: "bad",  feedback: "…" },
    { text: "…", outcome: "good", feedback: "…" }
  ]
}
```

**`classify`** — sort items into buckets, with per-item feedback and a running score.
```js
interactive: {
  type: "classify",
  title: "Hook or prompt guidance?",
  instructions: "…",
  items: [{
    text: "…",
    answer: "hook",
    options: [["hook", "🔒 Hook"], ["prompt", "💬 Prompt"]],  // optional; defaults to hook/prompt
    why: "…"
  }]
}
```

**`sequence`** — put steps in the correct order (click them in sequence).
```js
interactive: {
  type: "sequence",
  title: "Order the agentic loop",
  instructions: "…",
  items: [{ text: "…" }],      // authored in the CORRECT order; shuffled at render time
  explanation: "…"             // shown after checking
}
```

### `lesson.checks[]` and `quiz[]`

Same shape. `checks` are 2–3 quick checkpoints shown as the walkthrough's final page; `quiz` is the domain's practice bank (and feeds the track's full practice exam).

```js
{
  type: "single",              // "single" | "multi"
  question: "…",
  options: ["…", "…", "…", "…"],
  correct: [1],                // indices; for "multi", the UI caps selection at correct.length
  explanation: "…",            // why right is right AND why the distractors are wrong
  source: "official"           // ONLY for reproduced Exam Guide sample questions
}
```

Question quality bar:
- **Scenario-framed, not recall.** "A coordinator delegates X and Y happens — what's the root cause?" beats "What does stop_reason mean?"
- **Plausible distractors.** Each wrong option should be something a half-prepared candidate would actually pick. Avoid joke options.
- **Explanations teach.** Say why the right answer is right *and* why each tempting distractor fails.
- **Bank size**: aim for ~2.5× the real exam's item count per track, so a practice exam doesn't repeat itself.

### `flashcards[]`

```js
{ front: "What does stop_reason \"tool_use\" tell the loop to do?", back: "Continue: execute the tool(s)…" }
```

One fact per card. Front should be a real question, not a topic label. 8–14 per domain, scaled to weight.
