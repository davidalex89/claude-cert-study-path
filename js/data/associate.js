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
            heading: "A prompt is a specification, not a search query",
            body: `<p>The single biggest difference between people who get mediocre output and people who get usable output is not prompt length or clever phrasing — it's whether the prompt contains the information the task actually requires. A search query names a topic. A specification names a <em>result</em>. Claude can only work with what you give it, and when something is missing, it doesn't stop and ask — it fills the gap with the most generic plausible assumption and keeps going, confidently.</p><p>Four things carry almost all the weight:</p><ul><li><strong>Goal</strong> — what decision or action does this output support? "Summarize this" and "summarize this so the VP can decide whether to renew" produce different documents.</li><li><strong>Audience</strong> — a board summary and a Slack update need different vocabulary, length, and level of hedging.</li><li><strong>Format</strong> — table, bullet list, prose memo, or an artifact someone will keep editing?</li><li><strong>Constraints</strong> — word count, tone, things to avoid, data that must be included, claims you can't make.</li></ul><p>Here's what that looks like in practice. An ops lead needs to tell twelve customers that a shipment is running late.</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ Search query</span><p>"Write an email about the shipping delay."</p><p>Claude has no idea who's reading, how bad the delay is, whether it can offer compensation, or whether Legal has opinions about the word "sorry." It will produce a competent, hollow, apologetic email that says nothing specific — and you'll rewrite all of it.</p></div><div class="compare-col good"><span class="cc-label">✓ Specification</span><p>"Draft a customer email about a 6-day shipment delay caused by a port closure. Audience: SMB customers who ordered in the last two weeks. Under 150 words, plain and direct, no corporate hedging. Lead with the new delivery date. Offer the 10% credit we've approved. Don't speculate on the cause beyond 'a port closure' and don't promise it won't recur."</p><p>Every judgment call Claude would otherwise guess at is already decided.</p></div></div><div class="callout analogy"><span class="callout-label">Think of it like...</span>Briefing a talented freelancer you've never met. If you say "make me a logo," you'll get something — and it'll be wrong, not because they're bad but because you gave them nothing to aim at. You'd never brief a human that way. You'd say what it's for, who sees it, where it'll appear, and what to avoid. Claude has exactly the same problem and none of the social awkwardness that would prompt a freelancer to email you back with questions.</div><p><strong>The trap:</strong> people conclude "Claude isn't good at this" after a one-line prompt returns one-line-prompt-quality output. The prompt was a search query. The task needed a spec.</p>`
          },
          {
            heading: "Task decomposition: break it up before it breaks down",
            body: `<p>Broad, multi-part requests — "build me a marketing plan," "analyze this data and write the report" — produce shallow, generic output for a structural reason: Claude has to guess your priorities, and it has to do every part of the work in a single pass with no chance to check anything with you. The result reads fine and is useful for nothing.</p><p><strong>Decomposition</strong> means breaking the request into an ordered sequence of smaller, well-scoped asks, each with its own inputs and its own definition of done:</p><pre><code>1. Summarize what we know about the target audience
   (input: the persona notes + last quarter's survey)
2. Draft 3 candidate positioning statements from that summary
3. I pick one → build a channel plan against it
4. Turn the channel plan into a dated timeline</code></pre><p>Notice step 3: <em>you</em> pick. That's the real payoff. Decomposition isn't just about smaller chunks — it creates checkpoints where a wrong assumption gets caught while it's still cheap. If Claude misreads your audience at step 1, you fix one paragraph. If you never checked, that misread silently propagates into the positioning, the channel plan, and the timeline, and you discover it in a meeting.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Renovating a kitchen. You don't hand a contractor "make my kitchen nice" and leave for six weeks. You approve the layout, then the cabinets, then the counters — because catching "wrong layout" at the drawing stage costs a conversation, and catching it after the plumbing is in costs a second renovation. Every checkpoint you skip is a bet that nothing upstream was wrong.</div><p><strong>The trap:</strong> decomposition looks slower, so people skip it under time pressure. It is slower — for the first two steps. Then it's dramatically faster, because you're editing a draft that's aimed at the right target instead of restarting a draft that was aimed at the wrong one.</p>`,
            interactive: {
              type: "sequence",
              title: "Order the decomposition",
              instructions: "A PM asks Claude to help build a customer-onboarding revamp. Put the decomposed steps in the order that creates the most useful checkpoints — each step should be able to feed the next.",
              items: [
                { text: "Summarize the current onboarding process and where customers drop off (input: the support-ticket export and last quarter's churn notes)." },
                { text: "From that summary, identify the top 3 friction points and rank them by how many customers each affects." },
                { text: "Propose 2 candidate fixes for the highest-ranked friction point." },
                { text: "Build out the chosen fix into a step-by-step process change with owners." },
                { text: "Turn the process change into a dated rollout timeline with review gates." }
              ],
              explanation: "Each step consumes the previous step's output and produces something you can check before committing further. Grounding comes first (what's actually happening, from real data), then diagnosis, then options, then one design, then scheduling. Jumping straight to the timeline — the thing the PM actually wants — would produce a confident schedule for fixing problems nobody verified were the real ones."
            }
          },
          {
            heading: "Iterating instead of starting over",
            body: `<p>Treat the first response as a draft, not a verdict. The instinct when output misses is to rewrite the prompt from scratch and re-roll — which throws away everything that was already working and re-rolls the dice on all of it. Iteration is almost always faster, because Claude keeps the parts you didn't complain about.</p><p>The skill is feedback that <em>locates</em> the problem. Vague feedback produces another guess; specific feedback narrows the search:</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ Re-rolls everything</span><p>"This isn't quite right, try again."</p><p>"Make it better."</p><p>"I don't like the tone."</p><p>Claude now guesses which of a dozen things you meant. Roughly half the time, the fix breaks something that was fine.</p></div><div class="compare-col good"><span class="cc-label">✓ Directed fix</span><p>"Cut paragraph 2 — it repeats the intro. In the recommendation, lead with the number, not the caveat. Keep everything else as-is."</p><p>Three located problems, three stated targets, and an explicit instruction not to touch what's working.</p></div></div><p>The pattern: <strong>point at it, name what's wrong, say what fixed looks like.</strong> "Too long" is half a note; "cut this to 100 words by dropping the background section" is a whole one. And "keep everything else as-is" is worth adding more often than people do — it's the difference between a revision and a re-roll.</p>`,
            interactive: {
              type: "stepThrough",
              title: "Iterate a bad prompt into a good one",
              steps: [
                {
                  label: "Attempt 1",
                  narration: "A marketing associate needs a product-launch announcement. She starts where everyone starts: naming the topic and hoping for the best.",
                  messages: [
                    { role: "user", kind: "tool_call", text: "Write a launch announcement for our new analytics dashboard." },
                    { role: "assistant", kind: "final", text: "We are thrilled to announce the launch of our new analytics dashboard! This exciting new product represents a significant milestone in our journey to empower businesses with data-driven insights. Packed with powerful features, it's designed to transform the way you work..." }
                  ]
                },
                {
                  label: "Diagnosis",
                  narration: "It's not wrong — it's weightless. Every sentence would survive being pasted into an announcement for literally any product. That's the tell: nothing in the prompt was specific, so nothing in the output is either. Rather than re-rolling, she adds the missing spec.",
                  messages: [
                    { role: "user", kind: "tool_result", text: "Missing: who reads it, what the product actually does, what makes it different, how long, what tone." }
                  ]
                },
                {
                  label: "Attempt 2 — add goal, audience, format",
                  narration: "She specifies the reader and the job the copy has to do. The output immediately gets concrete, because now there's something to be concrete about.",
                  messages: [
                    { role: "user", kind: "tool_call", text: "Rewrite for existing customers on our Starter plan who already use our reporting exports. Goal: get them to try the dashboard this week. 120 words max, plain and specific, no 'thrilled to announce.' Lead with what it does, not that it exists." },
                    { role: "assistant", kind: "final", text: "Your exports now have a home. The new analytics dashboard turns the CSVs you've been downloading every Monday into live charts — same data, no spreadsheet step. Filter by segment, date, or channel, and share a link instead of an attachment..." }
                  ]
                },
                {
                  label: "Attempt 3 — located feedback, not a re-roll",
                  narration: "Much better, but the close is soft and one claim is a stretch. Note what she does NOT do: she doesn't rewrite the prompt. She points at two specific things and explicitly protects the rest.",
                  messages: [
                    { role: "user", kind: "tool_call", text: "Two fixes, keep everything else: (1) cut 'and share a link instead of an attachment' — that ships next quarter, not now. (2) The last line is vague. End with a direct ask: try it on last week's data, link included." },
                    { role: "assistant", kind: "final", text: "Your exports now have a home. The new analytics dashboard turns the CSVs you've been downloading every Monday into live charts — same data, no spreadsheet step. Filter by segment, date, or channel. Open last week's numbers in it now: [link]" }
                  ]
                },
                {
                  label: "What actually changed",
                  narration: "Three turns, no restarts. Attempt 1 failed on specification, not on Claude. Attempt 2 fixed the spec. Attempt 3 fixed two located problems while preserving the working draft. Compare that to re-rolling 'write a launch announcement' five times and picking the least bad one — which is the loop most people are actually stuck in.",
                  messages: [
                    { role: "assistant", kind: "final", text: "Spec first → then locate and fix → never re-roll what already works." }
                  ]
                }
              ]
            }
          },
          {
            heading: "Show the shape you want",
            body: `<p>When a format is fussy or particular to your team, describing it is slower and less reliable than <em>showing</em> it. One example does more work than three paragraphs of instructions, because it resolves a dozen small ambiguities at once — spacing, capitalization, how terse to be, whether "owner" means a name or a team.</p><p>An HR coordinator summarizing exit-interview themes could write a long spec about how each theme should be phrased. Or she could paste one:</p><pre><code>Format each theme exactly like this example:

THEME: Onboarding buddy program is inconsistent
Mentions: 7 of 12
Representative quote: "My buddy left the company in week two
and nobody reassigned me."
Suggested owner: People Ops
</code></pre><p>Now every theme comes back in that shape, including the ones she didn't think to describe. This is the same instinct as the specification idea — you're removing guesses — but applied to structure rather than content.</p><p>Two related moves worth knowing:</p><ul><li><strong>Give Claude a role when it changes the lens</strong>, not as decoration. "You're reviewing this as the compliance lead who has to sign off" genuinely changes what gets flagged. "You are a helpful assistant" changes nothing and wastes a line.</li><li><strong>Say what to do with uncertainty.</strong> "If the notes don't support a theme, say so rather than inventing one" is one sentence that prevents a specific, common failure — and it connects directly to Domain 2's hallucination material.</li></ul>`
          },
          {
            heading: "Matching strategy to task type",
            body: `<p>The blueprint calls out four task types, and each one fails in its own characteristic way when you prompt it like the others.</p><ul><li><strong>Analysis</strong> — give explicit evaluation criteria up front. "What do you think of these five vendor proposals?" produces a descriptive summary of each; "score each vendor on cost, integration effort, and support SLA, then rank them and flag any where the ranking is close" produces a comparison you can defend in a meeting. Without named dimensions, Claude picks its own — usually whatever the documents talk about most, which is whatever the vendors chose to emphasize.</li><li><strong>Research</strong> — ask Claude to flag uncertainty and separate what's well-established from what it's inferring. Treat the output as a fast first pass that tells you where to look, not a finished citation. This is where confident fabrication is most likely and most costly.</li><li><strong>Drafting</strong> — front-load tone, length, and audience, then iterate on structure before you polish sentences. Polishing prose that's in the wrong order is wasted work; you'll cut the sentences you just perfected.</li><li><strong>Brainstorming</strong> — ask for volume and range explicitly ("give me 20, including a few unconventional ones"), and hold judgment for a separate pass.</li></ul><div class="callout warn"><span class="callout-label">Watch out</span>The most common cross-type error is <strong>collapsing generation and evaluation into one step</strong>. "Give me the best tagline" asks Claude to generate and judge simultaneously — so it silently prunes the interesting options before you ever see them, and hands you the safest one. Generate wide, then narrow in a second pass where you can actually see what you're rejecting. The same error in reverse: asking for 20 options when you needed one careful recommendation, then having to do the analysis yourself anyway.</div>`
          },
          {
            heading: "Four traps that ruin otherwise-good prompts",
            body: `<p>Recognizable failure patterns, worth naming because each has a specific fix:</p><ul><li><strong>The buried ask.</strong> Three paragraphs of context, then "thoughts?" at the end. Claude answers the question you asked, which was nothing in particular. Fix: state the ask first, then supply context.</li><li><strong>Contradictory constraints.</strong> "Comprehensive but under 100 words." "Formal but conversational." Claude will pick one and you'll be annoyed at whichever it picked. Fix: decide which constraint actually wins, and say so.</li><li><strong>Assumed context.</strong> "Update the deck for the Q3 pivot" — Claude doesn't know what the pivot was, what the deck says, or which Q3. This is the single most common cause of confidently wrong output on internal work. Fix: paste it in, or put it in a Project (Domain 5).</li><li><strong>The runaway thread.</strong> Twenty turns of drift, and now the model is weighing an instruction from turn 3 that you've long since abandoned. Fix: restart clean with a summary of what still matters (Domain 3).</li></ul><p>Notice the pattern underneath all four: each one leaves Claude reasoning over something other than the actual current request — a missing ask, a conflict it has to resolve on your behalf, context you have and it doesn't, or stale context you've mentally discarded but the thread hasn't. Prompting well is mostly the discipline of making sure what's in front of Claude matches what's in your head.</p>`
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
          },
          {
            type: "single",
            question: "Claude drafts a memo that's 80% right. The opening is strong, but the third paragraph is off-topic and the closing is too soft. What's the most efficient way to fix it?",
            options: [
              "Rewrite the original prompt from scratch with more detail and regenerate the whole memo.",
              "Tell Claude \"this isn't working, try a different approach.\"",
              "Point at the two specific problems, state what each should become, and say to keep the rest as-is.",
              "Accept the draft and fix both problems by hand without telling Claude."
            ],
            correct: [2],
            explanation: "Located feedback plus an explicit instruction to preserve what's working is the fastest path — Claude keeps the strong opening and fixes only what you named. Regenerating from a new prompt (A) re-rolls the 80% that was already fine, and vague redirection (B) makes Claude guess which of several things you meant. Editing by hand (D) is defensible for tiny fixes but throws away the iteration loop the domain is testing."
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
          explanation: "A vague prompt without a stated goal, audience, or format forces Claude to guess, and generic guesses produce generic prose. Specifying purpose and audience alone (e.g. \"a one-paragraph summary for the exec team, leading with whether we hit target\") sharply improves usability. Length itself isn't the issue — a short, well-specified prompt works fine."
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
          explanation: "Research tasks carry the highest risk of confidently-stated but wrong claims. Asking Claude to separate what's well-established from what it's inferring gives you a map of where to verify before you rely on the output. The other three tasks either make no factual claims (birthday message, team names) or make none beyond the data you supplied (reformatting)."
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
          explanation: "Specific, located feedback (what to cut, what the new constraint is) lets Claude fix exactly what's wrong while preserving what already worked. Vague feedback re-rolls the whole draft from scratch — and often breaks something that was fine."
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
          explanation: "The main value of decomposition is early error-catching: reviewing step 1 before moving to step 4 means a bad assumption gets fixed cheaply instead of propagating through the whole chain. Prompt length isn't a quality lever in itself, context limits aren't the driver, and nothing guarantees an edit-free final output."
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
          explanation: "Analysis tasks need explicit evaluation criteria up front. Naming the dimensions (cost, timeline, SLA) turns a vague opinion request into a structured, defensible comparison. Without named criteria (A), Claude picks its own — usually whatever the vendors emphasized most. One-sentence summaries (C) describe rather than compare, and (D) asks for a verdict with no visible reasoning to check."
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
          explanation: "Bundled, multi-deliverable requests and high-stakes-if-wrong first steps are the classic cases for decomposition — both benefit from a checkpoint. A short, well-scoped factual question doesn't need to be broken up, and prompt brevity on its own says nothing about whether decomposition would help."
        },
        {
          type: "single",
          question: "An analyst writes: \"Give me a comprehensive competitive analysis of all six competitors, but keep it under 100 words.\" The result covers two competitors superficially. What went wrong?",
          options: [
            "Claude ignored the instructions.",
            "The prompt contains contradictory constraints — \"comprehensive across six competitors\" and \"under 100 words\" can't both be satisfied, so Claude had to silently pick one.",
            "The model tier was too low for competitive analysis.",
            "Competitive analysis is not a supported use case."
          ],
          correct: [1],
          explanation: "When constraints conflict, Claude resolves the conflict on your behalf and you have no say in how. The fix is deciding which constraint actually wins — either raise the word budget or narrow to the two competitors that matter. Claude followed the instructions (A); it just couldn't follow both. Model tier (C) doesn't reconcile an impossible spec, and (D) is simply false."
        },
        {
          type: "single",
          question: "An associate pastes three paragraphs of background about a stalled project and ends the message with \"thoughts?\" The response is a general summary rather than the risk assessment she wanted. What's the fix?",
          options: [
            "Add more background context so Claude better understands the project.",
            "State the specific ask up front — \"identify the top three risks to the October deadline and rank them by likelihood\" — then supply the context.",
            "Switch to a higher-capability model tier.",
            "Ask the same question again; the response will vary."
          ],
          correct: [1],
          explanation: "This is the buried-ask trap: context without a stated request leaves Claude to infer what you want, and a summary is the safest inference. More background (A) makes it worse, not better — the problem isn't a shortage of context, it's the absence of a question. A stronger model (C) still can't read your mind, and re-rolling (D) re-runs the same ambiguity."
        },
        {
          type: "single",
          question: "You need exit-interview notes summarized into a specific in-house format your team uses. What's the most reliable way to get that format?",
          options: [
            "Describe the format in detail across several sentences.",
            "Paste one filled-in example of the format and say \"format each theme exactly like this.\"",
            "Ask for a summary first, then reformat it by hand.",
            "Ask Claude to guess the format from the notes."
          ],
          correct: [1],
          explanation: "A concrete example resolves a dozen small ambiguities at once — spacing, phrasing, terseness, what each field means — that a prose description tends to leave open. Describing it (A) can work but is slower and less precise for a fussy format; (C) does the work manually; (D) removes the specification entirely."
        },
        {
          type: "single",
          question: "Which use of a role instruction actually improves output?",
          options: [
            "\"You are a helpful AI assistant.\"",
            "\"You are reviewing this contract as the compliance lead who has to personally sign off on it — flag anything you'd refuse to approve.\"",
            "\"You are a very intelligent and capable model.\"",
            "\"You are an expert at everything.\""
          ],
          correct: [1],
          explanation: "A role earns its place when it changes the lens — a compliance sign-off framing genuinely changes what gets flagged and how conservatively. Generic flattery or capability assertions (A, C, D) change nothing about what Claude actually looks for; they just consume space."
        },
        {
          type: "single",
          question: "A drafting task keeps producing prose in the wrong order, and you've been rewriting individual sentences each round to fix the flow. What's the more efficient sequence?",
          options: [
            "Keep polishing sentences; structure will emerge from good prose.",
            "Settle the structure first — get the outline and section order right — then polish the sentences inside it.",
            "Ask for more options and pick the one with the best flow.",
            "Increase the length limit so there's room for everything."
          ],
          correct: [1],
          explanation: "Polishing prose that's in the wrong order is wasted work — you'll cut the sentences you just perfected when the structure changes. Fix structure, then language. Generating more options (C) doesn't address a structural problem, and more length (D) usually makes disorganized output longer, not clearer."
        },
        {
          type: "multi",
          question: "Which two instructions meaningfully reduce the risk of Claude inventing details in a summarization task? (Select 2)",
          options: [
            "\"If the source notes don't support a claim, say so rather than filling the gap.\"",
            "\"Be accurate and don't make anything up.\"",
            "\"Quote the specific line from the notes that supports each theme you list.\"",
            "\"Write with confidence and authority.\""
          ],
          correct: [0, 2],
          explanation: "Both winners give Claude a concrete, checkable behavior: an explicit instruction for what to do with a gap, and a requirement to tie each claim to a quotable source line that you can spot-check. \"Don't make anything up\" (B) is a well-meaning but unactionable instruction that doesn't change what Claude can verify, and asking for confident tone (D) actively works against the goal — it encourages exactly the assured phrasing that makes fabrication hard to spot."
        },
        {
          type: "single",
          question: "Which of these is the clearest example of the \"assumed context\" trap?",
          options: [
            "\"Summarize the attached report for the exec team in under 200 words.\"",
            "\"Update the deck for the Q3 pivot.\"",
            "\"Give me 15 name ideas for an internal wellness program.\"",
            "\"Convert this list into a table with three columns: owner, due date, status.\""
          ],
          correct: [1],
          explanation: "\"Update the deck for the Q3 pivot\" assumes Claude knows what the deck contains, what the pivot was, and which Q3 — none of which it has. The other three are self-contained: they either attach their input, need no input, or specify the transformation completely."
        },
        {
          type: "single",
          question: "An associate insists that decomposition \"takes too long\" and prefers one big prompt under deadline pressure. What's the most accurate response?",
          options: [
            "She's right — decomposition is only worth it when you have spare time.",
            "Decomposition costs time on the first two steps and saves it after, because you edit a draft aimed at the right target instead of restarting one aimed at the wrong target.",
            "Decomposition is required for all requests regardless of size.",
            "One big prompt is fine as long as the model tier is high enough."
          ],
          correct: [1],
          explanation: "The time cost is real but front-loaded, and it buys checkpoints that prevent a full restart later — which is exactly what deadline pressure can least afford. Decomposition isn't required for well-scoped small asks (C), and no model tier compensates for a request that bundles four deliverables and never checks its assumptions (D)."
        }
      ],
      flashcards: [
        { front: "What four things should you specify before sending a non-trivial prompt?", back: "Goal (what decision it supports), audience, format, and constraints." },
        { front: "What does Claude do when your prompt is missing information it needs?", back: "It doesn't stop and ask — it fills the gap with the most generic plausible assumption and continues confidently." },
        { front: "Why does task decomposition improve output quality on complex requests?", back: "It creates checkpoints — you catch a wrong assumption at step 1 instead of after it has propagated through every later step." },
        { front: "What makes iteration feedback effective versus vague?", back: "Point at specific lines, name what's wrong, and state the target — e.g. \"cut paragraph 2, tighten the subject line to 8 words\" instead of \"make it better.\"" },
        { front: "For brainstorming tasks, what should you ask for before narrowing down?", back: "Volume and range — explicitly ask for many options, including unconventional ones, before asking Claude to judge or filter them." },
        { front: "For analysis tasks, what should you provide up front?", back: "Explicit evaluation criteria (the dimensions to score or compare on), so the result is a structured comparison rather than a vague opinion." },
        { front: "For research tasks, what should you explicitly ask Claude to do?", back: "Flag uncertainty and distinguish well-established facts from inference, since research carries the highest risk of confidently-stated but wrong claims." },
        { front: "For drafting tasks, what should you settle before polishing sentences?", back: "Structure — section order and outline. Polishing prose that's in the wrong order is wasted work; you'll cut those sentences when the structure changes." },
        { front: "What's the \"collapsing generation and evaluation\" error?", back: "Asking for \"the best X\" in one pass — Claude silently prunes the interesting options before you see them and hands you the safest one. Generate wide, then narrow separately." },
        { front: "Name the four common prompting traps.", back: "The buried ask (context then \"thoughts?\"), contradictory constraints, assumed context (referencing things Claude can't see), and the runaway thread (stale instructions from 20 turns ago)." },
        { front: "When is a role instruction worth including?", back: "When it changes the lens — \"review this as the compliance lead who must sign off\" changes what gets flagged. \"You are a helpful assistant\" changes nothing." },
        { front: "What's the fastest way to get a fussy in-house format?", back: "Paste one filled-in example and say \"format each item exactly like this\" — an example resolves ambiguities a prose description leaves open." }
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
            body: `<p>At 21%, output evaluation outweighs every other domain — roughly one question in five. That weighting is a statement about what the job actually is. The Associate's value isn't producing AI output; anyone can produce AI output. The value is <em>being the quality gate</em> on it before it reaches a decision, a customer, or a compliance team.</p><p>The thing that makes this hard is specific and worth stating plainly: <strong>a language model states fabricated details in exactly the same confident register as correct ones.</strong> There is no tremor in the voice. A made-up subsection number, an invented statistic, a plausible-sounding quote from a real person who never said it — all delivered with the same even competence as the parts that are right. Human writing carries reliability cues (hedging, vagueness, a defensive tone when someone's unsure) that we've all spent decades learning to read. Those cues don't survive here. The signal you've relied on your whole professional life is simply absent.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>A brilliant new hire who is never, ever visibly uncertain. Ninety-five percent of what they tell you is excellent. The other five percent is confidently wrong, and it sounds identical. You'd figure that person out fast, and you'd adapt — not by ignoring them (they're genuinely good) and not by checking every word (you'd never finish), but by learning <em>which kinds</em> of claims to check. That triage skill is what this domain tests. Not paranoia, not credulity — calibration.</div><p>Everything else in this domain follows from that: knowing the three ways output goes wrong, knowing which claims are worth checking, knowing when the check exceeds your competence, and knowing how to shape what survives for the person who reads it.</p>`
          },
          {
            heading: "Three defects, three different fixes",
            body: `<p>"The output was bad" isn't a diagnosis. Three distinct defects show up on this exam, and they're caught in different ways — conflating them is why people either miss problems or waste time checking the wrong things.</p><ul><li><strong>Hallucination</strong> — a fabricated fact, source, number, or quote that sounds plausible but isn't real. Caught by <em>checking against an external source</em>. Most likely wherever Claude produces an oddly specific detail it wasn't given: a page number, an exact percentage, a named study, a clause reference.</li><li><strong>Inconsistency</strong> — the output contradicts itself or contradicts something established earlier in the conversation. A summary total that doesn't match its own line items; a recommendation that violates a constraint you stated three turns ago. Caught by <em>reading carefully</em> — no external source needed, because the contradiction is sitting right there in the document.</li><li><strong>Bias</strong> — the output skews toward one framing, omits a relevant perspective, or applies different standards to comparable cases. Caught by <em>comparing across cases</em> — which means you often can't spot it in a single output at all.</li></ul><p>That last one deserves an example, because it's the one people miss. An HR partner has Claude draft performance summaries for eight people from their manager notes. Each summary, read on its own, seems fine. Read side by side, a pattern appears: the men "drove" and "led" their projects; the women "supported" and "were involved in" comparable ones. No single summary is wrong. No fact is fabricated. Nothing contradicts anything. And if you review them one at a time — which is exactly how people review things — you will never see it.</p><div class="callout warn"><span class="callout-label">Watch out</span>The exam likes to hand you a defect and see whether you name it correctly, because the name determines the fix. A total that doesn't match its line items is <strong>not</strong> a hallucination — nothing was fabricated, the document just contradicts itself, and you'd catch it without any source document at all. Reaching for an external source there is wasted motion; reading the page is the fix.</div>`,
            interactive: {
              type: "classify",
              title: "Name the defect",
              instructions: "Each item is something you noticed while reviewing Claude's output. Which defect is it — a fabricated fact, a self-contradiction, or a skew in framing?",
              items: [
                {
                  text: "A market summary cites \"a 2023 Gartner study finding 47% adoption.\" You gave Claude no such study, and you can't find it.",
                  answer: "hallucination",
                  options: [["hallucination", "🌀 Hallucination"], ["inconsistency", "⚖️ Inconsistency"], ["bias", "🎭 Bias"]],
                  why: "An oddly specific, unsupplied detail — a named source, a year, an exact percentage. This is the signature hallucination shape, and it's caught by checking an external source."
                },
                {
                  text: "A budget memo says \"total Q3 spend was $412K\" in the summary, but the line items listed below add up to $389K.",
                  answer: "inconsistency",
                  options: [["hallucination", "🌀 Hallucination"], ["inconsistency", "⚖️ Inconsistency"], ["bias", "🎭 Bias"]],
                  why: "The document contradicts itself. You don't need any external source to catch this — the conflict is entirely internal, and it's a problem regardless of which figure (if either) is right."
                },
                {
                  text: "Across eight drafted performance reviews, comparable achievements are described as \"drove\" for some employees and \"was involved in\" for others, tracking gender.",
                  answer: "bias",
                  options: [["hallucination", "🌀 Hallucination"], ["inconsistency", "⚖️ Inconsistency"], ["bias", "🎭 Bias"]],
                  why: "Nothing is fabricated and nothing self-contradicts — but different standards are being applied to comparable cases. It's only visible when you compare across outputs, which is why reviewing one at a time misses it."
                },
                {
                  text: "You told Claude \"no options over $50K.\" Its final recommendation is a $72K vendor, described as the best fit.",
                  answer: "inconsistency",
                  options: [["hallucination", "🌀 Hallucination"], ["inconsistency", "⚖️ Inconsistency"], ["bias", "🎭 Bias"]],
                  why: "The output contradicts a constraint established earlier in the same conversation. The vendor and its price may both be perfectly real — the defect is the conflict with what you already specified."
                },
                {
                  text: "A policy summary references \"Section 7.4(b), which requires 30 days' notice.\" The policy has no Section 7.4.",
                  answer: "hallucination",
                  options: [["hallucination", "🌀 Hallucination"], ["inconsistency", "⚖️ Inconsistency"], ["bias", "🎭 Bias"]],
                  why: "A fabricated citation — the most exam-relevant hallucination pattern, and the exact shape of the official Sample 1 question. Precise-looking references are where fabrication hides best."
                },
                {
                  text: "A vendor comparison spends four paragraphs on the incumbent's strengths and one dismissive line on each challenger, though you asked for a neutral assessment.",
                  answer: "bias",
                  options: [["hallucination", "🌀 Hallucination"], ["inconsistency", "⚖️ Inconsistency"], ["bias", "🎭 Bias"]],
                  why: "Skewed framing through unequal treatment. Every individual claim might be accurate — the distortion is in the proportions and what got omitted, not in any single sentence."
                },
                {
                  text: "A research brief states a competitor's headcount as \"approximately 400\" in one section and \"over 1,200\" in another.",
                  answer: "inconsistency",
                  options: [["hallucination", "🌀 Hallucination"], ["inconsistency", "⚖️ Inconsistency"], ["bias", "🎭 Bias"]],
                  why: "Two claims in the same document that can't both be true. At least one is probably also a hallucination — but the defect you can identify from the document alone, with no research, is the contradiction."
                }
              ]
            }
          },
          {
            heading: "Fact-checking and knowing when to escalate",
            body: `<p>The validation bar scales with what's at stake. A rule of thumb: <strong>any claim bound for a compliance, legal, financial, or external-facing audience gets verified against a primary source before it ships</strong> — self-reported confidence from Claude is not sufficient, and rewording a claim to sound more authoritative doesn't make it more accurate. For lower-stakes internal drafts, a lighter read-through may be enough.</p><p>Here's the judgment call in practice. Claude drafts a client-facing email stating "per our contract, refunds are processed within 5 business days." You don't have that clause memorized — so before it goes out, you pull up the actual contract and check the number. That's verification, and it's on you to do it: you have access to the source and the ability to check it. Now suppose Claude also drafts an internal Slack recap of that same email for your team's tracking. Same underlying claim, much lower stakes — a quick skim is enough, since a wrong number there gets caught internally long before it reaches a customer.</p><p>The harder case is when you <em>can't</em> verify something yourself, even if you wanted to — a regulatory interpretation you're not trained in, a tax rule, a technical claim about why a production system behaved a certain way. That's the signal to escalate: to a subject-matter expert for domain questions, or to a Developer/Architect for technical systems claims. Escalating isn't a failure. Treating something outside your expertise as "probably fine because it sounded confident" is the actual failure this domain tests for.</p><div class="callout"><span class="callout-label">Note</span>Two axes decide this, and they're independent: <strong>stakes</strong> (what happens if this is wrong?) and <strong>your competence to check</strong> (could you actually tell if it were wrong?). High stakes but checkable → verify it yourself, and do it before shipping. High stakes and not checkable by you → escalate. Low stakes and checkable → skim and move on. The trap is the fourth quadrant: low <em>apparent</em> stakes on a claim you can't evaluate, which is how an unverified technical assertion slips into a doc that later gets forwarded to a customer.</div>`,
            interactive: {
              type: "classify",
              title: "Verify it yourself, or escalate?",
              instructions: "For each situation, decide: is this something you can check and ship yourself, or does it need to go to someone else first?",
              items: [
                {
                  text: "Claude drafts a client email citing a specific refund-timeline clause from a contract you have on hand.",
                  answer: "verify",
                  options: [["verify", "✅ Verify yourself"], ["escalate", "🚩 Escalate"]],
                  why: "You have access to the actual contract and the ability to check the clause — that's exactly the kind of claim you're equipped to verify yourself."
                },
                {
                  text: "Claude summarizes a new regulatory requirement for a compliance filing, citing a specific subsection.",
                  answer: "escalate",
                  options: [["verify", "✅ Verify yourself"], ["escalate", "🚩 Escalate"]],
                  why: "Regulatory interpretation is specialist territory. Even if the citation looks plausible, this needs a compliance or legal expert, not a confident guess."
                },
                {
                  text: "Claude drafts an internal Slack recap of a meeting, for your own team's notes only.",
                  answer: "verify",
                  options: [["verify", "✅ Verify yourself"], ["escalate", "🚩 Escalate"]],
                  why: "Low stakes and internal — a quick skim against your own memory of the meeting is proportionate. No need to escalate something this low-risk."
                },
                {
                  text: "Claude explains why a production system behaved unexpectedly, citing specific technical internals.",
                  answer: "escalate",
                  options: [["verify", "✅ Verify yourself"], ["escalate", "🚩 Escalate"]],
                  why: "A technical claim about how a system actually behaves is outside an Associate's scope — route it to a Developer or Architect who can verify against the real system."
                },
                {
                  text: "Claude reformats a dataset into a cleaner table — the numbers are ones you personally validated yesterday.",
                  answer: "verify",
                  options: [["verify", "✅ Verify yourself"], ["escalate", "🚩 Escalate"]],
                  why: "Nothing new is being claimed here — the underlying data was already checked. Reformatting doesn't introduce new facts that need re-verification."
                },
                {
                  text: "Claude drafts a tax-law interpretation for a client's financial planning document.",
                  answer: "escalate",
                  options: [["verify", "✅ Verify yourself"], ["escalate", "🚩 Escalate"]],
                  why: "Tax law is specialist domain expertise. This is a textbook case for routing to someone qualified to actually stand behind the interpretation."
                }
              ]
            }
          },
          {
            heading: "A validation pass you can actually run",
            body: `<p>"Check the output" is not a procedure. Here's one that is, and that fits in the time you actually have:</p><ol><li><strong>Read it once for internal coherence.</strong> Do the numbers reconcile? Does anything contradict a constraint you set? This costs a minute and needs no sources.</li><li><strong>Underline every specific, checkable claim.</strong> Dates, figures, names, citations, quotes, percentages. Vague prose isn't the risk — precision is. If a sentence could be proven false, it's a candidate.</li><li><strong>For each underlined claim, ask: was this in what I gave Claude?</strong> If yes, spot-check it against the source. If <em>no</em> — if the detail appeared from nowhere — that's your highest-priority check, every time.</li><li><strong>Sort what's left by stakes and by whether you can judge it.</strong> Checkable and consequential → check it now. Not checkable by you and consequential → escalate it.</li><li><strong>Then edit for the reader</strong> — but not before, because there's no point polishing a sentence you may have to delete.</li></ol><p>Step 3 is the one that earns its keep. The question "did this detail come from my source, or did it appear from nowhere?" is fast, requires no expertise, and catches the overwhelming majority of fabrications — because fabrication is precisely the act of producing a detail that wasn't in the input.</p>`,
            interactive: {
              type: "stepThrough",
              title: "Validate a suspicious output, claim by claim",
              steps: [
                {
                  label: "The output",
                  narration: "An ops associate uploaded a vendor's contract and asked for a summary of the termination terms for her director. Here's what came back. It reads well. That's the problem — reading well is not evidence of anything.",
                  messages: [
                    { role: "assistant", kind: "final", text: "Per Section 8.3, either party may terminate with 60 days' written notice. Early termination incurs a fee of 15% of the remaining contract value. Industry benchmarks suggest this is standard; most SaaS agreements in 2024 averaged 55 days' notice. Our renewal date is March 15." }
                  ]
                },
                {
                  label: "Step 1 — internal coherence",
                  narration: "First pass, no sources needed. Does anything contradict itself? Nothing here does — the paragraph hangs together fine. That's a clean result, but notice what it does NOT tell you: coherence is not accuracy. A completely fabricated paragraph can be perfectly self-consistent.",
                  messages: [
                    { role: "tool", kind: "tool_result", text: "→ No internal contradictions. Proceed — this tells us nothing about truth." }
                  ]
                },
                {
                  label: "Step 2 — underline the checkable claims",
                  narration: "Every specific, falsifiable detail gets underlined. Four here. Vague phrasing wouldn't be a risk; it's the precision that makes each of these either right or wrong.",
                  messages: [
                    { role: "tool", kind: "tool_result", text: "→ (1) Section 8.3 = 60 days' notice  (2) 15% early-termination fee  (3) 2024 SaaS average = 55 days  (4) renewal date = March 15" }
                  ]
                },
                {
                  label: "Step 3 — was it in the source?",
                  narration: "The decisive question. Claims 1 and 2 came from the uploaded contract — check them, but they have a real provenance. Claim 4 wasn't in the contract at all. And claim 3 is the loud one: she never gave Claude any benchmark data. It appeared from nowhere.",
                  messages: [
                    { role: "tool", kind: "tool_result", text: "→ (1) in source ✓ verify  (2) in source ✓ verify  (3) NOT IN SOURCE ⚠️ appeared from nowhere  (4) NOT IN SOURCE ⚠️" }
                  ]
                },
                {
                  label: "Checking the source claims",
                  narration: "She opens the contract. Section 8.3 does say 60 days — correct. But the 15% fee is in Section 9.1, not 8.3, and it's 15% of the remaining term capped at three months. Directionally right, materially wrong. This is the most dangerous category: close enough to survive a skim.",
                  messages: [
                    { role: "tool", kind: "tool_result", text: "→ (1) ✓ accurate.  (2) ✗ partly wrong — right ballpark, wrong section, missing the cap." }
                  ]
                },
                {
                  label: "Checking the invented claims",
                  narration: "The \"2024 SaaS average of 55 days\" cites no source and rests on no data she supplied — a textbook fabrication, and the kind that would have sailed into a director's inbox as a benchmark. The March 15 renewal date turns out to be right, but by luck: it was in a different document, not this one. Right answer, no provenance. That's still a finding, not a pass.",
                  messages: [
                    { role: "tool", kind: "tool_result", text: "→ (3) ✗ fabricated — cut it.  (4) ~ accurate but ungrounded here — cite the real source or drop it." }
                  ]
                },
                {
                  label: "Step 4 — stakes and escalation",
                  narration: "This is going to a director who will use it in a renewal negotiation — consequential, and the fee terms are contractual. She can verify the contract claims herself (she has the contract). But whether the fee cap actually applies to their situation is a contract-interpretation question. That part goes to Legal.",
                  messages: [
                    { role: "assistant", kind: "final", text: "Verified: 60-day notice (§8.3). Corrected: fee is §9.1, 15% of remaining term, capped at 3 months. Removed: unsourced industry benchmark. Flagged for Legal: does the cap apply given our mid-term renewal?" }
                  ]
                },
                {
                  label: "The score",
                  narration: "Four claims: one right, one materially wrong, one fabricated, one right by accident. That's a 25% clean rate on the specifics — from output that read as entirely competent. Everything that mattered was invisible to a skim and obvious to a five-minute pass. This is the domain, in one example.",
                  messages: [
                    { role: "assistant", kind: "final", text: "Confidence told you nothing. The question \"was this in my source?\" told you everything." }
                  ]
                }
              ]
            }
          },
          {
            heading: "Editing and adapting for the audience",
            body: `<p>Verification asks "is it true?" Adaptation asks "is it right for this reader?" — and they're separate jobs. A summary can be flawlessly accurate and still be the wrong document for the person receiving it.</p><p>A finance analyst has Claude analyze quarterly churn. The output is a solid 900-word analysis: correct methodology, sound conclusions, well-organized. Three different people need this, and the accurate version is wrong for all three of them.</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ One document, forwarded three times</span><p>The CFO gets 900 words and skims the first two paragraphs, which are methodology. She misses the finding.</p><p>The support lead gets the same 900 words, none of which say what his team should do differently on Monday.</p><p>The board gets it in the pre-read and asks, at the meeting, "so what's the number?"</p></div><div class="compare-col good"><span class="cc-label">✓ Adapted per reader</span><p><strong>CFO:</strong> lead with the number and the delta vs. forecast; methodology moves to an appendix she won't read but wants to exist.</p><p><strong>Support lead:</strong> lead with the two churn drivers his team touches, and what to change.</p><p><strong>Board:</strong> three bullets and a single chart. Everything else is a link.</p></div></div><p>Same facts, same analysis, three documents. This is <strong>curation</strong>, and it's the part people skip: an unedited dump of everything Claude generated is not a report — it's raw material. Cutting is most of the work. The 900-word version isn't more thorough for the CFO, it's less useful, because the finding is buried under context that exists to satisfy a reader who isn't her.</p><div class="callout warn"><span class="callout-label">Watch out</span>Claude will happily do this adaptation for you — "rewrite this for the CFO, lead with the number, 150 words" works well. But <strong>every adaptation pass is a new opportunity for drift.</strong> When you compress 900 words to 150, hedges are the first casualty: "churn rose 3%, likely driven by the pricing change though the sample is small" compresses into "churn rose 3% due to the pricing change" — the caveat vanished and a tentative finding just became a fact the CFO will repeat. Re-check the compressed version against the verified one, especially where certainty appears to have increased.</div>`
          },
          {
            heading: "Choosing the right output format",
            body: `<p>Format is a real decision, not a default. Match it to how the output will be <em>used</em>, not to what's easiest to generate:</p><ul><li><strong>Artifacts</strong> — for anything the recipient will keep editing, reuse, or view outside the chat: a document, a slide outline, a policy draft. The test is simple — does this need to survive the conversation? If someone will still care about it next week, it's an artifact.</li><li><strong>Inline chat response</strong> — for quick, disposable answers that don't outlive the thread. A clarification, a yes/no, a one-line rephrase. Putting these in artifacts creates clutter you'll scroll past forever.</li><li><strong>Structured data (tables, CSV, JSON)</strong> — when the output feeds another tool or process, or needs to be scanned, sorted, and filtered rather than read top to bottom. If the next thing that happens to this output is "paste into a spreadsheet," prose is a step backwards.</li></ul><p>The common mistake runs one direction far more than the other: prose where structured data belongs. An ops lead asks for "a summary of the 40 open tickets by team and priority" and gets four flowing paragraphs. It's accurate. It's also unusable — she needs to sort by priority, and you cannot sort a paragraph. A table would have taken Claude the same effort and saved her the manual re-entry she's now doing.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Choosing between a text message, a shared doc, and a spreadsheet. Nobody agonizes over this at work — you just know that "running 5 min late" is a text, the project plan is a doc, and the budget is a spreadsheet. Putting the budget in a text message isn't wrong exactly, it's just going to make everyone's life worse. Same instinct, same three choices: inline, artifact, structured data.</div>`
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
          },
          {
            type: "single",
            question: "While validating a summary Claude wrote from a document you uploaded, which single question most efficiently surfaces likely fabrications?",
            options: [
              "\"Does this sentence sound confident?\"",
              "\"Was this specific detail actually in the source I provided, or did it appear from nowhere?\"",
              "\"Is the output well-organized and readable?\"",
              "\"Did Claude use formal language throughout?\""
            ],
            correct: [1],
            explanation: "Fabrication is precisely the production of a detail that wasn't in the input, so tracing each specific claim back to the source catches the large majority of hallucinations — fast, and with no domain expertise required. Confidence (A) is independent of accuracy, and organization or register (C, D) are presentation qualities that say nothing about whether the content is true."
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
          explanation: "A document that contradicts itself — a total that doesn't reconcile with its own line items — is an internal inconsistency, catchable by reading alone with no external source. Calling it a hallucination (A) misidentifies the fix: nothing was necessarily fabricated, and you'd catch this without any source document."
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
          explanation: "Artifacts fit content that will be kept, edited further, or viewed outside the chat — a multi-page document the team will iterate on is the clearest case. The other three are disposable answers that don't outlive the thread; putting them in artifacts just creates clutter."
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
          explanation: "Applying different standards or tone to comparable cases is a bias pattern, distinct from hallucination (fabricated facts) or inconsistency (self-contradiction). Note that neither summary is factually wrong on its own — which is exactly why bias requires comparing across outputs to detect."
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
          explanation: "Customer-facing commitments and compliance/legal interpretations both carry real consequences if wrong and involve claims the associate typically can't fully verify alone — both should route to expert review. A no-consequence brainstorm and a reformat of already-verified data introduce no new checkable claims."
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
          explanation: "When output feeds another tool or process, structured data (table/CSV/JSON) is the right format — it's built to be parsed and sorted, not read top to bottom. Prose (A) forces manual re-entry, which is the most common format mistake in this domain."
        },
        {
          type: "single",
          question: "An analyst asks Claude to summarize a report she uploaded. The summary includes a market-share statistic that does not appear anywhere in the uploaded report. What's the most likely explanation and the correct response?",
          options: [
            "Claude found the statistic through additional research; use it as-is.",
            "The statistic likely appeared from nowhere — a fabrication. Remove it or verify it against a real source before the summary is used.",
            "The report probably contains it and the analyst missed it; no action needed.",
            "It's an inconsistency, so re-reading the summary will resolve it."
          ],
          correct: [1],
          explanation: "A specific detail that wasn't in the supplied input is the signature shape of a hallucination — and \"was this in my source?\" is the fastest test for it. Assuming background research (A) is exactly the wrong instinct on a summarization task scoped to one document. (C) inverts the burden of proof, and (D) misnames the defect: an inconsistency is an internal contradiction, and re-reading won't surface a fact that simply isn't in the source."
        },
        {
          type: "single",
          question: "An associate compresses a verified 900-word analysis into a 150-word executive summary. What should she re-check in the compressed version?",
          options: [
            "Nothing — the source analysis was already verified, so the summary inherits its accuracy.",
            "Whether hedges and caveats survived compression, since dropping them can silently turn a tentative finding into a stated fact.",
            "Only the spelling and grammar.",
            "Whether the word count is exactly 150."
          ],
          correct: [1],
          explanation: "Every adaptation pass is a fresh opportunity for drift, and qualifiers are the first thing compression discards — \"likely driven by the pricing change, though the sample is small\" becomes \"driven by the pricing change,\" and a caveated finding becomes a fact an executive will repeat. Verification of the source (A) doesn't transfer through a rewrite that can change what's being claimed."
        },
        {
          type: "single",
          question: "An ops lead asks for \"a summary of the 40 open tickets by team and priority\" and receives four well-written paragraphs. The content is accurate. What's the problem?",
          options: [
            "Nothing — accurate output is successful output.",
            "The format doesn't fit the use: she needs to sort and filter by priority, and prose can't be sorted — this called for a table.",
            "The summary should have been an artifact instead.",
            "Four paragraphs is too long for any summary."
          ],
          correct: [1],
          explanation: "Accuracy and fitness-for-use are separate tests, and this output passes the first while failing the second. Data meant to be scanned, sorted, or filtered belongs in structured form. (C) misdiagnoses — artifact vs. inline is about persistence, not sortability — and (D) invents a length rule that isn't the issue."
        },
        {
          type: "multi",
          question: "Which two defects can be identified from the output alone, with no external source to check against? (Select 2)",
          options: [
            "A summary total that doesn't match its own line items.",
            "A citation to a regulation subsection that doesn't exist.",
            "A recommendation that violates a budget cap you stated earlier in the conversation.",
            "A statistic attributed to a study that was never conducted."
          ],
          correct: [0, 2],
          explanation: "Both inconsistencies — a self-contradicting total and a recommendation conflicting with an established constraint — are visible in the document itself; the contradiction is right there. The two hallucinations (a fake subsection, a nonexistent study) look perfectly plausible on the page and can only be caught by checking an authoritative source."
        },
        {
          type: "single",
          question: "Why is reviewing eight AI-drafted performance summaries one at a time an unreliable way to catch bias?",
          options: [
            "Reviewing individually takes longer than reviewing together.",
            "Bias here shows up as different standards applied across comparable cases — a pattern that's invisible in any single output and only appears when you compare them side by side.",
            "Bias only occurs in outputs longer than a page.",
            "Individual review can't catch hallucinations either."
          ],
          correct: [1],
          explanation: "Each summary can be factually correct and internally consistent, and still be part of a skewed pattern — \"drove\" for some people, \"was involved in\" for others. The defect lives in the comparison, not in any one document, so the review method has to match the defect. The other options invent constraints (C) or address a different defect entirely (D)."
        },
        {
          type: "single",
          question: "Claude's summary reads as fully coherent, with no internal contradictions. What does that establish about its accuracy?",
          options: [
            "It's accurate — internal coherence is strong evidence of correctness.",
            "Very little — a fabricated passage can be perfectly self-consistent; coherence rules out inconsistency, not hallucination.",
            "It means every claim came from the source document.",
            "It means the output is ready to ship without further checks."
          ],
          correct: [1],
          explanation: "The coherence pass is genuinely useful, but only for what it tests: self-contradiction. An entirely invented paragraph will pass it comfortably, since nothing forces a fabrication to conflict with itself. Treating coherence as an accuracy signal (A, D) is a version of the same error as treating confidence as one."
        },
        {
          type: "single",
          question: "Which claim in a Claude-drafted brief is the highest-priority candidate for verification?",
          options: [
            "A general statement that \"customer retention is important to long-term revenue.\"",
            "A specific figure — \"adoption reached 47% in Q3 2024, per a Gartner study\" — that you never supplied and can't immediately place.",
            "A sentence restating a constraint you gave in your prompt.",
            "A transitional sentence introducing the next section."
          ],
          correct: [1],
          explanation: "Precision plus absent provenance is the highest-risk combination: named source, exact figure, specific period, none of it from your input. Generalities (A) make no falsifiable claim, a restatement of your own constraint (C) has obvious provenance, and transitions (D) assert nothing checkable."
        },
        {
          type: "single",
          question: "A director asks whether Claude's own statement that it is \"highly confident\" in a summary can be used as a quality gate before sharing it externally. What's the correct answer?",
          options: [
            "Yes — self-reported confidence is a useful proxy when time is short.",
            "No — self-reported confidence is not a reliable accuracy signal; fabricated details are stated in the same confident register as correct ones.",
            "Yes, provided the confidence rating is above 90%.",
            "Only for internal documents."
          ],
          correct: [1],
          explanation: "This is the trap the official Sample 1 question is built around: asking the model to rate its own confidence produces another generated claim, not an independent check, and it fails in exactly the cases you most need it to catch. A numeric threshold (C) just puts a number on the same unreliable signal."
        },
        {
          type: "multi",
          question: "An associate is preparing the same verified churn analysis for a CFO and for a support team lead. Which two adaptations are appropriate? (Select 2)",
          options: [
            "For the CFO: lead with the headline number and variance against forecast, and move methodology to an appendix.",
            "For both: send the identical 900-word analysis, since it's already verified and accurate.",
            "For the support lead: lead with the two churn drivers his team actually controls and what to change on Monday.",
            "For the CFO: add confidence to the tentative findings so the recommendation lands more decisively."
          ],
          correct: [0, 2],
          explanation: "Adaptation means reshaping verified content around what each reader needs to decide or do — the finding first for the executive, the actionable drivers first for the operator. Sending one document to everyone (B) confuses accuracy with usefulness. Option (D) is the drift failure dressed up as polish: strengthening a hedge that the evidence doesn't support corrupts the analysis to make it sound better."
        },
        {
          type: "single",
          question: "In the validation pass, why is \"edit for the reader\" placed last rather than first?",
          options: [
            "Editing is the least important step.",
            "There's no point polishing a sentence you may have to delete once you find out it's wrong.",
            "Editing must always be done by a different person than the reviewer.",
            "Editing before verification is prohibited by AI policy."
          ],
          correct: [1],
          explanation: "Verification determines what survives; adaptation shapes what's left. Reversing them wastes effort on content that may not make the cut, and worse, an early polish can bury the specifics you most needed to check. Editing isn't unimportant (A) — it's just downstream of knowing what's true."
        },
        {
          type: "single",
          question: "Claude cites a real contract clause, but attributes it to Section 8.3 when it's actually in Section 9.1, and omits a cap the clause contains. Why is this failure mode particularly dangerous?",
          options: [
            "It isn't dangerous — the substance is roughly right.",
            "It's directionally right and materially wrong, so it survives a skim: a reviewer who half-remembers the term will nod and move on.",
            "It's a formatting error, easily caught by a spell-check.",
            "It only matters if the document is customer-facing."
          ],
          correct: [1],
          explanation: "Wholly invented claims often look odd enough to prompt a check. Near-misses don't — they match the reviewer's rough memory, so they clear the exact heuristic most people use, and the missing cap can change a negotiation. \"Roughly right\" (A) is precisely the reasoning that lets it through, and stakes (D) don't change the diagnosis."
        },
        {
          type: "single",
          question: "Which is the strongest reason \"just check everything\" is not a workable validation strategy?",
          options: [
            "Checking is technically impossible for most claims.",
            "It doesn't scale — the practical skill is triage: knowing which classes of claim carry risk, based on specificity, provenance, and stakes.",
            "Most AI output is accurate, so checking is rarely necessary.",
            "Checking output is the Developer's responsibility, not the Associate's."
          ],
          correct: [1],
          explanation: "The domain tests calibration, not paranoia or credulity. Verifying every sentence costs more than the AI saved and gets abandoned within a week; verifying nothing is the failure the whole domain exists to prevent. The middle path is triage by specificity, provenance, and stakes. (C) rationalizes skipping the gate, and (D) misassigns the Associate's core responsibility."
        },
        {
          type: "single",
          question: "An associate reviewing a Claude-drafted market brief finds a claim that's accurate but was never in any source she provided — it happened to be right. How should she treat it?",
          options: [
            "Leave it as-is, since it turned out to be correct.",
            "Treat it as a finding: the claim has no provenance in this work, so either cite a real source for it or remove it.",
            "Remove the entire brief and start over.",
            "Ask Claude to confirm it's correct and then keep it."
          ],
          correct: [1],
          explanation: "A right answer with no provenance is luck, not verification, and it will not stay lucky. If the claim matters, ground it in a real source; if it can't be grounded, it doesn't belong. Keeping it because it happened to be right (A) rewards the exact process that produces fabrications, and asking Claude to self-confirm (D) is the same unreliable signal as self-reported confidence."
        },
        {
          type: "single",
          question: "Which situation best fits the inline chat response format rather than an artifact?",
          options: [
            "A policy draft that HR will revise over two weeks.",
            "A quick clarification of what an acronym meant in the previous message.",
            "A slide outline the team will build a deck from.",
            "A project plan that will be shared with three stakeholders."
          ],
          correct: [1],
          explanation: "The test is whether the output needs to survive the conversation. A one-off clarification doesn't — it's consumed immediately and never referenced again. The other three will all be revisited, edited, or shared beyond the thread, which is what artifacts are for."
        }
      ],
      flashcards: [
        { front: "Why is \"Claude sounded confident\" not a reliable accuracy signal?", back: "Language models state fabricated details (citations, numbers, quotes) with the same confident tone as accurate ones — confidence and correctness are independent." },
        { front: "Define hallucination in this context.", back: "A fabricated fact, source, number, or quote that sounds plausible but isn't real — most likely around oddly specific unsupplied details. Caught by checking an external source." },
        { front: "Define an internal inconsistency (vs. a hallucination).", back: "A document contradicting itself — e.g. a summary total that doesn't match its own line items — catchable by reading alone, with no external source needed." },
        { front: "Define bias as a distinct output defect, and say why it's hard to catch.", back: "Different standards or framing applied to comparable cases. It's invisible in any single output — it only appears when you compare across several, which isn't how people usually review." },
        { front: "Which single question catches most fabrications fastest?", back: "\"Was this specific detail actually in the source I gave Claude, or did it appear from nowhere?\" — fabrication IS the production of a detail that wasn't in the input." },
        { front: "What's the rule of thumb for when a claim must be verified against a primary source?", back: "Anything bound for a compliance, legal, financial, or external-facing audience — verify before it ships; self-reported AI confidence doesn't substitute." },
        { front: "What two independent axes decide verify-yourself vs. escalate?", back: "Stakes (what happens if it's wrong) and your competence to check (could you actually tell). High stakes + checkable → verify. High stakes + not checkable by you → escalate." },
        { front: "When should you escalate an output rather than verify it yourself?", back: "When you're not equipped to judge a domain-specific claim (e.g., a regulatory interpretation) — route it to a subject-matter expert, or to a Developer/Architect for technical system claims." },
        { front: "List the five steps of a practical validation pass.", back: "1. Read for internal coherence. 2. Underline every specific checkable claim. 3. Ask whether each was in your source. 4. Sort what's left by stakes and checkability. 5. Edit for the reader — last." },
        { front: "What does internal coherence prove about accuracy?", back: "Almost nothing — a fabricated passage can be perfectly self-consistent. Coherence rules out inconsistency, not hallucination." },
        { front: "Why is a \"near-miss\" citation more dangerous than an obviously invented one?", back: "It's directionally right and materially wrong, so it matches the reviewer's rough memory and survives a skim — clearing the exact heuristic most people rely on." },
        { front: "When should you use the Artifact format?", back: "For content the recipient will keep editing or view outside the chat — documents, code, slide outlines. Test: does this need to survive the conversation?" },
        { front: "When should you use structured data (table/JSON/CSV) as the output format?", back: "When the output feeds another tool or process, or needs to be scanned/sorted rather than read as prose. If the next step is \"paste into a spreadsheet,\" prose is a step backwards." },
        { front: "What does \"curating\" an AI-generated report mean, beyond fact-checking?", back: "Cutting it down to what the audience actually needs — an unedited full dump of everything generated is raw material, not a report. Cutting is most of the work." },
        { front: "What's the main risk when compressing a verified analysis for an executive?", back: "Drift — hedges and caveats are the first casualty of compression, silently turning a tentative finding into a stated fact the executive will repeat." },
        { front: "Why isn't \"just check everything\" a workable validation strategy?", back: "It doesn't scale — it costs more than the AI saved and gets abandoned within a week. The skill is triage by specificity, provenance, and stakes." }
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
            body: `<p>Claude isn't one thing — it's a few surfaces with different jobs, and most inefficiency comes from using the wrong one out of habit rather than from prompting badly.</p><ul><li><strong>Plain chat</strong> — one-off questions and quick tasks with no ongoing context to maintain. The default, and correct far more often than power users like to admit.</li><li><strong>Projects</strong> — recurring work with shared context: persistent instructions plus knowledge sources, so you're not re-explaining your team's background every single session.</li><li><strong>Research mode</strong> — open-ended, multi-source investigation where you want Claude to go find and synthesize rather than answer from what's in front of it.</li><li><strong>Artifacts</strong> — output meant to be viewed or edited as a standalone document rather than read inline.</li></ul><p>The tell for each is what you're doing repeatedly. A comms manager who pastes the same brand voice guide into a fresh chat every Monday morning has been telling herself she's saving time by not "setting up a whole Project." She's spent four minutes a week for a year re-pasting a document that could have sat in a Project's knowledge from day one — and worse, the version she pastes has quietly drifted, because she's been copying it from an older email each time rather than from the current file.</p><div class="callout"><span class="callout-label">Note</span>These surfaces compose rather than compete — the question is rarely "Project <em>or</em> artifact." You work inside a Project, ask it to produce an artifact, and might use research mode within it. The exam's judgment calls are about which surface addresses the specific friction described: repeated context → Project. Needs to be edited later → artifact. Needs external sources → research mode. Answer in ten seconds and forget it → chat.</div>`,
            interactive: {
              type: "classify",
              title: "Which surface fits?",
              instructions: "For each situation, pick the Claude surface that addresses the actual friction described.",
              items: [
                {
                  text: "Every Monday you re-paste the same brand style guide and product glossary before drafting the weekly newsletter.",
                  answer: "project",
                  options: [["chat", "💬 Chat"], ["project", "📁 Project"], ["research", "🔎 Research mode"], ["artifact", "📄 Artifact"]],
                  why: "Stable context reused across many sessions is exactly what Projects exist for. The repetition itself is the signal — and re-pasting risks drift as the copy you paste ages."
                },
                {
                  text: "\"What's a reasonable industry benchmark for SaaS onboarding time?\" — you need to check several external sources you don't have.",
                  answer: "research",
                  options: [["chat", "💬 Chat"], ["project", "📁 Project"], ["research", "🔎 Research mode"], ["artifact", "📄 Artifact"]],
                  why: "Open-ended investigation across sources you don't already hold. That's research mode's job, not something a single prompt over existing context can do."
                },
                {
                  text: "\"Does 'net 30' mean 30 days from invoice or from delivery?\" — you just need the answer and you'll never look at it again.",
                  answer: "chat",
                  options: [["chat", "💬 Chat"], ["project", "📁 Project"], ["research", "🔎 Research mode"], ["artifact", "📄 Artifact"]],
                  why: "A one-off question with no persistent context and nothing to keep. Plain chat. Spinning up a Project for this is overhead with no payoff."
                },
                {
                  text: "You need a first-draft onboarding policy that HR will revise over the next two weeks and then publish.",
                  answer: "artifact",
                  options: [["chat", "💬 Chat"], ["project", "📁 Project"], ["research", "🔎 Research mode"], ["artifact", "📄 Artifact"]],
                  why: "It must survive the conversation and be edited by others. That's an artifact — buried in a chat thread, it's effectively lost by Thursday."
                },
                {
                  text: "Your team of five all answer support tickets using the same escalation rules and tone standards, and their answers have been drifting apart.",
                  answer: "project",
                  options: [["chat", "💬 Chat"], ["project", "📁 Project"], ["research", "🔎 Research mode"], ["artifact", "📄 Artifact"]],
                  why: "Shared standards applied consistently across people and sessions — a Project's instructions plus knowledge give everyone one source of truth. Drift across a team is the classic symptom of missing shared configuration."
                },
                {
                  text: "\"Summarize this attached PDF in three bullets so I can decide whether to read it.\"",
                  answer: "chat",
                  options: [["chat", "💬 Chat"], ["project", "📁 Project"], ["research", "🔎 Research mode"], ["artifact", "📄 Artifact"]],
                  why: "Self-contained, disposable, and the input is right there. No persistence needed, no external sources, nothing to edit later — plain chat handles it."
                }
              ]
            }
          },
          {
            heading: "Model tiers: cost, speed, and quality are a triangle",
            body: `<p>Claude's model tiers — <strong>Haiku</strong>, <strong>Sonnet</strong>, and <strong>Opus</strong> — trade off along cost, latency, and reasoning depth. There is no single "best" model; there's a best model <em>for the task</em>:</p><ul><li><strong>Haiku</strong> — fastest and cheapest. Fits high-volume, low-complexity work: short replies, simple classification, quick formatting, tagging.</li><li><strong>Sonnet</strong> — the balanced default for most day-to-day work that requires real reasoning.</li><li><strong>Opus</strong> — highest capability for the hardest reasoning, at the highest cost and latency. Reserve it for work where getting it right matters more than getting it fast or cheap.</li></ul><div class="callout analogy"><span class="callout-label">Think of it like...</span>Shipping options. Overnight courier, ground, or a bike messenger across town. Nobody thinks the courier is "the best" — they think it's the best <em>for the thing that has to be there tomorrow</em>. You would not overnight a birthday card to your neighbour, and you would not put a passport renewal in the slowest option to save four dollars. Same package, different urgency, different correct answer. Anyone who insists on overnighting everything isn't being careful, they're just spending money to avoid making a decision.</div><p>Make that concrete. An ops team classifies 5,000 support tickets a month into four buckets. It's mechanical work with an unambiguous right answer per ticket. On the top tier it's slow and expensive; on Haiku it's fast, cheap, and — because the task is genuinely simple — no less accurate. Nothing was sacrificed. Now the same team wants a root-cause analysis of the 200 tickets that escalated, weighing patterns and ambiguous causes and producing a recommendation the VP will act on. That's exactly what the top tier is for, and cheaping out there costs far more than the compute saved.</p><div class="callout warn"><span class="callout-label">Watch out</span>Both defaults fail, in opposite directions. "Always use the best model to be safe" burns cost and latency on tasks that never needed it — and it's not caution, it's just declining to think about the task. "Always use the cheapest" risks quality on work that genuinely needed reasoning, and the failures are subtle: not obviously broken output, just slightly worse judgment that nobody notices until a decision goes wrong. The exam consistently rewards matching the tier to the task's actual complexity.</div>`
          },
          {
            heading: "Context limits: what running out of room actually feels like",
            body: `<p>Every conversation has a finite <strong>context window</strong> — a limit on how much of the conversation Claude can consider at once. Two things about this surprise people, and both show up on the exam.</p><p>First, the failure is <em>gradual</em>, not a wall. Nobody gets an error saying "context exceeded, please restart." What happens instead: a constraint you set forty turns ago stops being honored. A document you uploaded early gets described a little wrong. Claude starts re-asking something you already told it. Quality degrades quietly, and the natural reaction — "it's getting worse, let me explain again" — makes it worse, because you're adding more context to a thread that's already overloaded.</p><p>Second, more context is not automatically better. A long thread isn't just a bigger pile of useful information; it's a pile that includes three abandoned drafts, a tangent about a different project, and an instruction you gave in turn 3 and mentally revoked in turn 20 — except you never told Claude that. It's still weighing that instruction. This is Domain 1's runaway-thread trap, seen from the other side.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>A whiteboard in a long meeting. Early on, everything on it is relevant. Three hours later it's covered in crossed-out ideas, a diagram from a tangent, and a decision that got reversed but never erased. A newcomer reading that board has to work out what still counts. That's the model's position in a runaway thread — and "let me add more to the board" is not the fix. Photographing the conclusions and wiping it is.</div>`
          },
          {
            heading: "Restart, summarize, or persist",
            body: `<p>Three moves, three different situations. Getting them straight is the practical skill this objective tests.</p><ul><li><strong>Restart</strong> when the thread has drifted far from the current topic and most of the history is now noise. Open a clean conversation with a focused prompt. Bring forward the conclusions, not the transcript.</li><li><strong>Summarize</strong> when the history is genuinely relevant but too long — ask Claude to summarize the decisions and open questions so far, then continue from that. The distinction from restarting: is the past still <em>load-bearing</em>? If yes, summarize. If it's mostly abandoned turns, restart.</li><li><strong>Persist</strong> when information is stable and reused across sessions — style guides, standards, background facts. That belongs in a Project's instructions or knowledge, not re-pasted into each new thread.</li></ul><p>The scope test sorts these fast: does this matter <em>right now</em> (nothing — restart clean), <em>for the rest of this conversation</em> (summarize), or <em>every time forever</em> (persist in a Project)?</p><div class="callout warn"><span class="callout-label">Watch out</span>Reaching for a bigger model to fix a cluttered thread is a classic wrong answer. A higher tier doesn't clean up your context — it processes the same noise more expensively, and confidently. If the problem is that Claude is weighing three revoked instructions and a tangent, no amount of reasoning capability fixes that, because the reasoning isn't what's broken. The input is.</div>`,
            interactive: {
              type: "scenario",
              title: "Ninety minutes deep and drifting",
              setup: "You're 90 minutes into a thread with Claude. It started as a Q3 campaign brief, wandered through budget questions, took a detour into a different product's positioning, and produced two drafts you abandoned. Now you need to write the actual campaign brief — and Claude has just used a tagline you explicitly rejected an hour ago. What do you do?",
              choices: [
                {
                  text: "Tell Claude \"remember, we rejected that tagline\" and keep going in the same thread.",
                  outcome: "bad",
                  feedback: "You've added a 41st turn to a thread whose problem is that it has 40. The rejected tagline is still in there, along with the abandoned drafts and the tangent about a different product — you've just layered a correction on top of the noise. This works for a turn or two, then something else from the pile resurfaces."
                },
                {
                  text: "Switch to a higher-capability model so it can better handle the long, complex thread.",
                  outcome: "bad",
                  feedback: "The classic wrong answer. The model's reasoning was never the problem — the input is cluttered with revoked instructions and abandoned work. A bigger model processes the same noise more expensively and just as confidently. You've spent more to fix nothing."
                },
                {
                  text: "Start a fresh conversation with a focused prompt: the campaign goal, the audience, the constraints that survived, and the fact that the rejected tagline is off the table.",
                  outcome: "good",
                  feedback: "Right. The thread has drifted and most of its history is now noise, so restarting is the move — and you bring forward the conclusions, not the transcript. Ninety minutes of exploration wasn't wasted; it's what told you which constraints actually matter. That's exactly what belongs in the new prompt."
                },
                {
                  text: "Ask Claude to summarize the whole conversation, then keep working in the same thread below the summary.",
                  outcome: "bad",
                  feedback: "Half right, and it's the tempting answer. Summarizing is the correct move when the history is still load-bearing — but here it's mostly abandoned drafts and a tangent about another product. You'd get a tidy summary sitting on top of all the original clutter, which is still in the thread and still being weighed. Summarize when the past matters; restart when it doesn't."
                }
              ]
            }
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
          },
          {
            type: "single",
            question: "A long conversation has started ignoring a constraint you set early on and is describing an uploaded document slightly wrong. What is happening, and what's the right response?",
            options: [
              "Claude is malfunctioning; report the bug and wait.",
              "Context degradation from a long, cluttered thread — restart with a focused prompt or summarize the load-bearing decisions and continue from that.",
              "The context window has hard-failed and Claude will now return an error.",
              "Switch to a higher-tier model so it can handle the longer thread."
            ],
            correct: [1],
            explanation: "Context limits degrade gradually rather than erroring out — dropped constraints and fuzzy recall of early material are the symptoms. The fix is reducing the noise (restart or summarize), not a bigger model (D), which processes the same clutter more expensively without cleaning it up."
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
          explanation: "When a thread has drifted and accumulated irrelevant context, restarting with a focused prompt typically produces better results than continuing in a cluttered thread — a bigger model doesn't fix a noisy context, it just processes the noise more expensively. Telling Claude to ignore earlier turns (C) doesn't remove them from what it's weighing."
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
          explanation: "Research mode is built for open-ended, multi-source exploration — it fits investigative work, not quick single-turn edits where the input is already in front of you."
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
          explanation: "Projects exist for recurring context: stable, reusable information that would otherwise need re-explaining (and risk drifting) every session. One-off, non-reused details don't need persistence, and persisting something is the opposite of wanting it forgotten."
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
          explanation: "Model selection is a cost/speed/quality trade-off, not a strict hierarchy. Defaulting to the top tier for every task spends budget and time without improving outcomes on tasks simple enough for a lighter model. Top-tier models handle simple tasks fine (A, C) — they're just an expensive way to do so."
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
          explanation: "Context windows and effective attention are finite; letting a thread run indefinitely without summarizing risks losing track of earlier decisions and cluttering the context that later responses draw on. There's no hard message cap that triggers a refusal (A) — that's precisely what makes the degradation easy to miss."
        },
        {
          type: "single",
          question: "A team lead argues that context limits aren't a real concern because \"Claude would tell us if we hit the limit.\" Why is this reasoning dangerous?",
          options: [
            "It's correct — an explicit error appears when the limit is reached.",
            "Context pressure degrades gradually and silently — dropped constraints, fuzzy recall of early material — rather than announcing itself, so the team will attribute the decline to something else.",
            "Claude refuses all requests once a thread exceeds 50 turns.",
            "Context limits only apply inside Projects."
          ],
          correct: [1],
          explanation: "The absence of an alarm is what makes this failure mode costly: quality erodes quietly and the natural response — explaining again at greater length — adds more context to an already overloaded thread, making it worse. (C) and (D) invent limits that don't exist."
        },
        {
          type: "single",
          question: "Five people on a support team use Claude with the same escalation rules and tone standards, but their answers have drifted noticeably apart. What's the most appropriate fix?",
          options: [
            "Have each person write better individual prompts.",
            "Set up a shared Project whose instructions and knowledge encode the escalation rules and tone standards, so everyone works from one source of truth.",
            "Move everyone to a higher model tier for more consistency.",
            "Have one person handle all tickets."
          ],
          correct: [1],
          explanation: "Drift across people doing the same task is the signature symptom of missing shared configuration — each person is reconstructing the standards from memory. A Project centralizes them. Better individual prompts (A) still leaves five diverging copies, and model tier (C) doesn't address consistency of instructions."
        },
        {
          type: "single",
          question: "A conversation contains genuinely important decisions but has grown very long. You need to keep working on the same topic. What's the best move?",
          options: [
            "Restart from scratch and reconstruct the decisions from memory.",
            "Ask Claude to summarize the decisions and open questions so far, then continue from that summary.",
            "Keep appending to the thread and hope the early decisions stay in effect.",
            "Move the whole transcript into a Project's knowledge base."
          ],
          correct: [1],
          explanation: "Summarizing is the right tool when the history is still load-bearing but too long — you keep what matters without the accumulated noise. Restarting from memory (A) risks losing real decisions, and (D) misuses Projects: persistent knowledge is for stable, reusable material, not one conversation's transcript."
        },
        {
          type: "multi",
          question: "Which two situations call for restarting a conversation rather than summarizing it? (Select 2)",
          options: [
            "The thread drifted into a tangent about an unrelated project and most of the history no longer applies.",
            "The thread contains a chain of decisions you'll keep building on for the rest of the session.",
            "The thread is full of abandoned drafts and instructions you've since mentally revoked.",
            "The thread is long but every turn is still directly relevant to the current task."
          ],
          correct: [0, 2],
          explanation: "Restart when the past is mostly noise — tangents and abandoned work you don't want weighed anymore. Summarize when the past is still load-bearing (B, D), where you want to preserve the substance and shed only the length. The test is whether the history still matters."
        },
        {
          type: "single",
          question: "An associate spins up a Project for a single one-off question she'll never revisit. What's the issue?",
          options: [
            "Nothing — Projects are always the better choice.",
            "It's overhead with no payoff: Projects earn their setup cost through repeated reuse of shared context, which a one-off question doesn't have.",
            "Projects can't answer one-off questions.",
            "It will corrupt her other Projects' knowledge sources."
          ],
          correct: [1],
          explanation: "Projects pay for themselves through repetition — persistent instructions and knowledge you'd otherwise re-explain. With no reuse, there's nothing to amortize the setup against, and plain chat is the right surface. Projects would answer the question fine (C); the point is that the configuration work buys nothing here."
        },
        {
          type: "single",
          question: "A finance team runs a monthly root-cause analysis of escalated tickets — weighing ambiguous patterns and producing a recommendation the VP acts on. They currently run it on the cheapest tier to save money. What's the most accurate assessment?",
          options: [
            "Correct call — cheaper is always the responsible choice for recurring work.",
            "This is the wrong direction to economize: the task requires genuine reasoning and feeds a consequential decision, which is exactly what the higher tier is for.",
            "Model tier makes no difference to analytical quality.",
            "They should use research mode instead of choosing a tier."
          ],
          correct: [1],
          explanation: "Cost optimization is task-specific, not a blanket policy. Ambiguous, judgment-heavy analysis feeding a VP's decision is the case where reasoning depth earns its cost — and the failure mode is subtle, showing up as slightly worse judgment nobody notices until a decision goes wrong, not as visibly broken output."
        }
      ],
      flashcards: [
        { front: "When should you use a Claude Project instead of plain chat?", back: "For recurring work with shared context — persistent instructions plus knowledge sources you'd otherwise re-explain every session." },
        { front: "What is research mode best suited for?", back: "Open-ended, multi-source investigation where you want Claude to explore and synthesize, not just answer from context already in front of it." },
        { front: "Rank Claude's model tiers by cost/speed vs. reasoning depth.", back: "Haiku (fastest/cheapest, simple tasks) → Sonnet (balanced default) → Opus (highest capability, highest cost/latency, hardest reasoning)." },
        { front: "What's the risk of always defaulting to the highest-tier model?", back: "Wasted cost and latency on tasks that didn't need the extra reasoning power — model selection is a trade-off, not a strict hierarchy." },
        { front: "What's the risk of always defaulting to the cheapest/fastest model?", back: "Risking quality on tasks that actually needed deeper reasoning — and the failures are subtle: slightly worse judgment, not visibly broken output." },
        { front: "How does hitting a context limit actually present itself?", back: "Gradually and silently — dropped constraints, fuzzy recall of early uploads, re-asking things you already said. There's no error message announcing it." },
        { front: "When should you restart a conversation instead of continuing it?", back: "When it has drifted far from topic and most of the history is now noise — bring forward the conclusions, not the transcript." },
        { front: "When should you summarize a long thread instead of restarting it?", back: "When the history is still load-bearing — genuinely relevant, just too long. Restart when it's mostly abandoned turns; summarize when the past still matters." },
        { front: "What's the scope test for restart vs. summarize vs. persist?", back: "Does this matter right now (restart clean), for the rest of this conversation (summarize), or every time forever (persist in a Project)?" },
        { front: "Why doesn't switching to a bigger model fix a cluttered thread?", back: "The reasoning was never the problem — the input is. A higher tier processes the same noise more expensively and just as confidently." },
        { front: "What's the symptom that a team needs shared Project configuration?", back: "Drift — several people doing the same task with the same standards, getting noticeably different results because each reconstructs the rules from memory." }
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
            heading: "Start with the friction, not the technology",
            body: `<p>The most common way an AI initiative fails has nothing to do with AI. It fails because someone decided to "use AI" before deciding what problem they were solving, and "use AI" is not a goal — it's a technique in search of one.</p><p>Before automating or augmenting anything, get specific about three things: what the current process actually is, where it actually breaks down, and what measurably better would look like. That third one does most of the work, because it forces honesty. "Faster" is not a target. "First-draft turnaround under 30 minutes instead of the current two days" is a target, and it tells you immediately whether you succeeded.</p><p>Here's the pattern in practice. A VP tells an ops associate: "Legal review is a bottleneck — can AI fix it?" The tempting move is to start prompting. The right move is to spend an hour finding out what's true. She maps the process and finds that of the average 9-day turnaround, <strong>7 days is contracts sitting in a queue</strong> waiting for a reviewer to pick them up. Actual review time is about 90 minutes.</p><div class="callout warn"><span class="callout-label">Watch out</span>Read that again, because it's the trap the whole domain circles: <strong>the bottleneck was queueing, not reviewing.</strong> A brilliant AI that cuts review from 90 minutes to 10 improves a 9-day turnaround to 8 days and 10 minutes. You'd have built something impressive, demoed it well, and moved the needle by 1%. Meanwhile the actual fix might be triage — using Claude to sort incoming contracts by risk so the routine 60% skip the queue entirely. Same technology, ten times the impact, and you only find it by measuring the process before designing the solution.</div><p>Claude is a genuinely good thinking partner for this analysis. Feed it the current process description and ask it to surface gaps, redundant steps, unclear ownership, and where work waits. Just don't confuse that with having done the measurement — Claude can reason about the process you describe, not the process you actually have.</p>`
          },
          {
            heading: "Where Claude actually fits in a process",
            body: `<p>Once you know where the friction is, the next question is whether it's the kind of friction Claude addresses. Some steps are a natural fit; some aren't; and the difference is learnable.</p><p><strong>Claude fits well</strong> where the work is language-shaped and the cost of a first draft being imperfect is low: summarizing, drafting, reformatting, extracting structure from mess, classifying, comparing documents, generating options. These share a trait — a human can check the output faster than they could produce it. That's the real test.</p><p><strong>Claude fits poorly</strong> where the step requires accountability rather than production. Deciding to fire someone. Approving spend. Signing off on a regulatory filing. It's not that Claude can't generate text for these — it's that generating the text was never the hard part, and the part that <em>is</em> hard (someone standing behind the decision) can't be delegated to a system that can't be held responsible.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Hiring a very fast, very capable research assistant. You'd hand them the literature review, the first draft, the data cleanup, the "find me everything we've said publicly about X." You would not hand them the decision to terminate a contract, and not because they're incapable of forming a view — because the decision needs a name on it, and it can't be theirs. The boundary isn't capability. It's accountability.</div><p>The useful reframe: instead of asking "can Claude do this step?", ask <strong>"if Claude does this step, what does the human do?"</strong> If the answer is "reviews it, using judgment they actually have" — good fit. If the answer is "rubber-stamps it, because they have no realistic way to check" — you haven't augmented the process, you've removed the control and left a signature block behind. That's worse than no automation at all, because now the process looks reviewed.</p>`,
            interactive: {
              type: "classify",
              title: "Augment, redesign, or leave it alone?",
              instructions: "For each step in a real process, decide: augment it with Claude (same process, one step better), redesign the process around what Claude enables, or keep it human and unautomated.",
              items: [
                {
                  text: "A support agent writes a first-draft reply to a routine billing question, then edits and sends it.",
                  answer: "augment",
                  options: [["augment", "⚡ Augment"], ["redesign", "🔄 Redesign"], ["human", "🙅 Keep human"]],
                  why: "Language-shaped work where a human can check the draft faster than writing it, and the process shape doesn't change — the agent still owns the reply. Textbook augmentation."
                },
                {
                  text: "The final decision to terminate an underperforming employee.",
                  answer: "human",
                  options: [["augment", "⚡ Augment"], ["redesign", "🔄 Redesign"], ["human", "🙅 Keep human"]],
                  why: "The hard part was never producing text — it's accountability for a consequential decision about a person. That can't be delegated to something that can't be held responsible."
                },
                {
                  text: "Contracts wait 7 days in a queue because every one gets full manual review, though 60% are routine renewals with no custom terms.",
                  answer: "redesign",
                  options: [["augment", "⚡ Augment"], ["redesign", "🔄 Redesign"], ["human", "🙅 Keep human"]],
                  why: "Speeding up the review step barely moves a 9-day turnaround that's mostly queueing. Using Claude to triage by risk so routine contracts skip the queue changes the process shape — that's redesign, and it's where the real gain is."
                },
                {
                  text: "A PM manually copies action items from meeting notes into the tracker every Friday.",
                  answer: "augment",
                  options: [["augment", "⚡ Augment"], ["redesign", "🔄 Redesign"], ["human", "🙅 Keep human"]],
                  why: "Mechanical extraction from unstructured text, easily checked at a glance, with the surrounding process untouched. Augment the step; don't rebuild the tracker."
                },
                {
                  text: "Signing off that a regulatory filing is accurate and complete before submission.",
                  answer: "human",
                  options: [["augment", "⚡ Augment"], ["redesign", "🔄 Redesign"], ["human", "🙅 Keep human"]],
                  why: "Claude can help draft and can flag issues — but the sign-off itself is an assertion of accountability to a regulator. Ask \"if Claude does this, what does the human do?\" If the answer is rubber-stamp, you've removed a control."
                },
                {
                  text: "Research for competitive briefs takes analysts three days per brief, and by the time it's done the sales team has already had the call.",
                  answer: "redesign",
                  options: [["augment", "⚡ Augment"], ["redesign", "🔄 Redesign"], ["human", "🙅 Keep human"]],
                  why: "When collapsing the time cost makes a fundamentally different cadence possible — briefs on demand before the call, rather than a slow artifact that arrives too late — the process itself changes shape. That's redesign."
                }
              ]
            }
          },
          {
            heading: "Augment first, redesign only where it earns it",
            body: `<p>Two integration patterns show up constantly, and the exam wants you to know which is which and when each is appropriate.</p><ul><li><strong>Augmenting</strong> — Claude does one step faster or better; everything around it stays the same. The support agent still owns the reply, they just start from a draft. Low risk, fast to adopt, easy to reverse if it doesn't work.</li><li><strong>Redesigning</strong> — the process itself changes shape because AI removed a constraint the old design was built around. Contracts no longer queue because triage routes the routine ones past review. Higher upside, and much higher change-management cost.</li></ul><p>The default sequencing: <strong>augment the highest-friction step first, prove it works, then consider redesign.</strong> Not because redesign is bad — the contract-triage example is a redesign, and it's the right answer there — but because redesign asks people to change how they work, and that ask should be backed by evidence rather than a slide deck.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Renovating versus moving. Replacing the broken dishwasher is augmentation: cheap, obvious, and if it doesn't help you've lost a weekend. Knocking out the wall to open the kitchen into the living room might genuinely be the better answer — but you want to be quite sure the layout is the problem before you start swinging a hammer, and you cannot un-knock a wall. Do the dishwasher first. It also teaches you things about the kitchen.</div><p><strong>The trap:</strong> a successful augmentation creates enthusiasm, and enthusiasm proposes redesigns that the evidence doesn't support. Drafting got 60% faster, so someone suggests removing the review step entirely — but nothing about faster drafting says review was unnecessary. Those are different claims. The evidence for the first is not evidence for the second.</p>`
          },
          {
            heading: "Using Claude to design the solution, not just run it",
            body: `<p>An underused move: Claude is useful for the <em>design</em> work, not only the execution. Most people jump straight to "have Claude do the task" and skip the part where Claude helps them figure out what the task should be.</p><p>Concretely, a few things worth handing it before you build anything:</p><ul><li><strong>Stress-test the plan.</strong> "Here's my proposed process change. What breaks at 10x volume? What assumptions am I making that I haven't stated? Who would object and why?" This is genuinely good at surfacing the objection you'll get in the meeting, while you still have time to have an answer.</li><li><strong>Draft the requirements.</strong> Describe the messy current process out loud and have Claude turn it into a structured description with gaps flagged. Half the value is that reading a clean version of your own process reveals the steps nobody actually owns.</li><li><strong>Generate the alternatives you didn't think of.</strong> "Give me four ways to solve this queueing problem, including one that doesn't use AI at all." That last clause matters — it's a cheap guard against building an AI solution to a scheduling problem.</li><li><strong>Pre-mortem it.</strong> "It's six months later and this rollout failed. Write the retro." Remarkably effective at surfacing risks that a forward-looking plan smooths over.</li></ul><div class="callout"><span class="callout-label">Note</span>Everything from Domain 2 applies here with force. Claude will confidently produce a plausible process analysis of a process it has never seen and cannot see. It reasons over your <em>description</em> — so if your description is wrong (and the whole problem is that you haven't measured yet), the analysis will be internally coherent, well-organized, and about a process that doesn't exist. Use it to structure your thinking and generate candidates. Don't use it as evidence.</div>`
          },
          {
            heading: "Communicating value and limitations honestly",
            body: `<p>Part of the Associate's job is setting expectations that survive contact with reality. This is not a soft skill or a nicety — overselling is the single most reliable way to kill an AI initiative, and it kills it about four months in, when the gap between the pitch and the experience becomes undeniable and the credibility is gone.</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ The pitch that wins the room and loses the year</span><p>"This will eliminate the legal review bottleneck. Claude reviews contracts instantly — we're looking at a 90% reduction in turnaround."</p><p>Leadership hears "we can cut a headcount." Legal hears "they think a chatbot can do my job" and is now an opponent. In month four the first mis-flagged contract lands and the whole program is radioactive.</p></div><div class="compare-col good"><span class="cc-label">✓ The pitch that's still standing in month four</span><p>"Most of our 9-day turnaround is queueing, not reviewing. If Claude triages incoming contracts by risk, the routine 60% skip the queue and reviewers spend their time on the 40% that need judgment. Target: 9 days to 3."</p><p>"What it won't do: it won't review anything. Every contract still gets a human sign-off, and Legal defines the triage rules. If triage is wrong, it's wrong toward more review, not less."</p></div></div><p>The right-hand version is more persuasive precisely <em>because</em> of the limitations, not despite them. It shows you understand the process, which means your numbers might be real. It gives Legal ownership instead of a threat. And it names the failure mode before a skeptic does — which is the difference between "he's thought about this" and "he hasn't thought about this."</p><p>A credible pitch names the actual benefit and the actual limitation <strong>in the same breath</strong>: "cuts first-draft time from two hours to twenty minutes, and still needs a domain expert's review before it goes external." Both halves, every time. Being the person who correctly identifies where a workflow <em>shouldn't</em> rely on Claude is as valuable as identifying where it should — and it's what makes people believe you the rest of the time.</p>`,
            interactive: {
              type: "scenario",
              title: "The VP wants a number",
              setup: "You've mapped the contract process: 9-day average turnaround, of which ~7 days is queueing and ~90 minutes is actual review. You think Claude-based risk triage could route the routine 60% around the queue. In the steering meeting, the VP asks: \"So how much faster does this make us?\" Everyone's looking at you. What do you say?",
              choices: [
                {
                  text: "\"We're targeting a 90% reduction — Claude can review contracts almost instantly.\"",
                  outcome: "bad",
                  feedback: "You've promised a number your own analysis doesn't support, and misdescribed the solution while you were at it — Claude isn't reviewing anything in your design, it's triaging. Legal will hear that you think software can replace their judgment and become an opponent by lunch. When the real number lands at 60%, nobody will remember it was a good result; they'll remember you were wrong."
                },
                {
                  text: "\"Hard to say until we pilot it — there are a lot of variables and I don't want to overpromise.\"",
                  outcome: "bad",
                  feedback: "Honest, and useless. You did the analysis; you have a defensible estimate. Refusing to give a number when you have one doesn't read as rigor — it reads as not having done the work, and the VP will go find someone happy to make one up. Caution isn't the same as credibility."
                },
                {
                  text: "\"Target is 9 days to 3. Most of our delay is queueing, not reviewing — so we'd use Claude to triage by risk and let the routine 60% skip the queue. Every contract still gets human sign-off, and Legal owns the triage rules.\"",
                  outcome: "good",
                  feedback: "This is the pitch that's still standing in month four. A specific number grounded in a real measurement, the mechanism stated plainly, the limitation named before a skeptic can name it, and Legal given ownership instead of a threat. The limitations are what make the number believable — they show you understand the process well enough that your estimate might actually be right."
                },
                {
                  text: "\"Somewhere between 30% and 90% depending on how it goes — I can get you a range after the pilot.\"",
                  outcome: "bad",
                  feedback: "A range that wide is a way of saying nothing while appearing quantitative, and it quietly abandons the most valuable thing you have: the finding that the bottleneck is queueing, not reviewing. That insight is what makes this project worth doing. Leading with a hedge buries it."
                }
              ]
            }
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
          },
          {
            type: "single",
            question: "An analysis finds that a 9-day contract turnaround consists of 7 days of queueing and about 90 minutes of actual review. A vendor proposes an AI that cuts review time by 80%. What's the most accurate assessment?",
            options: [
              "Excellent — an 80% cut to the core task will transform the process.",
              "It would barely move the turnaround, because review isn't the bottleneck — the queue is. Addressing the queue (e.g., triaging routine contracts around it) is where the real gain is.",
              "The analysis must be wrong; review is always the bottleneck in legal processes.",
              "Nothing can be done until the whole process is rebuilt from scratch."
            ],
            correct: [1],
            explanation: "Cutting 90 minutes to 18 improves a 9-day turnaround by roughly 1% — impressive-looking work aimed at the wrong constraint. This is why measuring the process precedes designing the solution: the bottleneck is often not the step everyone assumes it is."
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
          explanation: "Augmenting the highest-friction step first is lower-risk and faster to validate than a full redesign, and proves out the approach before committing to larger change-management cost. A full redesign (A, D) asks people to change how they work on the strength of a hypothesis rather than evidence."
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
          explanation: "Overselling capability without naming limitations creates rework and erodes trust once reality doesn't match the pitch. Naming both builds credibility and sets accurate expectations — and vagueness (C) isn't a safe middle ground, it just reads as not having done the analysis."
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
          explanation: "Solution design starts from a clear picture of the current process, its actual breakdown points, and a measurable definition of 'better' — not from maximizing automation for its own sake. Without a measurable target, you can't tell afterwards whether it worked."
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
          explanation: "Augmentation improves one step while leaving the surrounding process intact. Rebuilding the whole chain or removing review entirely goes beyond augmentation into a structural redesign — a bigger, higher-risk change that (D) additionally makes on unrelated evidence."
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
          explanation: "This mirrors the output-evaluation principle: claims with real compliance consequences need human/expert review. An honest answer names both the real acceleration benefit and the real limitation, rather than overselling full replacement — and (C) is factually wrong, since fabricated citations are a known failure mode."
        },
        {
          type: "single",
          question: "A first augmentation succeeds: drafting time drops 60%. A colleague immediately proposes removing the human review step entirely. What's the flaw in that reasoning?",
          options: [
            "No flaw — a successful pilot justifies expanding automation.",
            "\"Drafting got faster\" and \"review was unnecessary\" are different claims; nothing in the pilot's evidence supports the second one.",
            "The pilot should have been run on a higher model tier first.",
            "Review can be removed, but only after six months."
          ],
          correct: [1],
          explanation: "This is the enthusiasm trap: a successful augmentation generates momentum that proposes redesigns the evidence doesn't support. Speed of drafting says nothing about whether review catches things — that would need its own evidence. The arbitrary waiting period (D) misses the point entirely: it's about evidence, not elapsed time."
        },
        {
          type: "single",
          question: "Which question best tests whether a step is a good candidate for Claude augmentation?",
          options: [
            "\"Can Claude technically produce output for this step?\"",
            "\"If Claude does this step, what does the human actually do — apply real judgment, or rubber-stamp something they have no way to check?\"",
            "\"Is this step the most expensive one in the process?\"",
            "\"Would automating this step impress leadership?\""
          ],
          correct: [1],
          explanation: "Claude can produce output for almost any language-shaped step, so (A) doesn't discriminate. The useful test is what remains for the human: genuine review is augmentation, while a rubber-stamp means you've removed a control and left a signature block — worse than no automation, because the process now looks reviewed."
        },
        {
          type: "single",
          question: "An associate asks Claude to analyze her team's intake process and gets back a well-structured analysis identifying three bottlenecks. What's the appropriate way to treat this output?",
          options: [
            "As evidence — it's a structured analysis, so the bottlenecks are established.",
            "As a hypothesis to verify against the real process, since Claude reasoned over her description, not the actual process it has never seen.",
            "As irrelevant — Claude can't help with process analysis.",
            "As final, provided she used a high-capability model tier."
          ],
          correct: [1],
          explanation: "Claude reasons over your description of the process. If the description is wrong — and the reason you're doing the analysis is that you don't yet know — the output will be coherent, confident, and about a process that doesn't exist. It's genuinely useful for structuring thinking and generating candidates (so C is too dismissive), but it isn't measurement."
        },
        {
          type: "multi",
          question: "Which two uses apply Claude to the design work rather than just the execution? (Select 2)",
          options: [
            "\"Here's my proposed process change. What breaks at 10x volume, and what assumptions am I making that I haven't stated?\"",
            "\"Draft the announcement email for the new process.\"",
            "\"It's six months later and this rollout failed. Write the retro.\"",
            "\"Reformat this process document into a table.\""
          ],
          correct: [0, 2],
          explanation: "Stress-testing a plan and running a pre-mortem both use Claude to improve the design before anything is built — surfacing objections and risks while there's still time to address them. Drafting the announcement and reformatting a document (B, D) are execution on a design that's already settled."
        },
        {
          type: "single",
          question: "Why is \"give me four ways to solve this, including one that doesn't use AI at all\" a useful prompt during solution design?",
          options: [
            "It's not — the goal is to find an AI solution.",
            "It's a cheap guard against building an AI solution to a problem that has a simpler fix, like a scheduling or staffing change.",
            "It reduces the cost of the request.",
            "It forces Claude to use a lower model tier."
          ],
          correct: [1],
          explanation: "The failure mode this protects against is real and common: someone builds an impressive AI system to address a queueing problem that a rota change would have solved. Explicitly requesting a non-AI option keeps the alternative visible instead of quietly assumed away."
        },
        {
          type: "single",
          question: "A VP asks for an expected improvement number. You've measured the process and have a defensible estimate. What's the best response?",
          options: [
            "Give the grounded number with the mechanism and the limitation: \"9 days to 3 via risk triage; every contract still gets human sign-off.\"",
            "Decline to estimate until after a pilot, to avoid overpromising.",
            "Give the most optimistic number that's technically possible, to secure funding.",
            "Give a range so wide it can't be wrong."
          ],
          correct: [0],
          explanation: "You did the analysis; withholding the number (B) reads as not having done the work, not as rigor — and someone less careful will supply one instead. An optimistic number (C) sets up the month-four credibility collapse, and an uninformative range (D) buries the real finding while appearing quantitative."
        },
        {
          type: "single",
          question: "Why does naming a workflow's limitations in a stakeholder pitch tend to make it more persuasive rather than less?",
          options: [
            "It doesn't — limitations always weaken a pitch.",
            "It signals you understand the process well enough that your numbers might be real, and it names the failure mode before a skeptic does.",
            "Stakeholders don't listen to limitations anyway.",
            "It shifts responsibility for failure onto the audience."
          ],
          correct: [1],
          explanation: "A pitch with no limitations is indistinguishable from a pitch by someone who hasn't looked closely. Naming them establishes that you have, which is what makes the benefit claim credible — and it preempts the objection instead of getting ambushed by it."
        },
        {
          type: "single",
          question: "A three-day research cycle for competitive briefs means sales often has the call before the brief arrives. Claude could produce a solid draft brief in minutes. What kind of change is \"generate briefs on demand before each call\"?",
          options: [
            "Augmentation — one step got faster.",
            "A redesign — collapsing the time cost enables a fundamentally different cadence, changing the process's shape rather than just its speed.",
            "Neither; it's a tooling change with no process impact.",
            "An inappropriate use case."
          ],
          correct: [1],
          explanation: "When removing a constraint makes a different operating model possible — on-demand briefs rather than a slow artifact that arrives too late — the process itself changes shape. That's the augment/redesign line: augmentation makes the existing step better, redesign makes a different process viable."
        },
        {
          type: "single",
          question: "What is the strongest argument for augmenting before redesigning, even when a redesign looks like the better answer?",
          options: [
            "Redesigns never work.",
            "Redesign asks people to change how they work, and that ask should be backed by evidence — augmentation is cheap, reversible, and teaches you about the process.",
            "Augmentation always produces bigger gains.",
            "Redesign requires developer involvement, which is prohibited for Associates."
          ],
          correct: [1],
          explanation: "The sequencing argument is about evidence and reversibility, not about redesign being wrong — sometimes redesign is clearly the right answer. But augmentation costs little, can be undone, and surfaces things about the process you didn't know. Augmentation doesn't produce bigger gains (C); it produces safer information."
        },
        {
          type: "multi",
          question: "Which two steps are poor candidates for Claude, regardless of how well it could generate the text? (Select 2)",
          options: [
            "Summarizing a 40-page vendor proposal into a one-page brief.",
            "Signing off that a regulatory filing is accurate and complete.",
            "Extracting action items from meeting notes into a tracker.",
            "Making the final decision to terminate an employee."
          ],
          correct: [1, 3],
          explanation: "Both losers require accountability rather than production — the hard part was never generating text, it's that someone must stand behind the outcome, and that can't be delegated to a system that can't be held responsible. Summarizing and extraction (A, C) are language-shaped work a human can check faster than they could do it — the hallmark of good augmentation candidates."
        },
        {
          type: "single",
          question: "An AI initiative is pitched as \"eliminating the legal review bottleneck\" with a promised 90% turnaround reduction. Four months later it's shelved despite working roughly as designed. What's the most likely cause?",
          options: [
            "The technology underperformed.",
            "The pitch oversold: it promised a number the analysis didn't support and framed the work as replacing reviewers, so Legal became an opponent and the first visible miss destroyed the remaining credibility.",
            "The team used the wrong model tier.",
            "Four months is simply too short for any AI initiative."
          ],
          correct: [1],
          explanation: "Note the premise — it worked as designed. The failure was in expectation-setting, not engineering: an unsupported number, a framing that threatened the people whose cooperation the project needed, and no named limitation to absorb the first mistake. This is why overselling is the most reliable way to kill an initiative."
        }
      ],
      flashcards: [
        { front: "What should you establish before designing any Claude-assisted workflow fix?", back: "The specific current bottleneck and a measurable definition of what 'better' looks like — from requirements analysis, not assumption." },
        { front: "What's the classic mis-targeting trap in workflow analysis?", back: "Optimizing the step everyone assumes is slow rather than the one that actually is — e.g. cutting 90-minute review time in a 9-day process where 7 days is queueing." },
        { front: "What trait do good Claude augmentation candidates share?", back: "A human can check the output faster than they could produce it — summarizing, drafting, extracting, classifying, comparing." },
        { front: "What kind of step is a poor fit for Claude regardless of its capability?", back: "One requiring accountability rather than production — sign-offs, terminations, approvals. Generating the text was never the hard part." },
        { front: "What's the better question than \"can Claude do this step?\"", back: "\"If Claude does this step, what does the human do?\" Real judgment = augmentation. Rubber-stamp = you removed a control and left a signature block." },
        { front: "Distinguish 'augmenting' a workflow from 'redesigning' it.", back: "Augmenting: Claude does one step better/faster, rest of process unchanged (lower risk, reversible). Redesigning: the process changes shape because AI removed a constraint it was built around." },
        { front: "What's the recommended sequencing between augmenting and redesigning?", back: "Augment the highest-friction step first and prove it out — redesign asks people to change how they work, and that ask should be backed by evidence." },
        { front: "What's the \"enthusiasm trap\" after a successful augmentation?", back: "Momentum proposes redesigns the evidence doesn't support — \"drafting got 60% faster\" is not evidence that \"review was unnecessary.\" Different claims." },
        { front: "Name two ways to use Claude for solution design rather than execution.", back: "Stress-test the plan (\"what breaks at 10x? what assumptions haven't I stated?\") and run a pre-mortem (\"it's six months later and this failed — write the retro\")." },
        { front: "Why treat Claude's analysis of your process as a hypothesis, not evidence?", back: "It reasons over your description, not the real process it's never seen. If the description is wrong, the analysis is coherent, confident, and about a process that doesn't exist." },
        { front: "What makes a stakeholder pitch about AI credible?", back: "Naming a concrete, specific benefit AND a concrete limitation in the same breath — the limitations are what make the number believable." },
        { front: "What's the risk of overselling Claude's capability to stakeholders?", back: "It kills the initiative around month four, when the gap between pitch and experience becomes undeniable — and it can turn the people whose cooperation you need into opponents." },
        { front: "Why is identifying where Claude should NOT be used also valuable?", back: "It protects workflows needing expert judgment from premature automation — and it's what makes people believe you the rest of the time." }
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
            body: `<p>A Project has two configuration layers, and confusing them is the most common setup mistake:</p><ul><li><strong>Instructions</strong> — standing guidance applied to every conversation in the Project. Tone, format defaults, things to always or never do. This shapes <em>how</em> Claude behaves.</li><li><strong>Knowledge sources</strong> — documents and connectors Claude can reference: style guides, product specs, live data via connectors like Google Drive or Gmail. This shapes <em>what</em> Claude knows.</li></ul><p>The test is a sentence. If it's a <strong>rule</strong> ("never quote a delivery date"), it's an instruction. If it's a <strong>fact</strong> ("the Enterprise tier costs $12/seat"), it's knowledge. Rules go in instructions; facts go in documents.</p><p>This matters more than it sounds. A comms lead pastes her entire 40-page brand guide into the instructions field, reasoning that instructions are "more important" so Claude will follow them more closely. What she's actually done is fill the standing guidance with 40 pages of reference material that applies to every conversation whether it's relevant or not — while the three rules that genuinely should apply every time ("never use the old product name," "always sentence case in headers," "never promise a ship date") are buried on page 27 alongside the history of the logo.</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ Everything in instructions</span><p>40 pages of brand guide pasted into the instructions field, containing rules, examples, history, and reference tables all mixed together.</p><p>The rules that matter are indistinguishable from the reference material that surrounds them, and all of it is applied to every conversation regardless of relevance.</p></div><div class="compare-col good"><span class="cc-label">✓ Split by rule vs. fact</span><p><strong>Instructions:</strong> the handful of always/never rules. "Sentence case in headers. Never use 'ProductX' — it's 'Product One' since the rebrand. Never state a ship date; say timing is confirmed by the PM."</p><p><strong>Knowledge:</strong> the brand guide document, referenced when relevant.</p></div></div><div class="callout"><span class="callout-label">Note</span>The surfaces compose. Instructions can point at knowledge — "follow the tone section of the brand guide" is a rule that references a fact source, and that's exactly the right shape. What doesn't work is treating instructions as a place to store documents.</div>`,
            interactive: {
              type: "classify",
              title: "Instruction or knowledge source?",
              instructions: "You're configuring a Project for a customer-success team. For each item, decide where it belongs.",
              items: [
                {
                  text: "\"Never state a firm delivery date — say that timing needs confirmation from the PM.\"",
                  answer: "instruction",
                  options: [["instruction", "📋 Instruction"], ["knowledge", "📚 Knowledge source"]],
                  why: "A rule about behavior that should apply to every conversation in the Project. Rules go in instructions."
                },
                {
                  text: "The 40-page product specification document.",
                  answer: "knowledge",
                  options: [["instruction", "📋 Instruction"], ["knowledge", "📚 Knowledge source"]],
                  why: "Reference material Claude should consult when relevant — facts, not rules. Pasting it into instructions applies 40 pages of reference to every conversation whether or not it's needed."
                },
                {
                  text: "\"Write in second person, active voice, under 150 words unless asked for more.\"",
                  answer: "instruction",
                  options: [["instruction", "📋 Instruction"], ["knowledge", "📚 Knowledge source"]],
                  why: "Standing behavioral guidance about how every response should be shaped. Classic instruction."
                },
                {
                  text: "The current pricing table for all four subscription tiers.",
                  answer: "knowledge",
                  options: [["instruction", "📋 Instruction"], ["knowledge", "📚 Knowledge source"]],
                  why: "Facts Claude needs to reference. It also changes periodically — which is another reason it belongs in a maintainable knowledge source rather than baked into instructions."
                },
                {
                  text: "\"If the customer's question involves a contract term, don't answer — route it to Legal.\"",
                  answer: "instruction",
                  options: [["instruction", "📋 Instruction"], ["knowledge", "📚 Knowledge source"]],
                  why: "An escalation rule governing behavior in a specific situation. It's a rule, so it's an instruction — and it's the kind that should apply every single time."
                },
                {
                  text: "Last quarter's customer-satisfaction survey results.",
                  answer: "knowledge",
                  options: [["instruction", "📋 Instruction"], ["knowledge", "📚 Knowledge source"]],
                  why: "Reference data to draw on when relevant. Note the maintenance implication: \"last quarter's\" results become stale, and a Project that still cites them next year will do so confidently."
                }
              ]
            }
          },
          {
            heading: "Writing instructions Claude can actually follow",
            body: `<p>Good instructions are <strong>specific, behavioral, and checkable</strong>. The test: could someone else read this instruction and tell, by looking at an output, whether it was followed? If not, Claude can't reliably follow it either — and you can't debug it when output drifts.</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ Aspirational</span><p>"Be professional and helpful."</p><p>"Sound like our brand."</p><p>"Use good judgment on sensitive topics."</p><p>Nobody can look at an output and say definitively whether these were followed — including you, which means you can't fix anything when it goes wrong.</p></div><div class="compare-col good"><span class="cc-label">✓ Behavioral and checkable</span><p>"Write in second person, active voice, under 150 words per response unless asked for more."</p><p>"Never state a firm delivery date — say timing needs PM confirmation."</p><p>"If a question involves contract terms or refunds over $500, don't answer — say it's going to Legal and stop."</p><p>Each one is a pass/fail you can check at a glance.</p></div></div><p>Three patterns worth stealing:</p><ul><li><strong>Convert vague values into named behaviors.</strong> "Be professional" means something to you — probably a few specific things. Write those down instead. What would a person do differently if they were being professional? That's the instruction.</li><li><strong>Say what to do, not just what to avoid.</strong> "Don't promise dates" leaves Claude to invent an alternative. "Don't promise dates — say timing is confirmed by the PM" gives it one, and now every response handles it the same way.</li><li><strong>Put the escalation rules in.</strong> The most valuable instruction in most business Projects is the one that says when <em>not</em> to answer. It's also the one people forget.</li></ul><div class="callout warn"><span class="callout-label">Watch out</span>More instructions are not better instructions. A Project with forty rules has, in practice, no rules — the important ones are diluted among the trivial ones, and nobody on the team can tell you what the Project is supposed to do without opening the config. If a rule wouldn't change an output, it's decoration. Cut it.</div>`
          },
          {
            heading: "Knowledge sources and connectors: scope deliberately",
            body: `<p>Connectors — Google Drive, Gmail, and the like — let a Project reference live organizational data instead of documents someone remembered to upload. That's genuinely powerful and it's where the configuration job gets real, because you're now making a decision about data access.</p><p>The principle: <strong>connect what the work needs, not everything you have permission to connect.</strong> Broad access is the convenient default and it's the wrong one — every additional source is more material Claude might pull from, more surface for something sensitive to surface in an unexpected place, and more that someone has to reason about later when the Project is shared with a new team member.</p><p>The concrete case: a customer-success lead builds a Project to help draft responses. She connects her Gmail, which is convenient — everything's there. It's also her whole inbox: the compensation discussion with her manager, the vendor negotiation under NDA, the HR thread about a colleague. None of that is relevant to drafting customer responses, all of it is now in scope, and when she adds two teammates to the Project she has to think very carefully about what she just did.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Giving someone the keys to your office. You give them a key to the supply closet because they need supplies. You don't give them the master key because it's fewer keys to carry — even if you trust them completely, and even if the master key is genuinely more convenient. Scope isn't about trust; it's about not creating an exposure you'd have to think about every time something changes.</div><p>This connects straight to Domain 6: data sensitivity isn't only about what you paste into a chat. A broadly-scoped connector is an ongoing standing decision to share, made once and then forgotten about — which is precisely the kind of thing an AI usage policy exists to govern.</p>`,
            interactive: {
              type: "scenario",
              title: "The convenient connector",
              setup: "You're building a Project to help your customer-success team draft responses using your product docs and past ticket history. Your work Gmail contains the past ticket threads — along with everything else in your inbox: a compensation discussion with your manager, a vendor negotiation under NDA, and an HR thread about a colleague. Two teammates will be added to this Project next week. How do you configure it?",
              choices: [
                {
                  text: "Connect the full Gmail account — the ticket history is all in there, and Claude will only use what's relevant to each question.",
                  outcome: "bad",
                  feedback: "\"It'll only use what's relevant\" is doing enormous load-bearing work in that sentence, and it isn't a control — it's a hope. You've scoped a compensation discussion, an NDA'd negotiation, and an HR thread into a Project that two teammates get access to next week. The convenience is real and the exposure is real, and only one of them is going to come up in an incident review."
                },
                {
                  text: "Export the relevant ticket threads to a folder, connect only that folder plus the product docs, and leave the inbox out.",
                  outcome: "good",
                  feedback: "Right — connect what the work needs, not everything you have permission to connect. The Project gets exactly the ticket history it needs, the sensitive material was never in scope, and adding teammates next week requires no anxious re-think about what they can now reach. Scoping isn't about trusting your teammates; it's about not creating an exposure you have to keep reasoning about."
                },
                {
                  text: "Connect the full Gmail but add an instruction: \"Never reference compensation, HR, or vendor negotiation content.\"",
                  outcome: "bad",
                  feedback: "This is the same error as Domain 6's \"upload it but tell Claude not to retain it\" — you're using an instruction where you need a control. The sensitive data is in scope; you've just asked nicely that it not come up. It also fails the practical test: your teammates now have a Project connected to your inbox, and the only thing standing between them and your compensation thread is a sentence in a config field."
                },
                {
                  text: "Don't use connectors at all — paste the relevant ticket threads into each conversation manually.",
                  outcome: "bad",
                  feedback: "Safe, and it throws away the point. You've turned a configured Project back into manual re-pasting — the exact friction Projects exist to remove, and it'll drift as people paste different things. Avoiding connectors entirely is an overcorrection; scoping one narrowly gets you the benefit without the exposure."
                }
              ]
            }
          },
          {
            heading: "Configuration is a maintenance job",
            body: `<p>The failure mode this objective is really about: a Project configured once, in a burst of enthusiasm, and never revisited. It works beautifully for a quarter. Then it works confidently and wrongly, forever, until someone notices.</p><p>Because nothing announces it. The pricing sheet you uploaded in March was accurate in March. In September it's wrong, and the Project doesn't know that — it will cite the old numbers with exactly the same assurance it cited the right ones with in the spring. No error, no warning, no visible difference. The Project isn't broken; it's faithfully reporting what you told it, which stopped being true in June.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>The out-of-date org chart pinned by the printer. It was correct when someone printed it. Nobody made a decision to keep an inaccurate chart on the wall — it just aged, silently, while everyone walked past it. A new hire uses it to work out who to ask about payroll and gets sent to someone who left in April. Nothing failed. Nobody was negligent. The information simply stopped being true and there was no mechanism that noticed.</div><p>Maintenance is unglamorous and it's the job:</p><ul><li><strong>Review what's connected</strong> on a schedule you actually keep. Quarterly beats "when I remember."</li><li><strong>Remove sources that are no longer authoritative.</strong> A superseded policy still in knowledge is worse than no policy — it produces confident answers from a document nobody would deliberately hand out.</li><li><strong>Update instructions when the underlying process changes.</strong> A reorg that changes the escalation path makes your escalation rule wrong, and the rule will keep applying.</li><li><strong>Prefer a live connector to a static upload</strong> for anything that changes regularly — a connected doc reflects edits; an uploaded copy is a snapshot of a moment.</li></ul><p>The tell that a Project needs attention is usually indirect: someone says "Claude keeps saying X, but we changed that months ago." That's not a Claude problem. That's a configuration that's telling the truth about a world that moved on.</p>`
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
            explanation: "Instructions shape how Claude behaves across every conversation in the Project — tone rules and behavioral constraints like 'never promise a date' are exactly what belongs there, rather than being re-specified per prompt. The test: it's a rule, not a fact."
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
            explanation: "Uploaded knowledge sources go stale if not actively maintained; a Project isn't set-and-forget. Nothing announces the staleness — the Project cites old numbers with the same confidence it cited correct ones, which is what makes periodic review necessary."
          },
          {
            type: "single",
            question: "A team member says: \"Claude keeps telling customers our escalation path goes through the regional lead, but we changed that in the reorg two months ago.\" What does this indicate?",
            options: [
              "Claude is malfunctioning and should be reported.",
              "The Project's configuration needs maintenance — an instruction or knowledge source still reflects the pre-reorg process and will keep applying until someone updates it.",
              "The team should stop using Claude for escalation questions.",
              "A higher model tier would have caught the change."
            ],
            correct: [1],
            explanation: "This is the signature symptom of unmaintained configuration: Claude is faithfully applying a rule that was correct when written and has since become wrong. Nothing is malfunctioning (A) — the config is telling the truth about a world that moved on, and no model tier (D) can know about a reorg nobody told it about."
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
          explanation: "Specific, behavioral, checkable instructions (voice, length limit, an explicit prohibition) are easier to follow consistently and easier to debug than vague aspirational language. The test: could someone look at an output and tell whether the instruction was followed?"
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
          explanation: "Instructions are standing behavioral guidance (tone, format, do's/don'ts). Knowledge sources are the documents/connectors Claude can reference for factual content. The quick test: rules go in instructions, facts go in knowledge."
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
          explanation: "When a connector exposes sensitive data, deliberate, minimal scoping is the responsible default — this connects to the governance/data-sensitivity judgment tested elsewhere on the exam. Avoiding connectors entirely (C) is an overcorrection that throws away the benefit, and (D) isn't a control at all."
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
          explanation: "Uploaded documents and connected sources don't automatically stay current. Without periodic review, a Project will keep confidently referencing outdated material as if it were still accurate — with no error and no warning to signal it."
        },
        {
          type: "single",
          question: "A comms lead pastes her entire 40-page brand guide into a Project's instructions field, reasoning that instructions carry more weight than knowledge sources. What's wrong with this?",
          options: [
            "Nothing — important material belongs in instructions.",
            "It mixes reference material into standing guidance: 40 pages now apply to every conversation regardless of relevance, and the few rules that should always apply are buried among examples and history.",
            "Instructions have a strict page limit that this exceeds.",
            "Brand guides can't be used with Claude at all."
          ],
          correct: [1],
          explanation: "Rules belong in instructions; facts and reference material belong in knowledge sources. The right split here is a handful of always/never rules in instructions, with the guide itself as a knowledge source the instructions can point to. (C) invents a limit that isn't the actual problem."
        },
        {
          type: "single",
          question: "Which is the most valuable — and most commonly forgotten — instruction in a typical business Project?",
          options: [
            "An instruction specifying the preferred font.",
            "An escalation rule stating when Claude should not answer and where the question should go instead.",
            "An instruction telling Claude to be accurate.",
            "An instruction listing the company's founding date."
          ],
          correct: [1],
          explanation: "The rule that governs when NOT to answer — routing contract questions to Legal, for example — is where a Project's guardrails actually live, and it's the one people leave out. \"Be accurate\" (C) isn't checkable or actionable, and (D) is a fact, so it belongs in knowledge, not instructions."
        },
        {
          type: "single",
          question: "Why is \"Don't promise delivery dates\" weaker than \"Don't promise delivery dates — say timing needs PM confirmation\"?",
          options: [
            "It isn't weaker; both prohibit the same thing.",
            "A prohibition alone leaves Claude to invent its own alternative, so responses vary; supplying the replacement behavior makes every response handle the situation the same way.",
            "Negative instructions are always ignored.",
            "The second version is shorter."
          ],
          correct: [1],
          explanation: "Saying what to do, not just what to avoid, removes the guesswork about what fills the gap — and consistency across responses is usually the actual goal. Negative instructions aren't ignored (C); they're just incomplete on their own."
        },
        {
          type: "multi",
          question: "Which two items belong in a Project's knowledge sources rather than its instructions? (Select 2)",
          options: [
            "The current pricing table for all subscription tiers.",
            "\"Write in second person, active voice, under 150 words.\"",
            "The 40-page product specification document.",
            "\"If a question involves contract terms, route it to Legal instead of answering.\""
          ],
          correct: [0, 2],
          explanation: "Both winners are facts — reference material Claude consults when relevant. The other two are rules governing behavior on every conversation, which is what instructions are for. Rules vs. facts is the whole test."
        },
        {
          type: "single",
          question: "A Project has forty separate instructions covering everything from tone to font preferences to obscure edge cases. What's the likely problem?",
          options: [
            "Nothing — more instructions mean more control.",
            "In practice it has no rules: the important ones are diluted among trivial ones, and nobody on the team could say what the Project does without opening the config.",
            "Forty instructions will cause an error.",
            "The instructions need to be alphabetized."
          ],
          correct: [1],
          explanation: "Instruction bloat dilutes the rules that matter. The useful filter: if a rule wouldn't change an output, it's decoration — cut it. More instructions mean less control, not more (A), because the signal gets lost in the noise."
        },
        {
          type: "single",
          question: "For a document that changes regularly — a pricing sheet updated most months — what's the better configuration choice?",
          options: [
            "A static upload, so the Project's answers stay stable.",
            "A live connector to the source document, so the Project reflects edits rather than a snapshot of the day it was uploaded.",
            "Paste the pricing into the instructions field instead.",
            "Neither — pricing shouldn't be in a Project."
          ],
          correct: [1],
          explanation: "An uploaded copy freezes the moment it was added and then silently ages; a connected source reflects the current document. Stability (A) is the wrong goal when the underlying facts genuinely change — that's just a commitment to being wrong later. And pricing is a fact, so it never belongs in instructions (C)."
        },
        {
          type: "single",
          question: "Why does adding \"never reference compensation or HR content\" to the instructions fail to make a broadly-connected inbox safe?",
          options: [
            "It doesn't fail — an explicit instruction is an adequate control.",
            "It substitutes an instruction for a scoping control: the sensitive data is still in scope, and anyone added to the Project can reach it — you've only asked that it not come up.",
            "Instructions can't mention HR topics.",
            "It works, but only for single-user Projects."
          ],
          correct: [1],
          explanation: "This is the same error as \"upload it but tell Claude not to retain it\" from Domain 6 — an instruction where a control is needed. Scoping the connector to just the relevant folder means the sensitive material was never reachable in the first place, which is what actually addresses the risk."
        }
      ],
      flashcards: [
        { front: "What's the functional difference between Project instructions and knowledge sources?", back: "Instructions shape HOW Claude behaves (tone, format, rules). Knowledge sources shape WHAT it knows (documents, connectors)." },
        { front: "What's the one-sentence test for instructions vs. knowledge?", back: "Is it a rule or a fact? \"Never quote a delivery date\" is a rule → instructions. \"Enterprise costs $12/seat\" is a fact → knowledge." },
        { front: "Give an example of a weak vs. strong system instruction.", back: "Weak: 'Be professional and helpful.' Strong: 'Second person, active voice, under 150 words; never state a firm delivery date.'" },
        { front: "What's the checkability test for an instruction?", back: "Could someone look at an output and tell whether the instruction was followed? If not, Claude can't reliably follow it and you can't debug it when output drifts." },
        { front: "Why say what to do, not just what to avoid?", back: "A bare prohibition leaves Claude to invent its own alternative, so responses vary. \"Don't promise dates — say timing needs PM confirmation\" makes every response handle it identically." },
        { front: "What's the most valuable and most forgotten instruction in a business Project?", back: "The escalation rule — when NOT to answer, and where the question goes instead. That's where a Project's guardrails actually live." },
        { front: "Why are forty instructions worse than five?", back: "In practice it means no rules — the important ones are diluted among trivial ones. If a rule wouldn't change an output, it's decoration. Cut it." },
        { front: "What should you do when a connector exposes sensitive data (e.g., a shared inbox)?", back: "Scope the connection deliberately — export the relevant threads to a folder and connect that. Don't connect the whole inbox and add an instruction not to look." },
        { front: "Is Project configuration a one-time setup task?", back: "No — it needs periodic review: removing stale knowledge sources and updating instructions as the underlying process changes. Quarterly beats 'when I remember.'" },
        { front: "Static upload or live connector for a document that changes monthly?", back: "Live connector — an uploaded copy is a snapshot of the day you added it and then silently ages. A connected source reflects edits." },
        { front: "What's the indirect tell that a Project needs maintenance?", back: "Someone says \"Claude keeps saying X, but we changed that months ago.\" That's not a Claude problem — it's config telling the truth about a world that moved on." }
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
            heading: "\"Can it\" and \"should it\" are different questions",
            body: `<p>This domain exists because capability and appropriateness come apart, and the gap between them is where careers get interesting. Claude can technically screen resumes. It can technically draft a termination letter. It can technically analyze a spreadsheet full of account numbers. None of that tells you whether it should, here, right now, at your organization.</p><p>Three questions separate the two:</p><ul><li><strong>Consequence:</strong> if this output is wrong or skewed, does a real person suffer a real outcome? Hiring, credit, discipline, benefits, medical, legal — these carry a different weight than a first-draft newsletter.</li><li><strong>Policy:</strong> has your organization already decided something about this category of use? Governance isn't your personal risk assessment; it's a decision someone with more context than you already made.</li><li><strong>Data:</strong> is what you're about to paste something that should leave a controlled environment?</li></ul><div class="callout analogy"><span class="callout-label">Think of it like...</span>Having a driver's licence and a fast car. You're capable of doing 90 in a school zone; the car will do it, and you have the skill. Nobody's confused about whether you <em>can</em>. The question was never capability, and if you answer the "should you" question with a demonstration of the "can you" answer, everyone will correctly conclude you've misunderstood something fundamental.</div><p>The framing that helps: the exam is not testing whether you're cautious. Refusing to use AI for anything is not the responsible answer, and it's a wrong answer on this exam — you'll see it as a distractor repeatedly, and it's wrong every time. The responsible answer is almost always <strong>a path that gets the work done within the constraint</strong>. Anonymize the data and run the analysis. Screen the resumes and have a human decide. The person who says "we can't do that" is not more responsible than the person who says "we can do that this way" — they're just less useful, and they get routed around.</p>`
          },
          {
            heading: "Data sensitivity in practice",
            body: `<p>The recurring pattern, and the one Anthropic's own sample question is built on: someone wants Claude to analyze data containing regulated personal information — names, account numbers, health data, salary — and organizational policy restricts sharing it.</p><p>Four options present themselves, and three of them are wrong in instructive ways:</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ The three wrong answers</span><p><strong>"Upload it as-is, the analysis is internal."</strong> Policy doesn't have an internal-use exemption you invented on the spot. Internal is where most breaches start.</p><p><strong>"Upload it but tell Claude not to retain it."</strong> The violation happens at upload. An instruction issued afterwards doesn't reach back in time and un-share the data.</p><p><strong>"Skip the analysis."</strong> The overcorrection. You've protected the data by abandoning work that had a perfectly good compliant path.</p></div><div class="compare-col good"><span class="cc-label">✓ The right answer</span><p><strong>"Remove or anonymize the identifiers first, then analyze."</strong></p><p>The trend analysis never needed names or account numbers — it needed the transaction patterns. Strip the identifiers, run the analysis, get the answer. The policy is satisfied because the protected data never left, and the work gets done.</p></div></div><p>That second wrong answer deserves attention because it's the sophisticated-sounding one, and it's the one people actually reach for. It <em>feels</em> like a control. It has the shape of a control — you did a thing, you addressed the concern, you can describe what you did in a meeting. But <strong>an instruction is not a control.</strong> The data was shared the moment you hit upload; everything after that is a request about what happens to something that's already gone. Compare: mailing a document to the wrong address and then sending a follow-up note asking them not to read it. The note is not a mistake, exactly. It's just not a remedy.</p><div class="callout warn"><span class="callout-label">Watch out</span>The generalization is worth holding onto, because it recurs across this exam: <strong>when a policy requires a control, an instruction to the model doesn't satisfy it.</strong> You saw the same shape in Domain 5 — connecting an entire inbox and adding "never reference HR content" doesn't scope the connector. Both cases substitute a request for a boundary. The fix in both is the same: change what's reachable, don't ask nicely about what's already reachable.</div>`,
            interactive: {
              type: "classify",
              title: "What do you do with this data?",
              instructions: "Your organization's policy restricts sharing regulated personal data with external tools. For each situation, choose the right move.",
              items: [
                {
                  text: "A spreadsheet of customer names and account numbers; you want to analyze spending trends by region.",
                  answer: "anonymize",
                  options: [["ok", "✅ Use as-is"], ["anonymize", "🔒 Anonymize first"], ["stop", "🛑 Don't use Claude"]],
                  why: "The trend analysis never needed the names or account numbers — it needed the amounts and regions. Strip the identifiers and the work proceeds with the policy satisfied. This is the official sample question's exact shape."
                },
                {
                  text: "A public product FAQ page you want reformatted into a quick-reference table.",
                  answer: "ok",
                  options: [["ok", "✅ Use as-is"], ["anonymize", "🔒 Anonymize first"], ["stop", "🛑 Don't use Claude"]],
                  why: "It's already public. There's nothing to protect, and treating public content as sensitive is the overcorrection that makes people stop taking data policy seriously."
                },
                {
                  text: "Employee performance ratings with names attached; you want to summarize themes across the team.",
                  answer: "anonymize",
                  options: [["ok", "✅ Use as-is"], ["anonymize", "🔒 Anonymize first"], ["stop", "🛑 Don't use Claude"]],
                  why: "Thematic summary doesn't need identities — replace names with role codes and the analysis works identically. Note the bonus: anonymizing also reduces the chance of skewed framing attaching to specific people."
                },
                {
                  text: "A patient dataset with diagnoses, where policy explicitly prohibits processing health data in any external tool, anonymized or not.",
                  answer: "stop",
                  options: [["ok", "✅ Use as-is"], ["anonymize", "🔒 Anonymize first"], ["stop", "🛑 Don't use Claude"]],
                  why: "Here the policy forecloses the anonymize path explicitly — it prohibits the data category, not just the identifiers. When policy has already made the decision, your job is to follow it and raise it with the policy owner if you think it's wrong, not to route around it."
                },
                {
                  text: "Your own meeting notes from an internal planning session, containing no personal or regulated data.",
                  answer: "ok",
                  options: [["ok", "✅ Use as-is"], ["anonymize", "🔒 Anonymize first"], ["stop", "🛑 Don't use Claude"]],
                  why: "Ordinary internal work product with nothing regulated in it. The policy is about regulated personal data, not about everything that happens to be internal — and applying it to everything is how policies get ignored."
                },
                {
                  text: "A support ticket export where the ticket text itself contains customers' full names and home addresses.",
                  answer: "anonymize",
                  options: [["ok", "✅ Use as-is"], ["anonymize", "🔒 Anonymize first"], ["stop", "🛑 Don't use Claude"]],
                  why: "The sneaky one — identifiers hiding in a free-text field rather than a tidy 'name' column. The data is regulated wherever it lives, and 'it's in the ticket body, not a column' isn't a distinction the policy makes."
                }
              ]
            }
          },
          {
            heading: "High-stakes decisions about people",
            body: `<p>The other recurring pattern is automation of a consequential decision about a person, and it usually arrives dressed as efficiency. Somebody says: we get 400 applicants per role, screening takes forever, Claude could score them and auto-reject anyone under the bar.</p><p>Everything in that sentence is true except the last clause. The bottleneck is real, the volume is real, and Claude genuinely could produce scores. The problem is the <strong>auto-reject</strong>, and it's worth being precise about why, because "AI shouldn't do hiring" is too blunt to be useful and won't survive contact with a determined VP.</p><ul><li><strong>The consequence is real and lands on a person.</strong> A rejected candidate doesn't get a do-over. This isn't a draft that gets edited before it matters.</li><li><strong>Bias is hard to detect here, by construction.</strong> Domain 2 told you bias only shows up when you compare across cases. Now imagine 400 cases nobody compared, because the whole point was that nobody read them.</li><li><strong>Nobody is accountable.</strong> Ask who's responsible for a wrongly rejected candidate. The system? The person who wrote the prompt? Nobody made the decision — which means nobody can answer for it, and nobody would even know it happened.</li></ul><p>And here's the thing: the compliant version is <em>barely different</em>. Claude summarizes each application against the stated criteria, surfaces the relevant experience, flags gaps — and a human makes every accept/reject call. The recruiter still reviews 400 candidates, but in a fraction of the time, because the reading was done for her. She keeps the decision. Most of the efficiency gain survives; all of the accountability survives.</p><div class="callout warn"><span class="callout-label">Watch out</span>Watch for the fake version of this: a human "reviews" 400 AI-generated scores at ten seconds each, and rubber-stamps them. That's Domain 4's test — <em>if Claude does this step, what does the human actually do?</em> — and the answer here is "provides a signature, not a judgment." A review that can't realistically catch anything isn't a control; it's a control-shaped object, and it's arguably worse than no review at all, because now the process looks reviewed and everyone stops worrying.</div>`,
            interactive: {
              type: "scenario",
              title: "The hiring manager has a great idea",
              setup: "A hiring manager comes to you, genuinely excited: \"We get 400 applicants per role and screening is killing us. Can we have Claude score each resume against the job criteria and auto-reject anything below 6/10? We'd save probably 30 hours per role.\" The pain is real and the volume is real. What do you tell her?",
              choices: [
                {
                  text: "\"Great idea — let's pilot it on the next role and measure the time saved.\"",
                  outcome: "bad",
                  feedback: "You've automated a consequential decision about real people with no human in the loop. Rejected candidates get no do-over, nobody is accountable for a wrong call, and bias here is undetectable by construction — it only shows up when you compare across cases, and the entire premise is that nobody reads them. The pilot will look like a huge success, because you have no mechanism that could ever tell you it wasn't."
                },
                {
                  text: "\"We can't use AI for hiring — it's too high-stakes. You'll have to keep screening manually.\"",
                  outcome: "bad",
                  feedback: "Too blunt, and it's a wrong answer on this exam every time it appears. Her pain is real and there's a perfectly good compliant path you just declined to mention. You've also guaranteed she'll either go around you or find someone who'll say yes without the safeguards — and \"we can't\" is how the responsible person gets routed out of the conversation entirely."
                },
                {
                  text: "\"Let's have Claude summarize each application against the criteria and flag relevant experience and gaps — but you make every accept/reject call. You still see all 400, just much faster.\"",
                  outcome: "good",
                  feedback: "This is the move. The 30 hours were mostly reading, not deciding — so you keep almost all the efficiency and give up none of the accountability. She reviews every candidate with the reading already done; the decision stays with a person who can answer for it. Notice the shape: the responsible answer wasn't \"no,\" it was \"yes, this way.\""
                },
                {
                  text: "\"Let Claude score and auto-reject, but you spot-check a random 10% of the rejections afterwards.\"",
                  outcome: "bad",
                  feedback: "Tempting, and it's a control-shaped object rather than a control. Ninety percent of rejected candidates were still auto-rejected with nobody accountable, and a 10% sample of a bias pattern is unlikely to reveal it — you'd need to compare across cases to see it, which spot-checking individual rejections specifically doesn't do. It produces the reassuring feeling of oversight and very little of the substance."
                }
              ]
            }
          },
          {
            heading: "Policy isn't your personal risk assessment",
            body: `<p>Governance is concrete: it's the actual AI usage policy your organization adopted. What data can go in, which use cases are pre-approved, what needs sign-off, who owns the decision. Following it is part of the job, not an optional best practice for the cautious.</p><p>The distinction that trips people up: <strong>your judgment that something is low-risk is not a substitute for a policy decision.</strong> You might be right! The policy might be overcautious. That's a conversation to have with the policy owner, not a permission you can grant yourself — because the policy exists precisely so that this decision isn't made ad hoc by whoever happens to be at the keyboard, with only their slice of the context.</p><p>Which leads to the case the exam likes: <strong>a use case the policy doesn't clearly cover.</strong> Your policy pre-approves some things and requires sign-off for others, and your situation is neither. The tempting reading is "not explicitly forbidden, therefore allowed." It's tempting because it's how we treat most rules in life, and because the alternative feels like asking permission to do your job.</p><p>But silence in a policy is not approval. It usually means one of two things: nobody thought of this case yet, or it sits at a boundary that someone deliberately left unresolved. Either way, the ambiguity itself is the signal — check with whoever owns the policy. Practically, this costs you an email and buys you the thing you actually want, which is not "permission" but <em>someone else's name on the decision</em>. If it's fine, you have a documented "it's fine" and a policy that's now slightly clearer. If it isn't fine, you found out for the price of an email rather than an incident review.</p><div class="callout"><span class="callout-label">Note</span>Notice the asymmetry the exam is testing. Checking costs you a day and a small hit to your sense of autonomy. Not checking, when it turns out to matter, costs a policy violation you personally own — and the reason you'll give ("it wasn't explicitly forbidden") is precisely the reasoning nobody accepts afterwards. The expected values here are not close.</div>`
          },
          {
            heading: "Ethics: bias, transparency, and who's accountable",
            body: `<p>Three themes recur, and none of them are abstract.</p><p><strong>Don't let AI-assisted output launder bias.</strong> The word matters. AI doesn't just risk producing bias — it risks making bias look objective. A hiring manager's gut feeling is visibly a gut feeling and can be challenged in the room. The same judgment expressed as "the system scored this candidate 4/10" arrives wearing a lab coat, and people argue with it far less. It's the same bias with better PR, and the numeric score is doing rhetorical work the underlying analysis doesn't support.</p><p><strong>Be transparent where it matters to the audience.</strong> Not a confession on every email — nobody needs a disclosure that Claude helped format your meeting notes. The test is whether the reader's judgment would change if they knew: a candidate whose application was AI-screened, a client receiving analysis they think reflects your firm's expert opinion, an audience being persuaded by something they believe a person reasoned through. If knowing would change how they weigh it, they should know.</p><p><strong>A human is accountable for what ships.</strong> "The AI wrote it" has never once worked as a defense and never will. If your name is on the output, the output is yours — its errors, its omissions, its skew. This isn't a rule anyone imposed on AI use; it's just how professional accountability has always worked, and AI didn't get a carve-out.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Signing a document your assistant drafted. Nobody imagines "my assistant wrote that paragraph" is a defense — you signed it, so it's yours, and everyone understood that long before AI existed. The interesting thing is that no new ethical principle is needed here at all. The rules didn't change. It's just that AI makes it much easier to produce a great deal of confident, polished material you haven't actually thought about, and to sign it without noticing you didn't.</div><p>Which is the through-line for this whole domain, and honestly for the whole exam: <strong>the technology changed what's easy, not what you're responsible for.</strong></p>`
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
            explanation: "Fully automating a consequential decision about real people, with no human review, is a textbook inappropriate-use pattern — the stakes and the bias risk both argue for human-in-the-loop review, not full automation. Note that the compliant version keeps most of the efficiency: Claude summarizes and flags, a human decides."
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
          },
          {
            type: "single",
            question: "Why is \"the AI wrote it\" not a viable defense when a Claude-assisted report turns out to contain a damaging error?",
            options: [
              "It is viable, provided you disclose that AI was used.",
              "Accountability for what ships stays with the human whose name is on it — AI didn't create an exception to how professional responsibility has always worked.",
              "It's viable only for internal documents.",
              "It's viable if you used the highest model tier available."
            ],
            correct: [1],
            explanation: "This is the same principle as signing a document your assistant drafted: you signed it, so it's yours — errors, omissions, and all. Disclosure (A) is a separate obligation and doesn't transfer responsibility, and neither stakes (C) nor model tier (D) change who answers for the output."
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
          explanation: "High-stakes decisions about real people (discipline, hiring, credit) require human review — full automation of a consequential, person-affecting decision is the clearest inappropriate-use pattern tested on this domain. The other three carry no consequence to a person that a wrong output could cause."
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
          explanation: "Following organizational governance means resolving ambiguous cases with the policy owner rather than defaulting to 'not explicitly forbidden, so allowed' — silence in a policy usually means nobody considered the case yet, not that it's approved. Checking costs an email; not checking costs a violation you personally own."
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
          explanation: "Transparency about AI use and maintaining human accountability are core responsible-use practices. Treating AI as a substitute for accountability, or assuming it can't be biased, are the failure patterns this domain tests against — the latter inverts reality, since AI can make bias look objective."
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
          explanation: "The policy violation happens at the point regulated data is shared/uploaded — a downstream instruction about retention doesn't undo that. It's like mailing a document to the wrong address and following up with a note asking them not to read it. Anonymizing before upload is what actually satisfies the control."
        },
        {
          type: "single",
          question: "A recruiter proposes: Claude scores 400 resumes, auto-rejects anything under 6/10, and she spot-checks a random 10% of rejections. Why is this still inadequate?",
          options: [
            "It's adequate — a 10% sample is a standard quality control.",
            "90% of rejections still had no human decision-maker, and a random sample of individual rejections is specifically bad at revealing bias, which only appears when comparing across cases.",
            "The threshold should be 7/10 rather than 6/10.",
            "Spot-checks are only valid if they cover 50% or more."
          ],
          correct: [1],
          explanation: "This is a control-shaped object rather than a control: it produces the feeling of oversight with little of the substance. Accountability is still absent for the overwhelming majority of consequential decisions, and the review method is mismatched to the defect it would need to catch. Tuning the threshold (C) doesn't address who's accountable."
        },
        {
          type: "single",
          question: "An associate argues: \"This dataset is technically regulated, but the analysis is purely internal and low-risk, so policy shouldn't apply.\" What's the flaw?",
          options: [
            "No flaw — internal use is generally exempt from data policy.",
            "A personal judgment that something is low-risk isn't a substitute for a policy decision; the policy exists so this call isn't made ad hoc by whoever's at the keyboard.",
            "The flaw is that internal analysis is actually higher-risk than external.",
            "Policies only apply to datasets over a certain size."
          ],
          correct: [1],
          explanation: "The associate might even be right that the policy is overcautious — but that's a conversation with the policy owner, not a permission to self-grant. Policies exist precisely to prevent case-by-case reasoning by people with only a slice of the context. There's no internal-use exemption unless the policy says there is (A)."
        },
        {
          type: "single",
          question: "What does it mean to say AI can \"launder\" bias, and why does it matter?",
          options: [
            "AI removes bias from human decisions automatically.",
            "AI can make a biased judgment look objective — \"the system scored them 4/10\" gets challenged far less than the same view expressed as a gut feeling, though the bias is identical.",
            "It refers to AI cleaning up biased language in documents.",
            "It means AI output is always biased and unusable."
          ],
          correct: [1],
          explanation: "The laundering is rhetorical: a numeric score carries an authority the underlying analysis doesn't earn, and people argue with it less than they'd argue with an opinion. That's what makes it more dangerous than an openly-stated human preference, not less. (A) inverts the risk and (D) overcorrects into uselessness."
        },
        {
          type: "multi",
          question: "Which two situations warrant disclosing that AI was used? (Select 2)",
          options: [
            "A client receives an analysis they believe reflects your firm's expert human judgment.",
            "Claude helped reformat your own meeting notes into bullets.",
            "A job candidate's application was screened with AI assistance.",
            "Claude fixed the grammar in an internal Slack message."
          ],
          correct: [0, 2],
          explanation: "The test is whether the reader's judgment would change if they knew. A client weighing analysis as expert opinion and a candidate being evaluated both have a real stake in how the output was produced. Formatting your own notes or fixing grammar (B, D) changes nothing about how anyone should weigh the content — disclosure there is noise, not ethics."
        },
        {
          type: "single",
          question: "Company policy explicitly prohibits processing health data in any external AI tool, anonymized or not. An analyst proposes stripping the patient names and proceeding. What's the correct response?",
          options: [
            "Proceed — anonymization is always the right answer for sensitive data.",
            "Don't proceed: the policy forecloses this data category entirely, not just the identifiers. Follow it, and take it up with the policy owner if you think it's wrong.",
            "Proceed, but add an instruction telling Claude not to retain the data.",
            "Proceed if the analysis is internal only."
          ],
          correct: [1],
          explanation: "Anonymization is usually the enabling path, but it isn't a universal override — here the policy has already decided about the category, and your job is to follow it, not route around it with a technique. This is what distinguishes governance from personal risk assessment. (C) repeats the instruction-is-not-a-control error."
        },
        {
          type: "single",
          question: "A support ticket export has no \"name\" column, but customers' full names and home addresses appear inside the free-text ticket bodies. How should this be treated?",
          options: [
            "As non-regulated data, since there's no dedicated identifier column.",
            "As regulated personal data requiring anonymization — the data is regulated wherever it lives, and free text isn't a loophole.",
            "As safe to upload because support tickets are operational data.",
            "As unusable for any analysis."
          ],
          correct: [1],
          explanation: "Structure is irrelevant to whether data is regulated. \"It's in the ticket body, not a column\" isn't a distinction any policy makes — and this is the common real-world case, since identifiers hide in free text far more often than they sit in a tidy labeled column. It's still analyzable once scrubbed (D)."
        },
        {
          type: "single",
          question: "Which response to \"can we use Claude to screen resumes?\" best reflects this domain's judgment?",
          options: [
            "\"No — hiring is too high-stakes for AI.\"",
            "\"Yes — Claude summarizes each application against the criteria and flags experience and gaps; you make every accept/reject call.\"",
            "\"Yes — score them and auto-reject below the threshold to save time.\"",
            "\"Only if Legal signs off on each individual rejection.\""
          ],
          correct: [1],
          explanation: "The responsible answer is a compliant path to the work, not a refusal. Most of the 30 hours were reading, not deciding — so Claude does the reading and the human keeps the decision, preserving the efficiency and the accountability. A flat no (A) is a wrong answer on this exam and gets you routed around; (C) automates the consequential decision; (D) is unworkable theater."
        },
        {
          type: "single",
          question: "Why is \"refuse to use AI wherever there's any risk\" not the responsible position this domain teaches?",
          options: [
            "It is the responsible position — caution is always correct with AI.",
            "Responsible use means finding the path that gets the work done within the constraint; blanket refusal isn't more responsible, just less useful, and it gets you routed around.",
            "Because risk is never real in business AI use.",
            "Because policy always permits AI use."
          ],
          correct: [1],
          explanation: "\"Skip it entirely\" appears as a distractor throughout this domain — including in the official sample question — and it's wrong every time there's a compliant path available. The person who says \"we can do that this way\" is doing the actual job; the person who only says no gets bypassed by someone with fewer scruples."
        },
        {
          type: "single",
          question: "What's the common structure shared by \"upload it but tell Claude not to retain it\" and \"connect the whole inbox but instruct Claude never to reference HR content\"?",
          options: [
            "Both are adequate controls when documented.",
            "Both substitute an instruction to the model for an actual control — the data is already shared or reachable, and a request doesn't change what's in scope.",
            "Both are technically impossible to implement.",
            "Both are only problems in regulated industries."
          ],
          correct: [1],
          explanation: "Recognizing this shape is worth real points, since it recurs across Domains 5 and 6. In both cases the fix is identical: change what's reachable rather than asking nicely about what's already reachable — anonymize before upload, scope the connector to the folder."
        },
        {
          type: "single",
          question: "An HR partner uses Claude to draft eight performance reviews, then reads each one carefully on its own before sending. What risk does this review process still miss?",
          options: [
            "None — careful individual review is thorough.",
            "Bias across cases: each review can be accurate and fair on its own while the set applies different framing to comparable achievements — a pattern only visible when compared side by side.",
            "Hallucinated citations.",
            "Formatting inconsistencies."
          ],
          correct: [1],
          explanation: "This links Domain 2's bias mechanics to Domain 6's ethics: reviewing one at a time is exactly the method that cannot detect the defect, because the defect lives in the comparison. For decisions affecting people, the review method has to match the risk — read them side by side."
        }
      ],
      flashcards: [
        { front: "What's the key question beyond \"can Claude technically do this task\"?", back: "\"Should this task go through Claude, here, right now\" — considering consequences to real people, existing policy, and data sensitivity." },
        { front: "Someone wants to analyze a spreadsheet with regulated personal data, but policy restricts sharing it. What's the correct fix?", back: "Remove or anonymize the personal identifiers before uploading — not upload-as-is, and not just instructing the model not to retain it." },
        { front: "Why doesn't \"upload it but tell Claude not to retain the data\" satisfy a data-sharing policy?", back: "The violation happens at the moment of upload — a downstream instruction doesn't reach back and un-share it. Like mailing a document to the wrong address and asking them not to read it." },
        { front: "State the general rule that covers both \"don't retain this\" and \"never reference HR content.\"", back: "When a policy requires a control, an instruction to the model doesn't satisfy it. Change what's reachable; don't ask nicely about what's already reachable." },
        { front: "Why is \"skip the analysis entirely\" usually a wrong answer on this domain?", back: "It's the overcorrection — it abandons work that had a perfectly good compliant path. Responsible use means finding the path within the constraint, not refusing." },
        { front: "What's the textbook inappropriate-use pattern for high-stakes decisions about people?", back: "Fully automating a consequential decision (hiring, credit, discipline) with no human review — stakes and bias risk both argue for human-in-the-loop." },
        { front: "What's the compliant version of \"have Claude screen 400 resumes\"?", back: "Claude summarizes each application against the criteria and flags experience and gaps; a human makes every accept/reject call. Most of the time saved was reading, not deciding." },
        { front: "Why is bias especially hard to catch in an automated screening process?", back: "Bias only appears when comparing across cases — and the whole premise of automation is that nobody reads them. By construction, there's no mechanism that could notice." },
        { front: "What's a \"control-shaped object\"?", back: "A review that can't realistically catch anything — e.g. rubber-stamping 400 scores at 10 seconds each. Worse than no review, because the process now looks reviewed." },
        { front: "What should you do when a new use case isn't clearly covered by your org's AI policy?", back: "Check with the policy owner. Silence isn't approval — it usually means nobody considered the case yet. Costs an email; buys someone else's name on the decision." },
        { front: "What does it mean that AI can \"launder\" bias?", back: "It makes a biased judgment look objective — \"the system scored them 4/10\" gets challenged far less than the same view as a gut feeling. Same bias, better PR." },
        { front: "What's the test for whether AI use needs disclosure?", back: "Would the reader's judgment change if they knew? A client weighing it as expert opinion or a screened candidate — yes. Formatting your own notes — no." },
        { front: "What does responsible use require regarding accountability?", back: "A human stays accountable for what ships. \"The AI wrote it\" has never worked as a defense — it's how professional accountability always worked, and AI got no carve-out." }
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
            heading: "\"Wrong\" and \"not what I wanted\" are different problems",
            body: `<p>When output disappoints, the reflex is to re-roll it. Resist that for thirty seconds and ask one question first, because it splits the world in two and the two halves have different fixes:</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">Wrong — an accuracy problem</span><p>The output states something false, misreads the source, or contradicts your data.</p><p><strong>Cause:</strong> Claude was missing something it needed — context, the actual document, a constraint you had in your head.</p><p><strong>Fix:</strong> supply what was missing. Rewording won't help; the information genuinely wasn't there.</p></div><div class="compare-col good"><span class="cc-label">Not what I wanted — a specification problem</span><p>The output is accurate but too long, wrong tone, wrong format, wrong emphasis.</p><p><strong>Cause:</strong> you knew the target and didn't say it.</p><p><strong>Fix:</strong> state the target. Adding more context won't help; Claude had enough — it just aimed somewhere else.</p></div></div><p>Conflating these wastes cycles in the most frustrating way possible: you add three paragraphs of background to fix a tone problem (Claude never lacked context), or you rephrase more forcefully to fix a factual error (the fact still isn't there, now stated more confidently). Both feel like effort. Neither addresses anything.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>A dish that came out wrong. If it's undersalted, adding heat won't help. If it's burnt, salt won't help. Diagnose before you reach — obvious in a kitchen, and somehow not obvious at all when the response is right there and re-rolling takes two seconds. The cheapness of the retry is exactly what makes it a trap.</div><p><strong>The trap:</strong> re-rolling an identical prompt and hoping. Output varies slightly between runs, so occasionally this produces something better and teaches you that it works. It didn't work — you got a different sample from the same distribution. The underlying gap is still there and it'll be back next time.</p>`
          },
          {
            heading: "A troubleshooting loop that converges",
            body: `<p>A sequence that actually terminates, rather than the "tweak and re-roll until something looks okay" loop most people run:</p><pre><code>1. Classify: is it WRONG, or NOT WHAT I WANTED?
2. If wrong  → what did Claude not have? Supply it.
   If not what I wanted → what's the target? State it.
3. Change ONE thing.
4. Re-test. Better, worse, or unchanged?
5. Still off? Back to 1 — with new information this time.</code></pre><p>Step 3 is the one people skip, and skipping it is why troubleshooting sessions go on for forty minutes. When you rewrite the prompt wholesale — new context, new format, new tone, a role, and an example, all at once — and the result improves, <strong>you've learned nothing.</strong> You don't know which change did it, so you can't reproduce it on the next task, and you probably carried along two changes that made things worse and one that fixed it. Next week you'll rebuild the whole thing from scratch again.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Adjusting the shower with two taps. Turn both at once and you'll get there eventually, by luck, and learn nothing about your shower. Turn one, feel, turn the other — and now you know which tap does what, forever. Nobody's confused about this in a bathroom. Everybody does the two-taps-at-once thing with prompts.</div><p>The payoff isn't this prompt; it's the next fifty. One change at a time builds an actual model of what moves the output, and that transfers.</p>`,
            interactive: {
              type: "sequence",
              title: "Order the troubleshooting loop",
              instructions: "An associate's weekly summary prompt is producing output that misses the point. Put the diagnostic steps in the order that converges fastest.",
              items: [
                { text: "Classify the failure: is the output factually wrong, or accurate but not what you wanted?" },
                { text: "Identify the specific cause — what information was Claude missing, or what target did you never state?" },
                { text: "Make exactly one targeted change addressing that cause." },
                { text: "Re-test and compare: better, worse, or unchanged?" },
                { text: "If it's still off, loop back to classification — now with what the last test taught you." }
              ],
              explanation: "Classification comes first because it determines the whole fix: supply missing information for accuracy problems, state the target for specification problems. Then one change, so the re-test actually tells you something — change five things and an improvement teaches you nothing about which one worked. The loop terminates because each pass adds real information; 'tweak and re-roll' doesn't, which is why it can run for forty minutes."
            }
          },
          {
            heading: "Reading the failure: where the problem usually lives",
            body: `<p>Most "Claude got it wrong" reports trace to one of four input-side causes. Worth learning the shapes, since the symptom usually tells you which one:</p><ul><li><strong>Missing specification</strong> (Domain 1) — output is generic, plausible, could have been written for anyone. Symptom: it reads like a template. Fix: goal, audience, format, constraints.</li><li><strong>Missing context</strong> — output is confidently wrong about your specifics. Symptom: it invented a detail about your business that it had no way to know. Fix: give it the document, don't describe the document.</li><li><strong>Scope too broad</strong> (Domain 1) — output addresses four things shallowly. Symptom: everything's mentioned, nothing's useful. Fix: decompose; this is not a wording problem and no rephrasing will fix it.</li><li><strong>Cluttered context</strong> (Domain 3) — output ignores a constraint you set, or resurrects something you rejected. Symptom: it's regressing in a long thread. Fix: restart or summarize.</li></ul><p>Notice what's not on that list: "the model isn't good enough." That's occasionally true, and it's almost never the first four things you should check. The reason this matters practically is that people reach for a model upgrade early — it's the only lever that requires no thought — and it fixes none of the above. A bigger model given no context still can't know your Q3 numbers; given a cluttered thread it processes the clutter more expensively; given a four-deliverable bundle it produces four shallow deliverables with better sentences.</p><div class="callout warn"><span class="callout-label">Watch out</span>There's a specific version of this worth naming: <strong>escalating to a higher tier hides the diagnosis rather than solving it.</strong> Sometimes the upgrade genuinely does mask a bad prompt — a stronger model compensates for vagueness, output improves, and everyone concludes the fix was the model. Now you're paying more, permanently, to avoid a two-line prompt fix you never found. That's the worst outcome available, because it feels like a success.</div>`
          },
          {
            heading: "Optimizing the workflow, not just this output",
            body: `<p>Everything above fixes one bad output. Optimization is a different altitude: it asks what keeps going wrong, and fixes the setup instead of the instance.</p><p>The signal is <strong>repetition</strong>. Fixing the same thing twice is a data point. Three times is a workflow problem wearing a troubleshooting costume.</p><p>Concretely, an ops associate rewrites her weekly status-report prompt from memory every Monday. It takes twelve minutes. Some weeks she forgets the "flag blockers separately" instruction and doesn't notice until Thursday. She has never once thought of this as a problem, because each individual Monday is fine — twelve minutes isn't worth a project. But it's ten hours a year plus a recurring quality defect, and the fix is to save the prompt into a Project's instructions once. Then it's zero minutes a week and the blockers instruction can't be forgotten, because nobody's retyping it.</p><p>The recurring optimization moves, all cheap:</p><ul><li><strong>Templating</strong> — a prompt you rebuild from memory becomes a Project instruction. Removes both the effort and the drift.</li><li><strong>Right-sizing the tier</strong> (Domain 3) — a recurring low-complexity task running on the top tier out of habit is pure waste. Evaluate it once, save it forever.</li><li><strong>Moving context upstream</strong> (Domain 5) — background you paste every session belongs in a knowledge source.</li><li><strong>Cutting the step</strong> — occasionally the honest answer is that the output nobody reads shouldn't be generated at all. Optimization includes deleting things.</li></ul><div class="callout analogy"><span class="callout-label">Think of it like...</span>The drawer that sticks. You've shoved it for two years — half a second each time, never worth fixing. Then one afternoon you plane the runner and it's fixed forever, and you realize you'd spent more time being annoyed at the drawer than the repair took. Recurring friction is invisible precisely because each instance is trivial. That's what makes it survive.</div><p>The habit worth building: when you catch yourself fixing something familiar, stop and ask whether you're troubleshooting or maintaining. If it's the third time, it's not a bad output. It's a setup you haven't fixed yet.</p>`,
            interactive: {
              type: "scenario",
              title: "Third time this month",
              setup: "You're helping a colleague whose client-summary prompt produced a summary missing the risk section — again. It's the third time this month. Each time, he adds \"and include a risks section\" and it works fine. He's about to do that again and get on with his day. What do you tell him?",
              choices: [
                {
                  text: "\"Just add the risks line — it works, and you've got a deadline.\"",
                  outcome: "bad",
                  feedback: "It does work, and that's exactly what keeps this alive. Each individual fix is thirty seconds, so it never clears the bar for being worth solving — and it'll happen again in a week, and the week he forgets to add the line, a client gets a summary with no risk section. Recurring friction survives because each instance is too small to justify fixing."
                },
                {
                  text: "\"Switch to a higher model tier — it'll infer that a client summary needs a risks section.\"",
                  outcome: "bad",
                  feedback: "It might, actually — which is the trap. A stronger model can paper over an incomplete spec, so the symptom disappears and everyone concludes the model was the fix. Now he's paying more forever to avoid a one-line prompt change nobody ever found. That's the worst available outcome, because it looks like a success."
                },
                {
                  text: "\"Third time is a setup problem, not an output problem. Put the required sections — including risks — into a Project instruction so the prompt can't omit it.\"",
                  outcome: "good",
                  feedback: "Right. Twice is a coincidence, three times is a workflow problem in a troubleshooting costume. The prompt has an incomplete spec that he's been patching by hand every time; moving the required structure into a Project instruction fixes it permanently and removes the failure mode where he forgets to patch it. Thirty seconds a time is invisible — that's why it survived three rounds."
                },
                {
                  text: "\"Re-run it — the output varies, so it'll probably include risks this time.\"",
                  outcome: "bad",
                  feedback: "This is the re-roll trap in its purest form. Output does vary, so sometimes you'll get the risks section and conclude re-rolling works. It doesn't — you drew a different sample from the same distribution. The spec is still incomplete, and now he's learned a superstition instead of a fix."
                }
              ]
            }
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
            explanation: "Separating 'wrong' from 'not what I wanted' determines the fix: accuracy issues need more/better context, while preference mismatches need a more specific target (format, tone, scope) — conflating the two wastes iteration cycles on changes that can't address the actual gap."
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
            explanation: "Recurring friction like this is a workflow optimization signal — templating the reusable prompt removes both the repeated effort and the week-to-week drift, rather than treating each week's version as a one-off."
          },
          {
            type: "single",
            question: "During troubleshooting, an associate rewrites the prompt with new context, a new format, a role, and an example — all at once. The output improves substantially. What's the problem?",
            options: [
              "No problem — the output improved, which is the goal.",
              "She doesn't know which change worked, so she can't reproduce it next time and may be carrying changes that actively hurt alongside the one that helped.",
              "She should have used a higher model tier as well.",
              "Changing the format is never appropriate during troubleshooting."
            ],
            correct: [1],
            explanation: "One change at a time is what makes the re-test informative. Bundling five changes and seeing improvement teaches nothing transferable — the payoff of disciplined troubleshooting isn't this prompt, it's building a real model of what moves output across the next fifty."
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
          explanation: "Without diagnosing what went wrong (missing context, ambiguity, wrong scope), re-running the same prompt tends to reproduce the same failure mode. Output does vary between runs (so D is wrong), which is precisely the trap: an occasional better draw teaches you that re-rolling 'works' when you've only drawn a different sample from the same distribution."
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
          explanation: "Shallow coverage of several bundled sub-tasks is a scope problem, not a wording problem — no rephrasing fixes it, because the request is asking for four things in one pass. Tone, length, and format issues are all directly fixed with a specific instruction tweak."
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
          explanation: "This connects to Domain 3's cost/speed/quality trade-off: a recurring, low-complexity task running on an unnecessarily expensive tier is a workflow-level optimization, and it only has to be evaluated once to save indefinitely. Habit isn't a selection criterion."
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
          explanation: "Missing context and excessive scope are genuine input-side causes of poor output — Claude couldn't have succeeded. A style preference or a minor length mismatch (B, D) is a specification gap: the output is fine, it just isn't aimed where you wanted, and the fix is stating the target, not supplying information."
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
          explanation: "Single-prompt troubleshooting fixes one bad output; workflow optimization addresses the pattern — reusable prompt templates, right-sized model tiers, and moving repeated context upstream. The signal to switch altitudes is repetition: fixing the same thing three times means the setup is the problem."
        },
        {
          type: "single",
          question: "Claude confidently states an incorrect figure about your company's Q3 performance. Which fix actually addresses the cause?",
          options: [
            "Reword the prompt more forcefully to emphasize accuracy.",
            "Provide the actual Q3 data — this is an accuracy problem caused by missing information, and no amount of rewording supplies a fact Claude never had.",
            "Ask Claude to double-check its own answer.",
            "Add tone and format constraints to the prompt."
          ],
          correct: [1],
          explanation: "This is the accuracy half of the diagnosis: the information genuinely wasn't there. Rewording (A) or adding constraints (D) addresses specification, which isn't the problem, and self-checking (C) asks the model to verify a fact it doesn't have — the same unreliable signal as self-reported confidence in Domain 2."
        },
        {
          type: "single",
          question: "An output is accurate but three times longer than needed and far too formal. What kind of problem is this, and what's the fix?",
          options: [
            "An accuracy problem — supply more context about the topic.",
            "A specification problem — state the target: length limit and tone. Claude had enough information; it just aimed somewhere you didn't specify.",
            "A model-tier problem — upgrade to a stronger model.",
            "A context-clutter problem — restart the conversation."
          ],
          correct: [1],
          explanation: "Nothing is wrong with the content, so adding context (A) fixes nothing — Claude never lacked information. This is the classic conflation the domain warns about: reaching for the accuracy fix on a specification problem. Say the target and it's solved in one line."
        },
        {
          type: "single",
          question: "A colleague reports his prompts \"got worse over the last hour\" in a long working session — Claude is now ignoring a constraint he set early and resurfacing an option he rejected. What's the likely cause?",
          options: [
            "The model degrades over time within a session.",
            "Cluttered context in a long thread — the fix is restarting with a focused prompt or summarizing the decisions that still stand.",
            "A specification problem requiring a clearer target.",
            "The prompt is missing background context and needs more detail."
          ],
          correct: [1],
          explanation: "Dropped constraints and resurrected rejects in a long thread are the signature of context clutter (Domain 3), and the fix is reducing noise, not adding to it. Note (D) is exactly the wrong instinct — explaining again at greater length adds more context to an already overloaded thread."
        },
        {
          type: "multi",
          question: "Which two are workflow-level optimizations rather than single-prompt fixes? (Select 2)",
          options: [
            "Moving background context you paste every session into a Project's knowledge source.",
            "Adding a length constraint to today's prompt because the draft ran long.",
            "Evaluating once whether a recurring low-complexity task can run on a cheaper tier.",
            "Cutting a repeated paragraph from a specific draft."
          ],
          correct: [0, 2],
          explanation: "Both winners fix the setup so the problem stops recurring — solve once, save indefinitely. Adding a constraint to today's prompt or cutting a paragraph from one draft (B, D) are perfectly good fixes to individual outputs, but tomorrow's output starts from the same place."
        },
        {
          type: "single",
          question: "Why is upgrading to a higher model tier a risky response to a vague prompt?",
          options: [
            "It isn't risky — a stronger model is strictly better.",
            "It may mask the bad prompt: output improves, everyone credits the model, and you pay more permanently to avoid a two-line prompt fix nobody ever found.",
            "Higher tiers can't process vague prompts at all.",
            "It will produce an error message."
          ],
          correct: [1],
          explanation: "The danger is specifically that it can work — a stronger model compensates for vagueness, the symptom disappears, and the diagnosis is buried under an apparent success. That's the worst outcome available, because nothing prompts a re-examination. A model upgrade also fixes none of the other common causes: missing context, excessive scope, or thread clutter."
        }
      ],
      flashcards: [
        { front: "What's the first diagnostic question when an output is 'wrong'?", back: "Is this actually an accuracy problem, or a preference/specification mismatch? The fix differs completely for each." },
        { front: "How do you fix an accuracy problem vs. a specification problem?", back: "Accuracy → supply what Claude was missing (rewording won't add a fact). Specification → state the target (more context won't help; it had enough)." },
        { front: "Why is re-running an identical prompt after a bad result usually ineffective?", back: "You draw a different sample from the same distribution. Output varies, so it occasionally looks like it worked — which teaches a superstition, not a fix." },
        { front: "What's the recommended troubleshooting loop?", back: "Classify (wrong vs. not-what-I-wanted) → identify the missing element or unstated target → change ONE thing → re-test → loop with what you learned." },
        { front: "Why change only one thing at a time when troubleshooting?", back: "Bundle five changes and an improvement teaches you nothing — you can't reproduce it, and you may be carrying changes that hurt alongside the one that helped." },
        { front: "Name the four input-side causes of bad output and their symptoms.", back: "Missing spec (reads like a template) · missing context (confidently wrong about your specifics) · scope too broad (four things, all shallow) · cluttered context (regressing in a long thread)." },
        { front: "Why is a model-tier upgrade a risky fix for a vague prompt?", back: "It might work — masking the bad prompt. You pay more forever to avoid a two-line fix nobody found, and it looks like a success, so nobody re-examines it." },
        { front: "What's the signal to switch from troubleshooting to workflow optimization?", back: "Repetition. Fixing the same thing twice is a data point; three times is a workflow problem in a troubleshooting costume." },
        { front: "What's a workflow-level (not single-prompt) optimization example?", back: "Templating a recurring prompt into a Project instruction instead of rewriting it from memory weekly — removes the effort AND the drift." },
      ]
    }
  ]
};
