/* Claude Certified Associate – Foundations (CCAO-F)
   Domain blueprint sourced from Anthropic's official Exam Guide (v1.0, July 2026).
   All lesson content, practice questions, and flashcards below are original,
   written to teach the published blueprint objectives — not drawn from any
   live exam item bank. The three items marked source:"official" in Domain 2,
   3, and 6 quizzes are the illustrative sample questions Anthropic itself
   publishes in the Exam Guide for candidate preparation (reproduced with
   their published answer + rationale).
*/
window.CERT_DATA = window.CERT_DATA || {};
window.CERT_DATA["associate"] = {
  id: "associate",
  name: "Claude Certified Associate – Foundations",
  code: "CCAO-F",
  cost: "$99 USD",
  questions: 60,
  time: "120 min",
  passingScore: "720/1000",
  validity: "12 months",
  tagline: "Use Claude effectively and responsibly in day-to-day business work — no code required.",
  audience: "For professionals who use Claude as a productivity tool in roles like operations, marketing, project management, education, communications, and HR — plus consultants who help organizations adopt it. You're expected to build Projects, write structured prompts, evaluate AI output critically, and know when to escalate to a Developer or Architect. This track assumes no coding or API experience.",
  domains: [
    {
      id: "d1",
      title: "Prompting and Task Execution",
      weight: 14,
      summary: "Writing effective prompts, decomposing complex requests, and adapting strategy to the task at hand.",
      objectives: [
        "Create effective prompts for business and technical tasks",
        "Apply task decomposition techniques to structure complex requests",
        "Iterate prompts to improve output quality",
        "Adapt prompting strategies based on task type (analysis, research, drafting, brainstorming)"
      ],
      lesson: {
        sections: [
          {
            heading: "Give Claude what it needs to succeed",
            body: "<p>A prompt is a specification, not a search query. The gap between a mediocre result and a great one is almost always missing information: what the output is <em>for</em>, who will read it, what \"good\" looks like, and what constraints matter. Before asking, gather:</p><ul><li><strong>Goal</strong> — what decision or action does this output support?</li><li><strong>Audience</strong> — a board summary and a Slack update need different vocabulary and length.</li><li><strong>Format</strong> — table, bullet list, prose memo, or an artifact meant to be edited further?</li><li><strong>Constraints</strong> — word count, tone, things to avoid, data that must be included.</li></ul><p>You don't need a rigid template for every request — but for anything you'll reuse or hand to someone else, writing these four things down first produces noticeably more usable first drafts.</p>"
          },
          {
            heading: "Task decomposition",
            body: `<p>Broad, multi-part requests ("build me a marketing plan") produce shallow, generic output because Claude has to guess your priorities. Decomposition means breaking the request into an ordered sequence of smaller, well-scoped asks, each with its own success criteria:</p><pre><code>1. Summarize what we know about the target audience (inputs: persona notes)
2. Draft 3 candidate positioning statements from that summary
3. Pick one and build a channel plan against it
4. Turn the channel plan into a dated timeline</code></pre><p>This also gives you natural checkpoints to review and redirect before errors compound — catching a wrong assumption at step 1 is cheap; catching it after step 4 means redoing everything downstream.</p>`
          },
          {
            heading: "Iterating instead of starting over",
            body: "<p>Treat the first response as a draft, not a verdict. Vague feedback (\"make it better\") produces another guess; specific feedback narrows the search:</p><ul><li><strong>Weak:</strong> \"This isn't quite right, try again.\"</li><li><strong>Better:</strong> \"Cut the second paragraph — it repeats the intro. Make the recommendation more direct: lead with the number, not the caveat.\"</li></ul><p>Point at concrete lines, name what's wrong (too long, wrong tone, missing a number), and say what \"fixed\" looks like. This is faster than a fresh prompt because Claude keeps everything that was already working.</p>"
          },
          {
            heading: "Matching strategy to task type",
            body: "<p>The right prompting approach changes with the kind of work:</p><ul><li><strong>Analysis</strong> — give explicit evaluation criteria up front (\"score each vendor on cost, integration effort, and support SLA\") so the comparison is structured, not just descriptive.</li><li><strong>Research</strong> — ask Claude to flag uncertainty and distinguish well-established facts from inference; treat it as a fast first pass to verify, not a finished citation.</li><li><strong>Drafting</strong> — front-load tone, length, and audience; iterate on structure before you polish sentences.</li><li><strong>Brainstorming</strong> — explicitly ask for volume and range (\"give me 20, including a few unconventional ones\") before asking for judgment; mixing generation and evaluation in one pass narrows the results prematurely.</li></ul>"
          }
        ],
        checks: [
          {
            type: "single",
            question: "You ask Claude for \"a plan to improve our onboarding process\" and get a generic, high-level list you can't act on. What's the most effective next step?",
            options: [
              "Ask Claude to make the same plan \"more detailed and specific.\"",
              "Break the request into steps — e.g., first summarize current onboarding pain points from your notes, then propose fixes for the top three, then sequence them into a timeline.",
              "Regenerate the response a few times and pick the best one.",
              "Switch to a different AI tool since Claude couldn't handle it."
            ],
            correct: [1],
            explanation: "The output was generic because the request was broad and left Claude to guess your priorities and inputs. Decomposing it into scoped steps — each with real inputs to work from — produces a plan grounded in your actual situation rather than a generic template. Asking for \"more detail\" on an ungrounded plan just produces more confident-sounding generic content."
          },
          {
            type: "single",
            question: "You're brainstorming taglines and want a wide range of options before narrowing down. Which instruction best fits that goal?",
            options: [
              "\"Give me the single best tagline for this product.\"",
              "\"Give me 20 taglines, including a few unconventional or risky ones — don't filter yet, we'll narrow down after.\"",
              "\"Give me 3 taglines that are safe and on-brand.\"",
              "\"Give me a tagline and explain why it's the best choice.\""
            ],
            correct: [1],
            explanation: "Brainstorming needs volume and range before judgment. Asking for one \"best\" answer collapses generation and evaluation into a single step, which narrows the option space before you've actually seen it."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "A colleague's prompt says only: \"Write something about our Q3 numbers.\" The output is vague and unusable. What's missing?",
          options: [
            "Nothing — the output quality is just random.",
            "Goal, audience, format, and constraints — the prompt doesn't say what the output is for or who reads it.",
            "The prompt is too short to work at all.",
            "Claude needs the raw data file, not a text prompt."
          ],
          correct: [1],
          explanation: "A vague prompt without a stated goal, audience, or format forces Claude to guess, and generic guesses produce generic prose. Specifying purpose and audience alone (e.g. \"a one-paragraph summary for the exec team, leading with whether we hit target\") sharply improves usability."
        },
        {
          type: "single",
          question: "Which task benefits most from asking Claude to explicitly flag uncertainty and separate established facts from inference?",
          options: [
            "Drafting a birthday message for a coworker",
            "Open-ended research on a topic you'll fact-check before using",
            "Brainstorming a list of possible team names",
            "Reformatting a table from CSV to Markdown"
          ],
          correct: [1],
          explanation: "Research tasks carry the highest risk of confidently-stated but wrong claims. Asking Claude to separate what's well-established from what it's inferring gives you a map of where to verify before you rely on the output."
        },
        {
          type: "single",
          question: "You want to improve a drafted email Claude wrote. Which feedback will most efficiently get you the fix you want?",
          options: [
            "\"This is close, but not quite — try again.\"",
            "\"Make it better.\"",
            "\"Cut the third paragraph, it repeats paragraph one. Shorten the subject line to under 8 words.\"",
            "\"I don't like it.\""
          ],
          correct: [2],
          explanation: "Specific, located feedback (what to cut, what the new constraint is) lets Claude fix exactly what's wrong while preserving what already worked. Vague feedback re-rolls the whole draft from scratch."
        },
        {
          type: "single",
          question: "Decomposing a complex request into an ordered sequence of smaller steps is most valuable because it:",
          options: [
            "Makes the prompt longer, which always improves quality.",
            "Creates checkpoints where you can catch a wrong assumption before it compounds through later steps.",
            "Is required by Claude's context window limits.",
            "Guarantees the final output needs no further editing."
          ],
          correct: [1],
          explanation: "The main value of decomposition is early error-catching: reviewing step 1 before moving to step 4 means a bad assumption gets fixed cheaply instead of propagating through the whole chain."
        },
        {
          type: "single",
          question: "A project manager needs Claude to compare five vendor proposals. Which prompting approach produces the most useful comparison?",
          options: [
            "\"Tell me what you think of these five proposals.\"",
            "\"Score each vendor on cost, implementation timeline, and support SLA, then rank them.\"",
            "\"Summarize each proposal in one sentence.\"",
            "\"Pick the best vendor.\""
          ],
          correct: [1],
          explanation: "Analysis tasks need explicit evaluation criteria up front. Naming the dimensions (cost, timeline, SLA) turns a vague opinion request into a structured, defensible comparison."
        },
        {
          type: "multi",
          question: "Which two of the following are signs a request should be decomposed into smaller steps rather than sent as one prompt? (Select 2)",
          options: [
            "The request bundles several distinct deliverables (e.g., \"analyze the data, write the report, and design the slide deck\").",
            "The request is a single, well-scoped question with a short factual answer.",
            "Getting the first part wrong would invalidate a lot of downstream work if you don't catch it early.",
            "The request is shorter than one sentence."
          ],
          correct: [0, 2],
          explanation: "Bundled, multi-deliverable requests and high-stakes-if-wrong first steps are the classic cases for decomposition — both benefit from a checkpoint. A short, well-scoped factual question doesn't need to be broken up further."
        }
      ],
      flashcards: [
        { front: "What four things should you specify before sending a non-trivial prompt?", back: "Goal (what decision it supports), audience, format, and constraints." },
        { front: "Why does task decomposition improve output quality on complex requests?", back: "It creates checkpoints — you catch a wrong assumption at step 1 instead of after it has propagated through every later step." },
        { front: "What makes iteration feedback effective versus vague?", back: "Point at specific lines, name what's wrong, and state the target — e.g. \"cut paragraph 2, tighten the subject line to 8 words\" instead of \"make it better.\"" },
        { front: "For brainstorming tasks, what should you ask for before narrowing down?", back: "Volume and range — explicitly ask for many options, including unconventional ones, before asking Claude to judge or filter them." },
        { front: "For analysis tasks, what should you provide up front?", back: "Explicit evaluation criteria (the dimensions to score or compare on), so the result is a structured comparison rather than a vague opinion." },
        { front: "For research tasks, what should you explicitly ask Claude to do?", back: "Flag uncertainty and distinguish well-established facts from inference, since research carries the highest risk of confidently-stated but wrong claims." },
        { front: "Why is \"make it better\" weak iteration feedback?", back: "It gives Claude no target, so it produces another guess rather than a directed fix — you lose whatever was already working in the draft." },
        { front: "What's the risk of sending one giant prompt for a multi-deliverable task (analysis + report + slides)?", back: "Errors compound silently across deliverables with no checkpoint to catch a wrong assumption early." }
      ]
    },
    {
      id: "d2",
      title: "Output Evaluation and Validation",
      weight: 21,
      summary: "The single largest domain: catching hallucinations, verifying claims, and choosing the right output format.",
      objectives: [
        "Evaluate Claude-generated outputs for accuracy and completeness",
        "Identify hallucinations, inconsistencies, and biases in responses",
        "Apply fact-checking and validation techniques",
        "Determine when human review or additional verification is required",
        "Edit, adapt, refine, and compare outputs for the intended audience",
        "Organize and curate information and select appropriate output formats (artifacts, inline, structured data)"
      ],
      lesson: {
        sections: [
          {
            heading: "Why this is the biggest domain on the exam",
            body: "<p>At 21% of the exam, output evaluation outweighs every other domain — because the Associate's core job isn't producing AI output, it's <em>being the quality gate</em> on it before it reaches a decision, a customer, or a compliance team. Language models can state specific-sounding but fabricated details — a citation, a subsection number, a statistic — with exactly the same confident tone as a correct one. Confidence is not a reliability signal.</p>"
          },
          {
            heading: "Hallucinations, inconsistencies, and bias",
            body: "<ul><li><strong>Hallucinations</strong> — fabricated facts, sources, numbers, or quotes that sound plausible but aren't real. Most likely wherever Claude cites something oddly specific (a page number, an exact statistic) without being given the source text.</li><li><strong>Inconsistencies</strong> — a document that contradicts itself, e.g. a total that doesn't match its line items, or a recommendation that ignores a constraint stated earlier in the same conversation.</li><li><strong>Bias</strong> — outputs that skew toward one framing, omit a relevant perspective, or apply different standards to comparable cases (e.g., describing two similar candidates in subtly different tones).</li></ul>"
          },
          {
            heading: "Fact-checking and knowing when to escalate",
            body: "<p>The validation bar scales with what's at stake. A rule of thumb: <strong>any claim bound for a compliance, legal, financial, or external-facing audience gets verified against a primary source before it ships</strong> — self-reported confidence from Claude is not sufficient, and rewording a claim to sound more authoritative doesn't make it more accurate. For lower-stakes internal drafts, a lighter read-through may be enough. When you're not equipped to verify a domain-specific claim yourself (e.g., a regulatory interpretation), that's the signal to route it to a subject-matter expert or escalate to a Developer/Architect if it's a technical claim about how a system behaves.</p>"
          },
          {
            heading: "Choosing the right output format",
            body: "<p>Match the format to how the output will be used, not just what's easiest to generate:</p><ul><li><strong>Artifacts</strong> — for anything the recipient will keep editing (a document, code, a slide outline) or view outside the chat.</li><li><strong>Inline chat response</strong> — for quick, disposable answers that don't need to be reused.</li><li><strong>Structured data (tables, JSON, CSV)</strong> — when the output feeds another tool or process, or needs to be scanned/sorted rather than read top to bottom.</li></ul><p>Curating also means cutting: a report with everything Claude generated, unedited, is not the same as a report edited down to what the audience actually needs.</p>"
          }
        ],
        checks: [
          {
            type: "single",
            question: "Claude produces a summary with a specific-sounding citation (\"per Section 4.2 of the policy\") that you can't immediately verify. What does high confidence in the phrasing tell you about its accuracy?",
            options: [
              "Confident phrasing means it's very likely accurate.",
              "Nothing reliable — confident phrasing and factual accuracy are independent; specific-sounding details are exactly where hallucinations tend to appear.",
              "It means the source document was included in the prompt.",
              "It means the claim has already been fact-checked."
            ],
            correct: [1],
            explanation: "Language models produce fabricated specifics (citations, numbers, page references) in the same confident tone as accurate ones. Confidence is not a reliability signal — specific unverified details are exactly what to check first."
          },
          {
            type: "single",
            question: "Which of these outputs most clearly needs human/expert review before use, rather than a quick self-check?",
            options: [
              "A brainstormed list of internal meeting icebreakers",
              "A regulatory compliance summary going to your legal team, containing a specific clause citation",
              "A first-draft outline for a team lunch invite",
              "A reformatted version of notes you already wrote yourself"
            ],
            correct: [1],
            explanation: "Claims bound for a compliance/legal audience carry real consequences if wrong, and specific citations are a known hallucination risk — this combination clears the bar for expert verification before it ships."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "An associate asks Claude to summarize a new regulation, and Claude produces a confident summary citing a specific subsection number. Before sending the summary to the compliance team, what is the most appropriate action?",
          options: [
            "Send it as-is, since Claude expressed high confidence.",
            "Verify the cited subsection against the official regulation text before sharing.",
            "Ask Claude to rate its own confidence and send it if the rating is high.",
            "Reword the summary to sound more formal, then send it."
          ],
          correct: [1],
          explanation: "Language models can fabricate specific-looking details such as citation numbers, a hallucination. Validating factual claims, especially citations bound for a compliance audience, against an authoritative source is the diligence step required. Self-reported confidence is not a reliable accuracy signal, and reformatting does not address correctness.",
          source: "official"
        },
        {
          type: "single",
          question: "A monthly report Claude drafted has a summary total that doesn't match the sum of the line items listed two paragraphs later. This is best described as:",
          options: [
            "A hallucination, since a number was invented.",
            "An internal inconsistency — the document contradicts its own numbers, regardless of which figure (if either) is correct.",
            "A formatting issue that doesn't affect accuracy.",
            "Evidence of bias in the report."
          ],
          correct: [1],
          explanation: "A document that contradicts itself — a total that doesn't reconcile with its own line items — is an internal inconsistency. It should be caught even before you check either number against a source."
        },
        {
          type: "single",
          question: "Which output most clearly calls for the artifact format rather than an inline chat reply?",
          options: [
            "A one-line yes/no answer to a scheduling question",
            "A five-page project proposal the team will continue editing over the next week",
            "A quick clarification of a term used earlier in the conversation",
            "A single-sentence rephrasing of a sentence you pasted in"
          ],
          correct: [1],
          explanation: "Artifacts fit content that will be kept, edited further, or viewed outside the chat — a multi-page document the team will iterate on is the clearest case. Quick, disposable answers are better as inline responses."
        },
        {
          type: "single",
          question: "You notice that Claude's drafted performance summaries describe two employees with comparable achievements in subtly different tones — one \"confidently led\" a project, the other \"was involved in\" a similar one. This is most likely an example of:",
          options: [
            "A hallucination",
            "Bias — inconsistent framing applied to comparable cases",
            "A formatting error",
            "A context window limitation"
          ],
          correct: [1],
          explanation: "Applying different standards or tone to comparable cases is a bias pattern, distinct from hallucination (fabricated facts) or inconsistency (self-contradiction)."
        },
        {
          type: "multi",
          question: "Which two situations most clearly require human review before Claude's output is used, rather than a quick self-check? (Select 2)",
          options: [
            "A customer-facing claim about pricing or contractual terms",
            "A casual internal brainstorm list with no downstream consequence",
            "A legal or regulatory interpretation feeding a compliance decision",
            "A reformatted version of a table you already verified"
          ],
          correct: [0, 2],
          explanation: "Customer-facing commitments and compliance/legal interpretations both carry real consequences if wrong and involve claims the associate typically can't fully verify alone — both should route to expert review."
        },
        {
          type: "single",
          question: "You need to hand a dataset of extracted line items to a downstream spreadsheet tool. Which output format is most appropriate?",
          options: [
            "A prose paragraph summarizing the data",
            "Structured data such as a table or CSV",
            "An inline chat message",
            "A brainstormed list"
          ],
          correct: [1],
          explanation: "When output feeds another tool or process, structured data (table/CSV/JSON) is the right format — it's built to be parsed and sorted, not read top to bottom."
        }
      ],
      flashcards: [
        { front: "Why is \"Claude sounded confident\" not a reliable accuracy signal?", back: "Language models state fabricated details (citations, numbers, quotes) with the same confident tone as accurate ones — confidence and correctness are independent." },
        { front: "Define hallucination in this context.", back: "A fabricated fact, source, number, or quote that sounds plausible but isn't real — most likely around oddly specific unsupported details." },
        { front: "Define an internal inconsistency (vs. a hallucination).", back: "A document contradicting itself — e.g. a summary total that doesn't match its own line items — independent of whether any single figure is factually correct." },
        { front: "What's the rule of thumb for when a claim must be verified against a primary source?", back: "Anything bound for a compliance, legal, financial, or external-facing audience — verify before it ships; self-reported AI confidence doesn't substitute." },
        { front: "When should you escalate an output rather than verify it yourself?", back: "When you're not equipped to judge a domain-specific claim (e.g., a regulatory interpretation) — route it to a subject-matter expert, or to a Developer/Architect for technical system claims." },
        { front: "When should you use the Artifact format?", back: "For content the recipient will keep editing or view outside the chat — documents, code, slide outlines." },
        { front: "When should you use structured data (table/JSON/CSV) as the output format?", back: "When the output feeds another tool or process, or needs to be scanned/sorted rather than read as prose." },
        { front: "Give an example of bias in AI output (distinct from hallucination or inconsistency).", back: "Applying inconsistent tone or standards to comparable cases — e.g. describing two similar achievements with different levels of credit." },
        { front: "What does \"curating\" an AI-generated report mean, beyond fact-checking?", back: "Cutting it down to what the audience actually needs — an unedited full dump of everything generated is not the same as a curated report." }
      ]
    },
    {
      id: "d3",
      title: "Product and Model Selection",
      weight: 12,
      summary: "Matching Claude's product surfaces and model tiers to the task's cost, speed, and quality needs.",
      objectives: [
        "Select appropriate Claude product features (Projects, research mode, chat, artifacts)",
        "Differentiate between Claude model types (Haiku, Sonnet, Opus)",
        "Align model selection with task requirements (cost, speed, quality)",
        "Understand and manage context limitations and memory considerations (when to restart, summarize, or persist)"
      ],
      lesson: {
        sections: [
          {
            heading: "Product features: pick the surface for the job",
            body: "<ul><li><strong>Plain chat</strong> — one-off questions, quick tasks with no ongoing context to maintain.</li><li><strong>Projects</strong> — recurring work with shared context: persistent instructions plus knowledge sources so you're not re-explaining background every session.</li><li><strong>Research mode</strong> — open-ended, multi-source investigation where you want Claude to explore rather than answer from a fixed prompt.</li><li><strong>Artifacts</strong> — any output meant to be viewed or edited as a standalone document/file rather than read inline.</li></ul>"
          },
          {
            heading: "Model tiers: cost, speed, and quality are a triangle",
            body: "<p>Claude's model tiers — Haiku, Sonnet, and Opus — trade off along cost, latency, and reasoning depth. There isn't a single \"best\" model; there's a best model <em>for the task</em>:</p><ul><li><strong>Haiku</strong> — fastest and cheapest; fits high-volume, low-complexity work (short replies, simple classification, quick formatting).</li><li><strong>Sonnet</strong> — the balanced default for most day-to-day work requiring real reasoning.</li><li><strong>Opus</strong> — highest capability for the hardest reasoning, at the highest cost and latency; reserve it for work where getting it right matters more than getting it fast or cheap.</li></ul><p>Always using the top-tier model \"to be safe\" wastes budget and time on tasks that didn't need it; always defaulting to the cheapest model risks quality on tasks that did.</p>"
          },
          {
            heading: "Managing context and memory",
            body: "<p>Every conversation has a finite context window, and Projects add persistent memory on top. Practical judgment calls:</p><ul><li><strong>Restart</strong> a conversation when it has drifted far from the original topic or accumulated a lot of now-irrelevant back-and-forth — a fresh start with a clean, focused prompt often beats continuing a cluttered thread.</li><li><strong>Summarize</strong> long threads before continuing serious work in them, so the important decisions stay salient instead of buried in scrollback.</li><li><strong>Persist</strong> stable, reusable information (standards, background facts, style guides) in a Project's knowledge/instructions rather than re-pasting it every session.</li></ul>"
          }
        ],
        checks: [
          {
            type: "single",
            question: "You need to classify 5,000 short support tickets into 4 categories, fast and cheaply, with no complex reasoning required. Which model tier fits best?",
            options: [
              "Opus — always use the most capable model available.",
              "Haiku — fast and low-cost, suited to high-volume, low-complexity classification.",
              "Whichever model is newest, regardless of tier.",
              "Sonnet, because it's the default for everything."
            ],
            correct: [1],
            explanation: "High-volume, low-complexity work is exactly where the fastest/cheapest tier fits — using a higher tier wouldn't improve accuracy on a task this simple, only cost and latency."
          },
          {
            type: "single",
            question: "You're doing recurring monthly reporting that always references the same style guide and background context. What's the most efficient setup?",
            options: [
              "Re-paste the style guide and background into a new chat every month.",
              "Set up a Project with the style guide and background as persistent instructions/knowledge, so you don't re-explain them each time.",
              "Use research mode every time to look up the style guide fresh.",
              "Ask Claude to memorize the style guide permanently across all future unrelated chats."
            ],
            correct: [1],
            explanation: "Stable, reused context belongs in a Project's persistent instructions/knowledge sources — that's precisely the feature built for recurring work with shared background."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "An associate needs to generate a high volume of short customer-reply drafts where speed and cost matter more than deep reasoning. Which choice best fits the task?",
          options: [
            "Use the most capable, highest-cost model for every reply to maximize quality.",
            "Use a faster, lower-cost model suited to straightforward, high-volume tasks.",
            "Disable all product features to reduce cost.",
            "Switch to a different AI platform."
          ],
          correct: [1],
          explanation: "Aligning model selection with task requirements means matching a faster, lower-cost model to straightforward, high-volume work, reserving the most capable model for complex reasoning. Always using the top model wastes the cost/latency budget; disabling features or switching platforms doesn't address the trade-off.",
          source: "official"
        },
        {
          type: "single",
          question: "A conversation has drifted across five unrelated subtopics over an hour, and the scrollback is cluttered. You need to do focused, serious work on just one of those subtopics now. Best move?",
          options: [
            "Keep going in the same thread — more context is always better.",
            "Start a fresh conversation with a clean, focused prompt covering just what's needed for the current subtopic.",
            "Ask Claude to ignore everything except the first message.",
            "Switch to Opus so it can handle the clutter better."
          ],
          correct: [1],
          explanation: "When a thread has drifted and accumulated irrelevant context, restarting with a focused prompt typically produces better results than continuing in a cluttered thread — a bigger model doesn't fix a noisy context, it just processes the noise more expensively."
        },
        {
          type: "single",
          question: "Which task is the best fit for Claude's research mode rather than a single chat prompt?",
          options: [
            "Reformatting one paragraph into bullet points",
            "Open-ended investigation across multiple sources on an unfamiliar topic",
            "Answering a single factual question you already know the answer to",
            "Fixing a typo in a sentence"
          ],
          correct: [1],
          explanation: "Research mode is built for open-ended, multi-source exploration — it fits investigative work, not quick single-turn edits."
        },
        {
          type: "multi",
          question: "Which two of the following are good reasons to persist information in a Project's knowledge/instructions rather than re-pasting it each session? (Select 2)",
          options: [
            "The information is stable and reused across many sessions (e.g., a style guide).",
            "The information is a one-off detail relevant to a single, unrepeated task.",
            "Re-explaining the same background every session wastes time and risks drift between sessions.",
            "You want Claude to forget the information as soon as possible."
          ],
          correct: [0, 2],
          explanation: "Projects exist for recurring context: stable, reusable information that would otherwise need re-explaining (and risk drifting) every session. One-off, non-reused details don't need persistence."
        },
        {
          type: "single",
          question: "Why is \"always use the highest-tier model, regardless of task\" not a sound default strategy?",
          options: [
            "Higher-tier models produce lower-quality answers on simple tasks.",
            "It wastes cost and latency budget on tasks that didn't need the extra reasoning capability.",
            "Higher-tier models cannot handle simple tasks at all.",
            "It's against platform policy to use a lower tier."
          ],
          correct: [1],
          explanation: "Model selection is a cost/speed/quality trade-off, not a strict hierarchy. Defaulting to the top tier for every task spends budget and time without improving outcomes on tasks simple enough for a lighter model."
        },
        {
          type: "single",
          question: "What is the main practical risk of never restarting or summarizing a very long-running conversation?",
          options: [
            "Claude will refuse to respond after a fixed number of messages.",
            "Important earlier decisions can get buried in scrollback and drift out of effective context, degrading output quality.",
            "The Project's knowledge sources get permanently deleted.",
            "There is no risk — longer conversations are always better."
          ],
          correct: [1],
          explanation: "Context windows and effective attention are finite; letting a thread run indefinitely without summarizing risks losing track of earlier decisions and cluttering the context that later responses draw on."
        }
      ],
      flashcards: [
        { front: "When should you use a Claude Project instead of plain chat?", back: "For recurring work with shared context — persistent instructions plus knowledge sources you'd otherwise re-explain every session." },
        { front: "What is research mode best suited for?", back: "Open-ended, multi-source investigation where you want Claude to explore, not just answer a fixed single-turn prompt." },
        { front: "Rank Claude's model tiers by cost/speed vs. reasoning depth.", back: "Haiku (fastest/cheapest, simple tasks) → Sonnet (balanced default) → Opus (highest capability, highest cost/latency, hardest reasoning)." },
        { front: "What's the risk of always defaulting to the highest-tier model?", back: "Wasted cost and latency on tasks that didn't need the extra reasoning power — model selection is a trade-off, not a strict hierarchy." },
        { front: "What's the risk of always defaulting to the cheapest/fastest model?", back: "Risking quality on tasks that actually needed deeper reasoning." },
        { front: "When should you restart a conversation instead of continuing it?", back: "When it has drifted far from topic or accumulated a lot of irrelevant back-and-forth — a focused fresh start often beats a cluttered thread." },
        { front: "When should you summarize a long thread instead of restarting it?", back: "Before continuing serious work in it, so key decisions stay salient instead of buried in scrollback — when the history is still relevant, just long." },
        { front: "What kind of information belongs in a Project's persistent knowledge/instructions?", back: "Stable, reusable information — style guides, standards, recurring background — not one-off task details." }
      ]
    },
    {
      id: "d4",
      title: "Workflow Integration and Solution Design",
      weight: 16,
      summary: "Using Claude to analyze requirements, support solution design, and integrate into existing team workflows.",
      objectives: [
        "Apply Claude to analyze requirements and use cases",
        "Leverage Claude for research, planning, and process optimization",
        "Use Claude to support solution design, development, and iteration",
        "Integrate Claude into existing workflows to augment or redesign them",
        "Communicate Claude's value and limitations to stakeholders"
      ],
      lesson: {
        sections: [
          {
            heading: "From requirements to use case",
            body: "<p>Before automating or augmenting a process with Claude, get specific about what's actually needed: what's the current process, where does it break down, and what would \"better\" measurably look like? Claude is a strong thinking partner for this analysis itself — feed it the current process description and ask it to surface gaps, redundant steps, or unclear ownership before you design a fix.</p>"
          },
          {
            heading: "Augment first, redesign only where it earns it",
            body: "<p>Two integration patterns show up constantly: <strong>augmenting</strong> an existing workflow (Claude does one step faster or better, the rest of the process is unchanged) versus <strong>redesigning</strong> it (the process itself changes shape because AI removes a bottleneck). Augmentation is lower-risk and faster to adopt; redesign has more upside but more change-management cost. Start by augmenting the highest-friction step, and only redesign the whole workflow once that's proven out.</p>"
          },
          {
            heading: "Communicating value and limitations honestly",
            body: "<p>Part of the Associate's job is setting accurate expectations with stakeholders — overselling AI capability creates rework and erodes trust when reality doesn't match the pitch. A credible pitch names the actual benefit (e.g., \"cuts first-draft time from two hours to twenty minutes\") <em>and</em> the actual limitation (\"still needs a domain expert's review before it goes external\") in the same breath. Being the one who correctly identifies where a workflow shouldn't yet rely on Claude is as valuable as identifying where it should.</p>"
          }
        ],
        checks: [
          {
            type: "single",
            question: "A department wants to \"use AI everywhere\" without identifying specific pain points first. What's the most appropriate first step?",
            options: [
              "Roll Claude out across every task at once and see what sticks.",
              "Analyze the current process to find specific bottlenecks and use cases before deciding where and how to apply Claude.",
              "Wait until the department has a fully detailed technical spec before doing anything.",
              "Tell the department AI can't help without more budget."
            ],
            correct: [1],
            explanation: "Effective workflow integration starts with requirements analysis — identifying where the actual friction is — rather than applying AI indiscriminately or waiting for unnecessary technical detail that isn't required for this kind of process work."
          },
          {
            type: "single",
            question: "You're pitching a Claude-assisted process to leadership. Which pitch is most credible?",
            options: [
              "\"This will replace the entire manual review process immediately.\"",
              "\"This cuts first-draft time from two hours to twenty minutes, but still needs expert review before anything goes external.\"",
              "\"AI can do anything if you prompt it right.\"",
              "\"We should adopt this because everyone else is.\""
            ],
            correct: [1],
            explanation: "A credible pitch states a concrete, specific benefit alongside an honest limitation. Overselling capability without naming what still requires human oversight creates rework and damages trust when reality falls short."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "A team's expense-approval process has one especially slow, error-prone manual step. Everything else in the process works fine. What's the lowest-risk first move?",
          options: [
            "Redesign the entire end-to-end process from scratch immediately.",
            "Augment just the slow step with Claude, leaving the rest of the process unchanged, then evaluate before going further.",
            "Leave the process untouched since it 'mostly works.'",
            "Replace the whole team's workflow tooling in one rollout."
          ],
          correct: [1],
          explanation: "Augmenting the highest-friction step first is lower-risk and faster to validate than a full redesign, and proves out the approach before committing to larger change-management cost."
        },
        {
          type: "single",
          question: "Which statement best reflects honest stakeholder communication about a Claude-assisted workflow?",
          options: [
            "Naming both the concrete benefit and the concrete limitation in the same conversation.",
            "Emphasizing only the benefits to secure buy-in quickly.",
            "Avoiding specifics so expectations stay flexible.",
            "Promising the workflow will need no human review going forward."
          ],
          correct: [0],
          explanation: "Overselling capability without naming limitations creates rework and erodes trust once reality doesn't match the pitch. Naming both builds credibility and sets accurate expectations."
        },
        {
          type: "single",
          question: "Before designing a Claude-assisted fix for a workflow, what should you establish first?",
          options: [
            "The specific bottleneck in the current process and what a measurable improvement would look like.",
            "Which AI vendor has the best marketing.",
            "The maximum possible automation, regardless of current pain points.",
            "Whether the workflow can be eliminated entirely."
          ],
          correct: [0],
          explanation: "Solution design starts from a clear picture of the current process, its actual breakdown points, and a measurable definition of 'better' — not from maximizing automation for its own sake."
        },
        {
          type: "multi",
          question: "Which two of these are examples of augmenting a workflow rather than redesigning it? (Select 2)",
          options: [
            "Using Claude to draft the first pass of a report that a person still edits and approves, with every other step unchanged.",
            "Rebuilding the entire approval chain because one drafting step got faster.",
            "Having Claude pre-summarize incoming support tickets before a human triages them, with triage otherwise unchanged.",
            "Removing all human review from a customer-facing process because a draft step is now automated."
          ],
          correct: [0, 2],
          explanation: "Augmentation improves one step while leaving the surrounding process intact. Rebuilding the whole chain or removing review entirely goes beyond augmentation into a structural redesign — a bigger, higher-risk change."
        },
        {
          type: "single",
          question: "A stakeholder asks whether Claude can fully replace a compliance reviewer's judgment on regulatory filings. What is the most accurate answer?",
          options: [
            "Yes, if the prompt is written carefully enough.",
            "No — it can accelerate drafting and flag issues, but a claim with real regulatory consequences still needs expert human review before it's finalized.",
            "Yes, since Claude always cites its sources correctly.",
            "It's impossible to know without testing every possible filing."
          ],
          correct: [1],
          explanation: "This mirrors the output-evaluation principle: claims with real compliance consequences need human/expert review. An honest answer names both the real acceleration benefit and the real limitation, rather than overselling full replacement."
        }
      ],
      flashcards: [
        { front: "What should you establish before designing any Claude-assisted workflow fix?", back: "The specific current bottleneck and a measurable definition of what 'better' looks like — from requirements analysis, not assumption." },
        { front: "Distinguish 'augmenting' a workflow from 'redesigning' it.", back: "Augmenting: Claude does one step better/faster, rest of process unchanged (lower risk). Redesigning: the process itself changes shape (more upside, more change-management cost)." },
        { front: "What's the recommended sequencing between augmenting and redesigning?", back: "Augment the highest-friction step first and prove it out before attempting a full workflow redesign." },
        { front: "What makes a stakeholder pitch about AI credible?", back: "Naming a concrete, specific benefit AND a concrete limitation in the same breath — not just the upside." },
        { front: "What's the risk of overselling Claude's capability to stakeholders?", back: "Rework and erosion of trust once reality doesn't match the pitch." },
        { front: "How can Claude itself help with the requirements-analysis step?", back: "Feed it the current process description and ask it to surface gaps, redundant steps, or unclear ownership before you design a fix." },
        { front: "Why is identifying where Claude should NOT be used yet also valuable?", back: "It's as important as identifying good use cases — it protects workflows (e.g., ones needing expert judgment) from premature, risky automation." }
      ]
    },
    {
      id: "d5",
      title: "Configuration and Knowledge Management",
      weight: 12,
      summary: "Configuring Projects, connectors, and system instructions so Claude has the right ongoing context.",
      objectives: [
        "Configure Claude Projects with instructions and knowledge sources",
        "Manage uploaded knowledge and connectors (e.g., Google Drive, Gmail)",
        "Create effective system-level instructions",
        "Inform, maintain, and update Claude configurations, knowledge sources, and instructions"
      ],
      lesson: {
        sections: [
          {
            heading: "Anatomy of a well-configured Project",
            body: "<p>A Project has two main configuration layers: <strong>instructions</strong> (standing guidance applied to every conversation in the Project — tone, format defaults, things to always/never do) and <strong>knowledge sources</strong> (documents and connectors Claude can reference — style guides, reference docs, live data via connectors like Google Drive or Gmail). Getting the split right matters: instructions shape <em>how</em> Claude behaves, knowledge shapes <em>what</em> it knows.</p>"
          },
          {
            heading: "Writing effective system-level instructions",
            body: "<p>Good instructions are specific and behavioral, not aspirational. Compare:</p><ul><li><strong>Weak:</strong> \"Be professional and helpful.\"</li><li><strong>Better:</strong> \"Write in second person, active voice, under 150 words per response unless asked for more. Never promise a delivery date — flag that timing needs confirmation from the PM instead.\"</li></ul><p>Concrete, checkable instructions are easier for Claude to follow consistently and easier for you to debug when output drifts from what you wanted.</p>"
          },
          {
            heading: "Managing knowledge sources and connectors over time",
            body: "<p>Uploaded documents and connectors (Google Drive, Gmail, etc.) go stale. A Project configured once and never revisited will confidently reference an outdated pricing sheet or a superseded policy. Treat configuration as something to maintain, not set-and-forget: periodically review what's connected, remove documents that are no longer authoritative, and update instructions when the underlying process changes. When a connector exposes sensitive data (e.g., a shared inbox), scope what's connected deliberately rather than granting broad access by default.</p>"
          }
        ],
        checks: [
          {
            type: "single",
            question: "You want a Project to always respond in a specific tone and never make delivery-date promises. Where does this belong?",
            options: [
              "As a knowledge source document.",
              "As a Project instruction — standing behavioral guidance applied to every conversation.",
              "It can't be configured; you have to repeat it in every prompt.",
              "As a connector."
            ],
            correct: [1],
            explanation: "Instructions shape how Claude behaves across every conversation in the Project — tone rules and behavioral constraints like 'never promise a date' are exactly what belongs there, rather than being re-specified per prompt."
          },
          {
            type: "single",
            question: "A Project's knowledge source is a pricing sheet that was updated three months ago outside the Project. What's the risk?",
            options: [
              "None — Claude always fetches the latest live version automatically.",
              "Claude may confidently reference the outdated pricing sheet as if it were current, since configuration isn't automatically refreshed.",
              "The Project will stop working until it's manually deleted.",
              "Connectors cannot reference pricing documents."
            ],
            correct: [1],
            explanation: "Uploaded knowledge sources go stale if not actively maintained; a Project isn't set-and-forget. Periodic review of what's connected and whether it's still authoritative is part of the configuration job."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "Which instruction is written well enough for Claude to follow consistently?",
          options: [
            "\"Be helpful and professional.\"",
            "\"Write responses in second person, active voice, under 150 words unless asked for more detail; never state a firm delivery date.\"",
            "\"Do a good job.\"",
            "\"Try to sound like our brand.\""
          ],
          correct: [1],
          explanation: "Specific, behavioral, checkable instructions (voice, length limit, an explicit prohibition) are easier to follow consistently and easier to debug than vague aspirational language."
        },
        {
          type: "single",
          question: "What's the functional difference between a Project's instructions and its knowledge sources?",
          options: [
            "There is no difference — they're the same thing.",
            "Instructions shape how Claude behaves; knowledge sources shape what Claude knows.",
            "Instructions are for connectors only; knowledge sources are for text only.",
            "Knowledge sources override instructions whenever they conflict."
          ],
          correct: [1],
          explanation: "Instructions are standing behavioral guidance (tone, format, do's/don'ts). Knowledge sources are the documents/connectors Claude can reference for factual content. Getting this split right is core to configuring a Project well."
        },
        {
          type: "single",
          question: "A connector gives a Project access to a shared inbox containing sensitive customer data. What's the most responsible configuration approach?",
          options: [
            "Grant the broadest access available by default, for convenience.",
            "Scope the connection deliberately to what's actually needed, rather than granting broad access by default.",
            "Avoid connectors entirely in every case.",
            "Leave scoping decisions to Claude at runtime."
          ],
          correct: [1],
          explanation: "When a connector exposes sensitive data, deliberate, minimal scoping is the responsible default — this connects to the governance/data-sensitivity judgment tested elsewhere on the exam."
        },
        {
          type: "multi",
          question: "Which two of these are signs a Project's configuration needs maintenance? (Select 2)",
          options: [
            "A knowledge-source document references a policy that was superseded months ago.",
            "The Project's instructions are still accurate and match the current process.",
            "Claude keeps citing figures from a pricing sheet that's no longer current.",
            "The Project was configured recently and reviewed last week."
          ],
          correct: [0, 2],
          explanation: "Stale knowledge sources — a superseded policy or an outdated pricing sheet still being cited — are the clearest signals that configuration needs a refresh. Accurate, recently reviewed configuration is the healthy state, not a warning sign."
        },
        {
          type: "single",
          question: "What is the main risk of treating a Project as \"set it up once and never revisit it\"?",
          options: [
            "The Project will automatically delete itself after a fixed period.",
            "Claude will confidently produce outdated answers grounded in stale knowledge sources or instructions.",
            "There is no risk — Projects self-update.",
            "Connectors will lose all data access permanently."
          ],
          correct: [1],
          explanation: "Uploaded documents and connected sources don't automatically stay current. Without periodic review, a Project will keep confidently referencing outdated material as if it were still accurate."
        }
      ],
      flashcards: [
        { front: "What's the functional difference between Project instructions and knowledge sources?", back: "Instructions shape HOW Claude behaves (tone, format, rules). Knowledge sources shape WHAT it knows (documents, connectors)." },
        { front: "Give an example of a weak vs. strong system instruction.", back: "Weak: 'Be professional and helpful.' Strong: 'Second person, active voice, under 150 words; never state a firm delivery date.'" },
        { front: "Why do concrete, checkable instructions work better than aspirational ones?", back: "They're easier for Claude to follow consistently and easier for you to debug when output drifts from what you wanted." },
        { front: "What's the risk of an unmaintained Project's knowledge sources?", back: "Claude will confidently reference stale/outdated documents (e.g., an old pricing sheet) as if they were current." },
        { front: "What should you do when a connector exposes sensitive data (e.g., a shared inbox)?", back: "Scope the connection deliberately to what's needed rather than granting broad access by default." },
        { front: "Is Project configuration a one-time setup task?", back: "No — it needs periodic review: removing stale knowledge sources and updating instructions as the underlying process changes." }
      ]
    },
    {
      id: "d6",
      title: "Governance, Risk, and Responsible Use",
      weight: 15,
      summary: "Recognizing appropriate use cases, handling sensitive data correctly, and following organizational AI policy.",
      objectives: [
        "Identify appropriate and inappropriate use cases",
        "Apply data sensitivity, regulatory, and privacy considerations",
        "Follow organizational AI policies and governance standards",
        "Understand the ethical implications of AI usage"
      ],
      lesson: {
        sections: [
          {
            heading: "Appropriate vs. inappropriate use cases",
            body: "<p>Not every task should go through an AI tool, regardless of technical feasibility. The exam tests judgment calls like: is this a task where a wrong or biased output has meaningful consequences for a real person (hiring, credit, discipline)? Is there an organizational policy that already restricts this category of use? Is the data involved sensitive enough that it shouldn't leave a controlled environment? \"Can Claude technically do this\" and \"should this go through Claude, here, right now\" are different questions.</p>"
          },
          {
            heading: "Data sensitivity in practice",
            body: "<p>The recurring pattern on this domain: someone wants Claude to analyze a dataset that contains regulated personal data (names, account numbers, health information) and organizational policy restricts sharing that data. The correct move is almost never \"upload it anyway\" or \"upload it but ask Claude not to retain it\" (an instruction doesn't satisfy a policy control) — it's to <strong>remove or anonymize the sensitive identifiers before uploading</strong>, so the analysis can proceed without exposing protected data. Abandoning the task outright is usually unnecessary once anonymization is on the table.</p>"
          },
          {
            heading: "Organizational policy and ethics",
            body: "<p>Governance isn't abstract — it's the actual AI usage policy your organization has adopted (what data can be uploaded, what use cases are pre-approved, what needs sign-off). Following it is part of the job, not optional best practice. On ethics, the recurring themes are: don't let AI-assisted output create or launder bias against real people, be transparent that AI was used where that matters to the audience, and don't treat AI output as a substitute for accountability — a human is still responsible for what ships.</p>"
          }
        ],
        checks: [
          {
            type: "single",
            question: "A hiring manager wants Claude to screen resumes and auto-reject candidates below a score threshold, with no human review. What's the main governance concern?",
            options: [
              "There is no concern — this is a routine productivity task.",
              "A high-stakes decision about real people (hiring) is being fully automated without human review, which risks unaccountable bias in a consequential outcome.",
              "Claude cannot read resumes.",
              "This only matters if the company has fewer than 50 employees."
            ],
            correct: [1],
            explanation: "Fully automating a consequential decision about real people, with no human review, is a textbook inappropriate-use pattern — the stakes and the bias risk both argue for human-in-the-loop review, not full automation."
          },
          {
            type: "single",
            question: "Someone wants to upload a spreadsheet with customer names and account numbers to Claude for trend analysis, but policy restricts sharing regulated personal data. What's the correct move?",
            options: [
              "Upload it as-is since the analysis is internal.",
              "Remove or anonymize the personal identifiers before uploading, consistent with policy.",
              "Upload it but tell Claude not to retain the data.",
              "Skip the analysis entirely."
            ],
            correct: [1],
            explanation: "Anonymizing identifiers before uploading satisfies the policy while still enabling the analysis. Uploading as-is violates policy; instructing the model not to retain data doesn't satisfy a data-sharing control; abandoning the task is an unnecessary overcorrection once anonymization is available."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "A project manager wants to upload a spreadsheet containing customer names and account numbers so Claude can analyze trends. Organizational policy restricts sharing regulated personal data. What is the most appropriate action?",
          options: [
            "Upload the file as-is, since the analysis is internal.",
            "Remove or anonymize the personal identifiers before uploading, consistent with policy.",
            "Upload the file but instruct Claude not to retain it.",
            "Skip the analysis entirely."
          ],
          correct: [1],
          explanation: "Applying data-sensitivity and privacy safeguards means redacting or anonymizing regulated identifiers before use, so the analysis can proceed without exposing protected data. Uploading as-is violates policy; instructing the model not to retain data does not satisfy the policy control; abandoning the task is unnecessary when anonymization enables it.",
          source: "official"
        },
        {
          type: "single",
          question: "Which of the following is the clearest example of an inappropriate use case for an unreviewed AI output?",
          options: [
            "Drafting an internal team meeting agenda.",
            "Fully automating a disciplinary decision about an employee with no human review.",
            "Brainstorming icebreaker questions for a team offsite.",
            "Reformatting a public blog post into bullet points."
          ],
          correct: [1],
          explanation: "High-stakes decisions about real people (discipline, hiring, credit) require human review — full automation of a consequential, person-affecting decision is the clearest inappropriate-use pattern tested on this domain."
        },
        {
          type: "single",
          question: "Your organization has an AI usage policy that pre-approves certain use cases and requires sign-off for others. A new use case isn't clearly covered by either category. What should you do?",
          options: [
            "Proceed anyway since the policy doesn't explicitly forbid it.",
            "Treat the ambiguity as a signal to check with whoever owns the AI governance policy before proceeding.",
            "Avoid using Claude for anything ever again.",
            "Assume it's fine because it's a productivity task."
          ],
          correct: [1],
          explanation: "Following organizational governance means resolving ambiguous cases with the policy owner rather than defaulting to 'not explicitly forbidden, so allowed' — silence in a policy isn't the same as approval."
        },
        {
          type: "multi",
          question: "Which two practices reflect responsible, ethical use of AI-assisted output? (Select 2)",
          options: [
            "Being transparent that AI was used where that matters to the audience.",
            "Treating AI output as a substitute for human accountability on consequential decisions.",
            "Keeping a human accountable for what ultimately ships, even when AI helped produce it.",
            "Assuming AI output can't be biased since it's not human-authored."
          ],
          correct: [0, 2],
          explanation: "Transparency about AI use and maintaining human accountability are core responsible-use practices. Treating AI as a substitute for accountability, or assuming it can't be biased, are the failure patterns this domain tests against."
        },
        {
          type: "single",
          question: "Why does instructing Claude \"don't retain this data\" fail to satisfy a policy that restricts sharing regulated personal data?",
          options: [
            "Because Claude ignores all instructions about data handling.",
            "Because an in-conversation instruction doesn't satisfy a data-sharing control — the data was already shared/uploaded regardless of what happens after.",
            "Because it's technically impossible to phrase such an instruction.",
            "It doesn't fail — this is actually sufficient."
          ],
          correct: [1],
          explanation: "The policy violation happens at the point regulated data is shared/uploaded — a downstream instruction about retention doesn't undo that. Anonymizing the data before it's ever uploaded is what actually satisfies the control."
        }
      ],
      flashcards: [
        { front: "What's the key question beyond \"can Claude technically do this task\"?", back: "\"Should this task go through Claude, here, right now\" — considering consequences to real people, existing policy, and data sensitivity." },
        { front: "Someone wants to analyze a spreadsheet with regulated personal data, but policy restricts sharing it. What's the correct fix?", back: "Remove or anonymize the personal identifiers before uploading — not upload-as-is, and not just instructing the model not to retain it." },
        { front: "Why doesn't \"upload it but tell Claude not to retain the data\" satisfy a data-sharing policy?", back: "The policy violation happens at the moment of sharing/upload — a downstream retention instruction doesn't undo that the data was already shared." },
        { front: "What's the textbook inappropriate-use pattern for high-stakes decisions about people?", back: "Fully automating a consequential decision (hiring, credit, discipline) with no human review — stakes and bias risk both argue for human-in-the-loop." },
        { front: "What should you do when a new use case isn't clearly covered by your org's AI policy?", back: "Check with the policy owner rather than assuming 'not explicitly forbidden' means 'approved.'" },
        { front: "What does responsible use require regarding accountability?", back: "A human stays accountable for what ships — AI output isn't a substitute for that accountability, even when it did most of the drafting." },
        { front: "What ethical risk applies specifically when AI assists with decisions about real people?", back: "AI-assisted output can create or launder bias against people if not reviewed — consistency and fairness checks matter most here." }
      ]
    },
    {
      id: "d7",
      title: "Troubleshooting and Optimization",
      weight: 10,
      summary: "Diagnosing underperforming prompts and improving workflow efficiency over time.",
      objectives: [
        "Identify, diagnose, and resolve issues with underperforming prompts or poor outputs",
        "Adjust approach based on feedback and results",
        "Optimize workflows for efficiency and effectiveness"
      ],
      lesson: {
        sections: [
          {
            heading: "Diagnosing a bad output",
            body: "<p>When output is consistently underperforming, resist the urge to just re-roll it. Diagnose first: is the prompt missing goal/audience/format (see Domain 1)? Is Claude missing context it needs (relevant background not provided)? Is the task actually too broad for one prompt and needs decomposition? Is the wrong product surface or model tier being used for the complexity of the task? Most \"Claude got it wrong\" problems trace back to one of these input-side issues rather than an unfixable model limitation.</p>"
          },
          {
            heading: "A simple troubleshooting loop",
            body: `<pre><code>1. Is the output wrong, or just not what I wanted? (accuracy vs. preference)
2. If wrong: what information was missing or ambiguous in the prompt?
3. If a matter of preference: what specific change would fix it?
4. Apply one targeted fix at a time and re-test, rather than
   rewriting the whole prompt from scratch each time.</code></pre>`
          },
          {
            heading: "Optimizing workflows, not just single prompts",
            body: "<p>Optimization at this level is about the recurring workflow, not any one output: which steps are still manual that could be templated into a reusable Project instruction? Which recurring prompt could become a saved, reusable pattern instead of being rewritten from memory each time? Is the team using a higher-cost model tier than a recurring task actually needs? Treat repeated friction as a signal to fix the underlying setup, not just the current output.</p>"
          }
        ],
        checks: [
          {
            type: "single",
            question: "A prompt consistently produces outputs that are technically accurate but not what the requester actually wanted. What's the most useful first diagnostic question?",
            options: [
              "Is this an accuracy problem, or a preference/specification problem?",
              "Should we abandon AI for this task entirely?",
              "Is Claude broken today?",
              "Should we switch to the most expensive model available?"
            ],
            correct: [0],
            explanation: "Separating 'wrong' from 'not what I wanted' determines the fix: accuracy issues need more/better context, while preference mismatches need a more specific target (format, tone, scope) — conflating the two wastes iteration cycles."
          },
          {
            type: "single",
            question: "A team keeps rewriting the same complex prompt from memory every week, with small inconsistencies each time. What's the workflow-level fix?",
            options: [
              "Nothing — rewriting from memory is fine.",
              "Save the prompt as a reusable pattern (e.g., in a Project) instead of reconstructing it from memory each time.",
              "Switch to a lower-cost model to save money.",
              "Assign a different person to write it each week."
            ],
            correct: [1],
            explanation: "Recurring friction like this is a workflow optimization signal — templating the reusable prompt removes the inconsistency and the repeated effort, rather than treating each week's version as a one-off."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "An associate gets a wrong answer from Claude and immediately re-runs the exact same prompt hoping for a better result. What's the issue with this approach?",
          options: [
            "There is no issue — re-running is always the right first move.",
            "It skips diagnosis — if the prompt was missing needed context or was ambiguous, an identical prompt will likely reproduce the same problem.",
            "Re-running a prompt is technically impossible.",
            "It will always produce the exact same output, so there's no point trying."
          ],
          correct: [1],
          explanation: "Without diagnosing what went wrong (missing context, ambiguity, wrong scope), simply re-running the same prompt tends to reproduce the same failure mode rather than fix it."
        },
        {
          type: "single",
          question: "Which situation is best addressed by task decomposition rather than a prompt-wording tweak?",
          options: [
            "The output used the wrong tone for the audience.",
            "The output ran too long.",
            "The request bundled several distinct sub-tasks and the response only shallowly addressed each one.",
            "The output was in the wrong format (prose instead of a table)."
          ],
          correct: [2],
          explanation: "Shallow coverage of several bundled sub-tasks is a scope problem, not a wording problem — it calls for breaking the request into steps (Domain 1), while tone/length/format issues are more directly fixed with a specific instruction tweak."
        },
        {
          type: "single",
          question: "A recurring weekly report task is currently run on the highest-cost model tier out of habit, even though the task is simple formatting and summarization. What's the optimization opportunity?",
          options: [
            "None — always use the best model available regardless of task.",
            "Evaluate whether a lower-cost, faster tier meets the quality bar for this recurring, low-complexity task.",
            "Stop generating the report at all.",
            "Increase the model tier further to be safe."
          ],
          correct: [1],
          explanation: "This connects to Domain 3's cost/speed/quality trade-off: recurring, low-complexity tasks running on an unnecessarily expensive tier is a workflow-level optimization opportunity, not something to leave on habit."
        },
        {
          type: "multi",
          question: "Which two are common root causes of a genuinely underperforming prompt (as opposed to a preference mismatch)? (Select 2)",
          options: [
            "The prompt omits relevant background context Claude would need to answer correctly.",
            "The requester simply prefers a different writing style than what was produced.",
            "The task was too broad for a single prompt and needed decomposition into steps.",
            "The output was factually accurate but slightly longer than ideal."
          ],
          correct: [0, 2],
          explanation: "Missing context and excessive scope for a single prompt are genuine input-side causes of poor output. A style preference or minor length mismatch is a refinement, not a diagnosis of what went wrong."
        },
        {
          type: "single",
          question: "What distinguishes workflow-level optimization from single-prompt troubleshooting?",
          options: [
            "They are the same activity.",
            "Workflow optimization looks at recurring friction across a process (reusable prompts, model-tier fit, templated instructions) rather than fixing one output at a time.",
            "Workflow optimization only applies to technical/developer tasks.",
            "Workflow optimization means using the most expensive model tier available."
          ],
          correct: [1],
          explanation: "Single-prompt troubleshooting fixes one bad output; workflow optimization addresses recurring patterns — reusable prompt templates, right-sized model tiers, and reducing repeated manual effort across the whole process."
        }
      ],
      flashcards: [
        { front: "What's the first diagnostic question when an output is 'wrong'?", back: "Is this actually an accuracy problem, or a preference/specification mismatch? The fix differs for each." },
        { front: "What usually causes a genuinely underperforming prompt?", back: "Missing goal/audience/format, missing background context, or a task too broad for one prompt (needs decomposition) — not an unfixable model limit." },
        { front: "Why is re-running an identical prompt after a bad result usually ineffective?", back: "Without diagnosing and fixing what was missing or ambiguous, the same input tends to reproduce the same failure." },
        { front: "What's the recommended troubleshooting loop?", back: "Classify (wrong vs. not-what-I-wanted) → identify the missing/ambiguous element → apply one targeted fix → re-test, rather than rewriting from scratch each time." },
        { front: "What's a workflow-level (not single-prompt) optimization example?", back: "Templating a recurring prompt into a reusable Project instruction instead of rewriting it from memory each time, with drift, every week." },
        { front: "What's a model-tier optimization signal?", back: "A recurring, low-complexity task running on a higher-cost tier out of habit rather than fit — a candidate to downgrade after evaluation." }
      ]
    }
  ]
};
