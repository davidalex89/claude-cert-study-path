/* Claude Certified Architect – Foundations (CCAR-F)
   Domain blueprint and task statements sourced from Anthropic's official Exam
   Guide (v1.0, July 2026). All lesson content, practice questions, and
   flashcards below are original, written to teach the published blueprint
   objectives — not drawn from any live exam item bank. The twelve items
   marked source:"official" across the five domains' quizzes are the
   illustrative sample questions Anthropic itself publishes in the Exam
   Guide's "Sample Questions" section for candidate preparation, reproduced
   here with their published answer and rationale.
*/
window.CERT_DATA = window.CERT_DATA || {};
window.CERT_DATA["architect-foundations"] = {
  id: "architect-foundations",
  name: "Claude Certified Architect – Foundations",
  code: "CCAR-F",
  cost: "$125 USD",
  questions: 60,
  time: "120 min",
  passingScore: "720/1000",
  validity: "12 months",
  tagline: "Make informed architectural tradeoffs building production agentic systems with Claude Code, the Agent SDK, and MCP.",
  audience: "For solution architects who design and implement production applications with Claude: building agentic systems with the Claude Agent SDK (multi-agent orchestration, subagent delegation, tool integration, lifecycle hooks), configuring Claude Code for team workflows (CLAUDE.md hierarchies, Agent Skills, MCP servers, plan mode), designing Model Context Protocol tool and resource interfaces for backend integration, and engineering prompts that produce reliable structured output. Assumes 6+ months of hands-on experience with the Claude API, Agent SDK, Claude Code, and MCP, and a working understanding of both the capabilities and limitations of large language models in production.",
  scenarios: "Each exam sitting draws 4 scenarios at random from a fixed bank of 6 realistic production contexts; every scenario frames several of the exam's 60 questions and maps to 2-3 of the primary domains below. Scenario 1, Customer Support Resolution Agent: an Agent SDK support agent using custom MCP tools (get_customer, lookup_order, process_refund, escalate_to_human) targeting 80%+ first-contact resolution while knowing when to escalate - maps to Agentic Architecture & Orchestration, Tool Design & MCP Integration, and Context Management & Reliability. Scenario 2, Code Generation with Claude Code: integrating Claude Code into a dev workflow with custom slash commands and CLAUDE.md, choosing between plan mode and direct execution - maps to Claude Code Configuration & Workflows and Context Management & Reliability. Scenario 3, Multi-Agent Research System: a coordinator delegating to search, document-analysis, synthesis, and report-writing subagents to produce cited research reports - maps to Agentic Architecture & Orchestration, Tool Design & MCP Integration, and Context Management & Reliability. Scenario 4, Developer Productivity with Claude: an Agent SDK tool that explores unfamiliar codebases using the built-in tools (Read, Write, Bash, Grep, Glob) plus MCP servers - maps to Tool Design & MCP Integration, Claude Code Configuration & Workflows, and Agentic Architecture & Orchestration. Scenario 5, Claude Code for Continuous Integration: Claude Code wired into a CI/CD pipeline for automated code review, test generation, and pull request feedback that must minimize false positives - maps to Claude Code Configuration & Workflows and Prompt Engineering & Structured Output. Scenario 6, Structured Data Extraction: extracting information from unstructured documents, validating it against JSON schemas, and handling edge cases for downstream systems - maps to Prompt Engineering & Structured Output and Context Management & Reliability.",
  domains: [
    {
      id: "d1",
      title: "Agentic Architecture & Orchestration",
      weight: 27,
      summary: "The largest domain on the exam: controlling the agentic loop, orchestrating coordinator/subagent hierarchies, enforcing workflow rules deterministically, and managing session lifecycle.",
      objectives: [
        "Design and implement agentic loops for autonomous task execution",
        "Orchestrate multi-agent systems with coordinator-subagent patterns",
        "Configure subagent invocation, context passing, and spawning",
        "Implement multi-step workflows with enforcement and handoff patterns",
        "Apply Agent SDK hooks for tool call interception and data normalization",
        "Design task decomposition strategies for complex workflows",
        "Manage session state, resumption, and forking"
      ],
      lesson: {
        sections: [
          {
            heading: "The agentic loop: stop_reason is the control signal",
            body: `<p>An agentic loop is: send a request to Claude, inspect the response's <code>stop_reason</code>, execute whatever tools were requested, append the results to conversation history, and repeat. The entire control flow hinges on one field:</p><ul><li><strong>stop_reason: "tool_use"</strong> — Claude wants to call one or more tools; execute them and continue the loop.</li><li><strong>stop_reason: "end_turn"</strong> — Claude has no further tool calls; present the response as the final answer and stop.</li></ul><pre><code>while (response.stop_reason === "tool_use") {
  const results = await runTools(response.content);
  messages.push({ role: "assistant", content: response.content });
  messages.push({ role: "user", content: results });
  response = await client.messages.create({ model, messages, tools });
}
// response.stop_reason === "end_turn" -&gt; present response.content</code></pre><div class="callout analogy"><span class="callout-label">Think of it like...</span>A recipe says "preheat 10 min, bake 25 min, done" — a fixed number of steps regardless of what's actually happening in the oven. A thermostat instead keeps checking one signal (is the temperature at target yet?) and keeps acting until that signal says stop. The agentic loop works like the thermostat, not the recipe: it doesn't run a fixed number of turns, it keeps checking <code>stop_reason</code> and keeps calling tools until Claude itself signals it's done — no more, no less.</div><p>Tool results are appended to conversation history so the model can reason about them on the next iteration — the loop is model-driven decision-making (Claude decides which tool to call next based on context), not a pre-configured decision tree or fixed tool sequence. Avoid the anti-patterns: parsing natural-language text to detect when to stop, using an arbitrary iteration cap as the <em>primary</em> stopping mechanism, or checking for assistant text content instead of <code>stop_reason</code> as the completion signal. An iteration cap is still worth having — as a safety net against a genuinely stuck loop — but if it's the thing that's actually ending most of your loops, that's a sign the model isn't reliably reaching <code>end_turn</code> on its own, and the underlying prompt or tool design needs attention.</p>`,
            interactive: {
              type: "stepThrough",
              title: "Watch the loop run — a support request, turn by turn",
              steps: [
                {
                  label: "Turn 1",
                  stopReason: "tool_use",
                  narration: "The user asked about an order and a possible refund. Claude doesn't know who they are yet, so before anything else, it calls get_customer. Nothing told the loop to do this in advance — Claude decided it, based on what was missing.",
                  messages: [{ role: "assistant", kind: "tool_call", text: "get_customer(email: \"j.rivera@example.com\")" }]
                },
                {
                  label: "Tool executes",
                  stopReason: null,
                  narration: "The tool runs outside the model and its result is appended to the conversation. Claude hasn't \"seen\" this yet — it will on the next request, along with everything before it.",
                  messages: [{ role: "tool", kind: "tool_result", text: "→ { name: \"J. Rivera\", tier: \"gold\", id: 4471 }" }]
                },
                {
                  label: "Turn 2",
                  stopReason: "tool_use",
                  narration: "Now that Claude knows who the customer is, it reasons about what's still missing — the actual order — and calls lookup_order. A fixed script would have had to hard-code this exact sequence in advance; here, Claude derived it from context.",
                  messages: [{ role: "assistant", kind: "tool_call", text: "lookup_order(customer_id: 4471)" }]
                },
                {
                  label: "Tool executes",
                  stopReason: null,
                  narration: "Another result appended. The transcript keeps growing — every step adds to what Claude can see; nothing gets thrown away between iterations.",
                  messages: [{ role: "tool", kind: "tool_result", text: "→ { order: \"#8842\", status: \"delayed\", days_late: 3 }" }]
                },
                {
                  label: "Turn 3",
                  stopReason: "tool_use",
                  narration: "With order status in hand, Claude still needs to know if a 3-day-late gold-tier order actually qualifies for a refund. A third tool call — still driven by what Claude has learned so far, not a preset plan.",
                  messages: [{ role: "assistant", kind: "tool_call", text: "check_refund_policy(days_late: 3, tier: \"gold\")" }]
                },
                {
                  label: "Tool executes",
                  stopReason: null,
                  narration: "One more result appended to history.",
                  messages: [{ role: "tool", kind: "tool_result", text: "→ { eligible: true, reason: \"gold tier, 3+ days late\" }" }]
                },
                {
                  label: "Turn 4",
                  stopReason: "end_turn",
                  narration: "Claude now has everything it needs: identity, order status, and refund eligibility. No more tools are required, so stop_reason flips to \"end_turn\" and the loop presents this as the final answer.",
                  messages: [{ role: "assistant", kind: "final", text: "Your order #8842 is delayed by 3 days. Since you're a gold-tier customer, you're eligible for a refund — I can process that now if you'd like." }]
                }
              ]
            }
          },
          {
            heading: "Coordinator/subagent hub-and-spoke orchestration",
            body: "<p>Multi-agent systems typically use a <strong>hub-and-spoke</strong> architecture: a coordinator agent manages all inter-subagent communication, error handling, and information routing — subagents don't talk to each other directly. The coordinator owns task decomposition, delegation, result aggregation, and deciding which subagents to invoke based on query complexity; a well-designed coordinator dynamically selects which subagents to invoke rather than always routing every request through the full pipeline.</p><div class=\"callout analogy\"><span class=\"callout-label\">Think of it like...</span>An air traffic control tower. Planes (subagents) never negotiate directly with each other — they all talk to the tower, and the tower holds the only complete picture of what's happening across the airspace. If two planes coordinated directly and something went wrong, you'd have to reconstruct a conversation that happened entirely outside the tower's view. Routing everything through one coordinator is what keeps the whole system debuggable.</div><p>The recurring failure mode is <strong>overly narrow decomposition</strong>: a coordinator asked to research \"the impact of AI on creative industries\" might decompose the topic into only \"AI in digital art creation,\" \"AI in graphic design,\" and \"AI in photography\" — each subagent executes correctly, but the assignment itself never covered music, writing, or film. This is the trap: nothing in the pipeline ever fails loudly, because every subagent did exactly what it was asked. The gap is invisible unless something is specifically checking the output against the original scope. The fix is an <strong>iterative refinement loop</strong>: the coordinator evaluates synthesis output for coverage gaps, re-delegates to search/analysis subagents with targeted follow-up queries, and re-invokes synthesis until coverage is sufficient. Routing all subagent communication through the coordinator also gives you a single place for observability and consistent error handling.</p>",
            interactive: {
              type: "scenario",
              title: "You're the coordinator",
              setup: "A user asks: \"What's the impact of AI on creative industries?\" You need to decide how to decompose this into subagent tasks.",
              choices: [
                {
                  text: "Decompose into exactly three fixed subtopics up front — digital art, graphic design, photography — dispatch to three subagents, and synthesize whatever comes back.",
                  outcome: "bad",
                  feedback: "This is the overly-narrow-decomposition failure mode. Every subagent will execute cleanly and the synthesis will read confidently — but music, writing, film, and more never got assigned to anyone, so nothing in the pipeline ever surfaces the gap."
                },
                {
                  text: "Decompose broadly first, then have the coordinator check the synthesized output against the original scope and re-delegate targeted follow-ups for anything missing before finalizing.",
                  outcome: "good",
                  feedback: "This is the iterative-refinement loop. The coordinator treats the first pass as a draft, checks it against the original question, and only stops once coverage is actually sufficient — not once a fixed pipeline has run exactly once."
                }
              ]
            }
          },
          {
            heading: "Spawning subagents: the Task tool and context passing",
            body: `<p>The <strong>Task tool</strong> is the mechanism for spawning subagents — a coordinator's <code>allowedTools</code> must include <code>"Task"</code> or it cannot delegate at all. Critically, <strong>subagents do not automatically inherit the coordinator's conversation history or share memory between invocations</strong>: any context a subagent needs (prior findings, source documents, constraints) must be explicitly included in its prompt.</p><pre><code>// Coordinator emits both Task calls in the SAME turn for parallel execution
Task({ subagent_type: "web-search", prompt: "Research recent adoption of..." })
Task({ subagent_type: "doc-analysis", prompt: "Summarize the attached filing..." })</code></pre><p>An <code>AgentDefinition</code> configures each subagent type's description, system prompt, and tool restrictions. When passing findings between agents, use structured data formats that separate content from metadata (source URLs, document names, page numbers) so attribution survives the handoff — don't just concatenate raw prose. Coordinator prompts should specify research goals and quality criteria rather than step-by-step procedural instructions, so subagents can adapt their approach.</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ Assumes shared memory</span><code>Task({<br>&nbsp;&nbsp;subagent_type: "synthesis",<br>&nbsp;&nbsp;prompt: "Write up the findings<br>&nbsp;&nbsp;from the research so far."<br>})</code><p>This subagent starts with <em>zero</em> context beyond what's in this prompt. "The research so far" points at nothing — the coordinator's history isn't inherited.</p></div><div class="compare-col good"><span class="cc-label">✓ Context passed explicitly</span><code>Task({<br>&nbsp;&nbsp;subagent_type: "synthesis",<br>&nbsp;&nbsp;prompt: "Synthesize these findings<br>&nbsp;&nbsp;into a report, citing each<br>&nbsp;&nbsp;claim by source:\\n\\n" +<br>&nbsp;&nbsp;searchResults + docAnalysis<br>})</code><p>Findings are pasted directly into the prompt, with source attribution preserved, so the subagent has everything it needs in one shot.</p></div></div><p><code>fork_session</code> supports exploring divergent approaches from a shared analysis baseline (e.g., comparing two refactoring strategies against the same codebase understanding) — more on this in the session-state section below.</p>`
          },
          {
            heading: "Deterministic enforcement: hooks vs. prompt-based guidance",
            body: `<p>There's a hard distinction between <strong>programmatic enforcement</strong> (hooks, prerequisite gates) and <strong>prompt-based guidance</strong>. When a business rule requires deterministic compliance — verifying customer identity before a refund, blocking a destructive action past a threshold — prompt instructions alone have a non-zero failure rate, because they're probabilistic. Hooks give you a guarantee.</p><pre><code>{
  "hooks": {
    "PostToolUse": [{
      "matcher": "process_refund",
      "hooks": [{ "type": "command", "command": "./enforce_refund_cap.sh" }]
    }]
  }
}</code></pre><div class="callout analogy"><span class="callout-label">Think of it like...</span>A hook is a deadbolt; a prompt instruction is a sticky note on the door that says "please lock this." Most of the time the sticky note works fine — people generally do what it asks. But if the door absolutely cannot be left unlocked, you don't rely on everyone reading and obeying the note; you install a lock that makes the wrong state physically impossible. Hooks are the deadbolt: enforcement happens outside the model's judgment, so it can't be argued with, misread, or skipped under pressure.</div><p>A <strong>PostToolUse</strong> hook can intercept tool <em>results</em> to normalize heterogeneous formats (Unix timestamps, ISO 8601, numeric status codes) before the model ever reasons over them, or intercept outgoing tool <em>calls</em> to block a policy-violating action (e.g., a refund above $500) and redirect to an alternative workflow such as human escalation. Choose hooks over prompt-based enforcement whenever the business rule requires a guarantee, not just a strong nudge — and default to prompts for everything else, since hooks add rigidity and engineering overhead that a soft preference doesn't need. When a workflow does hand off to a human mid-process, compile a structured summary — customer ID, root cause, refund amount, recommended action — since the human agent typically lacks access to the conversation transcript.</p>`,
            interactive: {
              type: "classify",
              title: "Hook or prompt guidance?",
              instructions: "For each rule, decide: does this need a hook (deterministic, guaranteed), or is prompt-based guidance good enough?",
              items: [
                { text: "Block any refund tool call above $500 until a human has approved it.", answer: "hook", why: "Real financial exposure above a threshold — needs a guarantee, not a best-effort instruction." },
                { text: "Prefer a warm, conversational tone in responses.", answer: "prompt", why: "A stylistic preference. Nothing breaks if the model occasionally misses it." },
                { text: "Verify a caller's identity before any account-changing action.", answer: "hook", why: "Security-critical gate — exactly the failure mode hooks exist to prevent." },
                { text: "Keep answers under 200 words unless the user asks for more detail.", answer: "prompt", why: "A soft formatting preference, not a safety or compliance boundary." },
                { text: "Never allow the agent to delete files outside the project directory.", answer: "hook", why: "Destructive and irreversible if it goes wrong — enforce it programmatically, don't just ask nicely." },
                { text: "Try to cite a source when making a factual claim.", answer: "prompt", why: "Best-effort quality guidance — worth asking for, but not something that needs a guaranteed block." }
              ]
            }
          },
          {
            heading: "Task decomposition strategies for complex workflows",
            body: `<p>Two decomposition patterns cover most cases. <strong>Prompt chaining</strong> — a fixed sequential pipeline — fits predictable, multi-aspect work, where you already know the shape of the task in advance. <strong>Dynamic, adaptive decomposition</strong> fits open-ended investigation, where subtasks are generated based on what's discovered at each step rather than fixed up front.</p><div class="compare-grid"><div class="compare-col good"><span class="cc-label">Prompt chaining</span><p><strong>Task:</strong> code-review a pull request touching 8 files.</p><p><strong>Plan:</strong> analyze each file individually against style/correctness criteria, then run one more pass checking cross-file consistency (shared types, naming, duplicated logic).</p><p>The shape is known up front — decompose by file, plus one integration pass. Reviewing all 8 files in a single shot would dilute attention across them.</p></div><div class="compare-col good"><span class="cc-label">Dynamic decomposition</span><p><strong>Task:</strong> "add comprehensive tests to a legacy codebase."</p><p><strong>Plan:</strong> first map the codebase's structure, identify high-impact untested areas, then build a prioritized task list — which only takes shape once the mapping step reveals what's actually there.</p><p>Committing to a fixed task list before looking at the code would mean guessing at a structure you haven't seen yet.</p></div></div><p>The judgment call is which one you're facing: if you can describe the full task breakdown before doing any work, it's prompt chaining; if the right next step depends on what the previous step finds, it's dynamic decomposition — and forcing a dynamic problem into a fixed chain is exactly how you end up with the overly-narrow-decomposition failure from the previous section.</p>`
          },
          {
            heading: "Session state: resumption and forking",
            body: "<p>Named session resumption (<code>--resume &lt;session-name&gt;</code>) continues a specific prior conversation — useful for picking a long investigation back up across work sessions. <code>fork_session</code> instead creates an independent branch from a shared analysis baseline, letting you explore divergent approaches (e.g., comparing two testing strategies) without the branches interfering with each other.</p><p>The judgment call is between resuming and starting fresh: if the underlying files changed since a session was paused, you must explicitly inform the resumed session about those changes, or it will reason from stale tool results. When prior tool results are stale enough that they'd mislead more than help, starting a new session with a structured summary injected into the initial context is more reliable than resuming and hoping the agent notices the drift.</p><p>A concrete case: you pause a long codebase investigation on Friday with the agent holding a detailed mental model of a module's structure. Over the weekend, a teammate refactors that exact module. On Monday, resuming with <code>--resume</code> silently carries forward Friday's now-wrong structure unless you explicitly tell the resumed session what changed — the agent has no way to know the weekend happened. In that case, either inject a short \"here's what changed since Friday\" note into the resumed session, or start fresh and let it re-read the current state; don't resume silently and assume it'll notice.</p>"
          }
        ],
        checks: [
          {
            type: "single",
            question: "A response comes back with stop_reason: \"tool_use\". What should the agentic loop do next?",
            options: [
              "Present the response content to the user as the final answer.",
              "Execute the requested tool(s), append the results to conversation history, and send another request.",
              "Terminate the loop immediately regardless of content.",
              "Wait for the user to manually approve continuing."
            ],
            correct: [1],
            explanation: "stop_reason: \"tool_use\" means Claude wants to call a tool before it can finish; the loop must execute the tool(s), feed the results back into the conversation, and continue. Only stop_reason: \"end_turn\" signals the response is final."
          },
          {
            type: "single",
            question: "A coordinator delegates a broad research topic to subagents, and the final report is well-written but only covers a fraction of the requested scope. The subagents each executed their assigned subtasks correctly. What's the most likely architectural cause?",
            options: [
              "The subagents ignored their instructions.",
              "The coordinator's task decomposition was too narrow, so the subagents were never assigned the missing scope in the first place.",
              "The model's context window is too small to cover broad topics.",
              "The synthesis step used the wrong output format."
            ],
            correct: [1],
            explanation: "When every subagent executes its assigned task correctly but the aggregate output still misses large parts of the topic, the defect is upstream — in how the coordinator decomposed the task, not in subagent execution."
          },
          {
            type: "single",
            question: "A workflow must guarantee that a refund tool is never called before a customer-identity-verification tool has returned a verified ID. Prompt instructions alone haven't been reliable enough. What's the appropriate fix?",
            options: [
              "Add a programmatic prerequisite (e.g., a hook) that blocks the refund tool call until verification has completed.",
              "Reword the system prompt to state the requirement more forcefully.",
              "Add a few more few-shot examples showing the correct order.",
              "Increase the model's reasoning effort for this workflow."
            ],
            correct: [0],
            explanation: "When deterministic compliance is required, programmatic enforcement (a hook or prerequisite gate) is the correct tool — prompt-based guidance, however well-worded, remains probabilistic and has a non-zero failure rate."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "Production data shows that in 12% of cases, your agent skips get_customer entirely and calls lookup_order using only the customer's stated name, occasionally leading to misidentified accounts and incorrect refunds. What change would most effectively address this reliability issue?",
          options: [
            "Add a programmatic prerequisite that blocks lookup_order and process_refund calls until get_customer has returned a verified customer ID.",
            "Enhance the system prompt to state that customer verification via get_customer is mandatory before any order operations.",
            "Add few-shot examples showing the agent always calling get_customer first, even when customers volunteer order details.",
            "Implement a routing classifier that analyzes each request and enables only the subset of tools appropriate for that request type."
          ],
          correct: [0],
          explanation: "When a specific tool sequence is required for critical business logic (like verifying customer identity before processing refunds), programmatic enforcement provides deterministic guarantees that prompt-based approaches cannot. Options B and C rely on probabilistic LLM compliance, which is insufficient when errors have financial consequences. Option D addresses tool availability rather than tool ordering, which is not the actual problem.",
          source: "official"
        },
        {
          type: "single",
          question: "After running the system on the topic \"impact of AI on creative industries,\" you observe that each subagent completes successfully: the web search agent finds relevant articles, the document analysis agent summarizes papers correctly, and the synthesis agent produces coherent output. However, the final reports cover only visual arts, completely missing music, writing, and film production. When you examine the coordinator's logs, you see it decomposed the topic into three subtasks: \"AI in digital art creation,\" \"AI in graphic design,\" and \"AI in photography.\" What is the most likely root cause?",
          options: [
            "The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives from other agents.",
            "The coordinator agent's task decomposition is too narrow, resulting in subagent assignments that don't cover all relevant domains of the topic.",
            "The web search agent's queries are not comprehensive enough and need to be expanded to cover more creative industry sectors.",
            "The document analysis agent is filtering out sources related to non-visual creative industries due to overly restrictive relevance criteria."
          ],
          correct: [1],
          explanation: "The coordinator's logs reveal the root cause directly: it decomposed \"creative industries\" into only visual arts subtasks (digital art, graphic design, photography), completely omitting music, writing, and film. The subagents executed their assigned tasks correctly — the problem is what they were assigned. Options A, C, and D incorrectly blame downstream agents that are working correctly within their assigned scope.",
          source: "official"
        },
        {
          type: "single",
          question: "Which stop_reason value should cause an agentic loop to terminate and present the current response as the final answer?",
          options: [
            "\"tool_use\"",
            "\"end_turn\"",
            "Any stop_reason, as long as the assistant produced some text content",
            "The loop should never terminate automatically; a human must always approve stopping"
          ],
          correct: [1],
          explanation: "stop_reason: \"end_turn\" is the model's signal that it has no further tool calls to make. \"tool_use\" means the opposite — the loop must continue. Checking for assistant text content instead of stop_reason is one of the documented anti-patterns."
        },
        {
          type: "single",
          question: "Which of the following is a documented anti-pattern for agentic loop termination?",
          options: [
            "Checking response.stop_reason after every request.",
            "Continuing the loop whenever stop_reason is \"tool_use\".",
            "Using an arbitrary iteration cap as the primary mechanism for deciding when the loop is done.",
            "Appending tool results to conversation history before the next request."
          ],
          correct: [2],
          explanation: "Iteration caps are a reasonable safety net, but using one as the primary stopping mechanism (instead of stop_reason) is an anti-pattern — it will cut off legitimate multi-step work and mask cases where the loop should have stopped much earlier."
        },
        {
          type: "single",
          question: "In a hub-and-spoke multi-agent architecture, why does all subagent communication route through the coordinator rather than subagents talking directly to each other?",
          options: [
            "It's a hard technical limitation of the Agent SDK.",
            "It gives the system a single place for observability, consistent error handling, and controlled information flow.",
            "It reduces the number of subagents that can be spawned.",
            "It's required so subagents automatically inherit each other's context."
          ],
          correct: [1],
          explanation: "Hub-and-spoke is a design choice, not a technical constraint — routing everything through the coordinator centralizes observability and error handling and gives the coordinator control over how information flows between subagents."
        },
        {
          type: "single",
          question: "What must a coordinator agent's allowedTools configuration include for it to be able to spawn subagents at all?",
          options: [
            "\"Bash\"",
            "\"Task\"",
            "\"Read\" and \"Write\"",
            "Nothing extra — subagent spawning requires no tool permission"
          ],
          correct: [1],
          explanation: "The Task tool is the mechanism for spawning subagents. If \"Task\" isn't in the coordinator's allowedTools, it has no way to invoke subagents, regardless of what other tools it has."
        },
        {
          type: "single",
          question: "A coordinator passes only \"see the earlier research\" to a synthesis subagent, assuming it will have access to everything the search and analysis subagents found. What will actually happen?",
          options: [
            "The synthesis subagent automatically inherits the full coordinator conversation history.",
            "The synthesis subagent has no access to those findings unless they were explicitly included in its prompt — subagents don't share memory between invocations.",
            "The synthesis subagent will request the missing context from the other subagents directly.",
            "The system will throw a configuration error at spawn time."
          ],
          correct: [1],
          explanation: "Subagents run with isolated context. They do not automatically inherit the coordinator's conversation history or share memory with sibling subagents — any needed findings must be explicitly included in the subagent's prompt."
        },
        {
          type: "multi",
          question: "Which two of the following describe correct ways to spawn subagents in parallel rather than sequentially? (Select 2)",
          options: [
            "Emit multiple Task tool calls within a single coordinator response/turn.",
            "Issue one Task call per coordinator turn, waiting for each to complete before issuing the next.",
            "Rely on the subagents to coordinate timing with each other after being spawned.",
            "Structure the coordinator's response so independent Task calls appear together rather than split across separate turns."
          ],
          correct: [0, 3],
          explanation: "Parallel subagent execution comes from emitting multiple Task calls together in one coordinator turn. Issuing them one per turn (waiting on each) is sequential, not parallel, and subagents have no mechanism to coordinate timing with each other directly."
        },
        {
          type: "single",
          question: "When is fork_session the right tool, versus a plain --resume?",
          options: [
            "When you want to permanently delete a prior session's history.",
            "When you want to explore two or more divergent approaches from a shared analysis baseline without the branches interfering with each other.",
            "When the underlying source files have not changed since the session was paused.",
            "When you need a subagent to inherit the coordinator's full context automatically."
          ],
          correct: [1],
          explanation: "fork_session creates independent branches from a shared baseline specifically so you can explore divergent approaches (e.g., comparing two refactoring strategies) in isolation from each other. --resume instead continues a single named session in place."
        },
        {
          type: "single",
          question: "A session is resumed with --resume after the underlying files it had analyzed were modified outside the session. What's the risk if you don't address this?",
          options: [
            "The session will refuse to resume.",
            "The agent may reason from stale tool results, since it isn't automatically aware the files changed.",
            "The session will automatically re-run all prior tool calls to refresh its state.",
            "There is no risk — resumed sessions always re-verify file contents first."
          ],
          correct: [1],
          explanation: "A resumed session doesn't automatically know that previously analyzed files have changed. You must explicitly inform it of the changes, or it will keep reasoning from now-stale tool results — sometimes starting a fresh session with an injected structured summary is more reliable."
        },
        {
          type: "single",
          question: "A developer implements a support agent's loop as: send request, check whether the response text contains the phrase \"anything else I can help with,\" and terminate if it does. In testing it works, but in production the loop sometimes stops mid-investigation and other times keeps looping after Claude has clearly finished. What's the root cause?",
          options: [
            "The loop is parsing natural-language signals to determine termination instead of checking stop_reason, so it terminates on incidental phrasing and misses genuine completion.",
            "The model's temperature is too high, making its closing phrasing inconsistent.",
            "The tool results aren't being appended to conversation history between iterations.",
            "The loop needs a lower max_tokens so responses end more predictably."
          ],
          correct: [0],
          explanation: "Parsing natural-language text to detect loop termination is a documented anti-pattern for exactly this reason: phrasing is incidental, so the loop stops when Claude happens to say a courtesy phrase mid-investigation and continues when it finishes without it. stop_reason is the actual control signal — \"tool_use\" means continue, \"end_turn\" means stop. Option B treats a symptom of the wrong design; no temperature makes prose a reliable control channel. Option C describes a different bug that would break reasoning, not termination timing. Option D truncates responses without addressing what decides termination."
        },
        {
          type: "single",
          question: "In your Multi-Agent Research System, the coordinator routes every query — however simple — through the full pipeline: web search, then document analysis, then synthesis, then report generation. A user asks a narrow factual question that one search would answer. What design improvement does this suggest?",
          options: [
            "Design the coordinator to analyze query requirements and dynamically select which subagents to invoke, rather than always routing through the full pipeline.",
            "Reduce the number of subagents in the system so the pipeline is inherently shorter.",
            "Let each subagent decide whether to pass work to the next one, removing the coordinator from routing.",
            "Cache prior pipeline results so repeated simple queries skip the pipeline."
          ],
          correct: [0],
          explanation: "A well-designed coordinator analyzes query requirements and dynamically selects which subagents to invoke based on complexity, rather than always running the full pipeline. Option B degrades the system's capability on the complex queries the subagents exist for. Option C breaks hub-and-spoke: subagents routing to each other destroys the coordinator's observability and centralized error handling. Option D helps only on exact repeats, leaving every novel simple query paying full pipeline cost."
        },
        {
          type: "single",
          question: "Your research coordinator dispatches four subagents on \"renewable energy storage,\" and the final report repeats the same three studies in four different sections. Each subagent worked correctly. What's the coordinator-level fix?",
          options: [
            "Partition research scope across subagents so each has a distinct subtopic or source type, minimizing duplication.",
            "Instruct the synthesis agent to deduplicate findings before writing the report.",
            "Reduce to a single subagent, since parallel agents inevitably duplicate work.",
            "Have each subagent check what the others have already found before searching."
          ],
          correct: [0],
          explanation: "Partitioning research scope across subagents — assigning distinct subtopics or source types to each — is the documented way to minimize duplication, and it fixes the problem at its source: the assignments overlapped. Option B papers over redundant work after paying for it, and deduplication can't recover the coverage those four agents never went after. Option C discards parallelism to solve a decomposition problem. Option D requires subagent-to-subagent communication, which hub-and-spoke architecture specifically routes through the coordinator."
        },
        {
          type: "multi",
          question: "Your coordinator's synthesis output on a broad research topic reads coherently but omits several relevant areas. Which two changes address this at the architectural level? (Select 2)",
          options: [
            "Implement an iterative refinement loop where the coordinator evaluates synthesis output for coverage gaps and re-delegates targeted queries before finalizing.",
            "Have the coordinator decompose broadly and check the synthesized output against the original scope rather than treating the first pass as final.",
            "Increase each subagent's max_tokens so their findings are more thorough.",
            "Add more subagents to the pipeline so more ground is covered by volume."
          ],
          correct: [0, 1],
          explanation: "Both correct answers describe the same architectural insight: the coordinator must treat the first pass as a draft, evaluate it against the original scope for gaps, re-delegate targeted queries, and re-invoke synthesis until coverage is sufficient. Option C makes each subagent more verbose within an assignment that was already too narrow — the gap isn't depth, it's scope. Option D adds capacity without fixing decomposition; more subagents pointed at the same narrow subtopics still miss the same areas."
        },
        {
          type: "single",
          question: "Your Customer Support agent receives MCP tool results where get_customer returns Unix timestamps, lookup_order returns ISO 8601 strings, and a legacy tool returns numeric status codes. The agent frequently misreads dates and statuses. What's the cleanest architectural fix?",
          options: [
            "Implement a PostToolUse hook that normalizes the heterogeneous formats before the model processes the results.",
            "Add a system prompt section explaining each tool's date format and status code mapping.",
            "Add few-shot examples showing correct interpretation of each format.",
            "Ask each backend team to change their APIs to return a common format."
          ],
          correct: [0],
          explanation: "PostToolUse hooks intercept tool results for transformation before the model processes them, which is exactly the documented use case for normalizing heterogeneous data formats (Unix timestamps, ISO 8601, numeric status codes). It's deterministic — the model never sees the inconsistency. Options B and C both rely on probabilistic interpretation of formats the agent shouldn't have to reason about at all, and add token overhead on every turn. Option D may be correct long-term but is out of your control and doesn't address the system you're shipping now."
        },
        {
          type: "single",
          question: "Company policy states that refunds above $500 require human approval. Your agent has a clear system prompt instruction to this effect, but audit logs show it occasionally processes larger refunds anyway. What's the appropriate architecture?",
          options: [
            "A hook that intercepts the outgoing process_refund call, blocks it when the amount exceeds $500, and redirects to the human escalation workflow.",
            "A stronger, more explicit system prompt instruction repeated at both the start and end of the prompt.",
            "A PostToolUse hook that detects over-limit refunds after they process and files a report for review.",
            "Few-shot examples showing the agent correctly escalating refunds above $500."
          ],
          correct: [0],
          explanation: "When business rules require guaranteed compliance, tool call interception that blocks the policy-violating action and redirects to an alternative workflow is the documented pattern — enforcement happens outside the model's judgment, so it can't be skipped. Options B and D remain probabilistic: prompt instructions and few-shot examples have a non-zero failure rate, which is unacceptable when the failure has direct financial consequences. Option C detects violations only after the money has moved, which is a reporting mechanism, not a control."
        },
        {
          type: "multi",
          question: "Which two situations are better served by prompt-based guidance than by a hook? (Select 2)",
          options: [
            "Preferring concise responses unless the customer asks for detail.",
            "Blocking any tool call that would delete files outside the project directory.",
            "Encouraging the agent to cite a knowledge-base article when explaining a policy.",
            "Requiring identity verification before any account-changing operation."
          ],
          correct: [0, 2],
          explanation: "Hooks add rigidity and engineering overhead, so they're reserved for rules that genuinely need a deterministic guarantee; soft preferences default to prompts. Response length (A) and citing an article (C) are quality preferences where an occasional miss costs nothing. Options B and D are exactly the opposite: a destructive irreversible action and a security-critical gate, where a non-zero prompt failure rate is unacceptable and a hook's guarantee is worth its cost."
        },
        {
          type: "single",
          question: "Your support agent escalates a billing dispute to a human. The human agent receives the handoff and immediately asks the customer to re-explain everything from the start, frustrating them further. What was missing from the escalation design?",
          options: [
            "A structured handoff summary containing the customer ID, root cause analysis, refund amount, and recommended action.",
            "A copy of the full conversation transcript pasted into the ticket.",
            "A confidence score indicating how certain the agent was about the escalation.",
            "A faster escalation trigger so the handoff happened earlier in the conversation."
          ],
          correct: [0],
          explanation: "Human agents receiving a mid-process escalation typically lack access to the conversation transcript, so the documented pattern is compiling a structured handoff summary — customer ID, root cause, amount, recommended action — that lets them pick up immediately. Option B dumps raw material that requires the human to reconstruct the analysis the agent already did. Option C tells the human about the agent's certainty, not about the customer's problem. Option D changes when the handoff happens without fixing what it carries."
        },
        {
          type: "single",
          question: "A coordinator spawns a synthesis subagent with the prompt: \"Synthesize the research findings into a cited report.\" The subagent returns a fluent report citing sources that were never retrieved. What happened?",
          options: [
            "The subagent received no actual findings — subagent context must be explicitly provided in the prompt — so it had nothing to synthesize and generated plausible-looking content instead.",
            "The synthesis subagent's AgentDefinition granted it web-search tools it used incorrectly.",
            "The coordinator's allowedTools was missing \"Task\", so the subagent ran without configuration.",
            "The findings exceeded the subagent's context window and were silently truncated."
          ],
          correct: [0],
          explanation: "Subagents don't inherit the coordinator's conversation history or share memory between invocations — \"the research findings\" refers to nothing the subagent can see. Given an instruction to produce a cited report and no findings, fabrication is the predictable result. Option B would produce real (if poorly-chosen) sources rather than invented ones. Option C is wrong: without \"Task\" the coordinator couldn't have spawned the subagent at all. Option D describes truncation of context that was never passed in the first place."
        },
        {
          type: "single",
          question: "You're configuring a document-analysis subagent type that should never perform web searches or write files, and should always return findings in a fixed structure. Where does this configuration belong?",
          options: [
            "In the subagent's AgentDefinition, which specifies its description, system prompt, and tool restrictions.",
            "In the coordinator's system prompt, as instructions about how the subagent should behave.",
            "In a PostToolUse hook attached to the subagent's outputs.",
            "In the Task tool call's prompt, restated on every invocation."
          ],
          correct: [0],
          explanation: "AgentDefinition is the configuration mechanism for each subagent type, covering its description, system prompt, and tool restrictions — exactly the three things specified here. Option B puts the subagent's constraints somewhere the subagent never reads, since it doesn't inherit the coordinator's context. Option C could inspect outputs but can't restrict which tools the subagent may call. Option D would work for the prompt portion but restates it on every call and still can't enforce tool restrictions."
        },
        {
          type: "multi",
          question: "A synthesis agent produces reports where claims can't be traced back to their sources, even though the upstream search agent had the URLs. Which two practices address this at the handoff? (Select 2)",
          options: [
            "Use structured data formats that separate content from metadata (source URLs, document names, page numbers) when passing context between agents.",
            "Include the complete findings from prior agents directly in the synthesis subagent's prompt rather than referring to them.",
            "Instruct the synthesis agent to reconstruct likely sources for each claim from its own knowledge.",
            "Have the synthesis agent call the search agent directly whenever it needs a citation."
          ],
          correct: [0, 1],
          explanation: "Attribution survives a handoff only if it's carried structurally: using formats that separate content from metadata preserves source URLs and page numbers through the transfer, and complete findings must be included directly in the subagent's prompt since subagents inherit nothing. Option C is a recipe for fabricated citations — reconstructing sources from model knowledge is guessing. Option D violates hub-and-spoke by having subagents communicate directly, bypassing the coordinator's routing and observability."
        },
        {
          type: "single",
          question: "A coordinator prompt specifies exactly which three search queries the web-search subagent must run and in what order. Results are consistently shallow, missing obvious angles a human researcher would have pursued. What principle does this violate?",
          options: [
            "Coordinator prompts should specify research goals and quality criteria rather than step-by-step procedural instructions, so subagents can adapt.",
            "Coordinators should never constrain subagent behavior; subagents work best fully autonomous.",
            "Search queries should be generated by a separate query-planning subagent.",
            "The coordinator should run the searches itself rather than delegating them."
          ],
          correct: [0],
          explanation: "Designing coordinator prompts around research goals and quality criteria rather than step-by-step procedures is what enables subagent adaptability — a hard-coded query list can't respond to what the first result reveals. Option B overcorrects: goals and quality criteria are constraints, and useful ones. Option C adds a layer that would face the identical problem if prompted procedurally. Option D collapses the delegation the architecture exists for and hands the coordinator's context budget to raw search output."
        },
        {
          type: "single",
          question: "You need Claude Code to review a 12-file pull request. A single pass produces uneven depth and contradictory findings. Which decomposition pattern fits, and why?",
          options: [
            "Prompt chaining — the task breakdown is knowable upfront: analyze each file individually, then run a cross-file integration pass.",
            "Dynamic decomposition — the subtasks can only be determined after seeing what the first file reveals.",
            "No decomposition — the review should be a single pass with a larger context window.",
            "Fork the session 12 times, once per file, and merge the results."
          ],
          correct: [0],
          explanation: "Prompt chaining fits predictable multi-aspect work where you can describe the full breakdown before starting — and for a code review you can: one pass per file, plus an integration pass. Option B misapplies dynamic decomposition, which is for open-ended investigation where the next step depends on what the last one found; a file list is known upfront. Option C keeps the attention dilution that caused the contradictory findings. Option D uses fork_session for parallel file processing rather than its purpose — exploring divergent approaches from a shared baseline."
        },
        {
          type: "single",
          question: "A team asks Claude Code to \"add comprehensive tests to our legacy billing module.\" Which decomposition approach fits this task?",
          options: [
            "Dynamic decomposition — first map the module's structure, identify high-impact untested areas, then build a prioritized plan that adapts as dependencies are discovered.",
            "Prompt chaining — write one test file per source file, in alphabetical order.",
            "Delegate the entire task to a single subagent with no decomposition.",
            "Use plan mode to produce a fixed task list, then execute it without revision."
          ],
          correct: [0],
          explanation: "Open-ended tasks like adding comprehensive tests to a legacy codebase call for dynamic decomposition: map structure, identify high-impact areas, then create a prioritized plan that adapts as dependencies surface — you can't specify the right subtasks before seeing what's there. Option B commits to a fixed breakdown that ignores which areas actually carry risk. Option C skips decomposition entirely on a task whose difficulty is its scope. Option D captures the planning half but freezes the plan, discarding the adaptation that makes this pattern work."
        },
        {
          type: "single",
          question: "You've analyzed a codebase and want to compare two refactoring strategies against that same understanding, without either exploration contaminating the other. Which mechanism fits?",
          options: [
            "fork_session, to create independent branches from the shared analysis baseline.",
            "--resume with a different session name for each strategy.",
            "Two Task calls emitted in the same turn, one per strategy.",
            "The Explore subagent, run twice with different prompts."
          ],
          correct: [0],
          explanation: "fork_session creates independent branches from a shared analysis baseline specifically to explore divergent approaches — the codebase analysis is done once and both branches inherit it without interfering. Option B continues named sessions in place; it doesn't branch from a shared baseline. Option C spawns subagents that inherit no context, so each would have to redo the analysis from scratch. Option D is for isolating verbose discovery output, and would likewise discard the shared baseline."
        },
        {
          type: "single",
          question: "A customer message reads: \"My order is late, I was double-charged, and I want to update my shipping address.\" What's the recommended way for the agent to handle it?",
          options: [
            "Decompose the message into distinct concerns, investigate each using shared context, then synthesize a unified resolution.",
            "Handle the first concern raised and ask the customer to open separate tickets for the others.",
            "Escalate immediately, since multi-concern requests exceed an agent's reliable handling.",
            "Process all three with a single tool call that accepts multiple concerns."
          ],
          correct: [0],
          explanation: "The documented pattern is decomposing multi-concern requests into distinct items, investigating each in parallel using shared context, then synthesizing one unified resolution — the customer gets a single coherent answer. Option B pushes work back to the customer and forfeits first-contact resolution. Option C treats message complexity as case complexity; each concern here may be individually routine, and complexity alone isn't an escalation trigger. Option D invents a tool shape that doesn't address how each concern gets investigated."
        }
      ],
      flashcards: [
        { front: "What does an AgentDefinition configure?", back: "Each subagent type's description, system prompt, and tool restrictions." },
        { front: "How should a coordinator partition research scope across subagents?", back: "Assign each a distinct subtopic or source type, to minimize duplication of effort." },
        { front: "Why specify goals and quality criteria in a coordinator prompt rather than step-by-step procedures?", back: "So subagents can adapt their approach to what they find — a hard-coded procedure can't respond to what the first result reveals." },
        { front: "How should findings be formatted when passed between agents?", back: "Structured formats that separate content from metadata (source URLs, document names, page numbers), so attribution survives the handoff." },
        { front: "What does stop_reason \"tool_use\" tell the agentic loop to do?", back: "Continue: execute the requested tool(s) and feed the results back into conversation history for the next iteration." },
        { front: "What does stop_reason \"end_turn\" signal?", back: "The model has no more tool calls to make; present the response as the final answer and stop looping." },
        { front: "Name three agentic-loop anti-patterns to avoid.", back: "Parsing natural-language text to detect loop termination; using an arbitrary iteration cap as the primary stop condition; checking for assistant text content instead of stop_reason." },
        { front: "What is hub-and-spoke orchestration?", back: "A coordinator agent manages all inter-subagent communication, error handling, and information routing; subagents don't talk to each other directly." },
        { front: "Do subagents automatically inherit the coordinator's conversation history?", back: "No — context must be explicitly included in each subagent's prompt; subagents run with isolated context and no memory between invocations." },
        { front: "What must a coordinator's allowedTools include to spawn subagents?", back: "\"Task\" — the Task tool is the mechanism for spawning subagents." },
        { front: "How do you spawn subagents in parallel rather than sequentially?", back: "Emit multiple Task tool calls within a single coordinator response/turn, rather than issuing them across separate turns." },
        { front: "What's the risk of overly narrow task decomposition by a coordinator?", back: "Incomplete coverage of a broad topic — subagents execute correctly, but on an assignment that never covered the full scope." },
        { front: "When should you use a hook instead of a prompt instruction to enforce a rule?", back: "When deterministic compliance is required (e.g., identity verification before a refund) — prompt instructions alone have a non-zero failure rate." },
        { front: "What does a PostToolUse hook typically do?", back: "Intercepts tool results (or calls) to transform/normalize data, or to block a policy-violating action, before the model processes it." },
        { front: "What belongs in a structured handoff to a human escalation, and why?", back: "Customer ID, root cause, and recommended action — because the human agent lacks access to the full conversation transcript." },
        { front: "Prompt chaining vs. dynamic decomposition — when does each fit?", back: "Prompt chaining (fixed sequential steps) fits predictable multi-aspect reviews; dynamic decomposition (subtasks generated from what's discovered) fits open-ended investigation." },
        { front: "What does fork_session let you do?", back: "Create independent branches from a shared analysis baseline to explore divergent approaches (e.g., comparing two refactoring strategies)." },
        { front: "When is starting a fresh session better than --resume?", back: "When prior tool results are stale (e.g., the underlying files changed) — inject a structured summary into a new session rather than resuming with outdated context." }
      ]
    },
    {
      id: "d2",
      title: "Tool Design & MCP Integration",
      weight: 18,
      summary: "Designing MCP tool interfaces that route reliably, fail informatively, and integrate cleanly into Claude Code and agent workflows.",
      objectives: [
        "Design effective tool interfaces with clear descriptions and boundaries",
        "Implement structured error responses for MCP tools",
        "Distribute tools appropriately across agents and configure tool choice",
        "Integrate MCP servers into Claude Code and agent workflows",
        "Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively"
      ],
      lesson: {
        sections: [
          {
            heading: "Tool descriptions are the routing mechanism",
            body: `<p>Tool <em>descriptions</em> are the primary mechanism an LLM uses for tool selection — not the tool's name, not its implementation, not its parameter types. This is the single most load-bearing fact in this domain, and it has a direct corollary: <strong>a tool-selection bug is usually a writing bug.</strong> Minimal descriptions ("Retrieves customer information" / "Retrieves order details") lead to unreliable selection among similar tools, because the model has no basis on which to differentiate them.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Two unlabelled light switches by the door. You know one is the porch and one is the hall, but nothing on the wall tells you which — so every time you reach for one you're guessing, and you're right about half the time. Adding a strongly worded note above them ("please use the correct switch!") changes nothing; the information you need simply isn't there. Labelling each switch does. A tool description is the label: if two tools look the same to the model at the moment of choosing, no amount of instruction elsewhere fixes that.</div><p>A description that actually routes reliably carries four things: the <strong>input formats</strong> it accepts, one or two <strong>example queries</strong>, the <strong>edge cases</strong> it does and doesn't handle, and an explicit <strong>boundary</strong> — when to use this tool <em>versus</em> the similar alternative sitting next to it.</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ Thin — nothing to route on</span><code>lookup_order:<br>"Retrieves order details"</code><p>Given "check my order for j.rivera@example.com", is this the right tool? It takes an order ID — but nothing here says so, and <code>get_customer</code>'s description ("Retrieves customer information") is equally vague. The model guesses.</p></div><div class="compare-col good"><span class="cc-label">✓ Rich — routes on its own</span><code>lookup_order:<br>"Fetch one order by its order ID<br>(format: #NNNN, e.g. #8842).<br>Returns status, ship date, line<br>items, refund eligibility.<br>Requires an order ID — if you<br>only have a name or email, call<br>get_customer first to resolve<br>the customer, then their orders."</code><p>Input format, an example, the return shape, and an explicit boundary pointing at the neighbouring tool. There is nothing left to guess.</p></div></div><p>Two failure modes recur in production. The first is <strong>ambiguous or overlapping descriptions</strong>: an <code>analyze_content</code> tool and an <code>analyze_document</code> tool with near-identical wording, where the model genuinely cannot tell which is which — so it misroutes, roughly at chance. The fixes are to <em>rename and re-describe</em> to eliminate the overlap (renaming <code>analyze_content</code> to <code>extract_web_results</code> with a web-specific description), or to <em>split</em> an overly generic tool into purpose-specific tools with defined input/output contracts (<code>analyze_document</code> becoming <code>extract_data_points</code>, <code>summarize_content</code>, and <code>verify_claim_against_source</code>).</p><p>The second failure mode is subtler and easy to miss when you're debugging: <strong>keyword-sensitive system prompt wording can create unintended tool associations that override otherwise well-written tool descriptions.</strong> A system prompt line like "always start by looking up the customer's documents" can pull every request containing the word <em>document</em> toward <code>analyze_document</code>, no matter how carefully you described the alternatives. Here's the trap: you'll be staring at the tool definitions looking for the bug, and it isn't there. When descriptions look right and routing is still wrong, read the system prompt for keywords that collide with your tool names.</p>`,
            interactive: {
              type: "scenario",
              title: "Two tools, one coin flip",
              setup: "Your Developer Productivity agent has two tools: analyze_content (\"Analyzes content and returns insights\") and analyze_document (\"Analyzes documents and returns insights\"). Logs show web pages get sent to analyze_document about half the time, and the resulting analyses are wrong in ways that are hard to spot. What's your move?",
              choices: [
                {
                  text: "Add a line to the system prompt: \"Use analyze_content for web pages and analyze_document for uploaded files.\"",
                  outcome: "bad",
                  feedback: "This patches over the descriptions instead of fixing them, and it's fragile: you're now relying on a system-prompt instruction to override two tool descriptions that still say the same thing as each other. Worse, keyword-sensitive prompt wording is itself a documented source of unintended tool associations — you may trade a coin flip for a differently-biased coin flip."
                },
                {
                  text: "Rename and re-describe so each tool's purpose, inputs, and boundary are unambiguous — analyze_content becomes extract_web_results with a web-specific description, and analyze_document is split into extract_data_points, summarize_content, and verify_claim_against_source.",
                  outcome: "good",
                  feedback: "Right on both counts. Renaming plus a purpose-specific description removes the overlap at its source, and splitting the overloaded tool means each remaining description can be precise about exactly one job. Selection is now driven by the mechanism the model actually uses — the descriptions themselves."
                },
                {
                  text: "Consolidate both into a single analyze(source_type, content) tool and let the agent set source_type.",
                  outcome: "bad",
                  feedback: "This relocates the ambiguity rather than removing it. The model still has to make the same judgment call — it just makes it in a parameter now instead of in tool selection, where it's harder to observe. Consolidation is a legitimate architectural choice, but it doesn't help when the underlying problem is that nothing distinguishes the two cases."
                }
              ]
            }
          },
          {
            heading: "Structured error responses: telling the agent what kind of broken",
            body: `<p>MCP's <code>isError</code> flag is the pattern for communicating a tool failure back to the agent. But a bare flag with a uniform <code>"Operation failed"</code> message prevents the agent from making an appropriate recovery decision — it can't tell a transient network timeout from a permission denial from a business-rule violation, and those three demand completely different behavior. Structured error metadata fixes this:</p><pre><code>{
  "isError": true,
  "errorCategory": "business",
  "isRetryable": false,
  "message": "Refund of $620 exceeds the $500 auto-approval limit; route to human review."
}</code></pre><div class="callout analogy"><span class="callout-label">Think of it like...</span>A HTTP 500 for everything. Your service is down? 500. You sent a malformed request? 500. You're not authorized? 500. The caller has no way to know whether to retry, fix the payload, or go get a credential — so it either retries forever or gives up on everything. Status codes exist because the <em>category</em> of failure determines the correct response, and the caller can't infer it from a generic message. <code>errorCategory</code> and <code>isRetryable</code> are that same idea, aimed at a reader that reasons in natural language.</div><p>Four categories are worth distinguishing, each mapping to a different agent behavior:</p><ul><li><strong>Transient</strong> (timeouts, service unavailability) — retry, possibly after a wait. <code>isRetryable: true</code>.</li><li><strong>Validation</strong> (invalid input) — fix the arguments and call again. Retryable, but only with a <em>changed</em> request.</li><li><strong>Business</strong> (policy violations) — never retry; explain the limit to the user, or route to the escalation path. <code>isRetryable: false</code>, plus a customer-friendly explanation the agent can actually say out loud.</li><li><strong>Permission</strong> — never retry; the identical call will fail identically forever.</li></ul><p>The <code>isRetryable</code> boolean is what prevents the most expensive failure mode here: an agent burning turns (and your rate limit) retrying a permission error that was never going to succeed. Note the interaction with the business category specifically — a business error needs a human-readable explanation attached, because the agent's job on receiving it isn't to recover, it's to <em>communicate</em>. "Refund of $620 exceeds the $500 auto-approval limit" gives it something to say; "Operation failed" leaves it to invent something.</p><p>There's one more distinction that trips people up, and it isn't about error categories at all: <strong>access failures versus valid empty results.</strong> An access failure means the query couldn't be completed — that needs a retry decision. A valid empty result means the query ran perfectly and legitimately found nothing. Here's the trap: both can look like "no data came back." Conflate them and your agent either retries a query that already worked, or reports "no orders found" for a customer whose order lookup actually timed out. The first wastes turns; the second gives a customer wrong information with total confidence. An empty result set is a <em>success</em> and should never carry <code>isError</code>.</p>`,
            interactive: {
              type: "classify",
              title: "What kind of broken is this?",
              instructions: "Each tool call below failed. Sort each into the error category that tells the agent how to respond. The category determines behavior: retry, fix the input, explain a policy, or stop.",
              items: [
                {
                  text: "The order service returned HTTP 503 after a 30-second timeout. It was healthy two minutes ago.",
                  answer: "transient",
                  options: [["transient", "⏱ Transient"], ["validation", "📝 Validation"], ["business", "📕 Business"], ["permission", "🔒 Permission"]],
                  why: "Service unavailability that may clear on its own — isRetryable: true, and the agent should try again rather than tell the customer anything is wrong."
                },
                {
                  text: "process_refund was called with amount: \"-40.00\".",
                  answer: "validation",
                  options: [["transient", "⏱ Transient"], ["validation", "📝 Validation"], ["business", "📕 Business"], ["permission", "🔒 Permission"]],
                  why: "Invalid input. Retrying the identical call fails identically — but retrying with corrected arguments succeeds, so the error message should say what was wrong with the input."
                },
                {
                  text: "The requested refund is $620. The auto-approval ceiling is $500.",
                  answer: "business",
                  options: [["transient", "⏱ Transient"], ["validation", "📝 Validation"], ["business", "📕 Business"], ["permission", "🔒 Permission"]],
                  why: "A policy rule, correctly enforced. Nothing is broken. isRetryable: false, plus a customer-friendly explanation — the agent's job here is to communicate the limit and route to human review, not to recover."
                },
                {
                  text: "The agent's service account isn't authorized to invoke escalate_to_human.",
                  answer: "permission",
                  options: [["transient", "⏱ Transient"], ["validation", "📝 Validation"], ["business", "📕 Business"], ["permission", "🔒 Permission"]],
                  why: "No amount of retrying grants a credential. isRetryable: false — this is a configuration problem for a human to fix, and the agent should stop rather than loop."
                },
                {
                  text: "lookup_order received order_id: \"my order from last Tuesday\" — not a valid order ID.",
                  answer: "validation",
                  options: [["transient", "⏱ Transient"], ["validation", "📝 Validation"], ["business", "📕 Business"], ["permission", "🔒 Permission"]],
                  why: "Malformed input the agent can actually fix — it should resolve the real order ID (via get_customer) and call again. A precise validation message is what makes that recovery possible."
                },
                {
                  text: "The order shipped 45 days ago. The refund window is 30 days.",
                  answer: "business",
                  options: [["transient", "⏱ Transient"], ["validation", "📝 Validation"], ["business", "📕 Business"], ["permission", "🔒 Permission"]],
                  why: "Another correctly-enforced policy rule, not a malfunction. The agent needs a human-readable reason it can explain to the customer — retrying is pointless and re-asking is worse."
                },
                {
                  text: "The MCP server's database is failing over to a replica; reads are rejected for about ten seconds.",
                  answer: "transient",
                  options: [["transient", "⏱ Transient"], ["validation", "📝 Validation"], ["business", "📕 Business"], ["permission", "🔒 Permission"]],
                  why: "Classic transient infrastructure blip. isRetryable: true — this is exactly the case a subagent should recover from locally rather than escalating to the coordinator."
                }
              ]
            }
          },
          {
            heading: "Distributing tools across agents and configuring tool_choice",
            body: `<p>Giving an agent access to too many tools — 18 when 4-5 would do — degrades tool-selection reliability by increasing decision complexity, <em>even when every individual description is well written</em>. This is worth sitting with, because it's counterintuitive: you can do the work from the previous section perfectly and still get unreliable routing, purely from the size of the menu.</p><p>Agents given tools outside their specialization also tend to misuse them. A synthesis agent that happens to have web-search access will sometimes attempt searches instead of synthesizing — not because the search tool is badly described, but because having a tool creates a pull toward using it. The fix is <strong>scoped tool access</strong>: give each agent only the tools relevant to its role.</p><p>But "scope everything tightly" isn't the whole rule, and the exception is where the real judgment lives. Consider the multi-agent research system: the synthesis agent constantly needs to verify small facts (dates, names, statistics) while combining findings. If it must return control to the coordinator, which invokes the web-search agent, which returns, which re-invokes synthesis — that's 2-3 round trips per fact, and latency climbs sharply. If 85% of those verifications are simple lookups and 15% need real investigation, the answer isn't "give synthesis the full web-search toolkit" (over-provisioning, reintroducing exactly the specialization misuse above) and it isn't "keep routing everything through the coordinator" (paying 2-3 round trips for the easy 85%). It's a <strong>scoped cross-role tool</strong>: a narrow <code>verify_fact</code> tool for the common simple case, with complex verification still delegated through the coordinator. Least privilege for the 85%, existing coordination for the 15%.</p><p>A related move is <strong>replacing a generic tool with a constrained alternative</strong> — swapping a wide-open <code>fetch_url</code> for a <code>load_document</code> that validates document URLs. The narrower tool is both harder to misuse and easier to describe precisely, which feeds straight back into selection reliability.</p><p><code>tool_choice</code> gives you a different kind of control — not <em>which</em> tools exist, but whether the model must use one at all:</p><ul><li><code>"auto"</code> — the model may call a tool, or may just return text. The default posture for conversational agents.</li><li><code>"any"</code> — the model <em>must</em> call some tool, but chooses which. Useful when several extraction schemas exist and the document type isn't known ahead of time: you need structured output, you just don't know which shape yet.</li><li><code>{"type": "tool", "name": "extract_metadata"}</code> — forced selection. The model must call that specific tool. This is how you guarantee a particular step runs first (metadata extraction before enrichment tools that depend on it), then handle subsequent steps in follow-up turns.</li></ul><div class="callout warn"><span class="callout-label">Watch out</span>Forced <code>tool_choice</code> guarantees a tool runs <em>on this turn</em> — it is not a workflow engine. If you need "A must always precede B" enforced across a whole conversation, that's a prerequisite gate or hook (Domain 1), not a <code>tool_choice</code> setting. Reaching for <code>tool_choice</code> to enforce multi-step ordering is a common and expensive mistake.</div>`
          },
          {
            heading: "MCP servers: scoping, credentials, and resources",
            body: `<p>MCP servers are configured at two scopes, and the split mirrors CLAUDE.md's exactly: <strong>project-level</strong> (<code>.mcp.json</code>, committed to the repo — shared team tooling) or <strong>user-level</strong> (<code>~/.claude.json</code> — personal or experimental servers nobody else sees). Environment-variable expansion lets a committed config reference credentials without committing the secret itself:</p><pre><code>{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "\${GITHUB_TOKEN}" }
    }
  }
}</code></pre><p>That <code>\${GITHUB_TOKEN}</code> is expanded from the environment at launch. The file in version control names the variable; the value lives in each developer's shell or the CI secret store. This is what makes a shared <code>.mcp.json</code> safe to commit at all.</p><p>Tools from every configured MCP server are <strong>discovered at connection time and available to the agent simultaneously</strong> — a personal server in <code>~/.claude.json</code> and the team's servers from <code>.mcp.json</code> coexist in one tool list. This is also where the too-many-tools problem from the previous section quietly creeps in: each server you add contributes its whole catalog to the same menu the model chooses from.</p><p>MCP <strong>resources</strong> are the other half of the protocol and are routinely underused. Where a tool performs an <em>action</em>, a resource exposes a <em>content catalog</em> — issue summaries, documentation hierarchies, database schemas. The payoff is fewer exploratory tool calls: an agent that can see the schema catalog directly doesn't need three speculative queries to work out what tables exist. If your agent burns its first several turns just orienting itself, that's the signal you want a resource, not another tool.</p><p>Two practical notes. First, <strong>prefer existing community MCP servers over custom implementations for standard integrations</strong> (Jira, GitHub) — reserve custom servers for genuinely team-specific workflows; writing your own Jira server is effort spent on a solved problem. Second, an MCP tool competes with the built-in tools for the model's attention: if a capable MCP tool has a thin description, the agent will often fall back to <code>Grep</code> and hand-roll what the MCP tool does properly. That's not a bug in the agent — it's the routing mechanism from section 1 doing exactly what it always does. Describe MCP tools' capabilities and outputs in enough detail that they win on merit.</p>`,
            interactive: {
              type: "sequence",
              title: "Order the MCP request/response cycle",
              instructions: "A developer types a request that needs the team's Jira MCP server. Put the steps in the order they actually happen — from cold start to the model reasoning over the result.",
              items: [
                { text: "Claude Code reads .mcp.json at startup, launches each configured MCP server, and expands ${GITHUB_TOKEN}-style env vars into the server's environment." },
                { text: "Each server responds to the connection handshake by advertising its catalog: tool names, descriptions, and input schemas." },
                { text: "Those discovered tool definitions join the built-in tools (Read, Grep, Bash…) in the single tool list sent to the model." },
                { text: "The model reads the descriptions, decides jira_search is the right tool for the request, and returns stop_reason \"tool_use\" with the call." },
                { text: "The client dispatches the call to whichever MCP server owns that tool." },
                { text: "The server executes it and returns either a result or a structured error envelope (isError, errorCategory, isRetryable)." },
                { text: "The result is appended to conversation history and sent back to the model, which reasons over it on the next iteration of the loop." }
              ],
              explanation: "Two things worth pinning down. First, discovery happens at connection time, not per-request: by the time the model sees anything, the tool list is already fixed — which is why adding servers grows the menu and why description quality is decided long before the model chooses. Second, the tail of this cycle is just Domain 1's agentic loop: a tool result gets appended to history and fed back, and the loop continues while stop_reason stays \"tool_use\". MCP doesn't add a new control flow; it populates the tool list the existing loop already uses."
            }
          },
          {
            heading: "Built-in tools: choosing the right instrument",
            body: `<p>The built-in tools divide along one axis worth memorizing: <strong>Grep searches file <em>contents</em>; Glob matches file <em>paths</em>.</strong> Nearly every built-in-tool question reduces to that distinction.</p><ul><li><strong>Grep</strong> — content search: find every caller of a function, locate an error-message string, find all imports of a module.</li><li><strong>Glob</strong> — path/name pattern matching: <code>**/*.test.tsx</code> to find test files, regardless of where they live.</li><li><strong>Read / Write</strong> — full-file operations.</li><li><strong>Edit</strong> — targeted modification via unique text matching.</li><li><strong>Bash</strong> — everything else. Reaching for it to do routine content search is a smell, not a shortcut.</li></ul><p>The named trap: <strong>Edit fails when its anchor text isn't unique in the file.</strong> If you try to edit <code>const result = await fetch(url);</code> and that exact line appears four times, Edit has no way to know which one you meant, and it will refuse rather than guess. The fallback is Read the full file, then Write the corrected version — which is why "Edit failed, so I'll Read + Write" is a normal, correct move rather than a workaround.</p><p>The bigger judgment call in this domain is <strong>how to build codebase understanding</strong> — the core of the Developer Productivity scenario, where an agent explores an unfamiliar legacy system:</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ Read everything upfront</span><p>Glob for <code>**/*.ts</code>, then Read all 340 files to "understand the codebase" before answering anything.</p><p>The context window fills with files that were never relevant, the genuinely important ones get lost in the middle, and by the time there's an actual question to answer the agent is reasoning over noise. This is the fastest way to turn a large codebase into a context-management problem.</p></div><div class="compare-col good"><span class="cc-label">✓ Build it incrementally</span><p>Grep for the entry point (<code>createServer</code>, the route table, the error string from the bug report). Read <em>that</em> file. Follow its imports with more targeted Reads, tracing the actual flow.</p><p>Every file that enters context earned its way in by being on the path to the answer. The agent ends up knowing less about the codebase overall and far more about the part that matters.</p></div></div><p>One specific technique worth knowing: <strong>tracing a function's usage across wrapper modules.</strong> A direct Grep for <code>processRefund</code> finds direct callers — but misses everything reaching it through a re-export or a wrapper under a different name. The reliable pattern is two-phase: first identify all the exported names (including re-exports and aliases), then search for each name across the codebase. Otherwise you'll confidently report three callers when there are eleven.</p>`
          }
        ],
        checks: [
          {
            type: "single",
            question: "Two MCP tools, get_customer and lookup_order, both accept similar identifier formats and have minimal one-line descriptions. The agent frequently calls the wrong one. What's the most effective first fix?",
            options: [
              "Rewrite both descriptions to include input formats, example queries, and explicit boundaries explaining when to use one versus the other.",
              "Rename the tools to something more memorable.",
              "Reduce the number of tools available to the agent to one.",
              "Increase the model's temperature so it explores tool choices more."
            ],
            correct: [0],
            explanation: "Tool descriptions are the primary signal an LLM uses for selection. When two tools have thin, overlapping descriptions, expanding them with input formats, examples, and explicit boundaries is the highest-leverage, lowest-effort fix."
          },
          {
            type: "single",
            question: "An MCP tool call fails and returns only {\"isError\": true, \"message\": \"Operation failed\"}. What's the main problem with this error response?",
            options: [
              "Nothing — isError is all an agent needs.",
              "It gives the agent no way to distinguish a transient failure worth retrying from a permission or business-rule failure that never will succeed.",
              "isError should be a string, not a boolean.",
              "The message field is unnecessary and should be removed."
            ],
            correct: [1],
            explanation: "A generic \"Operation failed\" message collapses transient, validation, business, and permission errors into one undifferentiated signal, preventing the agent from making an appropriate recovery decision. Structured fields like errorCategory and isRetryable fix this."
          },
          {
            type: "single",
            question: "You need to guarantee that a document-extraction agent always calls a metadata-extraction tool before any enrichment tool runs. Which tool_choice setting achieves this?",
            options: [
              "tool_choice: \"auto\"",
              "tool_choice: \"any\"",
              "Forced selection, e.g. {\"type\": \"tool\", \"name\": \"extract_metadata\"}",
              "There is no way to guarantee tool call ordering"
            ],
            correct: [2],
            explanation: "Forced tool selection requires the model to call that specific named tool on this turn, which is exactly what's needed to guarantee a particular step (like metadata extraction) runs first."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "Production logs show the agent frequently calls get_customer when users ask about orders (e.g., \"check my order #12345\"), instead of calling lookup_order. Both tools have minimal descriptions (\"Retrieves customer information\" / \"Retrieves order details\") and accept similar identifier formats. What's the most effective first step to improve tool selection reliability?",
          options: [
            "Add few-shot examples to the system prompt demonstrating correct tool selection patterns, with 5-8 examples showing order-related queries routing to lookup_order.",
            "Expand each tool's description to include input formats it handles, example queries, edge cases, and boundaries explaining when to use it versus similar tools.",
            "Implement a routing layer that parses user input before each turn and pre-selects the appropriate tool based on detected keywords and identifier patterns.",
            "Consolidate both tools into a single lookup_entity tool that accepts any identifier and internally determines which backend to query."
          ],
          correct: [1],
          explanation: "Tool descriptions are the primary mechanism LLMs use for tool selection. When descriptions are minimal, models lack the context to differentiate between similar tools. Option B directly addresses this root cause with a low-effort, high-leverage fix. Few-shot examples (A) add token overhead without fixing the underlying issue. A routing layer (C) is over-engineered and bypasses the LLM's natural language understanding. Consolidating tools (D) is a valid architectural choice but requires more effort than a \"first step\" warrants when the immediate problem is inadequate descriptions.",
          source: "official"
        },
        {
          type: "single",
          question: "During testing, you observe that the synthesis agent frequently needs to verify specific claims while combining findings. Currently, when verification is needed, the synthesis agent returns control to the coordinator, which invokes the web search agent, then re-invokes synthesis with results. This adds 2-3 round trips per task and increases latency by 40%. Your evaluation shows that 85% of these verifications are simple fact-checks (dates, names, statistics) while 15% require deeper investigation. What's the most effective approach to reduce overhead while maintaining system reliability?",
          options: [
            "Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator.",
            "Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass, which then sends them all to the web search agent at once.",
            "Give the synthesis agent access to all web search tools so it can handle any verification need directly without round-trips through the coordinator.",
            "Have the web search agent proactively cache extra context around each source during initial research, anticipating what the synthesis agent might need to verify."
          ],
          correct: [0],
          explanation: "Option A applies the principle of least privilege by giving the synthesis agent only what it needs for the 85% common case (simple fact verification) while preserving the existing coordination pattern for complex cases. Option B's batching approach creates blocking dependencies since synthesis steps may depend on earlier verified facts. Option C over-provisions the synthesis agent, violating separation of concerns. Option D relies on speculative caching that cannot reliably predict what the synthesis agent will need to verify.",
          source: "official"
        },
        {
          type: "single",
          question: "A generic analyze_document tool is used for extracting key data points, summarizing content, and checking claims against a source — and the agent frequently applies the wrong mode. What's the most robust architectural fix?",
          options: [
            "Add a mode parameter and hope the agent sets it correctly.",
            "Split the generic tool into purpose-specific tools with defined input/output contracts, e.g. extract_data_points, summarize_content, and verify_claim_against_source.",
            "Delete the tool entirely and have the agent do everything via prose.",
            "Rename the tool without changing its description."
          ],
          correct: [1],
          explanation: "Splitting an overloaded, generic tool into purpose-specific tools with clear, distinct contracts removes the ambiguity that caused misrouting in the first place — each tool's description can now be precise about exactly one job."
        },
        {
          type: "single",
          question: "Why does a structured error response include an errorCategory field distinguishing transient, validation, business, and permission errors, rather than just a boolean isError flag?",
          options: [
            "It doesn't matter — isError alone is sufficient for any agent.",
            "Different error categories call for different agent behavior (retry, fix input, explain a policy limit, or stop and escalate), and a single flag can't convey which applies.",
            "errorCategory is required by the JSON specification.",
            "It's purely cosmetic and has no effect on agent behavior."
          ],
          correct: [1],
          explanation: "A transient error is worth retrying; a permission error never will succeed no matter how many times you retry it; a business error needs to be explained to the user, not silently retried. Collapsing all of these into a single isError boolean removes the information the agent needs to react appropriately."
        },
        {
          type: "single",
          question: "An agent has been given 18 tools instead of the 4-5 actually relevant to its role. Even though each tool is individually well-described, tool selection reliability drops. Why?",
          options: [
            "Having more tools always improves reliability; this scenario is unrealistic.",
            "More available tools increases the decision complexity of tool selection, which degrades routing reliability independent of how well each individual tool is described.",
            "The extra tools consume so much of the context window that none of the descriptions are visible.",
            "Only the first 5 tools in the list are ever considered by the model."
          ],
          correct: [1],
          explanation: "Tool selection reliability isn't just a function of individual tool description quality — it also depends on how many plausible candidates the model has to choose among. Scoping each agent's tool access to its role (roughly 4-5 tools) keeps that decision tractable."
        },
        {
          type: "single",
          question: "You want to guarantee the model calls some tool on this turn (as opposed to returning conversational text), but you don't care which of several extraction tools it picks, since the document type is unknown. Which tool_choice setting fits?",
          options: [
            "tool_choice: \"auto\"",
            "tool_choice: \"any\"",
            "A forced tool_choice naming one specific tool",
            "Omitting tool_choice entirely"
          ],
          correct: [1],
          explanation: "tool_choice: \"any\" forces the model to call a tool but leaves the choice of which tool up to the model — exactly right when multiple valid extraction schemas exist and you don't yet know which applies."
        },
        {
          type: "single",
          question: "What's the functional difference between a project-scoped .mcp.json file and a user-scoped ~/.claude.json for MCP server configuration?",
          options: [
            "There is no difference; they're interchangeable.",
            "Project-scoped .mcp.json is shared, version-controlled tooling available to the whole team; user-scoped ~/.claude.json is for personal or experimental servers not shared with teammates.",
            "User-scoped configuration always takes priority over project-scoped configuration.",
            "Only project-scoped MCP servers support environment variable expansion."
          ],
          correct: [1],
          explanation: "The scoping distinction mirrors CLAUDE.md's user/project split: .mcp.json in the repo is shared team tooling under version control, while ~/.claude.json holds an individual developer's personal or experimental server configurations."
        },
        {
          type: "multi",
          question: "Which two of the following correctly describe when to select each built-in tool? (Select 2)",
          options: [
            "Use Grep to search file contents for a pattern, such as all callers of a specific function.",
            "Use Glob to search file contents for a pattern, such as an error message string.",
            "Use Glob to find files matching a naming pattern, such as **/*.test.tsx.",
            "Always prefer Bash for file content search over Grep, since Bash is more powerful."
          ],
          correct: [0, 2],
          explanation: "Grep is for content search (patterns inside file contents); Glob is for path/name pattern matching, not content search. Reaching for Bash instead of Grep/Glob for routine content or path search adds unnecessary complexity for no benefit."
        },
        {
          type: "single",
          question: "Your Developer Productivity agent's tools are well described with clear boundaries, yet it still routes roughly a third of requests to analyze_document when extract_web_results is obviously correct. The tool definitions look right on review. Where should you look next?",
          options: [
            "The system prompt — keyword-sensitive wording can create unintended tool associations that override well-written tool descriptions.",
            "The model's max_tokens setting, which truncates the tool list before the model reads it.",
            "The order the tools appear in the tools array, since the model always prefers the first matching tool.",
            "The MCP server's connection timeout, which silently drops tools from the catalog."
          ],
          correct: [0],
          explanation: "When descriptions are genuinely good and routing is still wrong, the system prompt is the usual culprit: a phrase like \"start by reviewing the customer's documents\" pulls anything containing \"document\" toward analyze_document regardless of what the tool descriptions say. Reviewing the system prompt for keywords that collide with tool names is the documented next step. max_tokens governs output length, not the tool list; there's no documented first-match preference by array position; and a connection failure would remove the tool entirely rather than cause selective misrouting."
        },
        {
          type: "single",
          question: "A customer support agent calls lookup_order for a customer who genuinely has no orders. The MCP tool returns {\"isError\": true, \"message\": \"No results\"}. What's the consequence of modelling it this way?",
          options: [
            "None — an empty result and a failure are equivalent from the agent's perspective.",
            "The agent treats a successful query as a failure, so it may retry pointlessly or report a system problem when the correct answer is simply \"you have no orders.\"",
            "The agent will automatically re-classify it as a valid empty result using isRetryable.",
            "The MCP client rejects the response because isError requires an errorCategory field."
          ],
          correct: [1],
          explanation: "A valid empty result is a success: the query ran correctly and legitimately found nothing. Flagging it with isError conflates it with an access failure, so the agent can't tell \"you have no orders\" from \"the order service is down\" — leading to wasted retries or, worse, a confidently wrong answer. Option A is exactly the confusion the access-failure/empty-result distinction exists to prevent; isRetryable carries no such re-classification logic; and the problem here is semantic modelling, not a protocol validation error."
        },
        {
          type: "multi",
          question: "A subagent's MCP tool call fails with a transient timeout. Which two behaviors best reflect correct error handling in a coordinator/subagent system? (Select 2)",
          options: [
            "The subagent attempts local recovery for the transient failure before involving the coordinator at all.",
            "The subagent immediately propagates every error to the coordinator so the coordinator can decide everything centrally.",
            "If the subagent cannot resolve the failure locally, it propagates structured context — what was attempted, partial results, and why it failed — rather than a generic status.",
            "The subagent catches the timeout and returns an empty result marked successful so the workflow isn't disrupted."
          ],
          correct: [0, 2],
          explanation: "Transient failures should be recovered locally within the subagent — that's what \"transient\" and isRetryable: true mean. Only errors the subagent genuinely cannot resolve should reach the coordinator, and those must carry structured context (failure type, attempted query, partial results) so the coordinator can choose intelligently between retrying, trying an alternative, or proceeding with partial results. Option B pushes recoverable noise up the hierarchy for no benefit. Option D is the silent-suppression anti-pattern: marking a failure as success guarantees no recovery can ever happen and quietly corrupts the final output."
        },
        {
          type: "single",
          question: "Your team's Claude Code agent has a capable jira_search MCP tool, but engineers notice it keeps using Grep against a local issue export instead — producing worse results. The MCP tool works correctly when invoked directly. What's the most likely cause?",
          options: [
            "The jira_search tool's description is too thin to explain its capabilities and outputs, so the agent falls back to the built-in tool it understands better.",
            "Built-in tools always take precedence over MCP tools in Claude Code's tool resolution order.",
            "MCP tools are only available in plan mode, so the agent cannot reach jira_search during direct execution.",
            "The .mcp.json file must set a priority field to outrank built-in tools."
          ],
          correct: [0],
          explanation: "MCP tools compete with built-in tools on exactly one axis — description quality. A thinly-described jira_search loses to a Grep the model understands well, which is the routing mechanism behaving normally, not malfunctioning. Enhancing MCP tool descriptions to explain capabilities and outputs in detail is the documented fix. There's no built-in-tool precedence rule, MCP tools aren't restricted to plan mode, and no priority field exists in .mcp.json."
        },
        {
          type: "single",
          question: "You're adding your team's shared GitHub MCP server to a repository that every engineer clones. The server needs an auth token. What's the correct configuration approach?",
          options: [
            "Commit .mcp.json with the token value inline, since the repository is private.",
            "Configure the server in project-scoped .mcp.json using environment variable expansion (e.g., \"${GITHUB_TOKEN}\"), so the committed file names the variable while each environment supplies the value.",
            "Have each engineer configure the server in their own ~/.claude.json, since credentials cannot be referenced from project-scoped configuration.",
            "Commit .mcp.json without the env block and have engineers paste the token at each session start."
          ],
          correct: [1],
          explanation: "Environment variable expansion in project-scoped .mcp.json is exactly the documented mechanism for credential management without committing secrets: the shared file references ${GITHUB_TOKEN}, and each developer's shell or the CI secret store supplies the actual value. Option A commits a secret regardless of repo visibility. Option C wrongly claims project-scoped config can't handle credentials and abandons the benefit of shared team tooling. Option D invents a manual step that env expansion exists to eliminate."
        },
        {
          type: "single",
          question: "Your research agent spends its first several turns making exploratory tool calls just to discover which data sources and schemas exist before it can do any real work. Which MCP capability most directly addresses this?",
          options: [
            "MCP resources, which expose content catalogs (schemas, documentation hierarchies, issue summaries) so the agent has visibility into available data without exploratory calls.",
            "Adding more MCP tools so each discovery question has a dedicated tool.",
            "Setting tool_choice: \"any\" so the agent stops returning conversational text during discovery.",
            "Moving the MCP servers from project scope to user scope to reduce connection overhead."
          ],
          correct: [0],
          explanation: "Resources expose content catalogs directly, which is precisely the mechanism for giving agents visibility into available data without requiring exploratory tool calls. Option B makes the too-many-tools problem worse while still requiring a call per question. Option C forces tool use but doesn't reduce the number of discovery calls needed. Option D changes who can see the servers, not how the agent discovers what data exists."
        },
        {
          type: "single",
          question: "An agent tries to Edit a file, changing const client = createClient(config); — but that exact line appears three times in the file, and the Edit fails. What's the correct fallback?",
          options: [
            "Read the full file, then Write the corrected version.",
            "Retry the same Edit; the failure is transient.",
            "Use Glob to disambiguate which occurrence was intended.",
            "Split the file into three smaller files so each occurrence is unique."
          ],
          correct: [0],
          explanation: "Edit relies on unique text matching. When the anchor text isn't unique, Edit cannot know which occurrence was meant and correctly refuses rather than guessing — the documented fallback is Read + Write for a reliable full-file modification. The failure is deterministic, not transient, so retrying changes nothing. Glob matches file paths, not positions within a file. Restructuring source code to work around a tool's matching semantics is disproportionate."
        },
        {
          type: "single",
          question: "Your Developer Productivity agent is asked to explain how refund processing works in an unfamiliar 340-file codebase. Which approach best manages context while producing an accurate answer?",
          options: [
            "Glob for all source files and Read every one, so the agent has complete information before answering.",
            "Grep for the refund entry point, Read that file, then follow its imports with targeted Reads to trace the actual flow.",
            "Read the ten largest files, on the assumption that core logic lives in them.",
            "Ask the model to answer from general knowledge of how refund systems are typically structured."
          ],
          correct: [1],
          explanation: "Building understanding incrementally — Grep to find entry points, then Read to follow imports and trace flows — is the documented pattern, and every file that enters context earns its place by being on the path to the answer. Option A floods the context window with irrelevant files, making the relevant ones harder to attend to (and inviting lost-in-the-middle effects). Option C uses file size as a poor proxy for relevance. Option D describes exactly the context-degradation symptom to avoid: answering from \"typical patterns\" rather than the specific code."
        },
        {
          type: "multi",
          question: "Your team needs a Jira integration and a custom internal deploy-tracker integration for Claude Code. Which two decisions follow documented MCP integration guidance? (Select 2)",
          options: [
            "Use an existing community MCP server for the Jira integration rather than writing your own.",
            "Write a custom MCP server for Jira so it exactly matches your team's workflow terminology.",
            "Write a custom MCP server for the internal deploy tracker, since no community server covers a team-specific system.",
            "Expose the deploy tracker through Bash commands instead of an MCP server, to avoid maintaining a server."
          ],
          correct: [0, 2],
          explanation: "The documented guidance is to choose existing community MCP servers for standard integrations (Jira) and reserve custom implementations for team-specific workflows — which the internal deploy tracker is. Option B spends engineering effort re-solving a solved problem for cosmetic gain. Option D gives up structured tool descriptions, schemas, and error envelopes in exchange for opaque shell invocations the model can't route on reliably."
        },
        {
          type: "single",
          question: "Your Multi-Agent Research System gives the web-search subagent a generic fetch_url tool that accepts any URL. The subagent occasionally fetches unrelated pages it encountered in search snippets, polluting findings. Which change best fits the tool-design guidance?",
          options: [
            "Replace fetch_url with a constrained load_document tool that validates document URLs.",
            "Add a system prompt rule listing the URL patterns the subagent may fetch.",
            "Remove the subagent's fetch capability and route all fetches through the coordinator.",
            "Keep fetch_url but add a PostToolUse hook that discards irrelevant pages after they're fetched."
          ],
          correct: [0],
          explanation: "Replacing a generic tool with a constrained alternative — the guide's own example is swapping fetch_url for a load_document that validates document URLs — is the documented fix: a narrower tool is both harder to misuse and easier to describe precisely, which feeds back into selection reliability. Option B leans on probabilistic prompt compliance for a constraint the tool interface can enforce structurally. Option C forces a round trip through the coordinator for the subagent's core, high-frequency job. Option D pays the fetch cost and pollutes context before filtering, treating a symptom rather than the interface."
        }
      ],
      flashcards: [
        { front: "What's the primary mechanism LLMs use to select among available tools?", back: "Tool descriptions — minimal or overlapping descriptions cause unreliable selection among similar tools." },
        { front: "What four things should a well-written tool description include?", back: "Input formats, example queries, edge cases, and an explicit boundary explaining when to use it versus a similar alternative." },
        { front: "Give an example fix for two tools with near-identical descriptions causing misrouting.", back: "Rename and specialize: e.g., rename analyze_content to extract_web_results with a web-specific description, or split a generic tool into purpose-specific ones (extract_data_points, summarize_content, verify_claim_against_source)." },
        { front: "Tool descriptions look correct but routing is still wrong. Where do you look next?", back: "The system prompt — keyword-sensitive wording can create unintended tool associations that override otherwise well-written tool descriptions." },
        { front: "What does the MCP isError flag do?", back: "Signals a tool call failed, giving the agent structured information to decide how to recover instead of guessing from an ambiguous response." },
        { front: "Name the four error categories worth distinguishing in MCP structured errors.", back: "Transient (timeouts/unavailability), validation (invalid input), business (policy violation), and permission errors." },
        { front: "Why does isRetryable matter in a structured error response?", back: "It tells the agent whether retrying is worth attempting, preventing wasted retry attempts on errors that will never succeed (e.g., permission errors)." },
        { front: "What's the difference between an access failure and a valid empty result?", back: "An access failure means the query couldn't be completed (needs a retry decision); a valid empty result means the query succeeded and legitimately found nothing — and should never carry isError." },
        { front: "Why does giving an agent too many tools (e.g., 18 instead of 4-5) hurt reliability?", back: "It increases tool-selection decision complexity, degrading routing reliability even when each individual tool is well described." },
        { front: "What are the three tool_choice options and what does each guarantee?", back: "\"auto\" (model may return text instead of calling a tool), \"any\" (model must call some tool but picks which), and forced selection ({\"type\": \"tool\", \"name\": ...}) (a specific named tool must be called)." },
        { front: "When would you use forced tool_choice?", back: "To guarantee a specific tool runs first, e.g. forcing extract_metadata before enrichment tools that depend on its output." },
        { front: "Project-scoped .mcp.json vs. user-scoped ~/.claude.json — what's each for?", back: "Project .mcp.json is shared, version-controlled team tooling; user ~/.claude.json is for personal or experimental MCP servers not shared with the team." },
        { front: "How does a committed .mcp.json reference a secret without containing it?", back: "Environment variable expansion — the file names the variable (e.g. \"${GITHUB_TOKEN}\") and each developer's shell or the CI secret store supplies the value at launch." },
        { front: "What do MCP resources add beyond MCP tools?", back: "A way to expose content catalogs (issue summaries, doc hierarchies, DB schemas) directly, reducing the number of exploratory tool calls needed." },
        { front: "Why might an agent ignore a capable MCP tool and use Grep instead?", back: "Because the MCP tool's description is too thin — MCP tools compete with built-ins on description quality alone; describe capabilities and outputs in detail so they win on merit." },
        { front: "Community MCP server or custom one?", back: "Community servers for standard integrations (Jira, GitHub); reserve custom servers for genuinely team-specific workflows." },
        { front: "When should you fall back from Edit to Read+Write?", back: "When Edit fails because its target text isn't unique in the file — Read the full file, then Write the corrected version." },
        { front: "How should an agent build understanding of an unfamiliar codebase?", back: "Incrementally: Grep to find entry points, then Read to follow imports and trace flows — rather than reading all files upfront and flooding context." },
      ]
    },
    {
      id: "d3",
      title: "Claude Code Configuration & Workflows",
      weight: 20,
      summary: "Configuring Claude Code's memory hierarchy, commands, skills, and execution modes for team workflows, and wiring it into CI/CD.",
      objectives: [
        "Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization",
        "Create and configure custom slash commands and skills",
        "Apply path-specific rules for conditional convention loading",
        "Determine when to use plan mode vs direct execution",
        "Apply iterative refinement techniques for progressive improvement",
        "Integrate Claude Code into CI/CD pipelines"
      ],
      lesson: {
        sections: [
          {
            heading: "The CLAUDE.md hierarchy: who actually sees this?",
            body: `<p>CLAUDE.md configuration exists at three levels, and the only question that matters for each is <em>who sees it</em>:</p><ul><li><strong>User-level</strong> (<code>~/.claude/CLAUDE.md</code>) — applies only to <em>you</em>, on <em>your</em> machine. Not in version control. Your teammates will never see it.</li><li><strong>Project-level</strong> (<code>.claude/CLAUDE.md</code> or a root <code>CLAUDE.md</code>) — committed to the repo, so every developer gets it on clone or pull.</li><li><strong>Directory-level</strong> (a <code>CLAUDE.md</code> in a subdirectory) — applies to work in that directory and below.</li></ul><div class="callout analogy"><span class="callout-label">Think of it like...</span>Editor config. Your personal <code>~/.vimrc</code> follows you everywhere and nobody else has it. The <code>.editorconfig</code> committed at the repo root is how the <em>team</em> agrees on indentation — it's in git precisely so everyone gets it automatically. Putting a team standard in your <code>~/.vimrc</code> and wondering why nobody else's code matches is the same mistake as putting it in user-level CLAUDE.md.</div><p>That user/project split produces this domain's single most-tested diagnosis. A new engineer joins, and none of the team's standards seem to apply to their work — even though a teammate insists "it's all in CLAUDE.md." It <em>is</em> all in CLAUDE.md — in that teammate's <code>~/.claude/CLAUDE.md</code>, which has never been in version control and never will be. The instructions have worked flawlessly for the person who wrote them for months, which is exactly why nobody suspects them. Here's the trap: the symptom looks like a Claude Code problem and it's a git problem.</p><p>Deciding where something belongs is usually a one-question test: <strong>would a teammate be wrong to do this differently?</strong> If yes, it's a team standard — project level. If it's just how you like to work, it's user level, and putting it in the project file imposes your preferences on everyone else's sessions.</p>`,
            interactive: {
              type: "classify",
              title: "Which level does this belong in?",
              instructions: "For each instruction, decide where it should live. Ask yourself: does the whole team need this, does only this directory need it, or is it just personal preference?",
              items: [
                {
                  text: "\"All API endpoints must validate input with Zod schemas before touching the database.\"",
                  answer: "project",
                  options: [["user", "👤 User-level"], ["project", "📦 Project-level"], ["directory", "📁 Directory-level"]],
                  why: "A binding team standard — a teammate ignoring it would be shipping a bug. It must be version-controlled so every clone picks it up."
                },
                {
                  text: "\"Explain your reasoning before making changes; I like to follow along.\"",
                  answer: "user",
                  options: [["user", "👤 User-level"], ["project", "📦 Project-level"], ["directory", "📁 Directory-level"]],
                  why: "Pure personal working style. Nothing breaks if a teammate works differently — putting this in the project file imposes your preference on everyone."
                },
                {
                  text: "\"Code in services/billing/ must never log raw card numbers; use the redaction helper.\"",
                  answer: "directory",
                  options: [["user", "👤 User-level"], ["project", "📦 Project-level"], ["directory", "📁 Directory-level"]],
                  why: "Scoped to one area of the codebase. A directory-level CLAUDE.md in services/billing/ keeps it loaded where it's relevant instead of taxing every unrelated session."
                },
                {
                  text: "\"Our commit messages follow Conventional Commits — feat:, fix:, chore:.\"",
                  answer: "project",
                  options: [["user", "👤 User-level"], ["project", "📦 Project-level"], ["directory", "📁 Directory-level"]],
                  why: "A team convention that must apply to everyone's commits. If it lives in one developer's user-level file, everyone else's commits drift — the classic \"why isn't my teammate getting this\" bug."
                },
                {
                  text: "\"Use pnpm, not npm — this repo's lockfile is pnpm-lock.yaml.\"",
                  answer: "project",
                  options: [["user", "👤 User-level"], ["project", "📦 Project-level"], ["directory", "📁 Directory-level"]],
                  why: "Getting this wrong corrupts the lockfile for everyone. It's a property of the repository, so it belongs to the repository."
                },
                {
                  text: "\"Address me as 'Sam' and skip the preamble — get straight to the code.\"",
                  answer: "user",
                  options: [["user", "👤 User-level"], ["project", "📦 Project-level"], ["directory", "📁 Directory-level"]],
                  why: "Personal preference that follows you across every project. It has no business in a shared repo."
                },
                {
                  text: "\"Everything under infra/terraform/ requires a plan output pasted into the PR before apply.\"",
                  answer: "directory",
                  options: [["user", "👤 User-level"], ["project", "📦 Project-level"], ["directory", "📁 Directory-level"]],
                  why: "A rule for one specific area. Directory-level keeps it out of context for the frontend work that will never touch Terraform."
                }
              ]
            }
          },
          {
            heading: "Keeping configuration modular: @import, .claude/rules/, and /memory",
            body: `<p>A CLAUDE.md that grows into a monolith has a real cost: every session loads all of it, including the 80% irrelevant to the task at hand. Two mechanisms keep it modular.</p><p>The <strong><code>@import</code> syntax</strong> references external files, so a CLAUDE.md composes rather than duplicates:</p><pre><code># Project standards
@./docs/api-conventions.md
@./docs/testing-standards.md</code></pre><p>This is how a monorepo stays sane: each package's CLAUDE.md imports only the standards files its maintainers actually need, instead of every package re-inlining the same shared text (and drifting out of sync the moment one copy is edited).</p><p>The <strong><code>.claude/rules/</code> directory</strong> is the alternative to a monolithic CLAUDE.md, organizing topic-specific rule files — <code>testing.md</code>, <code>api-conventions.md</code>, <code>deployment.md</code> — as separate concerns rather than one long document.</p><p>Rules get more powerful with <strong>YAML frontmatter path scoping</strong>: a <code>paths</code> field of glob patterns means the rule activates — and only consumes context — when you're editing a matching file.</p><pre><code>---
paths: ["**/*.test.tsx", "**/*.test.ts"]
---
All test files use Testing Library; avoid snapshot tests for
interactive components. Cover the error path, not just the happy path.</code></pre><p>This is where path-scoped rules decisively beat directory-level CLAUDE.md, and the exam leans on the distinction. Consider test files: <code>Button.test.tsx</code> sits next to <code>Button.tsx</code>, <code>useCart.test.ts</code> next to <code>useCart.ts</code> — scattered across dozens of directories, following the code they test. A directory-level CLAUDE.md is <em>bound to its directory</em>; covering test conventions that way would mean dropping a near-identical CLAUDE.md into every folder that happens to contain a test, then maintaining all of them. A glob pattern matches by <strong>file type regardless of location</strong>, in one file. The rule of thumb: <strong>convention follows a directory → directory-level CLAUDE.md; convention follows a file type spread across directories → path-scoped rule.</strong></p><p>Finally, <code>/memory</code> shows which memory files are currently loaded. When behavior is inconsistent between two sessions — or between you and a teammate — this is the diagnostic that ends the argument, because it shows what's actually loaded rather than what everyone assumes is loaded.</p>`,
            interactive: {
              type: "scenario",
              title: "The standards that only work for one person",
              setup: "A new engineer's PRs keep missing the team's error-handling conventions. A senior teammate is baffled: \"It's literally spelled out in CLAUDE.md — it's worked for me for six months.\" You check the repo root and there's no mention of error handling in the committed CLAUDE.md. What's your first move?",
              choices: [
                {
                  text: "Ask the new engineer to run /memory, and have the senior teammate do the same — then compare which files are actually loaded in each session.",
                  outcome: "good",
                  feedback: "Exactly right. /memory shows what's really loaded rather than what everyone believes is loaded, and the comparison makes the diagnosis instantly: the senior teammate's session is loading ~/.claude/CLAUDE.md with six months of accumulated standards that were never version-controlled. The fix follows immediately — move the team-wide rules into the project-level CLAUDE.md so every clone gets them."
                },
                {
                  text: "Have the new engineer copy the senior teammate's ~/.claude/CLAUDE.md into their own home directory.",
                  outcome: "bad",
                  feedback: "This fixes exactly one person and leaves the actual defect in place: team standards living outside version control. The next hire hits the identical problem, the two copies drift apart the first time either is edited, and nothing about the standards is reviewable. You've turned a config bug into a manual onboarding ritual."
                },
                {
                  text: "Add the error-handling conventions to a .claude/rules/ file with a paths glob so they load automatically.",
                  outcome: "bad",
                  feedback: "You've jumped to a solution before confirming the diagnosis, and picked the wrong tool. Path-scoped rules are for conventions that follow a file type across directories — error-handling standards that apply to the whole project belong in the project-level CLAUDE.md. Confirm what's loaded with /memory first; the mechanism follows from the diagnosis."
                }
              ]
            }
          },
          {
            heading: "Custom slash commands and Agent Skills",
            body: `<p>Custom slash commands follow the same scoping logic as everything else in this domain: <strong>.claude/commands/</strong> when project-scoped (version-controlled, available to every developer the moment they clone or pull) or <strong>~/.claude/commands/</strong> when user-scoped (personal, never shared). A <code>/review</code> command encoding the team's review checklist belongs in the repo — that's the whole point of it being the <em>team's</em> checklist.</p><p>Agent Skills go further. A skill in <strong>.claude/skills/</strong> is defined by a <code>SKILL.md</code> file whose frontmatter configures how it runs:</p><pre><code>---
name: audit-deps
context: fork
allowed-tools: [Read, Grep]
argument-hint: "&lt;package-name&gt;"
---</code></pre><p>Each of those three options solves a distinct problem:</p><ul><li><strong><code>context: fork</code></strong> runs the skill in an isolated sub-agent context, so its output doesn't pollute the main conversation. This is the one worth internalizing: a skill that analyzes an entire codebase or brainstorms fifteen alternatives generates enormous intermediate output, and without <code>fork</code> all of it lands in your main session — burning the context budget you needed for the actual work. With <code>fork</code>, the main session receives the conclusion, not the transcript.</li><li><strong><code>allowed-tools</code></strong> restricts what the skill can do while running. An audit skill limited to <code>[Read, Grep]</code> is structurally incapable of modifying anything, which is a far stronger guarantee than instructing it not to.</li><li><strong><code>argument-hint</code></strong> prompts developers for required parameters when they invoke the skill without arguments — the difference between a skill that fails confusingly and one that tells you what it needs.</li></ul><p>Developers can create personal variants of a shared skill in <code>~/.claude/skills/</code> <em>under a different name</em>, which lets you customize without affecting teammates — the name change matters, since it's what prevents your variant from colliding with the shared one.</p><div class="compare-grid"><div class="compare-col good"><span class="cc-label">Reach for a Skill</span><p>On-demand, task-specific workflows: "audit this package's dependencies," "generate a migration from this schema diff."</p><p>Invoked deliberately, when needed. Costs nothing when you're not using it.</p></div><div class="compare-col good"><span class="cc-label">Reach for CLAUDE.md</span><p>Universal standards that should always apply: naming conventions, the testing framework, error-handling patterns.</p><p>Always loaded, no invocation needed — which is exactly why it must stay lean.</p></div></div><p>The dividing line: <strong>always-loaded universal standards → CLAUDE.md; on-demand task-specific workflows → skills.</strong> Getting this backwards is a real cost in both directions — universal standards in a skill silently don't apply unless someone remembers to invoke it, and task-specific workflows in CLAUDE.md tax every session with instructions relevant to almost none of them.</p>`
          },
          {
            heading: "Plan mode vs. direct execution",
            body: `<p>The judgment here is about <strong>what you don't yet know</strong>, not about how big the diff will be.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Hanging a picture versus knocking through a wall. For the picture you find a stud and drill — surveying the room first would be absurd. For the wall you find out what's inside it before you swing anything, because "load-bearing" is not something you want to discover halfway through. Notice the deciding factor isn't effort, it's <em>what you don't know yet</em>: the picture has one obvious right answer, the wall has several plausible approaches and a very expensive wrong one.</div><p><strong>Plan mode</strong> is designed for complex tasks: large-scale changes, multiple valid approaches, genuine architectural decisions, multi-file modifications. It enables safe codebase exploration and design <em>before</em> committing to changes, which is what prevents costly rework. Restructuring a monolith into microservices is the canonical case — you need to explore dependencies and decide service boundaries before writing anything, because discovering a wrong boundary assumption after touching forty files is enormously expensive. A library migration affecting 45+ files, or choosing between integration approaches with different infrastructure requirements, qualify for the same reason.</p><p><strong>Direct execution</strong> fits simple, well-scoped changes where the path is already clear: a single-file bug fix with a clear stack trace, adding one validation check to one function, adding a date conditional. Here plan mode is pure ceremony — you'd be planning a change you already fully understand.</p><div class="callout warn"><span class="callout-label">Watch out</span>"Start in direct execution and switch to plan mode if it gets complicated" sounds pragmatic and is a documented wrong answer when the complexity is <em>already stated in the requirements</em>. If you know going in that the task involves dozens of files and architectural decisions, the complexity isn't a risk that might emerge later — it's a fact you already have. Discovering it mid-implementation just means discovering it after you've done rework-able work.</div><p>The two modes also compose, which the framing "plan mode <em>vs.</em> direct execution" can obscure: a common pattern is <strong>plan mode for investigation, then direct execution for implementation</strong> — plan the library migration, then execute the approach you settled on.</p><p>For multi-phase work, the <strong>Explore subagent</strong> isolates verbose discovery output and returns summaries instead, preserving the main conversation's context. This is the same isolation principle as <code>context: fork</code> on a skill: the discovery phase generates far more output than its conclusions are worth, and letting all of it into the main session is how you exhaust the context window before reaching the part that matters.</p>`
          },
          {
            heading: "Iterative refinement: examples, tests, and the interview pattern",
            body: `<p>When a prose description gets interpreted inconsistently, the instinct is to write <em>more prose</em> — more adjectives, firmer wording. It rarely works. <strong>2-3 concrete input/output examples</strong> communicate an intended transformation far more effectively, because they're checkable in a way "normalize the addresses sensibly" never is.</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ More adjectives</span><code>"Normalize these customer<br>addresses properly and<br>consistently. Be thorough<br>and use good judgment<br>about formatting."</code><p>Every word here is unfalsifiable. Does "properly" uppercase the state? Expand "St." to "Street"? Two runs can both honor this instruction and disagree.</p></div><div class="compare-col good"><span class="cc-label">✓ Show the transformation</span><code>"Normalize addresses like this:<br><br>12 elm st, apt 4, boston ma<br>→ 12 Elm St Apt 4,<br>&nbsp;&nbsp;&nbsp;Boston, MA<br><br>PO BOX 22, reno nevada 89501<br>→ PO Box 22, Reno, NV 89501"</code><p>The examples answer the questions the prose left open — abbreviations kept, state codes two-letter, comma placement — without ever naming the rules.</p></div></div><p>Three more techniques from the guide, each for a distinct situation:</p><ul><li><strong>Test-driven iteration</strong> — write a test suite covering expected behavior, edge cases, and performance requirements <em>first</em>, then iterate by sharing the failures. This converts "make it better" into a concrete, unambiguous target, and each iteration has an objective stopping condition.</li><li><strong>The interview pattern</strong> — have Claude ask you questions before implementing. This surfaces considerations you hadn't anticipated (cache invalidation strategy, failure modes) and is most valuable precisely where you're least equipped to write a complete spec: an unfamiliar domain.</li><li><strong>Specific test cases for edge cases</strong> — when null values break a migration script, supply the exact input and expected output rather than describing the bug.</li></ul><p>One rule that's easy to get backwards: <strong>when several issues interact, describe them together in a single detailed message; when they're independent, fix them sequentially.</strong> The reason is that fixes to interacting problems constrain each other — solving them one at a time means each fix is made blind to the others, and fix #3 quietly undoes fix #1. Independent problems have no such coupling, and batching them just muddies each one's verification.</p>`
          },
          {
            heading: "Claude Code in CI/CD pipelines",
            body: `<p>The first thing every CI integration hits: <strong>a plain <code>claude "..."</code> invocation hangs forever</strong>, because Claude Code is waiting for interactive input that a pipeline will never provide. The <code>-p</code> (or <code>--print</code>) flag is the documented fix — it processes the prompt, prints the result to stdout, and exits.</p><pre><code>claude -p "Review this PR for security issues" \\
  --output-format json --json-schema ./review-schema.json</code></pre><p><code>--output-format json</code> with <code>--json-schema</code> produces machine-parseable, schema-conformant findings — the thing that turns a wall of review prose into inline PR comments a script can post at specific line numbers. <strong>CLAUDE.md</strong> is how CI-invoked Claude Code gets project context: testing standards, fixture conventions, review criteria. It's committed, so the CI checkout has it automatically — which is a genuine payoff of keeping standards at project level rather than in someone's home directory.</p><p>Three subtleties that separate a working pipeline from a good one:</p><ul><li><strong>Session context isolation.</strong> The same session that generated code is less effective at reviewing its own changes than an independent review instance — it retains its reasoning context from generation and is less likely to question decisions it just made. In CI this is nearly free: the review job is a fresh invocation with no such baggage.</li><li><strong>Duplicate comments on re-runs.</strong> Each CI invocation is a fresh session with no memory of the last one, so a re-run after a new commit re-reports every issue it already flagged. Include prior findings in context and instruct Claude to report only new or still-unaddressed issues. Here's the trap: the pipeline is working perfectly and reviewers are drowning — nothing errors, the signal just dies under repetition.</li><li><strong>Duplicate test generation.</strong> Same shape of problem: provide existing test files in context so generation doesn't propose scenarios the suite already covers. Documenting testing standards, valuable test criteria, and available fixtures in CLAUDE.md improves quality and cuts low-value output.</li></ul>`,
            interactive: {
              type: "sequence",
              title: "Order the CI review pipeline",
              instructions: "A pull request lands and the automated review job fires. Put the pipeline's steps in the order they run — from checkout to posted comments.",
              items: [
                { text: "CI checks out the PR branch — which brings the committed CLAUDE.md along with the code, giving the run its testing standards and review criteria." },
                { text: "The job gathers context for this specific run: the PR diff, and any findings from the previous review of this same PR." },
                { text: "It invokes claude -p so the run is non-interactive and exits on its own instead of hanging for input that will never come." },
                { text: "The invocation passes --output-format json with --json-schema, so findings come back machine-parseable rather than as prose." },
                { text: "The prompt instructs Claude to report only new or still-unaddressed issues, so re-runs don't repeat comments already posted." },
                { text: "Claude — a fresh instance with no memory of writing this code — reviews the diff against the CLAUDE.md criteria and emits schema-conformant findings." },
                { text: "The pipeline parses the JSON and posts each finding as an inline PR comment at its specific file and line." }
              ],
              explanation: "Two ideas are doing the real work here. First, everything about the invocation exists to make a language model safe to automate: -p stops it hanging, --json-schema makes the output parseable by a script rather than a human, and the committed CLAUDE.md means the CI run knows your standards without anyone passing them in. Second, notice that the reviewer being a fresh instance is a feature, not a limitation — an independent instance without the generator's reasoning context catches subtler issues than the session that wrote the code ever would. The one thing that context isolation costs you is memory of prior findings, which is exactly why you feed those back in deliberately (step 2) rather than hoping the session remembers."
            }
          }
        ],
        checks: [
          {
            type: "single",
            question: "A new engineer joins the team and doesn't seem to be getting any of the project's established coding standards, even though a teammate insists \"it's all in CLAUDE.md.\" What's the most likely explanation?",
            options: [
              "Claude Code ignores CLAUDE.md for new team members.",
              "The standards were written into someone's user-level ~/.claude/CLAUDE.md rather than the project-level CLAUDE.md, so they were never shared via version control.",
              "The new engineer needs a different Claude subscription tier.",
              "CLAUDE.md files expire after a fixed number of days."
            ],
            correct: [1],
            explanation: "User-level CLAUDE.md only applies to the user who wrote it and isn't version-controlled or shared. Standards meant for the whole team need to live in the project-level CLAUDE.md so every clone/pull picks them up."
          },
          {
            type: "single",
            question: "A Skill produces a lot of verbose intermediate output (a full dependency audit) that you don't want cluttering the main conversation. Which SKILL.md frontmatter option addresses this?",
            options: [
              "argument-hint",
              "allowed-tools",
              "context: fork",
              "There is no way to isolate a skill's output"
            ],
            correct: [2],
            explanation: "context: fork runs the skill in an isolated sub-agent context, so its verbose output is contained there rather than polluting the main conversation — the main session just gets the skill's final result."
          },
          {
            type: "single",
            question: "You're about to restructure a monolithic service into microservices, touching dozens of files with real decisions about service boundaries. What should you do first?",
            options: [
              "Start making changes directly and let the structure emerge as you go.",
              "Enter plan mode to explore the codebase and design an approach before committing to changes.",
              "Write exhaustive upfront instructions specifying every file's final structure without exploring the code.",
              "Skip investigation entirely since the task is already well understood."
            ],
            correct: [1],
            explanation: "Plan mode exists precisely for large-scale, multi-file changes with real architectural decisions — exploring dependencies and designing an approach before committing avoids costly rework from assumptions that turn out to be wrong."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "You want to create a custom /review slash command that runs your team's standard code review checklist. This command should be available to every developer when they clone or pull the repository. Where should you create this command file?",
          options: [
            "In the .claude/commands/ directory in the project repository",
            "In ~/.claude/commands/ in each developer's home directory",
            "In the CLAUDE.md file at the project root",
            "In a .claude/config.json file with a commands array"
          ],
          correct: [0],
          explanation: "Project-scoped custom slash commands should be stored in the .claude/commands/ directory within the repository. These commands are version-controlled and automatically available to all developers when they clone or pull the repo. Option B (~/.claude/commands/) is for personal commands that aren't shared via version control. Option C (CLAUDE.md) is for project instructions and context, not command definitions. Option D describes a configuration mechanism that doesn't exist in Claude Code.",
          source: "official"
        },
        {
          type: "single",
          question: "You've been assigned to restructure the team's monolithic application into microservices. This will involve changes across dozens of files and requires decisions about service boundaries and module dependencies. Which approach should you take?",
          options: [
            "Enter plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes.",
            "Start with direct execution and make changes incrementally, letting the implementation reveal the natural service boundaries.",
            "Use direct execution with comprehensive upfront instructions detailing exactly how each service should be structured.",
            "Begin in direct execution mode and only switch to plan mode if you encounter unexpected complexity during implementation."
          ],
          correct: [0],
          explanation: "Plan mode is designed for complex tasks involving large-scale changes, multiple valid approaches, and architectural decisions — exactly what monolith-to-microservices restructuring requires. It enables safe codebase exploration and design before committing to changes. Option B risks costly rework when dependencies are discovered late. Option C assumes you already know the right structure without exploring the code. Option D ignores that the complexity is already stated in the requirements, not something that might emerge later.",
          source: "official"
        },
        {
          type: "single",
          question: "Your codebase has distinct areas with different coding conventions: React components use functional style with hooks, API handlers use async/await with specific error handling, and database models follow a repository pattern. Test files are spread throughout the codebase alongside the code they test (e.g., Button.test.tsx next to Button.tsx), and you want all tests to follow the same conventions regardless of location. What's the most maintainable way to ensure Claude automatically applies the correct conventions when generating code?",
          options: [
            "Create rule files in .claude/rules/ with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths",
            "Consolidate all conventions in the root CLAUDE.md file under headers for each area, relying on Claude to infer which section applies",
            "Create skills in .claude/skills/ for each code type that include the relevant conventions in their SKILL.md files",
            "Place a separate CLAUDE.md file in each subdirectory containing that area's specific conventions"
          ],
          correct: [0],
          explanation: "Option A is correct because .claude/rules/ with glob patterns (e.g., **/*.test.tsx) allows conventions to be automatically applied based on file paths regardless of directory location, essential for test files spread throughout the codebase. Option B relies on inference rather than explicit matching, making it unreliable. Option C requires manual skill invocation or relies on Claude choosing to load them, contradicting the need for deterministic \"automatic\" application based on file paths. Option D can't easily handle files spread across many directories since CLAUDE.md files are directory-bound.",
          source: "official"
        },
        {
          type: "single",
          question: "Your pipeline script runs claude \"Analyze this pull request for security issues\" but the job hangs indefinitely. Logs indicate Claude Code is waiting for interactive input. What's the correct approach to run Claude Code in an automated pipeline?",
          options: [
            "Add the -p flag: claude -p \"Analyze this pull request for security issues\"",
            "Set the environment variable CLAUDE_HEADLESS=true before running the command",
            "Redirect stdin from /dev/null: claude \"Analyze this pull request for security issues\" < /dev/null",
            "Add the --batch flag: claude --batch \"Analyze this pull request for security issues\""
          ],
          correct: [0],
          explanation: "The -p (or --print) flag is the documented way to run Claude Code in non-interactive mode. It processes the prompt, outputs the result to stdout, and exits without waiting for user input — exactly what CI/CD pipelines require. The other options reference non-existent features (CLAUDE_HEADLESS environment variable, --batch flag) or use Unix workarounds that don't properly address Claude Code's command syntax.",
          source: "official"
        },
        {
          type: "single",
          question: "What's the main benefit of the @import syntax inside a CLAUDE.md file?",
          options: [
            "It lets you reference external files to keep CLAUDE.md modular, e.g. importing only the standards files relevant to a given package.",
            "It automatically synchronizes CLAUDE.md across every developer's machine.",
            "It replaces the need for .claude/rules/ entirely.",
            "It's required for CLAUDE.md to be version-controlled."
          ],
          correct: [0],
          explanation: "@import references other files so a CLAUDE.md doesn't have to inline everything — a package-specific CLAUDE.md can import only the standards documents relevant to that package instead of duplicating shared content."
        },
        {
          type: "single",
          question: "What's the purpose of context: fork in a Skill's SKILL.md frontmatter?",
          options: [
            "It duplicates the skill under a new name automatically.",
            "It runs the skill in an isolated sub-agent context so its output doesn't pollute the main conversation.",
            "It forks the git repository before the skill runs.",
            "It grants the skill unrestricted tool access."
          ],
          correct: [1],
          explanation: "context: fork isolates a skill's execution (and its often verbose output) in a sub-agent context, keeping the main conversation focused on the skill's final result rather than its intermediate work."
        },
        {
          type: "single",
          question: "Your CI pipeline re-runs Claude Code's PR review after every new commit to the same pull request. What should you do to avoid the review repeatedly flagging the same already-known issues as new comments?",
          options: [
            "Nothing — re-running always produces fresh, independent findings.",
            "Include the prior review's findings in context on re-runs, and instruct Claude to report only new or still-unaddressed issues.",
            "Disable the review after the first run.",
            "Switch to a higher-tier model so it remembers the prior run automatically."
          ],
          correct: [1],
          explanation: "Each CI invocation is a fresh session with no memory of the prior run unless you explicitly provide it. Including prior findings in context and instructing Claude to report only new/unaddressed issues avoids duplicate PR comments on every re-run."
        },
        {
          type: "single",
          question: "A prose description of a desired data transformation keeps producing inconsistent results across attempts. What's the most effective way to clarify the requirement?",
          options: [
            "Repeat the prose description with more emphatic wording.",
            "Provide 2-3 concrete input/output examples showing the exact transformation expected.",
            "Switch to a lower-cost model, since the current model isn't capable enough.",
            "Abandon the transformation task entirely."
          ],
          correct: [1],
          explanation: "When natural-language descriptions are interpreted inconsistently, concrete input/output examples are the most effective way to pin down exactly what transformation is expected — they remove the ambiguity that prose leaves open."
        },
        {
          type: "multi",
          question: "Which two of the following correctly describe project-scoped vs. user-scoped custom slash commands? (Select 2)",
          options: [
            "Project-scoped commands live in .claude/commands/ within the repository and are version-controlled.",
            "User-scoped commands live in .claude/commands/ within the repository and are version-controlled.",
            "User-scoped commands live in ~/.claude/commands/ and are personal, not shared via version control.",
            "There is no difference between project-scoped and user-scoped commands."
          ],
          correct: [0, 2],
          explanation: "Project-scoped commands (.claude/commands/ in the repo) are shared and version-controlled, available to every developer on clone/pull. User-scoped commands (~/.claude/commands/) are personal and not shared with teammates."
        },
        {
          type: "single",
          question: "Two engineers on the same repository get noticeably different behavior from Claude Code on identical tasks. Both insist their configuration is correct. What's the most direct way to diagnose this?",
          options: [
            "Have each engineer run /memory to see which memory files are actually loaded in their session, and compare.",
            "Have both engineers delete their ~/.claude/ directories and start over.",
            "Compare the git history of the project CLAUDE.md to find a recent breaking change.",
            "Add the same instructions to both engineers' user-level CLAUDE.md files to force consistency."
          ],
          correct: [0],
          explanation: "/memory reports which memory files are currently loaded, which is exactly the ground truth needed when behavior is inconsistent across sessions or team members — it distinguishes what's actually loaded from what everyone assumes is loaded. Option B destroys evidence and personal config without diagnosing anything. Option C assumes the project file is at fault when the far more common cause is an unshared user-level file. Option D papers over the divergence by duplicating config outside version control, which is the original defect.",
        },
        {
          type: "single",
          question: "Your team's deployment runbook is a large document that's only relevant when someone touches infra/. It currently lives in the root CLAUDE.md, and engineers complain that unrelated sessions feel cluttered. Which restructuring best addresses this?",
          options: [
            "Move it into a .claude/rules/deployment.md file (or a directory-level CLAUDE.md under infra/) so it loads only when relevant, rather than in every session.",
            "Leave it in the root CLAUDE.md but add a header saying \"ignore unless working in infra/\".",
            "Move it to each engineer's user-level ~/.claude/CLAUDE.md.",
            "Convert it to a slash command so it never loads automatically."
          ],
          correct: [0],
          explanation: "The .claude/rules/ directory exists as the alternative to a monolithic CLAUDE.md, organizing topic-specific rule files that don't tax every session; a directory-level CLAUDE.md under infra/ achieves the same scoping. Option B still loads the entire document into every session — the cost is the tokens, not the confusion. Option C removes it from version control, so nobody new gets the runbook. Option D is closer to reasonable but a runbook is reference context, not an invocable workflow, and it would then apply only when someone remembers to run it.",
        },
        {
          type: "multi",
          question: "Your team wants an audit-dependencies skill that produces a long analysis and must never modify files. Which two SKILL.md frontmatter options address these requirements? (Select 2)",
          options: [
            "context: fork, so the verbose analysis runs in an isolated sub-agent context instead of filling the main conversation.",
            "allowed-tools: [Read, Grep], so the skill is structurally incapable of writing or editing files.",
            "argument-hint, which prevents the skill from performing destructive operations.",
            "context: fork, which grants the skill read-only access to the filesystem."
          ],
          correct: [0, 1],
          explanation: "context: fork isolates the skill's verbose output in a sub-agent context, and allowed-tools restricts tool access during execution — limiting it to read-only tools makes modification impossible rather than merely discouraged. Option C misdescribes argument-hint, which prompts developers for required parameters when they invoke the skill without arguments. Option D misdescribes context: fork, which controls context isolation, not filesystem permissions — those are two separate frontmatter concerns.",
        },
        {
          type: "single",
          question: "A developer wants a personal variant of the team's shared /deploy-check skill with extra verbose logging, without changing anyone else's behavior. What's the correct approach?",
          options: [
            "Create the variant in ~/.claude/skills/ under a different name, leaving the shared project skill untouched.",
            "Edit the project's .claude/skills/deploy-check/SKILL.md and add a flag teammates can ignore.",
            "Copy the shared skill into ~/.claude/skills/ under the same name so it overrides the project version.",
            "Personal skill variants aren't supported; the developer should request a change to the shared skill."
          ],
          correct: [0],
          explanation: "Personal skill customization means creating variants in ~/.claude/skills/ with a different name specifically to avoid affecting teammates — the name change is what prevents collision with the shared skill. Option B changes a version-controlled file, so every teammate gets the modification. Option C invites a name collision instead of avoiding it. Option D is simply false — personal customization is a documented pattern.",
        },
        {
          type: "single",
          question: "You need to add a single date-validation conditional to one function, and the stack trace already identifies the exact line. Which approach is appropriate?",
          options: [
            "Direct execution — the change is simple, well-scoped, and the path is already clear.",
            "Plan mode, since all code changes benefit from exploration first.",
            "Plan mode, because validation logic always has architectural implications.",
            "The Explore subagent, to map the codebase before making the change."
          ],
          correct: [0],
          explanation: "Direct execution is appropriate for simple, well-scoped changes with a clear path — a single-file fix with a clear stack trace is the textbook example. Options B and C over-apply plan mode, which exists for large-scale changes with multiple valid approaches and genuine architectural decisions; planning a change you already fully understand is pure ceremony. Option D invokes a context-preservation mechanism for a task with no discovery phase.",
        },
        {
          type: "single",
          question: "During a multi-phase migration, the discovery phase generates thousands of lines of file listings and dependency traces, and by implementation time the session is running low on context. What's the documented mitigation?",
          options: [
            "Use the Explore subagent for the verbose discovery phase, so it returns summaries and the main conversation's context is preserved.",
            "Increase max_tokens so the session can hold more discovery output.",
            "Run the discovery phase with --output-format json to compress the output.",
            "Skip the discovery phase and rely on the model's general knowledge of similar codebases."
          ],
          correct: [0],
          explanation: "The Explore subagent isolates verbose discovery output and returns summaries, preventing context window exhaustion during multi-phase tasks — the same isolation principle as context: fork on a skill. Option B misunderstands max_tokens, which caps response length rather than the context window. Option C is a CI output-formatting flag and doesn't reduce what enters the session's context. Option D abandons the discovery the task actually requires, and answering from \"typical patterns\" instead of the real code is a context-degradation symptom, not a fix.",
        },
        {
          type: "single",
          question: "You're fixing three bugs in a caching layer: the eviction policy, the key-generation scheme, and the TTL calculation. Changing any one affects the correctness of the others. How should you communicate them to Claude?",
          options: [
            "In a single detailed message describing all three issues together, since the fixes interact.",
            "Sequentially, one issue per message, verifying each fix before moving to the next.",
            "As three separate parallel sessions, one per bug, then merge the results.",
            "As a test suite only, with no description of the issues."
          ],
          correct: [0],
          explanation: "When multiple issues interact, addressing them in a single detailed message is the documented approach — fixes to coupled problems constrain each other, so solving them one at a time means each fix is made blind to the others and later fixes can undo earlier ones. Option B is right for *independent* problems, which these explicitly aren't. Option C guarantees three mutually-inconsistent solutions. Option D discards the reasoning about why the current behavior is wrong, which the interaction between the bugs makes essential.",
        },
        {
          type: "single",
          question: "You're implementing a caching layer in an unfamiliar domain and aren't confident you can specify all the requirements upfront. Which technique best surfaces the considerations you haven't thought of?",
          options: [
            "The interview pattern — have Claude ask questions before implementing, surfacing considerations like cache invalidation strategy and failure modes.",
            "Write a longer, more emphatic prose specification.",
            "Ask for three implementations and pick the best one.",
            "Use plan mode with an instruction not to ask any questions."
          ],
          correct: [0],
          explanation: "The interview pattern — having Claude ask questions to surface considerations the developer may not have anticipated — is specifically valuable in unfamiliar domains, which is precisely where you're least equipped to write a complete spec. Option B can't surface unknown unknowns: you can't specify what you haven't thought of, at any length. Option C produces three implementations built on the same incomplete requirements. Option D disables the questioning that would surface the gaps.",
        },
        {
          type: "single",
          question: "Your CI test-generation job keeps proposing test cases the existing suite already covers, and reviewers are ignoring its output. What's the most effective fix?",
          options: [
            "Provide the existing test files in context so generation avoids duplicating covered scenarios, and document testing standards and available fixtures in CLAUDE.md.",
            "Reduce how often the job runs, so reviewers see less duplicate output.",
            "Instruct the prompt to \"only generate valuable tests\" and rely on the model's judgment.",
            "Switch the job to the Message Batches API to lower the cost of the redundant output."
          ],
          correct: [0],
          explanation: "Providing existing test files in context is the documented way to prevent duplicate scenario suggestions, and documenting testing standards, valuable test criteria, and available fixtures in CLAUDE.md improves generation quality while reducing low-value output. Option B reduces the volume of noise without improving the signal. Option C is exactly the kind of vague, non-categorical instruction that fails to improve precision — the model has no way to know what's already covered without being shown. Option D makes worthless output cheaper rather than making it useful.",
        },
        {
          type: "multi",
          question: "Which two statements accurately describe running Claude Code in a CI pipeline? (Select 2)",
          options: [
            "The committed project CLAUDE.md gives the CI-invoked run its project context — testing standards, fixture conventions, and review criteria — automatically on checkout.",
            "A fresh CI review instance is at a disadvantage versus the session that generated the code, because it lacks that session's reasoning context.",
            "--output-format json combined with --json-schema yields machine-parseable findings suitable for posting as inline PR comments.",
            "CI sessions automatically retain findings from the previous run on the same pull request."
          ],
          correct: [0, 2],
          explanation: "CLAUDE.md is the documented mechanism for supplying project context to CI-invoked Claude Code, and it arrives with the checkout because it's version-controlled. --output-format json with --json-schema produces the structured findings automated PR commenting needs. Option B inverts the truth: an independent instance is *more* effective at review precisely because it lacks the generator's reasoning context and is more willing to question the code. Option D is false — each invocation is a fresh session, which is exactly why prior findings must be passed in explicitly to avoid duplicate comments.",
        },
        {
          type: "single",
          question: "Your team's monorepo has a root CLAUDE.md, and each package has its own. The payments package's maintainers need the shared API conventions and security standards, but not the frontend styling guide. What's the cleanest way to compose this?",
          options: [
            "Use @import in the payments package's CLAUDE.md to include only the standards files its maintainers need.",
            "Copy the relevant sections of the shared standards into the payments package's CLAUDE.md.",
            "Put every standard in the root CLAUDE.md and let Claude infer which apply to the current package.",
            "Create a .claude/skills/ entry per standard so maintainers invoke the ones they need."
          ],
          correct: [0],
          explanation: "@import lets a CLAUDE.md reference external files so each package includes only the standards relevant to it, based on its maintainers' domain knowledge — composition without duplication. Option B duplicates shared text that drifts out of sync the moment either copy is edited. Option C loads the frontend styling guide into every payments session and relies on inference rather than explicit selection. Option D turns always-applicable standards into something that only applies when someone remembers to invoke it — standards belong in CLAUDE.md, not skills."
        }
      ],
      flashcards: [
        { front: "Three levels of CLAUDE.md hierarchy?", back: "User-level (~/.claude/CLAUDE.md), project-level (.claude/CLAUDE.md or root CLAUDE.md), directory-level (subdirectory CLAUDE.md files)." },
        { front: "Are user-level CLAUDE.md instructions shared with teammates?", back: "No — ~/.claude/CLAUDE.md applies only to that user and isn't shared via version control; that's a common cause of \"why isn't my teammate getting these instructions.\"" },
        { front: "What does @import do in CLAUDE.md?", back: "References external files to keep CLAUDE.md modular, e.g. importing only the standards files relevant to a given package." },
        { front: "What's .claude/rules/ an alternative to?", back: "A monolithic CLAUDE.md — it organizes topic-specific rule files (testing.md, api-conventions.md, deployment.md) separately." },
        { front: "What does the /memory command do?", back: "Shows which memory (CLAUDE.md) files are currently loaded, useful for diagnosing inconsistent behavior across sessions or between teammates." },
        { front: "What do .claude/rules/ files use to control when they load?", back: "YAML frontmatter with a paths field of glob patterns — the rule only activates when you're editing a matching file, reducing irrelevant context and token usage." },
        { front: "Why prefer path-specific rules over per-directory CLAUDE.md for something like test-file conventions?", back: "Test files are often scattered across many directories; a glob-pattern rule (**/*.test.tsx) applies by file type regardless of location, while directory CLAUDE.md is bound to one directory." },
        { front: "Project-scoped vs. user-scoped slash commands — where does each live?", back: "Project: .claude/commands/ (version-controlled, team-wide). User: ~/.claude/commands/ (personal, not shared)." },
        { front: "What does context: fork do in a Skill's frontmatter?", back: "Runs the skill in an isolated sub-agent context so its (often verbose) output doesn't pollute the main conversation." },
        { front: "What does allowed-tools do in SKILL.md frontmatter?", back: "Restricts which tools the skill may use while running — e.g. limiting an audit skill to [Read, Grep] makes destructive actions structurally impossible, not just discouraged." },
        { front: "Skill or CLAUDE.md — which for what?", back: "Skills for on-demand, task-specific workflows (invoked deliberately). CLAUDE.md for always-loaded universal standards." },
        { front: "When does plan mode earn its cost over direct execution?", back: "Complex, large-scale changes with multiple valid approaches and architectural decisions — it lets you explore and design before committing, avoiding costly rework." },
        { front: "What's the Explore subagent for?", back: "Isolating verbose discovery output and returning summaries, preventing context exhaustion during multi-phase tasks — the same isolation idea as context: fork." },
        { front: "Interacting issues vs. independent issues — how do you report them?", back: "Interacting: all in one detailed message, since the fixes constrain each other. Independent: sequentially, so each fix can be verified on its own." },
        { front: "What's the interview pattern and when is it most valuable?", back: "Having Claude ask questions before implementing, to surface considerations you hadn't anticipated — most valuable in unfamiliar domains where you can't write a complete spec." },
        { front: "What's the -p (--print) flag for in Claude Code?", back: "Runs Claude Code non-interactively for automated pipelines — it prints the result and exits instead of hanging waiting for interactive input." },
        { front: "What do --output-format json and --json-schema give you in CI?", back: "Machine-parseable, schema-conformant structured findings you can post as inline PR comments programmatically." },
        { front: "Why is the same session that generated code often worse at reviewing it?", back: "It retains its own reasoning context from generation, making it less likely to question its own decisions — an independent review instance without that context catches more." },
        { front: "Why does a CI review re-post the same comments after each new commit, and what's the fix?", back: "Each invocation is a fresh session with no memory of the last. Include prior findings in context and instruct Claude to report only new or still-unaddressed issues." }
      ]
    },
    {
      id: "d4",
      title: "Prompt Engineering & Structured Output",
      weight: 20,
      summary: "Engineering prompts and schemas for precise, consistent, and reliably structured output — and choosing the right processing and review architecture around them.",
      objectives: [
        "Design prompts with explicit criteria to improve precision and reduce false positives",
        "Apply few-shot prompting to improve output consistency and quality",
        "Enforce structured output using tool use and JSON schemas",
        "Implement validation, retry, and feedback loops for extraction quality",
        "Design efficient batch processing strategies",
        "Design multi-instance and multi-pass review architectures"
      ],
      lesson: {
        sections: [
          {
            heading: "Explicit criteria beat vague instructions",
            body: `<p>Instructions like "be conservative" or "only report high-confidence findings" fail to improve precision, and the reason is worth being precise about: they give the model <strong>no concrete standard to apply</strong>. "Conservative" isn't a threshold — it's a word the model has to interpret afresh on every finding, which is exactly the inconsistency you were trying to eliminate.</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ Vague — unfalsifiable</span><code>"Check that comments are<br>accurate. Be conservative<br>and only report high-<br>confidence findings."</code><p>What makes a comment "inaccurate"? Slightly stale wording? A renamed parameter? Nothing here can be checked, so two runs can both comply and disagree completely.</p></div><div class="compare-col good"><span class="cc-label">✓ Explicit — categorical</span><code>"Flag a comment only when the<br>behavior it claims contradicts<br>what the code actually does.<br>Do not flag: outdated phrasing,<br>missing comments, or style."</code><p>A binary test the model applies the same way every time — and one you can audit a disagreement against afterwards.</p></div></div><p>Notice what changed: not the strength of the wording, but its <em>checkability</em>. General instructions like "be conservative" fail specifically because they're non-categorical — they ask for a disposition, where a criterion asks for a decision.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Telling a new code reviewer "use good judgment, don't nitpick" versus handing them a checklist that says "block on: security issues, data loss, broken tests. Comment on: naming, structure. Ignore: formatting — the linter owns that." The first produces a different review from every reviewer, and from the same reviewer on different days. The second produces the same review from anyone. The model has exactly this problem, and the same fix works.</div><p>The stakes are higher than they look, because <strong>false positives are contagious</strong>. A single high-false-positive category doesn't just waste time on itself — it undermines developer trust in the categories that <em>are</em> accurate. Once a reviewer learns that "possible race condition" is noise, they start skimming past "SQL injection" in the same list. Here's the trap: your precision metrics can look fine in aggregate while one noisy category quietly destroys the tool's credibility.</p><p>That leads to a counterintuitive but documented move: <strong>temporarily disable a high-false-positive category</strong> while you improve its prompt, rather than leaving it on and eroding trust in everything else. Shipping fewer, more reliable categories beats shipping all of them badly. And when you need consistent severity classification, define explicit severity criteria <em>with concrete code examples for each level</em> — asking the model to "judge severity" reintroduces exactly the vagueness you just removed.</p>`,
            interactive: {
              type: "scenario",
              title: "The review nobody reads anymore",
              setup: "Your CI code review posts findings on every PR. The \"possible race condition\" category is wrong about 70% of the time; the security category is genuinely excellent. Developers have started ignoring the bot's comments wholesale — including the security ones. You have one sprint. What do you do?",
              choices: [
                {
                  text: "Add \"be more conservative and only report high-confidence race conditions\" to the prompt and leave everything running.",
                  outcome: "bad",
                  feedback: "This is the exact instruction the guide names as ineffective. \"Conservative\" and \"high-confidence\" give the model no concrete standard — it's already confident in those 70% wrong findings, which is why they got posted. Meanwhile the trust damage keeps compounding all sprint, because nothing actually changed."
                },
                {
                  text: "Temporarily disable the race-condition category to restore trust, then rewrite its prompt with explicit criteria and concrete code examples per severity level before re-enabling it.",
                  outcome: "good",
                  feedback: "Right, and for both reasons. Disabling stops the trust bleed immediately — developers start reading the security findings again because the noise is gone. Then the fix targets the real root cause: replacing confidence-based filtering with categorical criteria and concrete examples. Shipping fewer reliable categories genuinely beats shipping all of them badly."
                },
                {
                  text: "Keep all categories but add a confidence score to each finding and hide anything below 0.8.",
                  outcome: "bad",
                  feedback: "This builds on a foundation the guide explicitly calls unreliable: self-reported confidence is poorly calibrated, and a model that's wrong 70% of the time on race conditions is confidently wrong. You'd filter on a number that doesn't track correctness — while leaving the actual defect, the vague criteria, completely untouched."
                }
              ]
            }
          },
          {
            heading: "Few-shot prompting for consistency",
            body: `<p>When detailed prose instructions alone produce inconsistent results, <strong>few-shot examples are the most effective technique</strong> for consistently formatted, actionable output. But the reason they work is easy to get wrong, and the misunderstanding is expensive.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Training a new analyst. You could hand them a policy document — or you could walk them through four real cases, saying "we approved this one because X, but rejected that one despite looking similar, because Y." They don't memorize those four cases. They extract the <em>principle</em> and apply it to the hundred cases you never showed them. That's what a good few-shot example does; that's why the reasoning matters more than the answer.</div><p>Few-shot examples let the model <strong>generalize the underlying judgment to novel patterns</strong> — not merely match the cases you listed. This distinction shows up on the exam: the wrong mental model ("examples enumerate the cases") leads to trying to cover every scenario with more and more examples, when 2-4 well-chosen ones that show <em>why</em> generalize better than twenty that only show <em>what</em>.</p><p>They're most valuable for <strong>ambiguous-case handling</strong> — which tool to pick for an ambiguous request, whether a branch-level coverage gap matters — and they're one of the strongest levers against hallucination in extraction, particularly with informal measurements and varied document structures.</p><p>Practical guidelines:</p><ul><li><strong>2-4 targeted examples</strong> for an ambiguous scenario is usually enough.</li><li><strong>Show the reasoning</strong> for why one action was chosen over a plausible alternative — this is what enables generalization rather than pattern-matching.</li><li><strong>Demonstrate the exact output format</strong> you want (location, issue, severity, suggested fix) to lock in consistency.</li><li><strong>Contrast acceptable patterns against genuine issues</strong> — an example of something that looks like a bug but isn't does more for false-positive rates than another example of a real bug.</li><li><strong>Cover structural variety</strong> in extraction: inline citations vs. a bibliography, a methodology section vs. detail embedded in prose. Assuming one canonical layout is how you get empty required fields on the documents that don't match it.</li></ul><pre><code>Input:  "Refund my order, it arrived smashed" + photo attached
Action: process_refund (not escalate_to_human)
Why:    Damage claims with photo evidence are standard policy —
        complexity of *phrasing* isn't complexity of *case*.</code></pre><p>That "Why" line is the whole point. Without it, the model learns "this phrasing → this tool." With it, the model learns a principle it can apply to a differently-worded case it has never seen.</p>`
          },
          {
            heading: "Enforcing structured output with tool_use and JSON schemas",
            body: `<p>Using <strong>tool_use with a JSON schema</strong> is the most reliable approach for guaranteed schema-compliant structured output. It eliminates JSON syntax errors outright — the model is filling in a schema rather than freehand-generating text that happens to look like JSON, so there's no trailing comma to parse around.</p><p>What it does <em>not</em> eliminate is <strong>semantic errors</strong>. This is the distinction the exam tests hardest:</p><div class="compare-grid"><div class="compare-col good"><span class="cc-label">✓ Eliminated by the schema</span><p>Malformed JSON. Missing required fields. A string where a number belongs. An enum value outside the allowed set.</p><p><em>Syntax and structure — the schema is a hard constraint.</em></p></div><div class="compare-col bad"><span class="cc-label">✗ NOT eliminated by the schema</span><p>Line items that don't sum to the stated total. The invoice date placed in the due-date field. A plausible but fabricated tax ID.</p><p><em>Every one of these is perfectly valid JSON, perfectly schema-compliant, and wrong.</em></p></div></div><p>Schema design choices carry real weight:</p><pre><code>{
  "type": "object",
  "properties": {
    "amount": { "type": ["number", "null"] },
    "category": { "enum": ["refund", "credit", "other"] },
    "category_detail": { "type": "string" }
  },
  "required": ["category"]
}</code></pre><p><strong>Make a field optional/nullable when the source document may simply not contain it.</strong> Here's the mechanism, and it's the reason this matters so much: a required field is pressure. The model must emit <em>something</em> — and given a choice between violating the schema and inventing a plausible tax ID, it invents. You didn't ask it to hallucinate; you built a structure where honesty wasn't an available output. Nullable fields give "not present" a way to be expressed.</p><p>The <strong>enum + "other" + detail string</strong> pattern (above) is the same idea for categories: a fixed set of known values plus an escape hatch, so a case that doesn't fit any category doesn't get forced into the nearest one. Adding an <code>"unclear"</code> enum value for genuinely ambiguous cases works the same way.</p><p>On <code>tool_choice</code> for extraction: use <code>"any"</code> when multiple extraction schemas exist and the document type isn't known ahead of time — you need structured output, you just don't know which shape. Use forced selection (<code>{"type": "tool", "name": "extract_metadata"}</code>) when a specific extraction must run before dependent enrichment steps. And when source formatting is inconsistent, include <strong>format normalization rules in the prompt alongside</strong> the strict schema — the schema constrains the shape of the output, not how the model interprets "twelve fifty" on the way in.</p>`
          },
          {
            heading: "Validation, retry, and feedback loops",
            body: `<p>A <strong>retry-with-error-feedback</strong> loop appends the <em>specific</em> validation errors from a failed attempt to the next prompt. The word doing the work is "specific": re-sending the same request with "that was wrong, try again" gives the model nothing to correct toward, and it will often produce the identical output. The follow-up request should include the original document, the failed extraction, and the exact validation errors.</p><p>The critical judgment is <strong>knowing when retrying cannot possibly work</strong>:</p><div class="compare-grid"><div class="compare-col good"><span class="cc-label">✓ Retry will succeed</span><p>Format mismatches ("2024-13-45" isn't a date). Structural output errors. A value in the wrong field. A missed line item that's visibly on page 3.</p><p><em>The information exists; the model got it wrong. Feedback fixes that.</em></p></div><div class="compare-col bad"><span class="cc-label">✗ Retry is futile</span><p>A required <code>tax_id</code> that appears nowhere in the document — because it only exists on an addendum you didn't provide.</p><p><em>No amount of feedback invents data that isn't there. Retrying just pressures the model to fabricate.</em></p></div></div><p>Here's the trap: <strong>both failures look identical from inside the loop</strong> — a validation error and a retry. The difference is whether the required information is present in the source at all. Retrying an absent-data failure doesn't just waste calls; it escalates the pressure that produces fabricated values in the first place. When the data genuinely isn't there, the fix is upstream: make the field nullable, or route the document to human review.</p><p>Two design patterns extend this into a real feedback system:</p><ul><li><strong>Self-correction validation flows</strong> — extract a <code>calculated_total</code> alongside the document's own <code>stated_total</code> so a mismatch surfaces automatically instead of being silently trusted. Add a <code>conflict_detected</code> boolean when source data is internally inconsistent. This catches exactly the semantic errors the schema can't.</li><li><strong>Dismissal pattern tracking</strong> — add a <code>detected_pattern</code> field to structured findings recording which code construct triggered each one. When developers dismiss findings, you can analyze <em>which constructs</em> generate false positives, turning scattered anecdotes into a targeted prompt fix.</li></ul>`,
            interactive: {
              type: "stepThrough",
              title: "Watch a validation-retry loop run",
              steps: [
                {
                  label: "Turn 1 — extract",
                  stopReason: "tool_use",
                  narration: "An invoice goes in. tool_choice forces the extraction tool, so we get schema-shaped output rather than prose. The schema guarantees this will be well-formed JSON — it guarantees nothing about whether the numbers are right.",
                  messages: [{ role: "assistant", kind: "tool_call", text: "extract_invoice(document: \"invoice_8842.pdf\")" }]
                },
                {
                  label: "Extraction returns",
                  stopReason: null,
                  narration: "Valid JSON. Schema-compliant. Every required field present. If your only check were the schema, you would ship this.",
                  messages: [{ role: "tool", kind: "tool_result", text: "→ { line_items: [120.00, 45.50], stated_total: 210.50, tax_id: \"84-2991773\" }" }]
                },
                {
                  label: "Validation runs",
                  stopReason: null,
                  narration: "Pydantic-style validation catches what the schema structurally cannot: 120.00 + 45.50 = 165.50, not 210.50. This is a semantic error — perfectly valid JSON that's simply wrong. Extracting calculated_total alongside stated_total is what makes it visible at all.",
                  messages: [{ role: "tool", kind: "tool_result", text: "✗ ValidationError: line_items sum to 165.50 but stated_total is 210.50" }]
                },
                {
                  label: "Turn 2 — retry WITH the error",
                  stopReason: "tool_use",
                  narration: "The retry is the whole lesson. We resend the original document, the failed extraction, AND the specific error. \"Try again\" alone would likely reproduce the same output — the model has no idea what went wrong. The precise error points straight at the discrepancy.",
                  messages: [{ role: "assistant", kind: "tool_call", text: "extract_invoice(document: \"invoice_8842.pdf\", prior_attempt: {…}, errors: [\"line_items sum to 165.50 but stated_total is 210.50\"])" }]
                },
                {
                  label: "Extraction returns",
                  stopReason: null,
                  narration: "Guided by the error, the model re-reads and finds a third line item it missed on the first pass. The information was in the document all along — this is exactly the class of failure retry is built for.",
                  messages: [{ role: "tool", kind: "tool_result", text: "→ { line_items: [120.00, 45.50, 45.00], stated_total: 210.50, tax_id: \"84-2991773\" }" }]
                },
                {
                  label: "Validation passes",
                  stopReason: "end_turn",
                  narration: "120.00 + 45.50 + 45.00 = 210.50. The record is consistent and can move downstream. Retry earned its keep because the missing data existed in the source and only needed to be found.",
                  messages: [{ role: "assistant", kind: "final", text: "✓ Extraction validated: 3 line items, calculated_total matches stated_total (210.50)." }]
                },
                {
                  label: "A different document — the limit of retry",
                  stopReason: "end_turn",
                  narration: "Now the counter-case. This invoice has no tax ID anywhere; it lives on an addendum nobody attached. Retrying with error feedback CANNOT succeed — worse, each retry pressures the model to fabricate something plausible to satisfy the required field. Recognizing absent data (versus a format error) is the judgment call: the fix is upstream, making tax_id nullable or routing the document to human review.",
                  messages: [{ role: "tool", kind: "tool_result", text: "✗ ValidationError: tax_id required — retry #3 produced \"84-0000000\" (fabricated). Data absent from source; STOP retrying, route to human review." }]
                }
              ]
            }
          },
          {
            heading: "Batch processing: trading latency for cost",
            body: `<p>The <strong>Message Batches API</strong> makes one trade: roughly <strong>50% cost savings</strong> in exchange for a processing window of <strong>up to 24 hours with no guaranteed latency SLA</strong>. Every decision about it follows from that sentence.</p><p>It fits non-blocking, latency-tolerant workloads — overnight reports, weekly audits, nightly test generation. It's wrong for blocking workflows, and the clearest test is: <strong>is a human waiting on this result right now?</strong> A pre-merge check has a developer sitting there watching CI. "Batches are usually faster than 24 hours" isn't an argument — an SLA you don't have isn't one you can design around.</p><p>Two more constraints worth knowing cold:</p><ul><li><strong>No multi-turn tool calling within a single batch request.</strong> You can't execute a tool mid-request and feed results back inside one batch call. An agentic loop needs the synchronous API — this is a structural limit, not a performance one.</li><li><strong><code>custom_id</code> correlates each request with its response.</strong> This is also how you handle partial failures: identify the failed documents by <code>custom_id</code> and resubmit only those, with modifications (e.g., chunking one that exceeded context limits) rather than re-running the whole batch.</li></ul><p>Batch windows also compose into SLA math the exam likes. If you promise a 30-hour turnaround and batches take up to 24, you can't submit once a day — a document arriving just after submission waits ~24h to be picked up, then up to 24h to process. Submitting every 4 hours bounds the wait so the total stays inside 30. And before processing large volumes, <strong>refine the prompt on a sample set</strong>: a first-pass failure at scale means resubmitting thousands of documents, which is exactly the cost the batch discount was supposed to save.</p>`,
            interactive: {
              type: "classify",
              title: "Real-time or batch?",
              instructions: "For each workload, decide whether the synchronous API or the Message Batches API fits. The question that decides it: is anyone blocked waiting on this result?",
              items: [
                {
                  text: "A pre-merge check that must pass before a developer can merge their PR.",
                  answer: "realtime",
                  options: [["realtime", "⚡ Real-time API"], ["batch", "🌙 Batches API"]],
                  why: "A developer is sitting there waiting. Blocking workflows can't accept \"up to 24 hours, no SLA\" — and \"it's usually fast\" is not a guarantee you can merge against."
                },
                {
                  text: "A technical-debt report generated overnight for review the next morning.",
                  answer: "batch",
                  options: [["realtime", "⚡ Real-time API"], ["batch", "🌙 Batches API"]],
                  why: "The textbook fit: nobody is blocked, the deadline is hours away, and the 50% saving is free money."
                },
                {
                  text: "A customer support agent that calls get_customer, then lookup_order based on the result, then decides whether to refund.",
                  answer: "realtime",
                  options: [["realtime", "⚡ Real-time API"], ["batch", "🌙 Batches API"]],
                  why: "Two reasons, and the second is absolute: a customer is waiting, and the batch API doesn't support multi-turn tool calling within a request. An agentic loop structurally cannot run in a batch."
                },
                {
                  text: "A weekly compliance audit over 40,000 archived contracts, due Friday.",
                  answer: "batch",
                  options: [["realtime", "⚡ Real-time API"], ["batch", "🌙 Batches API"]],
                  why: "High volume, latency-tolerant, no one blocked — exactly where the 50% saving compounds. Refine the prompt on a sample first, so a bad first pass doesn't mean resubmitting 40,000 documents."
                },
                {
                  text: "Nightly test generation for files changed that day, reviewed by the team next morning.",
                  answer: "batch",
                  options: [["realtime", "⚡ Real-time API"], ["batch", "🌙 Batches API"]],
                  why: "Named in the guide as a batch fit: it runs while everyone's asleep and the results are read hours later."
                },
                {
                  text: "An IDE assistant suggesting a fix as the developer types.",
                  answer: "realtime",
                  options: [["realtime", "⚡ Real-time API"], ["batch", "🌙 Batches API"]],
                  why: "Interactive latency requirement. A suggestion that arrives tomorrow isn't a cheaper suggestion — it's not a suggestion."
                }
              ]
            }
          },
          {
            heading: "Multi-instance and multi-pass review architectures",
            body: `<p>Two independent architectural ideas share this section, and both come down to the same insight: <em>who does the reviewing, and how much do you ask them to look at once.</em></p><p><strong>Self-review is structurally limited.</strong> A model that generated code retains its reasoning context from generation, which makes it less likely to question its own decisions in the same session. It already concluded that approach was right — asking it to check its work invites it to re-derive the same conclusion. An <strong>independent review instance</strong>, without that prior reasoning context, is more effective at catching subtle issues than self-review instructions or extended thinking.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Proofreading your own writing. You don't read what's on the page — you read what you meant, because you still have the intention in your head. That's why the typo you missed on four passes is the first thing a colleague spots. The model has the same problem for the same reason: it isn't lack of skill, it's the reasoning context from generation still being loaded.</div><p><strong>Multi-pass review beats one big pass.</strong> A single-pass review of a 14-file PR produces a recognizable failure signature: detailed feedback on some files and superficial comments on others, obvious bugs missed, and — the tell — <em>contradictory findings</em>, flagging a pattern as problematic in one file while approving identical code elsewhere in the same PR. That inconsistency is the fingerprint of <strong>attention dilution</strong>, not of a model that doesn't know the answer.</p><p>The fix is splitting by concern: a <strong>focused per-file pass</strong> for local issues, plus a <strong>separate integration pass</strong> for cross-file data flow. Each pass gets a tractable amount to attend to.</p><div class="callout warn"><span class="callout-label">Watch out</span>Two tempting non-fixes. A <em>larger context window</em> doesn't help — the files already fit; the problem is attention quality across them, not capacity. And <em>voting</em> (run three passes, report only issues found in 2 of 3) actively suppresses real bugs, since a subtle issue caught intermittently is exactly the kind consensus filtering discards. Both distractors appear on the exam because both sound like engineering.</div><p>A third technique: run <strong>verification passes where the model self-reports confidence alongside each finding</strong> to enable calibrated review routing. Note the difference from the self-reported confidence the escalation material warns about — here it routes <em>human attention</em> among findings a person will read anyway, rather than autonomously deciding what to suppress.</p>`
          }
        ],
        checks: [
          {
            type: "single",
            question: "A code-review prompt currently says \"only flag issues you're highly confident about.\" It's producing inconsistent results. What's the more effective replacement?",
            options: [
              "\"Be even more conservative than before.\"",
              "Specific, categorical criteria defining exactly which issue types to report (e.g., real bugs and security issues) versus skip (e.g., minor style, local patterns).",
              "\"Use your best judgment.\"",
              "Remove all guidance and let the model decide freely."
            ],
            correct: [1],
            explanation: "Vague confidence-based instructions like \"be conservative\" give the model no concrete standard. Explicit, categorical criteria naming which issue types to report versus skip produce far more consistent precision."
          },
          {
            type: "single",
            question: "You've defined a strict JSON schema and are using tool_use to enforce it for an invoice-extraction tool. Does this guarantee the extracted line items will sum correctly to the stated total?",
            options: [
              "Yes — tool_use with a schema guarantees full correctness, both structural and semantic.",
              "No — tool_use with a schema eliminates JSON syntax errors, but semantic errors like a total that doesn't match its line items still require separate validation.",
              "No — tool_use provides no reliability benefit over asking for JSON in prose.",
              "Only if the schema marks every field as required."
            ],
            correct: [1],
            explanation: "Schema-enforced tool_use guarantees the output is well-formed and schema-compliant, eliminating syntax errors. It says nothing about whether the values are semantically correct — a self-consistency check (e.g., comparing a calculated total to the stated total) is still needed."
          },
          {
            type: "single",
            question: "Your team wants to cut API costs on an overnight technical-debt report that no one is actively waiting on, using the Message Batches API. Is this an appropriate use of batch processing?",
            options: [
              "No — batch processing should never be used for reports.",
              "Yes — overnight, latency-tolerant, non-blocking workloads are exactly what the Batches API's 50% cost savings and up-to-24-hour window are suited for.",
              "Only if the report requires multi-turn tool calling within a single batch request.",
              "No — batch requests cannot be correlated back to their original inputs."
            ],
            correct: [1],
            explanation: "An overnight report with no one blocked waiting on it is the textbook fit for the Batches API: it tolerates the lack of a latency guarantee in exchange for real cost savings. custom_id fields handle correlating requests to responses."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "Your team wants to reduce API costs for automated analysis. Currently, real-time Claude calls power two workflows: (1) a blocking pre-merge check that must complete before developers can merge, and (2) a technical debt report generated overnight for review the next morning. Your manager proposes switching both to the Message Batches API for its 50% cost savings. How should you evaluate this proposal?",
          options: [
            "Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks.",
            "Switch both workflows to batch processing with status polling to check for completion.",
            "Keep real-time calls for both workflows to avoid batch result ordering issues.",
            "Switch both to batch processing with a timeout fallback to real-time if batches take too long."
          ],
          correct: [0],
          explanation: "The Message Batches API offers 50% cost savings but has processing times up to 24 hours with no guaranteed latency SLA. This makes it unsuitable for blocking pre-merge checks where developers wait for results, but ideal for overnight batch jobs like technical debt reports. Option B is wrong because relying on \"often faster\" completion isn't acceptable for blocking workflows. Option C reflects a misconception — batch results can be correlated using custom_id fields. Option D adds unnecessary complexity when the simpler solution is matching each API to its appropriate use case.",
          source: "official"
        },
        {
          type: "single",
          question: "A pull request modifies 14 files across the stock tracking module. Your single-pass review analyzing all files together produces inconsistent results: detailed feedback for some files but superficial comments for others, obvious bugs missed, and contradictory feedback — flagging a pattern as problematic in one file while approving identical code elsewhere in the same PR. How should you restructure the review?",
          options: [
            "Split into focused passes: analyze each file individually for local issues, then run a separate integration-focused pass examining cross-file data flow.",
            "Require developers to split large PRs into smaller submissions of 3-4 files before the automated review runs.",
            "Switch to a higher-tier model with a larger context window to give all 14 files adequate attention in one pass.",
            "Run three independent review passes on the full PR and only flag issues that appear in at least two of the three runs."
          ],
          correct: [0],
          explanation: "Splitting reviews into focused passes directly addresses the root cause: attention dilution when processing many files at once. File-by-file analysis ensures consistent depth, while a separate integration pass catches cross-file issues. Option B shifts burden to developers without improving the system. Option C misunderstands that larger context windows don't solve attention quality issues. Option D would actually suppress detection of real bugs by requiring consensus on issues that may only be caught intermittently.",
          source: "official"
        },
        {
          type: "single",
          question: "Why does an instruction like \"only report high-confidence findings\" tend to fail at improving review precision?",
          options: [
            "It's too short to be processed correctly.",
            "It gives the model no concrete, checkable standard — specific categorical criteria (what to report vs. skip, with examples) work far better.",
            "Confidence-based filtering is a feature that doesn't exist in Claude.",
            "It causes the model to stop responding."
          ],
          correct: [1],
          explanation: "Vague, confidence-based guidance leaves the model to define \"high-confidence\" itself, which produces inconsistent results. Specific criteria — naming exactly which categories of issues to report and which to skip — give it something concrete to apply consistently."
        },
        {
          type: "single",
          question: "An extraction prompt is asked to pull dollar amounts from invoices with inconsistent, informal formatting (\"twelve fifty\", \"$12.50\", \"12.50 USD\"). Detailed prose instructions alone produce inconsistent parsing. What's the most effective fix?",
          options: [
            "Add 2-4 few-shot examples showing correct extraction across the different formats encountered.",
            "Remove the ambiguous invoices from the input set entirely.",
            "Increase the model's max_tokens setting.",
            "Ask the model to guess and flag its own confidence after the fact."
          ],
          correct: [0],
          explanation: "Few-shot examples are one of the most effective techniques for reducing hallucination and inconsistency in extraction tasks, especially around informal or varied formatting — they let the model generalize the correct parsing pattern rather than relying on prose alone."
        },
        {
          type: "single",
          question: "A JSON schema marks a \"tax_id\" field as required, but many of the source documents you're extracting from don't include a tax ID at all. What's the likely consequence, and the fix?",
          options: [
            "No consequence — the model will always leave it blank correctly.",
            "The model may fabricate a plausible-looking tax ID to satisfy the required field; making the field optional/nullable prevents this.",
            "The extraction will always fail with a schema error.",
            "Required fields have no effect on model output, only on downstream validation."
          ],
          correct: [1],
          explanation: "A required field pressures the model to produce something rather than admit the information isn't present, which can lead to fabricated values. Marking genuinely optional data as nullable/optional lets the model honestly report its absence instead."
        },
        {
          type: "single",
          question: "A validation-retry loop keeps failing on the same document because a required field's value simply doesn't appear anywhere in the source text. What should you conclude?",
          options: [
            "Keep retrying with the same error message; it will eventually succeed.",
            "This is a case where retries are ineffective — the fix is to mark the field optional/nullable or route the document to human review, not to retry further.",
            "Switch the field to a stricter type to force compliance.",
            "The retry loop is broken and needs to be reimplemented from scratch."
          ],
          correct: [1],
          explanation: "Retry-with-error-feedback works for format and structural errors, but is ineffective when the required data is genuinely absent from the source — no amount of retrying invents information that was never there."
        },
        {
          type: "multi",
          question: "Which two of the following are accurate characteristics of the Message Batches API? (Select 2)",
          options: [
            "It offers roughly 50% cost savings compared to real-time calls.",
            "It guarantees a fixed low-latency response time for every request.",
            "It does not support multi-turn tool calling within a single batch request.",
            "It is the correct choice for a blocking pre-merge check a developer is actively waiting on."
          ],
          correct: [0, 2],
          explanation: "The Batches API trades a latency guarantee for roughly 50% cost savings (with a window up to 24 hours) and doesn't support executing tools mid-request within a batch call. It's a poor fit for blocking workflows precisely because there's no latency SLA."
        },
        {
          type: "single",
          question: "Why is an independent Claude instance often more effective at reviewing generated code than the same session that wrote it?",
          options: [
            "The generating session has a smaller context window during review.",
            "The generating session retains its own reasoning context, making it less likely to question decisions it just made; a fresh instance without that context is more likely to catch issues.",
            "Independent instances always use a higher-tier model automatically.",
            "There is no real difference; this is a myth."
          ],
          correct: [1],
          explanation: "Self-review is hampered by the model's own prior reasoning context biasing it toward its earlier decisions. An independent review instance, without that baggage, evaluates the code fresh and tends to catch subtler issues."
        },
        {
          type: "single",
          question: "Your CI review's \"possible race condition\" category is wrong roughly 70% of the time, while its security category is highly accurate. Developers have begun ignoring all of the bot's comments, including the security ones. What's the most effective immediate response?",
          options: [
            "Temporarily disable the race-condition category to restore trust while you rewrite its criteria, keeping the accurate categories running.",
            "Add \"be more conservative about race conditions\" to the prompt and leave all categories enabled.",
            "Keep all categories but sort findings so security appears first, making the noise less prominent.",
            "Accept the tradeoff — a 70% false-positive rate in one category is acceptable if the others are accurate."
          ],
          correct: [0],
          explanation: "High false-positive categories undermine developer trust in the accurate categories too, and temporarily disabling a noisy category while improving its prompt is the documented response — it stops the trust erosion immediately. Option B is precisely the vague, non-categorical instruction that fails to improve precision; the model is already confident in those wrong findings. Option C is cosmetic — reviewers who've learned to skim the bot's output will skim past the top of the list too. Option D ignores that the damage isn't contained to the noisy category.",
        },
        {
          type: "single",
          question: "You're writing few-shot examples to teach an agent when to escalate versus resolve. Which example design best enables the model to handle novel situations you haven't anticipated?",
          options: [
            "Examples that show the chosen action along with the reasoning for why it was chosen over a plausible alternative.",
            "As many examples as possible — 15 to 20 — to cover the widest range of specific situations.",
            "Examples showing only the input and the correct action, with no explanation, to avoid biasing the model.",
            "A single highly detailed example covering the most common case in depth."
          ],
          correct: [0],
          explanation: "Few-shot examples work by enabling the model to generalize the underlying judgment to novel patterns rather than matching pre-specified cases, and 2-4 targeted examples showing the reasoning for why one action was chosen over plausible alternatives is the documented approach. Option B misunderstands the mechanism — you can't enumerate every scenario, and volume doesn't teach a principle. Option C strips out exactly the reasoning that makes generalization possible, leaving surface pattern-matching. Option D covers the case you least needed help with.",
        },
        {
          type: "single",
          question: "A batch of 500 documents completes, but 12 failed because they exceeded context limits. What's the most efficient way to handle this?",
          options: [
            "Identify the 12 failures by custom_id and resubmit only those, chunked so they fit within context limits.",
            "Resubmit the entire batch of 500 with chunking applied to every document.",
            "Switch the 12 failed documents to the real-time API without modification, since batch clearly can't handle them.",
            "Discard the 12 failures — a 97.6% success rate is within normal tolerance for batch processing."
          ],
          correct: [0],
          explanation: "custom_id fields correlate batch requests with their responses, which is exactly what lets you identify failed documents and resubmit only those with appropriate modifications such as chunking. Option B re-pays for 488 documents that already succeeded. Option C changes the API without addressing the cause — an oversized document exceeds context limits on the real-time API too. Option D silently drops data because of a fixable formatting issue.",
        },
        {
          type: "single",
          question: "You must guarantee a 30-hour turnaround SLA on documents that arrive continuously, using the Message Batches API (up to 24-hour processing). What submission strategy meets the SLA?",
          options: [
            "Submit batches every 4 hours, so a document's maximum wait (up to 4 hours queued plus up to 24 hours processing) stays within 30 hours.",
            "Submit one batch daily at midnight, since batches usually complete much faster than 24 hours.",
            "Submit each document individually the moment it arrives, to minimize queue time.",
            "The 30-hour SLA cannot be met with the Batches API under any submission schedule."
          ],
          correct: [0],
          explanation: "Calculating submission frequency from SLA constraints is a documented skill: with up to 24 hours of processing and a 30-hour promise, the queue wait must stay under 6 hours, so a 4-hour submission window bounds the total safely. Option B allows nearly 24 hours of queueing before processing even starts, blowing the SLA — and \"usually faster\" is the exact reasoning the no-SLA caveat forbids. Option C forfeits the batching that makes the discount possible. Option D is defeatist: the math works comfortably at a 4-hour cadence.",
        },
        {
          type: "multi",
          question: "Your extraction pipeline uses tool_use with a strict JSON schema. Which two error types will the schema NOT prevent? (Select 2)",
          options: [
            "Invoice line items that don't sum to the stated total.",
            "Malformed JSON with a trailing comma.",
            "The invoice date placed in the due_date field.",
            "An enum field containing a value outside the allowed set."
          ],
          correct: [0, 2],
          explanation: "Strict schemas via tool use eliminate syntax and structural errors but not semantic ones. Line items that don't sum to the total, and a correctly-typed date in the wrong field, are both perfectly valid schema-compliant JSON that happens to be wrong — catching them requires separate validation (e.g., extracting calculated_total alongside stated_total). Options B and D are exactly what the schema does prevent: syntax errors are eliminated by construction, and an out-of-range enum value violates the schema itself.",
        },
        {
          type: "single",
          question: "Developers keep dismissing findings from your review bot, but you can't tell which kinds of code are triggering the bad findings. Which design change best enables systematic analysis?",
          options: [
            "Add a detected_pattern field to each structured finding recording which code construct triggered it, so dismissals can be analyzed by pattern.",
            "Ask developers to write a free-text explanation each time they dismiss a finding.",
            "Log the full prompt and response for every review run and read through them manually.",
            "Increase the confidence threshold until dismissals drop to an acceptable rate."
          ],
          correct: [0],
          explanation: "Tracking which code constructs trigger findings via a detected_pattern field is the documented mechanism for enabling systematic analysis of false-positive patterns when developers dismiss findings — it turns scattered anecdotes into aggregate data pointing at a specific prompt fix. Option B relies on busy developers writing prose and yields nothing aggregable. Option C doesn't scale and produces no structured signal. Option D suppresses the symptom while hiding the very evidence you need, and leans on poorly-calibrated self-reported confidence.",
        },
        {
          type: "single",
          question: "An extraction schema needs to categorize expenses, but you know new categories will appear that you can't enumerate today. Which schema design handles this best?",
          options: [
            "An enum of known categories plus an \"other\" value, paired with a detail string field for the unenumerated case.",
            "A free-text string field, so any category can be expressed.",
            "An enum of known categories only, with required: true, forcing every expense into the closest match.",
            "A boolean field per known category, so multiple can be set."
          ],
          correct: [0],
          explanation: "The enum + \"other\" + detail string pattern is the documented approach for extensible categorization: it keeps the constrained, machine-parseable set for known cases while giving genuinely novel ones an honest escape hatch. Option B abandons constraint entirely, so the same category arrives spelled three ways. Option C forces novel cases into the nearest wrong category — the same fabrication pressure that required fields create. Option D changes the shape of the data without solving extensibility, since unknown categories still have no representation.",
        },
        {
          type: "single",
          question: "Your document extraction returns empty values for required fields on a subset of documents. Investigation shows those documents structure their information differently — narrative prose rather than the structured tables in your examples. What's the most effective fix?",
          options: [
            "Add few-shot examples demonstrating correct extraction from documents with the varied formats, including the narrative-prose structure.",
            "Mark the affected fields as nullable, since extraction clearly isn't possible from those documents.",
            "Add a retry loop that re-requests the extraction when required fields come back empty.",
            "Filter out narrative-format documents and route all of them to human review."
          ],
          correct: [0],
          explanation: "Adding few-shot examples showing correct extraction from documents with varied formats is the documented fix for empty/null extraction of required fields caused by structural variety — the information is present, the model just hasn't been shown that layout. Option B misdiagnoses a solvable format problem as absent data, and would silently drop information that's actually there. Option C retries without new guidance, so the model repeats its misread. Option D abandons automation for documents the pipeline could handle with better examples.",
        },
        {
          type: "single",
          question: "A team proposes adding \"review your own output carefully and correct any errors before responding\" to their code-generation prompt, instead of running a separate review instance. What's the flaw?",
          options: [
            "A model retains its reasoning context from generation, making it less likely to question its own decisions in the same session — self-review instructions don't remove that bias.",
            "Self-review instructions cause the model to exceed max_tokens.",
            "Self-review only works when tool_choice is set to \"any\".",
            "There's no flaw — self-review instructions are equivalent to an independent review instance and cost less."
          ],
          correct: [0],
          explanation: "Self-review is limited by the generating session's retained reasoning context: it already concluded its approach was right, so asking it to check invites re-deriving the same conclusion. Independent review instances without that context are documented as more effective at catching subtle issues than either self-review instructions or extended thinking. Option B invents an unrelated failure. Option C conflates structured-output configuration with review architecture. Option D asserts the equivalence the guide specifically rejects.",
        },
        {
          type: "multi",
          question: "Which two practices correctly describe designing a self-correcting extraction validation flow? (Select 2)",
          options: [
            "Extract a calculated_total alongside the document's stated_total so discrepancies are flagged automatically rather than silently trusted.",
            "Add a conflict_detected boolean so internally inconsistent source data is surfaced instead of quietly resolved.",
            "Mark every field required, so the model is never permitted to omit data.",
            "On validation failure, resend the original request unchanged so the model gets a fresh attempt."
          ],
          correct: [0, 1],
          explanation: "Extracting calculated_total alongside stated_total and adding conflict_detected booleans for inconsistent source data are both documented self-correction validation designs — they catch the semantic errors strict schemas structurally cannot. Option C creates fabrication pressure: a required field the source lacks pushes the model to invent a plausible value. Option D omits the specific validation errors that make retry work at all; an unchanged request usually reproduces the same output.",
        },
        {
          type: "single",
          question: "Your extraction pipeline handles several document types (invoices, receipts, purchase orders), each with its own schema, and the type isn't known until the document is read. You need guaranteed structured output on every call. Which tool_choice configuration fits?",
          options: [
            "tool_choice: \"any\" — the model must call one of the extraction tools but selects which schema fits the document it sees.",
            "tool_choice: \"auto\" — let the model decide whether structured extraction is warranted.",
            "Forced selection naming the invoice tool, since invoices are the most common type.",
            "tool_choice: \"any\" combined with a required document_type parameter on every schema."
          ],
          correct: [0],
          explanation: "tool_choice: \"any\" guarantees the model calls a tool rather than returning conversational text, while leaving the choice open — exactly right when multiple extraction schemas exist and the document type is unknown ahead of time. Option B permits a text response, forfeiting the guarantee. Option C forces the wrong schema onto receipts and purchase orders. Option D adds a redundant parameter: choosing the tool already declares the type, and making it required just adds a field the model must restate."
        },
        {
          type: "single",
          question: "A reviewer asks why your CI review prompt includes a few-shot example of code that *looks* like a bug but is an accepted local pattern, arguing the examples should only show real issues. What's the strongest justification for keeping it?",
          options: [
            "Examples distinguishing acceptable patterns from genuine issues reduce false positives while still letting the model generalize to novel cases.",
            "It pads the prompt so the model spends more time reasoning about each finding.",
            "Negative examples are required whenever tool_use enforces a JSON schema.",
            "It demonstrates the output format, which positive examples cannot do."
          ],
          correct: [0],
          explanation: "Providing few-shot examples that distinguish acceptable code patterns from genuine issues is documented as a way to reduce false positives while enabling generalization — and false positives in one category erode trust in the accurate ones, so this is high-leverage. Option B invents a mechanism; prompt length doesn't buy reasoning depth. Option C conflates few-shot prompting with schema enforcement, which are unrelated. Option D is false — any example demonstrates format; what this one uniquely teaches is the boundary between acceptable and problematic."
        }
      ],
      flashcards: [
        { front: "Why does \"be conservative\" or \"only report high-confidence findings\" fail to improve precision?", back: "They're vague and non-categorical — they ask for a disposition where a criterion asks for a decision. Explicit criteria naming which issues to report vs skip work far better." },
        { front: "What's the risk of a review prompt with a high false-positive rate in one category?", back: "It undermines developer trust in the tool's accurate categories too — once reviewers learn one category is noise, they skim past all of them." },
        { front: "When are few-shot examples most valuable?", back: "When detailed prose instructions alone produce inconsistent output — for ambiguous-case handling, format consistency, and generalizing judgment to novel patterns." },
        { front: "How many few-shot examples are typically enough for an ambiguous scenario?", back: "2-4 targeted examples, showing the reasoning for why one action was chosen over plausible alternatives." },
        { front: "Do few-shot examples work by enumerating cases or by teaching a principle?", back: "By teaching a principle — they enable the model to generalize the underlying judgment to novel patterns, not just match the cases you listed. That's why the reasoning matters more than the answer." },
        { front: "Why is tool_use with a JSON schema more reliable than asking for JSON in prose?", back: "It guarantees schema-compliant output and eliminates JSON syntax errors — though it does NOT eliminate semantic errors." },
        { front: "Give an example of a semantic error that a valid JSON schema won't catch.", back: "Line items that don't sum to the stated total, or a value placed in the wrong field — structurally valid JSON that's still wrong." },
        { front: "Why make a schema field nullable instead of required, when source documents sometimes lack that data?", back: "A required field is pressure: forced to choose between violating the schema and inventing a value, the model invents. Nullable gives \"not present\" a way to be expressed." },
        { front: "What's the \"enum + other + detail string\" schema pattern for?", back: "Extensible categorization — a fixed enum for known categories plus an \"other\" value with a free-text detail field for cases that don't fit (an \"unclear\" value works the same way for ambiguity)." },
        { front: "What must a retry request include for retry-with-error-feedback to work?", back: "The original document, the failed extraction, AND the specific validation errors — \"try again\" alone usually reproduces the same output." },
        { front: "When is a retry-with-error-feedback loop ineffective?", back: "When the required information is simply absent from the source document — retries only help with format/structural errors, and retrying absent data just pressures the model to fabricate." },
        { front: "What does a detected_pattern field on findings enable?", back: "Systematic analysis of which code constructs trigger false positives when developers dismiss findings — turning anecdotes into a targeted prompt fix." },
        { front: "How do you design a self-correcting numeric extraction?", back: "Extract calculated_total alongside the document's stated_total so mismatches flag automatically, and add a conflict_detected boolean for internally inconsistent source data." },
        { front: "What are the Message Batches API's core tradeoffs?", back: "50% cost savings and up to a 24-hour processing window, but no guaranteed latency SLA and no multi-turn tool calling within a single request." },
        { front: "Why can't an agentic loop run on the Message Batches API?", back: "The batch API doesn't support multi-turn tool calling within a single request — you can't execute a tool mid-request and feed results back. It's a structural limit, not a speed one." },
        { front: "What's custom_id for in batch processing?", back: "Correlating each request with its response — and identifying which documents failed so you resubmit only those (e.g., chunked), not the whole batch." },
        { front: "Why is an independent review instance often better than having the generating session review its own output?", back: "The generating session retains its own reasoning context, making it less likely to question decisions it just made; a fresh instance without that context catches subtler issues." },
        { front: "How do you structure a review of a large multi-file PR?", back: "Multi-pass: a focused per-file pass for local issues, plus a separate integration pass for cross-file data flow." },
        { front: "Why don't a bigger context window or 2-of-3 voting fix attention dilution?", back: "The files already fit — the problem is attention quality, not capacity. And voting suppresses real bugs, since subtle issues are exactly the ones caught only intermittently." }
      ]
    },
    {
      id: "d5",
      title: "Context Management & Reliability",
      weight: 15,
      summary: "Keeping long-running agentic and multi-agent systems reliable: preserving the right information under context pressure, escalating correctly, propagating errors usefully, and calibrating human review.",
      objectives: [
        "Manage conversation context to preserve critical information across long interactions",
        "Design effective escalation and ambiguity resolution patterns",
        "Implement error propagation strategies across multi-agent systems",
        "Manage context effectively in large codebase exploration",
        "Design human review workflows and confidence calibration",
        "Preserve information provenance and handle uncertainty in multi-source synthesis"
      ],
      lesson: {
        sections: [
          {
            heading: "Preserving critical information across long interactions",
            body: `<p>Three distinct forces degrade a long conversation, and they need different fixes — which is why lumping them together as "context problems" leads to the wrong solution.</p><p><strong>1. Progressive summarization loses exactly the wrong details.</strong> Summarization is lossy in a specific, predictable direction: numerical values, percentages, dates, and customer-stated expectations get condensed into vague language. "Refund of $142.50 requested by Friday" becomes "customer wants a refund soon" — and the details that mattered most for the next action are precisely the ones that evaporated.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Taking meeting notes by writing prose summaries. Three meetings later, "we agreed Priya would ship the migration by the 14th, budget capped at $40k" has softened into "the team discussed migration timelines." Nobody deleted anything — the summary is accurate. It just isn't <em>usable</em>, because the parts you now need were the parts that got smoothed away. Which is why good notes keep decisions and numbers in a separate list from the narrative.</div><p>That's the fix: extract transactional facts into a persistent <strong>"case facts" block</strong> included in every prompt, kept <em>outside</em> the summarized history so it's never subject to condensation:</p><pre><code>CASE FACTS (persisted, not summarized):
- order_id: 88213, amount: $142.50, status: shipped
- customer requested: refund by Friday</code></pre><p>For multi-issue sessions, extract and persist structured issue data (order IDs, amounts, statuses) into its own context layer, so each issue keeps its specifics as the conversation moves between them.</p><p><strong>2. The "lost in the middle" effect.</strong> Models reliably process information at the <em>beginning</em> and <em>end</em> of long inputs, but may omit or under-weight findings buried in the middle. This isn't about summarization — it happens to material sitting right there in context, fully intact. The mitigation is positional: place key-findings summaries at the <strong>beginning</strong> of aggregated inputs, and organize detailed results under <strong>explicit section headers</strong> so structure compensates for position.</p><p><strong>3. Tool results consume tokens disproportionately to their relevance.</strong> An order lookup returns 40+ fields when 5 are relevant, and every one of them accumulates. Here's the trap: nothing errors. The conversation just quietly fills with warehouse codes and internal flags, crowding out the case facts you actually needed. Trim verbose tool outputs to the relevant fields <em>before</em> they accumulate — and when downstream agents have limited context budgets, modify upstream agents to return structured data (key facts, citations, relevance scores) instead of verbose content and reasoning chains.</p><p>One thing you must <em>not</em> economize on: passing complete conversation history in subsequent API requests is what maintains conversational coherence. Trim what <em>enters</em> context; don't drop the history that's already there.</p>`
          },
          {
            heading: "Escalation and ambiguity resolution",
            body: `<p>Escalation calibration fails in both directions at once, which is what makes it interesting. The support agent stuck at 55% first-contact resolution isn't escalating too much or too little — it's escalating <em>the wrong cases</em>: handing off straightforward damage replacements with photo evidence while confidently attempting policy exceptions it has no authority to make.</p><p>Three triggers justify escalation:</p><ul><li><strong>The customer explicitly asks for a human.</strong> Honor it immediately — don't force an autonomous attempt first. Whether the agent <em>could</em> resolve it is no longer the question once the customer has asked.</li><li><strong>A policy exception or gap</strong> — the policy is ambiguous or silent on this specific request. Note this is <em>not</em> "the case is complex." A policy addressing only on-site price adjustments says nothing about competitor price matching; that silence is a gap to escalate, not a puzzle to solve creatively.</li><li><strong>Genuine inability to make progress.</strong></li></ul><p>There's a subtlety between the first trigger and mere frustration. When a customer is frustrated but the issue is within the agent's capability, the right move is to <strong>acknowledge the frustration and offer resolution</strong> — escalating only if they reiterate the preference for a human. Frustration isn't a request; an explicit request is.</p><div class="callout warn"><span class="callout-label">Watch out</span><strong>Sentiment-based escalation and self-reported confidence scores are unreliable proxies for case complexity</strong>, and both appear as tempting distractors. Sentiment measures mood, not difficulty — a calm question can hide a real policy gap, and a furious customer can have a one-click fix. Self-reported confidence fails for a sharper reason: the agent mishandling hard cases is already <em>confident</em> about them. That's why it mishandled them. Routing on a signal that's wrong exactly where you need it most doesn't help.</div><p>The proportionate first fix for miscalibration is <strong>explicit escalation criteria with few-shot examples</strong> in the system prompt demonstrating when to escalate versus resolve — the same "explicit criteria beat vague dispositions" principle from Domain 4, applied to a decision boundary. Reach for a trained classifier only after prompt optimization has actually been tried.</p><p>Finally, ambiguity: when a lookup returns <strong>multiple customer matches</strong>, ask for an additional identifier. Don't select heuristically — "most recently active" is a guess, and acting on the wrong account is worse than a follow-up question.</p>`,
            interactive: {
              type: "classify",
              title: "Escalate, or keep going?",
              instructions: "For each situation, decide whether the agent should escalate to a human or continue handling it autonomously. Watch for the cases that look like escalation triggers but aren't.",
              items: [
                {
                  text: "\"Just let me talk to a person.\" The agent could resolve the underlying issue easily.",
                  answer: "escalate",
                  options: [["escalate", "🙋 Escalate"], ["continue", "🤖 Keep going"]],
                  why: "An explicit request for a human — honor it immediately without first forcing a resolution attempt. Being capable of resolving it stopped being the question the moment they asked."
                },
                {
                  text: "A customer wants a price match against a competitor's site. Policy covers on-site price adjustments only and says nothing about competitors.",
                  answer: "escalate",
                  options: [["escalate", "🙋 Escalate"], ["continue", "🤖 Keep going"]],
                  why: "A policy gap: the policy is silent on this request, not restrictive about it. Silence is a gap to escalate, not license to invent a decision."
                },
                {
                  text: "A standard damage replacement with photo evidence attached. The customer's message is long and rambling.",
                  answer: "continue",
                  options: [["escalate", "🙋 Escalate"], ["continue", "🤖 Keep going"]],
                  why: "Exactly the case the miscalibrated agent wrongly escalates. Complexity of *phrasing* isn't complexity of *case* — this is standard policy with clear evidence."
                },
                {
                  text: "The customer is clearly angry about a late delivery, but the order qualifies for a refund under standard policy.",
                  answer: "continue",
                  options: [["escalate", "🙋 Escalate"], ["continue", "🤖 Keep going"]],
                  why: "Frustration isn't a request for a human. Acknowledge it and offer resolution — escalate only if they reiterate a preference for a person. Sentiment doesn't track complexity."
                },
                {
                  text: "get_customer returns three accounts matching the name and city given.",
                  answer: "continue",
                  options: [["escalate", "🙋 Escalate"], ["continue", "🤖 Keep going"]],
                  why: "Ambiguity, not a dead end — and neither an escalation nor a guess. Ask for an additional identifier (order number, email). Escalating here burns human capacity on a follow-up question."
                },
                {
                  text: "The customer asks for a refund on a subscription tier the policy documentation never mentions.",
                  answer: "escalate",
                  options: [["escalate", "🙋 Escalate"], ["continue", "🤖 Keep going"]],
                  why: "Another policy gap. The agent has no basis for a decision — resolving it autonomously means inventing policy, which is the failure mode behind the 55%-resolution agent."
                },
                {
                  text: "The agent has tried three approaches to locate an order and each tool call returns nothing usable. It has no further avenues.",
                  answer: "escalate",
                  options: [["escalate", "🙋 Escalate"], ["continue", "🤖 Keep going"]],
                  why: "Genuine inability to make progress — the third documented trigger. Looping further wastes the customer's time on an agent that has run out of options."
                }
              ]
            }
          },
          {
            heading: "Error propagation across multi-agent systems",
            body: `<p>When a subagent fails, what it <em>says</em> about the failure determines whether the coordinator can recover. The rule: <strong>recover locally when you can, propagate structured context when you can't.</strong></p><p>Transient failures — the timeouts and blips from Domain 2's error categories — should be handled inside the subagent. Only errors it genuinely cannot resolve should reach the coordinator, and those must carry:</p><ul><li>the <strong>failure type</strong>,</li><li>the <strong>query that was attempted</strong>,</li><li>any <strong>partial results</strong>,</li><li>and <strong>potential alternative approaches</strong>.</li></ul><p>With that, the coordinator has real options: retry with a modified query, try a different approach, or proceed with partial results and annotate the gap. With "search unavailable," it has none.</p><div class="compare-grid"><div class="compare-col bad"><span class="cc-label">✗ Generic status</span><code>{ status: "search_unavailable" }</code><p>The coordinator can't tell whether the query was malformed, the source rate-limited, or 80% of the results already came back. Every recovery path needs information this response destroyed — so it either gives up or retries blind.</p></div><div class="compare-col good"><span class="cc-label">✓ Structured error context</span><code>{ failure: "timeout",<br>&nbsp;&nbsp;attempted: "AI music<br>&nbsp;&nbsp;&nbsp;&nbsp;production 2024-2026",<br>&nbsp;&nbsp;partial: [3 sources found],<br>&nbsp;&nbsp;alternatives: ["narrow date<br>&nbsp;&nbsp;&nbsp;&nbsp;range", "try arXiv only"] }</code><p>Now the coordinator can choose: keep the 3 sources, retry narrower, or annotate a coverage gap. Every option is on the table because the information survived.</p></div></div><p>Two anti-patterns, and it's worth naming why each is seductive:</p><ul><li><strong>Silently suppressing the error</strong> — returning empty results marked as success. This feels like graceful degradation and is the worst option available: it guarantees no recovery can ever happen, and the coordinator confidently synthesizes a report over a hole it doesn't know exists. A failure disguised as success is worse than a failure.</li><li><strong>Terminating the entire workflow</strong> on a single subagent failure. This feels rigorous — fail fast, no silent corruption. But it throws away every recovery strategy that would have worked, and discards the partial results the other subagents already produced.</li></ul><p>The <strong>access failure vs. valid empty result</strong> distinction matters here as much as in Domain 2: a query that failed needs a retry decision; a query that succeeded and found nothing is an <em>answer</em>. Conflating them means either retrying a query that worked, or treating a timeout as evidence of absence.</p><p>Downstream, this shapes the output: structure synthesis with <strong>coverage annotations</strong> distinguishing well-supported findings from topic areas with gaps due to unavailable sources. A report that says "music production: no sources retrieved — search timed out" is far more useful than one that silently omits music and reads as complete.</p>`
          },
          {
            heading: "Context in large codebase exploration",
            body: `<p><strong>The tell:</strong> deep into a long exploration session, the model starts giving inconsistent answers and referencing "typical patterns you'd expect" instead of the specific classes it examined an hour ago. That's <strong>context degradation</strong>, and its signature is generic language displacing specific findings. When an agent that read your <code>RefundProcessor</code> starts describing how refund processors are usually built, the specifics have effectively fallen out of usable context.</p><p>Four mitigations, each aimed at a different part of the problem:</p><ul><li><strong>Scratchpad files</strong> persist key findings across context boundaries. The agent writes what it learns to a file and reads it back later, so a finding survives even if the conversation turn that produced it doesn't. This is the direct antidote to the degradation above: the specifics live somewhere durable rather than in a conversation that's being squeezed.</li><li><strong>Subagent delegation</strong> for specific investigative questions — "find all test files," "trace refund flow dependencies" — isolates verbose exploration output while the main agent keeps high-level coordination. The subagent burns its own context reading forty files; the main agent receives the answer.</li><li><strong>Phase summarization</strong>: summarize key findings from one exploration phase <em>before</em> spawning subagents for the next, injecting those summaries into their initial context. Recall from Domain 1 that subagents inherit nothing automatically — that summary is the only thing carrying phase 1's knowledge into phase 2.</li><li><strong><code>/compact</code></strong> reduces context usage during extended sessions when context fills with verbose discovery output.</li></ul><p>For long-running multi-agent work, <strong>structured state persistence</strong> handles crash recovery: each agent exports its state to a known location, and the coordinator loads a <em>manifest</em> on resume and injects it into agent prompts. The point is not to rely on raw conversation history surviving — it's to make recovery a deliberate mechanism rather than a hope.</p>`,
            interactive: {
              type: "sequence",
              title: "Order the context-handoff procedure",
              instructions: "A multi-phase codebase investigation is filling its context window, and phase 2 is about to start. Put the handoff steps in the order that actually preserves the work.",
              items: [
                { text: "Notice the tell: the agent starts referencing \"typical patterns\" instead of the specific classes it read earlier — context is degrading." },
                { text: "Summarize phase 1's key findings while the specifics are still in context and can still be stated accurately." },
                { text: "Write those findings to a scratchpad file, so they persist across the context boundary rather than living only in the conversation." },
                { text: "Run /compact to reclaim the context consumed by verbose discovery output now that the findings are safely persisted." },
                { text: "Spawn phase 2's subagents, injecting the phase 1 summary directly into each one's initial prompt — they inherit nothing automatically." },
                { text: "Subagents investigate their specific questions, burning their own context on verbose exploration while the main agent keeps only high-level coordination." },
                { text: "Each subagent returns a structured summary, which the main agent appends to the scratchpad as the durable record for phase 3." }
              ],
              explanation: "Sequence is the entire lesson here. Summarizing and persisting must happen BEFORE compacting — run /compact first and you're summarizing from the degraded context you were trying to escape, which is how a handoff quietly loses the findings it was meant to save. The same ordering logic drives the rest: you summarize phase 1 before spawning phase 2's subagents because they inherit nothing automatically, so that summary is the only bridge between phases. Notice the division of labor too — subagents spend their context on verbose exploration and hand back conclusions, which is what lets the main agent stay coordinating instead of drowning in file listings."
            }
          },
          {
            heading: "Crash recovery and the resume-versus-fresh decision",
            body: `<p>Resuming a session is not automatically the cheap option, and treating it that way is the trap this section exists to close.</p><p>Session resumption carries forward everything the session knew — including the parts that are now <strong>wrong</strong>. A resumed session has no way to notice that the world changed while it was paused. Its tool results still say what they said, stated with the same confidence, and it will reason from them happily.</p><div class="callout analogy"><span class="callout-label">Think of it like...</span>Coming back from two weeks of leave and replying to the top email in your inbox as though it just arrived. It's not that you forgot anything — you remember the project perfectly. That's the problem: you're acting on a picture that was accurate when you left and has since silently gone stale, and nothing in the email announces that. Sometimes the right move is a five-minute catch-up first; sometimes the project changed so much you're better off being briefed from scratch than trusting recall.</div><p>So the decision has two inputs: <em>how much has changed</em>, and <em>how load-bearing the stale parts are.</em></p><div class="compare-grid"><div class="compare-col good"><span class="cc-label">Resume (--resume) when…</span><p>Prior context is <strong>mostly still valid</strong>. A teammate touched two files you'd analyzed.</p><p>Then: resume, and <strong>explicitly inform the session what changed</strong> so it re-analyzes those specific files — targeted re-analysis, not full re-exploration. That's the payoff of resuming: you keep the 95% that's still true.</p></div><div class="compare-col good"><span class="cc-label">Start fresh when…</span><p>Prior tool results are <strong>stale enough to mislead</strong>. The module was refactored wholesale over the weekend.</p><p>Then: start a new session with a <strong>structured summary</strong> injected into the initial context. More reliable than resuming and hoping the agent notices the drift — it won't.</p></div></div><p>The failure mode to recognize: resuming silently. If you <code>--resume</code> a Friday investigation on Monday and say nothing about the weekend's refactor, the agent will confidently reason from Friday's structure. Nothing errors. The answers are just wrong in ways that look right, because they're internally consistent with a codebase that no longer exists.</p><p>This is the same principle as <strong>structured state persistence</strong> for crash recovery: don't rely on prior context being intact and current — export state deliberately, and inject a manifest on resume. In both cases you're choosing an explicit, inspectable handoff over an implicit one you're trusting on faith.</p>`,
            interactive: {
              type: "scenario",
              title: "Monday morning, stale context",
              setup: "Friday you paused a long investigation; the agent had built a detailed model of the payments module. Over the weekend a teammate refactored that module substantially — splitting one class into three and renaming the main entry point. You need to finish the investigation today. What do you do?",
              choices: [
                {
                  text: "Run --resume and continue where you left off. The session already understands the payments module.",
                  outcome: "bad",
                  feedback: "This is resuming silently, and it's the trap. The session has no way to know the weekend happened — its Friday tool results still describe a class that no longer exists, stated with total confidence. It will reason from that structure and produce answers that are internally consistent and wrong, with nothing erroring to warn you."
                },
                {
                  text: "Start a fresh session with a structured summary of Friday's findings injected into the initial context, letting it re-read the refactored module's current state.",
                  outcome: "good",
                  feedback: "Right for the degree of change described. When prior tool results are stale enough to mislead — a class split into three, the entry point renamed — starting fresh with an injected structured summary is more reliable than resuming and hoping the agent notices drift. You keep Friday's conclusions as *context* while letting the agent observe today's code as *fact*."
                },
                {
                  text: "Run --resume, but explicitly tell the session which files changed so it re-analyzes those specific files.",
                  outcome: "bad",
                  feedback: "This is the right instinct and the correct pattern — for a smaller change. Resume-plus-explicit-notification shines when prior context is *mostly* valid and you want targeted re-analysis instead of full re-exploration. But here the refactor invalidated the session's core mental model: one class became three and the entry point was renamed, so most of what it 'knows' about the module's structure is now wrong. You'd spend the session correcting it."
                }
              ]
            }
          },
          {
            heading: "Human review, confidence calibration, and provenance",
            body: `<p><strong>Aggregate accuracy lies by omission.</strong> "97% overall" can comfortably hide a document type that extracts at 61%, because it's 8% of the volume and the other 92% is excellent. The number isn't wrong — it's just answering a question you didn't ask. Before reducing human review for any segment, <strong>validate accuracy by document type and field</strong>: the decision is always about a specific segment, so the evidence must be too.</p><p>Three mechanisms for routing scarce reviewer capacity:</p><ul><li><strong>Stratified random sampling</strong> of high-confidence extractions for ongoing error-rate measurement. The point is subtle: you sample the ones you <em>believe</em> are fine, precisely because that's where an unnoticed error pattern would hide. Reviewing only low-confidence cases means you'd never discover a systematic failure the model is confident about.</li><li><strong>Field-level confidence scores calibrated against a labeled validation set.</strong> Calibration is what makes confidence usable here — the raw score means nothing until you've measured what a 0.8 actually predicts.</li><li><strong>Routing rules</strong>: send low-confidence extractions, and those from ambiguous or contradictory source documents, to human review — prioritizing limited reviewer capacity where errors are most likely.</li></ul><div class="callout"><span class="callout-label">Note</span>This isn't a contradiction of the escalation section's warning about self-reported confidence. There, confidence was used <em>autonomously</em> — the agent deciding on its own whether to hand off, with no ground truth anywhere. Here it's <strong>calibrated against a labeled set</strong> and used to <em>rank work for humans who will review it anyway</em>. Calibration plus a human in the loop is what turns an unreliable signal into a useful one.</div><p>On <strong>provenance</strong>: source attribution is quietly destroyed during summarization when findings are compressed without preserving <strong>claim-source mappings</strong> (source URL, document name, relevant excerpt). Require subagents to output these structured mappings, and require downstream synthesis to <em>preserve and merge</em> them rather than just carrying the prose conclusion forward. Once the mapping is gone, no downstream step can reconstruct it — the citation is unrecoverable, and the claim becomes an assertion.</p><p>Handling conflict and uncertainty:</p><ul><li><strong>Conflicting statistics from credible sources</strong>: annotate the conflict with attribution for both values rather than arbitrarily picking one. Document analysis should pass conflicts through <em>explicitly annotated</em> and let the coordinator decide how to reconcile — resolving silently at the analysis step destroys information the coordinator needed.</li><li><strong>Temporal data</strong>: require publication or collection dates in structured outputs. Two "contradictory" figures are often just measurements from different years, and without dates that's indistinguishable from a real contradiction.</li><li><strong>Report structure</strong>: distinguish well-established findings from contested ones, preserving original source characterizations and methodological context.</li><li><strong>Render content types appropriately</strong> — financial data as tables, news as prose, technical findings as structured lists — rather than flattening everything into one uniform format.</li></ul>`
          }
        ],
        checks: [
          {
            type: "single",
            question: "A document analysis agent processes a long report and its findings summary mentions strong results in the opening and closing sections, but omits a significant caveat that appeared in the middle of the document. What effect does this most likely illustrate?",
            options: [
              "A hallucination.",
              "The \"lost in the middle\" effect — models reliably process information at the start and end of long inputs but may under-weight content buried in the middle.",
              "A tool-selection error.",
              "A schema validation failure."
            ],
            correct: [1],
            explanation: "This is the classic \"lost in the middle\" pattern: content at the beginning and end of a long input gets attended to reliably, while material buried in the middle is more likely to be omitted or underweighted."
          },
          {
            type: "single",
            question: "A customer explicitly says \"I want to talk to a human\" partway through a conversation the agent could otherwise resolve on its own. What should the agent do?",
            options: [
              "Continue attempting to resolve the issue autonomously since it's within its capability.",
              "Honor the explicit request and escalate immediately, without first forcing another resolution attempt.",
              "Ask the customer to rate their satisfaction before deciding whether to escalate.",
              "Ignore the request unless the agent's own confidence score is below a threshold."
            ],
            correct: [1],
            explanation: "An explicit customer request for a human is one of the clearest, most reliable escalation triggers and should be honored immediately — capability to resolve the issue autonomously isn't the deciding factor once the customer has explicitly asked for a person."
          },
          {
            type: "single",
            question: "A web-search subagent returns the generic status \"search unavailable\" after a failure, with no other detail. Why is this a problem for the coordinator?",
            options: [
              "It isn't a problem; \"search unavailable\" is sufficient information.",
              "The generic status hides the context (failure type, attempted query, partial results) the coordinator would need to make an intelligent recovery decision.",
              "The coordinator will crash on any string status.",
              "It means the subagent used too many tokens."
            ],
            correct: [1],
            explanation: "A generic status collapses potentially very different failure situations into one undifferentiated signal, preventing the coordinator from deciding intelligently whether to retry, try an alternative, or proceed with partial results."
          }
        ]
      },
      quiz: [
        {
          type: "single",
          question: "Your agent achieves 55% first-contact resolution, well below the 80% target. Logs show it escalates straightforward cases (standard damage replacements with photo evidence) while attempting to autonomously handle complex situations requiring policy exceptions. What's the most effective way to improve escalation calibration?",
          options: [
            "Add explicit escalation criteria to your system prompt with few-shot examples demonstrating when to escalate versus resolve autonomously.",
            "Have the agent self-report a confidence score (1-10) before each response and automatically route requests to humans when confidence falls below a threshold.",
            "Deploy a separate classifier model trained on historical tickets to predict which requests need escalation before the main agent begins processing.",
            "Implement sentiment analysis to detect customer frustration levels and automatically escalate when negative sentiment exceeds a threshold."
          ],
          correct: [0],
          explanation: "Adding explicit escalation criteria with few-shot examples directly addresses the root cause: unclear decision boundaries. This is the proportionate first response before adding infrastructure. Option B fails because LLM self-reported confidence is poorly calibrated — the agent is already incorrectly confident on hard cases. Option C is over-engineered, requiring labeled data and ML infrastructure when prompt optimization hasn't been tried. Option D solves a different problem entirely; sentiment doesn't correlate with case complexity, which is the actual issue.",
          source: "official"
        },
        {
          type: "single",
          question: "The web search subagent times out while researching a complex topic. You need to design how this failure information flows back to the coordinator agent. Which error propagation approach best enables intelligent recovery?",
          options: [
            "Return structured error context to the coordinator including the failure type, the attempted query, any partial results, and potential alternative approaches.",
            "Implement automatic retry logic with exponential backoff within the subagent, returning a generic \"search unavailable\" status only after all retries are exhausted.",
            "Catch the timeout within the subagent and return an empty result set marked as successful.",
            "Propagate the timeout exception directly to a top-level handler that terminates the entire research workflow."
          ],
          correct: [0],
          explanation: "Structured error context gives the coordinator the information it needs to make intelligent recovery decisions — whether to retry with a modified query, try an alternative approach, or proceed with partial results. Option B's generic status hides valuable context from the coordinator, preventing informed decisions. Option C suppresses the error by marking failure as success, which prevents any recovery. Option D terminates the entire workflow unnecessarily when recovery strategies could succeed.",
          source: "official"
        },
        {
          type: "single",
          question: "A support conversation runs long, and the agent periodically compresses earlier turns into a summary. Which detail is most at risk of being lost in that process?",
          options: [
            "The overall topic of the conversation.",
            "Specific numbers, dates, and customer-stated expectations — progressive summarization tends to condense these into vague language.",
            "The identity of who is speaking in each turn.",
            "The language the conversation is conducted in."
          ],
          correct: [1],
          explanation: "Progressive summarization is especially risky for transactional specifics — amounts, percentages, dates, and stated expectations — precisely because summarization tends to smooth these into vaguer language, losing exactly the details that matter for follow-up actions."
        },
        {
          type: "single",
          question: "What's the purpose of maintaining a persistent \"case facts\" block (order ID, amount, status) in every prompt, kept separate from the summarized conversation history?",
          options: [
            "To reduce token usage to zero.",
            "To ensure key transactional facts survive summarization instead of being condensed into vague language over a long conversation.",
            "It's required by the Claude API for all conversations.",
            "To replace the need for tool calls entirely."
          ],
          correct: [1],
          explanation: "A dedicated, unsummarized case-facts block guarantees that critical numbers, IDs, and statuses stay exact and available throughout a long conversation, immune to the vagueness that progressive summarization introduces elsewhere."
        },
        {
          type: "single",
          question: "A customer support agent's identity-lookup tool returns three customers matching the name and city provided. What should the agent do?",
          options: [
            "Pick the most recently active account, since that's statistically most likely to be correct.",
            "Ask the customer for an additional identifier (e.g., order number or email) rather than selecting one match heuristically.",
            "Proceed with the first match returned by the tool.",
            "Escalate immediately without attempting to resolve the ambiguity."
          ],
          correct: [1],
          explanation: "When a lookup returns multiple matches, the correct pattern is to request additional identifying information from the customer rather than guessing based on a heuristic — a wrong heuristic-based selection here risks acting on the wrong account entirely."
        },
        {
          type: "single",
          question: "During a long codebase-exploration session, the agent starts describing \"typical patterns you'd expect\" instead of referencing the specific classes it examined earlier in the same session. What does this most likely indicate, and what's a good mitigation?",
          options: [
            "Nothing unusual — this is expected behavior. No mitigation needed.",
            "Context degradation — the earlier specific findings have effectively fallen out of usable context; persisting key findings in a scratchpad file mitigates this.",
            "A tool-selection error that requires renaming the exploration tools.",
            "A JSON schema validation failure in the exploration output."
          ],
          correct: [1],
          explanation: "Falling back on generic \"typical pattern\" language instead of the specific things actually discovered is a hallmark of context degradation in long sessions. Scratchpad files that persist key findings, plus delegating verbose exploration to subagents, are the standard mitigations."
        },
        {
          type: "single",
          question: "A structured findings report shows 97% overall extraction accuracy. Is it safe to conclude accuracy is uniformly high across all document types and fields?",
          options: [
            "Yes, an aggregate accuracy number is always representative of every subgroup.",
            "No — aggregate accuracy can mask much lower performance on specific document types or fields; accuracy should be validated by segment before reducing human review for any one of them.",
            "Yes, as long as the sample size was large enough.",
            "No, because aggregate accuracy metrics are never meaningful."
          ],
          correct: [1],
          explanation: "A single aggregate number can hide a segment (a particular document type, or a particular field) performing far worse than the average. Segment-level validation is required before you can safely reduce human review for that segment specifically."
        },
        {
          type: "multi",
          question: "Two credible sources report different statistics for the same metric during multi-source synthesis. Which two practices reflect the correct way to handle this? (Select 2)",
          options: [
            "Annotate the conflict, preserving both values along with their source attribution, rather than silently picking one.",
            "Arbitrarily select the value from whichever source was processed first and discard the other.",
            "Check whether the sources have different publication or collection dates that would explain the discrepancy rather than indicating a genuine contradiction.",
            "Average the two values together and report only the average."
          ],
          correct: [0, 2],
          explanation: "The correct pattern preserves both values with source attribution and checks for a temporal explanation (different collection dates) before treating the discrepancy as a genuine conflict. Silently discarding one value or averaging them both destroy information the reader needs to judge the claim themselves."
        },
        {
          type: "single",
          question: "You paused a codebase investigation on Friday; over the weekend a teammate refactored the module the agent had analyzed, splitting one class into three and renaming the entry point. What's the most reliable way to continue Monday?",
          options: [
            "Start a new session with a structured summary of the prior findings injected into the initial context.",
            "Run --resume and continue — the session already has a detailed model of the module.",
            "Run --resume and ask the agent to double-check anything that seems inconsistent as it goes.",
            "Run --resume with fork_session so the stale branch is preserved for comparison."
          ],
          correct: [0],
          explanation: "When prior tool results are stale, starting fresh with an injected structured summary is more reliable than resuming — a refactor this substantial invalidates the session's core model of the module. Option B resumes silently: the agent has no way to know the weekend happened and will confidently reason from Friday's now-wrong structure. Option C relies on the agent noticing drift it has no signal for; its stale results look exactly as authoritative as fresh ones. Option D preserves a branch built on invalid analysis, which addresses nothing.",
        },
        {
          type: "single",
          question: "A teammate modified two of the fifteen files your paused session had analyzed. The rest of its context is still accurate. What's the most efficient way to continue?",
          options: [
            "Resume the session and explicitly inform it which files changed, so it re-analyzes those specific files.",
            "Start a completely fresh session and re-explore all fifteen files from scratch.",
            "Resume the session without comment — with only two files changed, the impact is negligible.",
            "Resume and instruct the agent to re-read all fifteen files before continuing."
          ],
          correct: [0],
          explanation: "When prior context is mostly valid, resuming and informing the session about specific file changes enables targeted re-analysis rather than full re-exploration — that's precisely the payoff of resuming. Option B discards thirteen files of still-accurate analysis. Option C is the resume-silently trap: the agent can't detect changes it wasn't told about, so it reasons from stale results for those two files. Option D pays the full re-exploration cost while resuming, getting the worst of both.",
        },
        {
          type: "multi",
          question: "Which two changes best mitigate the \"lost in the middle\" effect when a coordinator aggregates findings from several subagents into one long input? (Select 2)",
          options: [
            "Place a key-findings summary at the beginning of the aggregated input.",
            "Organize the detailed results under explicit section headers.",
            "Sort all findings alphabetically so the ordering is predictable.",
            "Compress the middle sections more aggressively than the beginning and end."
          ],
          correct: [0, 1],
          explanation: "The documented mitigations are positional and structural: key findings placed at the beginning where attention is reliable, and explicit section headers so structure compensates for position. Option C imposes an ordering unrelated to importance — material still lands in the middle, just alphabetically. Option D actively destroys the middle content instead of making it findable, converting a position problem into a summarization-loss problem.",
        },
        {
          type: "single",
          question: "An order-lookup tool returns 40+ fields per order, of which about 5 matter for refund decisions. Over a long support conversation these results accumulate. What's the recommended approach?",
          options: [
            "Trim the tool output to the relevant fields before it accumulates in context.",
            "Keep all 40+ fields — discarding data risks losing something needed later.",
            "Summarize the accumulated tool results periodically once context pressure appears.",
            "Stop passing conversation history in subsequent requests to make room."
          ],
          correct: [0],
          explanation: "Tool results consume tokens disproportionately to their relevance, and trimming verbose output to relevant fields before it accumulates is the documented fix — nothing errors as the context quietly fills with warehouse codes, which is what makes it insidious. Option B is the behavior causing the problem. Option C waits until the damage is done and then applies summarization, which is itself lossy for exactly the numeric details that matter. Option D is actively harmful: passing complete conversation history is what maintains conversational coherence — you trim what enters context, not the history already there.",
        },
        {
          type: "single",
          question: "You want to reduce human review for extractions the model scores as high-confidence. What's the responsible way to monitor for errors you're no longer catching?",
          options: [
            "Stratified random sampling of high-confidence extractions to measure error rates and detect novel error patterns.",
            "Review only the low-confidence extractions, since high-confidence ones are by definition unlikely to be wrong.",
            "Rely on downstream systems to surface errors when they cause visible problems.",
            "Re-run each high-confidence extraction a second time and compare the two outputs."
          ],
          correct: [0],
          explanation: "Stratified random sampling of high-confidence extractions is the documented mechanism for ongoing error-rate measurement and novel error pattern detection — you sample where you believe things are fine precisely because that's where an unnoticed systematic failure would hide. Option B guarantees you never discover errors the model is confident about, the exact blind spot sampling exists to cover. Option C discovers errors only after they've caused damage. Option D checks self-consistency rather than correctness: a systematically wrong extraction reproduces itself reliably.",
        },
        {
          type: "single",
          question: "During synthesis, the summarization step compresses subagent findings into prose conclusions, and the final report's claims can no longer be traced to sources. What's the root cause?",
          options: [
            "Structured claim-source mappings (source URL, document name, relevant excerpt) weren't required in subagent outputs and preserved through synthesis.",
            "The synthesis agent's context window is too small to hold the source documents.",
            "The subagents used too many tools during research.",
            "The report needed a bibliography section appended at the end."
          ],
          correct: [0],
          explanation: "Source attribution is lost during summarization when findings are compressed without preserving claim-source mappings; the fix is requiring subagents to output structured mappings that downstream agents preserve and merge. Once a mapping is gone, no downstream step can reconstruct it. Option B misattributes a data-modelling failure to capacity — attribution is lost at the compression step regardless of window size. Option C is unrelated. Option D adds a bibliography of sources with no way to link claims to them, which is the problem restated.",
        },
        {
          type: "single",
          question: "A document analysis subagent finds two credible sources reporting different values for the same market-size statistic. What should it do before passing findings to synthesis?",
          options: [
            "Include both values with explicit conflict annotation and source attribution, letting the coordinator decide how to reconcile them.",
            "Select the value from the more recently published source and pass only that forward.",
            "Omit the contested statistic entirely to avoid introducing a contradiction.",
            "Average the two values so downstream synthesis receives a single number."
          ],
          correct: [0],
          explanation: "Document analysis should complete with conflicting values included and explicitly annotated, letting the coordinator decide how to reconcile before passing to synthesis — resolving silently at the analysis step destroys information the coordinator needed. Option B applies a reconciliation heuristic unilaterally at the wrong layer, and recency doesn't establish correctness. Option C silently drops a finding the report may need. Option D fabricates a number neither source reported.",
        }
      ],
      flashcards: [
        { front: "What's the \"lost in the middle\" effect?", back: "Models reliably process information at the start and end of long inputs but may omit or underweight findings buried in the middle — even though the content is sitting right there, fully intact." },
        { front: "How do you mitigate lost-in-the-middle in aggregated inputs?", back: "Place key-findings summaries at the beginning, and organize detailed results under explicit section headers so structure compensates for position." },
        { front: "Why is progressive summarization risky for transactional details?", back: "It tends to condense numerical values, percentages, dates, and customer-stated expectations into vague language, losing exactly the details that matter later." },
        { front: "What's a \"case facts\" block and why keep it separate from summarized history?", back: "A persistent block of key transactional facts (amounts, dates, order numbers, statuses) included in every prompt, kept outside the summarized history so it never gets vagued-out." },
        { front: "Tool results are flooding your context. What do you trim — and what must you never trim?", back: "Trim verbose tool outputs to the relevant fields before they accumulate. Never stop passing complete conversation history — that's what maintains conversational coherence." },
        { front: "When should an agent escalate to a human immediately, without attempting resolution first?", back: "When the customer explicitly requests a human — honor that immediately rather than forcing an autonomous attempt first." },
        { front: "Name the three appropriate escalation triggers.", back: "An explicit customer request for a human; a policy exception or gap (not merely a complex case); and genuine inability to make progress." },
        { front: "Why are sentiment analysis and self-reported confidence scores unreliable escalation triggers?", back: "They don't track case complexity. Sentiment measures mood; and self-reported confidence fails worst exactly where you need it — the agent mishandling hard cases is already confident about them." },
        { front: "What should an agent do when a lookup returns multiple matching customers?", back: "Ask for additional identifying information rather than picking one heuristically — acting on the wrong account is worse than a follow-up question." },
        { front: "What four things should structured error context include for a coordinator to recover intelligently?", back: "Failure type, the attempted query, any partial results, and potential alternative approaches." },
        { front: "Name two anti-patterns in multi-agent error propagation.", back: "Silently suppressing errors (returning empty results marked as success — a failure disguised as success), and terminating the entire workflow on a single subagent failure." },
        { front: "What's a scratchpad file used for in long codebase-exploration sessions?", back: "Persisting key findings across context boundaries so the agent (or a resumed session) doesn't have to rediscover them from scratch." },
        { front: "How does structured state persistence enable crash recovery?", back: "Each agent exports state to a known location; the coordinator loads a manifest on resume and injects it into agent prompts, rather than relying on raw conversation history surviving." },
        { front: "When is --resume the right call, and what must you do with it?", back: "When prior context is mostly still valid — and you must explicitly inform the session which files changed, so it re-analyzes those specifically rather than re-exploring everything." },
        { front: "When is starting a fresh session better than --resume?", back: "When prior tool results are stale enough to mislead — inject a structured summary into a new session rather than resuming and hoping the agent notices the drift. It won't." },
        { front: "Why can't a single aggregate accuracy number (e.g., 97%) be trusted on its own?", back: "It can mask poor performance on specific document types or fields; always validate accuracy by segment before reducing human review for that segment." },
        { front: "What are claim-source mappings and why must synthesis preserve them?", back: "Structured source URL / document name / relevant excerpt attached to each claim. Once compression drops the mapping, no downstream step can reconstruct it — the claim becomes an unsourced assertion." },
        { front: "How should conflicting statistics from two credible sources be handled in synthesis?", back: "Annotate the conflict with source attribution for both values rather than arbitrarily picking one — and check whether differing collection dates explain the discrepancy." },
      ]
    }
  ]
};
