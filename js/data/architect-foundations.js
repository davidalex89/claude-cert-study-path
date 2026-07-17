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
        }
      ],
      flashcards: [
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
            body: "<p>Tool <em>descriptions</em> are the primary mechanism an LLM uses for tool selection — not the tool's name, not its implementation. Minimal descriptions (\"Retrieves customer information\" / \"Retrieves order details\") lead to unreliable selection among similar tools, because the model has no basis for differentiating them. A well-written description includes input formats, example queries, edge cases, and explicit boundary explanations — when to use this tool <em>versus</em> a similar alternative.</p><p>Two failure modes recur in production: <strong>ambiguous or overlapping descriptions</strong> (an analyze_content tool and an analyze_document tool with near-identical wording) cause misrouting, and <strong>keyword-sensitive system prompt wording</strong> can create unintended tool associations that override otherwise well-written tool descriptions. Fixes include renaming and re-describing to eliminate overlap (e.g., renaming analyze_content to extract_web_results with a web-specific description), or splitting an overly generic tool into purpose-specific ones with defined input/output contracts (analyze_document split into extract_data_points, summarize_content, and verify_claim_against_source).</p>"
          },
          {
            heading: "Structured error responses for MCP tools",
            body: `<p>MCP's <code>isError</code> flag is the pattern for communicating a tool failure back to the agent. A uniform "Operation failed" response prevents the agent from making an appropriate recovery decision — it can't tell a transient network timeout from a permission denial from a business-rule violation. Structured error metadata fixes this:</p><pre><code>{
  "isError": true,
  "errorCategory": "business",
  "isRetryable": false,
  "message": "Refund of $620 exceeds the $500 auto-approval limit; route to human review."
}</code></pre><p>Distinguish <strong>transient</strong> errors (timeouts, service unavailability), <strong>validation</strong> errors (invalid input), <strong>business</strong> errors (policy violations), and <strong>permission</strong> errors — each calls for different agent behavior. The <code>isRetryable</code> boolean prevents wasted retry attempts on errors that will never succeed. Also distinguish <strong>access failures</strong> (the query itself couldn't be completed — needs a retry decision) from <strong>valid empty results</strong> (the query succeeded and legitimately found nothing) — conflating the two causes agents to either retry pointlessly or give up on a query that actually worked.</p>`
          },
          {
            heading: "Distributing tools across agents and configuring tool_choice",
            body: `<p>Giving an agent access to too many tools (18 instead of 4-5) degrades tool-selection reliability by increasing decision complexity — even when every individual tool description is well written. Agents given tools outside their specialization also tend to misuse them (a synthesis agent that has web-search access will sometimes attempt searches instead of synthesizing). The fix is <strong>scoped tool access</strong>: give each agent only the tools relevant to its role, with limited cross-role tools reserved for specific high-frequency needs — e.g., a narrow verify_fact tool for a synthesis agent that needs quick fact-checks, while routing genuinely complex verification through the coordinator to a full web-search agent.</p><p><code>tool_choice</code> configuration options give you finer control: <code>"auto"</code> (the model may return text instead of calling a tool), <code>"any"</code> (the model must call a tool, but chooses which one — useful when multiple extraction schemas exist and the document type is unknown), and forced selection <code>{"type": "tool", "name": "extract_metadata"}</code> (the model must call that specific tool, useful for guaranteeing a particular step runs first, e.g. metadata extraction before enrichment).</p>`
          },
          {
            heading: "MCP server scoping and built-in tools",
            body: `<p>MCP servers can be configured at two scopes: <strong>project-level</strong> (.mcp.json, shared and version-controlled team tooling) or <strong>user-level</strong> (~/.claude.json, personal or experimental servers not shared with the team). Environment-variable expansion lets you reference credentials without committing secrets:</p><pre><code>{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "\${GITHUB_TOKEN}" }
    }
  }
}</code></pre><p>Tools from every configured MCP server are discovered at connection time and made available to the agent simultaneously. MCP <strong>resources</strong> (as distinct from tools) expose content catalogs — issue summaries, documentation hierarchies, database schemas — directly, cutting down on exploratory tool calls the agent would otherwise need to make just to figure out what's available.</p><p>For the built-in tools: <strong>Grep</strong> searches file contents for patterns (function names, error messages, imports); <strong>Glob</strong> matches file paths by name/extension pattern; <strong>Read/Write</strong> handle full-file operations; <strong>Edit</strong> makes targeted modifications using unique text matching, and when Edit fails because its anchor text isn't unique in the file, fall back to Read + Write for a reliable full-file replacement.</p>`
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
        }
      ],
      flashcards: [
        { front: "What's the primary mechanism LLMs use to select among available tools?", back: "Tool descriptions — minimal or overlapping descriptions cause unreliable selection among similar tools." },
        { front: "Give an example fix for two tools with near-identical descriptions causing misrouting.", back: "Rename and specialize: e.g., rename analyze_content to extract_web_results with a web-specific description, or split a generic tool into purpose-specific ones (extract_data_points, summarize_content, verify_claim_against_source)." },
        { front: "What does the MCP isError flag do?", back: "Signals a tool call failed, giving the agent structured information to decide how to recover instead of guessing from an ambiguous response." },
        { front: "Name the four error categories worth distinguishing in MCP structured errors.", back: "Transient (timeouts/unavailability), validation (invalid input), business (policy violation), and permission errors." },
        { front: "Why does isRetryable matter in a structured error response?", back: "It tells the agent whether retrying is worth attempting, preventing wasted retry attempts on errors that will never succeed (e.g., permission errors)." },
        { front: "What's the difference between an access failure and a valid empty result?", back: "An access failure means the query couldn't be completed (needs a retry decision); a valid empty result means the query succeeded and legitimately found nothing." },
        { front: "Why does giving an agent too many tools (e.g., 18 instead of 4-5) hurt reliability?", back: "It increases tool-selection decision complexity, degrading routing reliability even when each individual tool is well described." },
        { front: "What are the three tool_choice options and what does each guarantee?", back: "\"auto\" (model may return text instead of calling a tool), \"any\" (model must call some tool but picks which), and forced selection ({\"type\": \"tool\", \"name\": ...}) (a specific named tool must be called)." },
        { front: "When would you use forced tool_choice?", back: "To guarantee a specific tool runs first, e.g. forcing extract_metadata before enrichment tools that depend on its output." },
        { front: "Project-scoped .mcp.json vs. user-scoped ~/.claude.json — what's each for?", back: "Project .mcp.json is shared, version-controlled team tooling; user ~/.claude.json is for personal or experimental MCP servers not shared with the team." },
        { front: "What do MCP resources add beyond MCP tools?", back: "A way to expose content catalogs (issue summaries, doc hierarchies, DB schemas) directly, reducing the number of exploratory tool calls needed." },
        { front: "When should you fall back from Edit to Read+Write?", back: "When Edit fails because its target text isn't unique in the file — Read the full file, then Write the corrected version." }
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
            heading: "CLAUDE.md hierarchy and modular organization",
            body: `<p>CLAUDE.md configuration exists at three levels: <strong>user-level</strong> (~/.claude/CLAUDE.md), <strong>project-level</strong> (.claude/CLAUDE.md or a root CLAUDE.md), and <strong>directory-level</strong> (subdirectory CLAUDE.md files). The scoping distinction matters in practice: user-level settings apply only to that individual user and are <em>not</em> shared with teammates via version control. The classic diagnosis when "a new team member isn't getting our standards" is that the instructions live in someone's user-level file instead of the project-level one.</p><pre><code># Project standards
@./docs/api-conventions.md
@./docs/testing-standards.md</code></pre><p>The <code>@import</code> syntax references external files to keep CLAUDE.md modular — e.g., importing only the standards files relevant to a given package rather than inlining everything into one file. For larger projects, a <code>.claude/rules/</code> directory is an alternative to a monolithic CLAUDE.md, letting you organize topic-specific rule files (testing.md, api-conventions.md, deployment.md) separately. The <code>/memory</code> command shows which memory files are currently loaded — useful for diagnosing inconsistent behavior across sessions or team members.</p>`
          },
          {
            heading: "Custom slash commands and Agent Skills",
            body: `<p>Custom slash commands live in <strong>.claude/commands/</strong> when project-scoped (version-controlled, available to every developer on clone/pull) or in <strong>~/.claude/commands/</strong> when user-scoped (personal, not shared with teammates).</p><p>Agent Skills go further: a skill in <strong>.claude/skills/</strong> is defined by a SKILL.md file whose frontmatter can configure <code>context: fork</code>, <code>allowed-tools</code>, and <code>argument-hint</code>:</p><pre><code>---
name: audit-deps
context: fork
allowed-tools: [Read, Grep]
argument-hint: "&lt;package-name&gt;"
---</code></pre><p><code>context: fork</code> runs the skill in an isolated sub-agent context, so its (often verbose) output — a full codebase analysis, a long brainstorm — doesn't pollute the main conversation. <code>allowed-tools</code> restricts what the skill can do while it runs (e.g., limiting it to read-only operations to prevent destructive actions). Developers can create personal variants of a shared skill in ~/.claude/skills/ under a different name without affecting teammates. As a rule of thumb: reach for a skill for on-demand, task-specific workflows, and for CLAUDE.md for universal standards that should always be loaded.</p>`
          },
          {
            heading: "Path-specific rules for conditional convention loading",
            body: `<p>.claude/rules/ files can carry YAML frontmatter with a <code>paths</code> field containing glob patterns, so the rule only activates — and only consumes context/tokens — when you're editing a matching file:</p><pre><code>---
paths: ["**/*.test.tsx", "**/*.test.ts"]
---
All test files use Testing Library; avoid snapshot tests for interactive components.</code></pre><p>This beats directory-level CLAUDE.md files for conventions that span multiple directories — test files scattered throughout a codebase (Button.test.tsx sitting next to Button.tsx in dozens of different folders) can be matched by file type via a glob pattern regardless of where they live, whereas a directory-level CLAUDE.md is bound to a single directory and can't reach files elsewhere.</p>`
          },
          {
            heading: "Plan mode vs. direct execution",
            body: "<p>Plan mode is designed for complex tasks: large-scale, multi-file changes, situations with multiple valid implementation approaches, and genuine architectural decisions — e.g., restructuring a monolith into microservices across dozens of files, where you need to explore dependencies and decide on service boundaries before committing to changes. It enables safe codebase exploration and design up front, preventing costly rework from a wrong early assumption.</p><p>Direct execution fits simple, well-scoped changes with a clear existing path — a single-file bug fix with a clear stack trace, or adding one validation check to one function. For multi-phase work, the <strong>Explore subagent</strong> isolates verbose discovery output (returning summaries instead) to preserve the main conversation's context budget — a common pattern is combining plan mode for investigation with direct execution for the implementation once the plan is set.</p>"
          },
          {
            heading: "Iterative refinement and CI/CD integration",
            body: `<p>When a prose description produces inconsistent results, 2-3 concrete input/output examples communicate the intended transformation far more reliably than more adjectives. <strong>Test-driven iteration</strong> — writing a test suite covering expected behavior, edge cases, and performance requirements before implementation, then iterating by sharing test failures — gives Claude a concrete target instead of a vague one. The <strong>interview pattern</strong> (having Claude ask clarifying questions before implementing) surfaces design considerations you may not have anticipated, especially in unfamiliar domains. When several issues interact, describe them together in one detailed message; independent issues are better fixed sequentially so each fix can be verified on its own.</p><pre><code>claude -p "Review this PR for security issues" \\
  --output-format json --json-schema ./review-schema.json</code></pre><p>For CI/CD: the <strong>-p (--print)</strong> flag runs Claude Code non-interactively, which is required in automated pipelines — without it, the job hangs waiting for interactive input. <strong>--output-format json</strong> combined with <strong>--json-schema</strong> produces machine-parseable, schema-conformant findings suitable for posting as inline PR comments. A subtlety worth remembering: the same session that generated a piece of code is less effective at reviewing its own changes than an independent review instance, because it retains its own reasoning context. On re-runs after new commits, include prior findings in context and instruct Claude to report only new or still-unaddressed issues, to avoid duplicate comments; likewise, provide existing test files as context so test generation doesn't suggest scenarios already covered.</p>`
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
        }
      ],
      flashcards: [
        { front: "Three levels of CLAUDE.md hierarchy?", back: "User-level (~/.claude/CLAUDE.md), project-level (.claude/CLAUDE.md or root CLAUDE.md), directory-level (subdirectory CLAUDE.md files)." },
        { front: "Are user-level CLAUDE.md instructions shared with teammates?", back: "No — ~/.claude/CLAUDE.md applies only to that user and isn't shared via version control; that's a common cause of \"why isn't my teammate getting these instructions.\"" },
        { front: "What does @import do in CLAUDE.md?", back: "References external files to keep CLAUDE.md modular, e.g. importing only the standards files relevant to a given package." },
        { front: "What's .claude/rules/ an alternative to?", back: "A monolithic CLAUDE.md — it organizes topic-specific rule files (testing.md, api-conventions.md, deployment.md) separately." },
        { front: "What does the /memory command do?", back: "Shows which memory (CLAUDE.md) files are currently loaded, useful for diagnosing inconsistent behavior across sessions." },
        { front: "Project-scoped vs. user-scoped slash commands — where does each live?", back: "Project: .claude/commands/ (version-controlled, team-wide). User: ~/.claude/commands/ (personal, not shared)." },
        { front: "What does context: fork do in a Skill's frontmatter?", back: "Runs the skill in an isolated sub-agent context so its (often verbose) output doesn't pollute the main conversation." },
        { front: "What do .claude/rules/ files use to control when they load?", back: "YAML frontmatter with a paths field of glob patterns — the rule only activates when you're editing a matching file." },
        { front: "Why prefer path-specific rules over per-directory CLAUDE.md for something like test-file conventions?", back: "Test files are often scattered across many directories; a glob-pattern rule (**/*.test.tsx) applies by file type regardless of location, while directory CLAUDE.md is bound to one directory." },
        { front: "When does plan mode earn its cost over direct execution?", back: "Complex, large-scale changes with multiple valid approaches and architectural decisions — it lets you explore and design before committing, avoiding costly rework." },
        { front: "What's the -p (--print) flag for in Claude Code?", back: "Runs Claude Code non-interactively for automated pipelines — it prints the result and exits instead of waiting for interactive input." },
        { front: "What do --output-format json and --json-schema give you in CI?", back: "Machine-parseable, schema-conformant structured findings you can post as inline PR comments programmatically." },
        { front: "Why is the same session that generated code often worse at reviewing it?", back: "It retains its own reasoning context from generation, making it less likely to question its own decisions — an independent review instance without that context catches more." }
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
            body: "<p>Instructions like \"be conservative\" or \"only report high-confidence findings\" fail to improve precision, because they give the model no concrete standard to apply — it's left to guess what \"conservative\" means case by case. Specific, categorical criteria work far better: \"flag comments only when the claimed behavior contradicts the actual code behavior\" produces more consistent results than \"check that comments are accurate.\" This matters because a high false-positive rate in one category undermines developer trust in the tool's <em>accurate</em> categories too — once a reviewer learns to ignore one noisy category, they start skimming past all of them.</p><p>In practice: write specific review criteria that define exactly which issues to report (real bugs, security problems) versus skip (minor style, established local patterns), rather than relying on confidence-based filtering. If a category is currently generating a lot of noise, it's often better to temporarily disable it while you improve its prompt than to let it erode trust in the rest of the review. Defining explicit severity criteria with concrete code examples for each level produces far more consistent classification than asking the model to \"judge severity.\"</p>"
          },
          {
            heading: "Few-shot prompting for consistency",
            body: "<p>When detailed prose instructions alone produce inconsistent results, few-shot examples are the most effective technique for achieving consistently formatted, actionable output. They're especially valuable for demonstrating <strong>ambiguous-case handling</strong> — how to pick a tool for an ambiguous request, or how to judge a borderline test-coverage gap — because a well-chosen example teaches the model to <em>generalize the underlying judgment</em> to novel cases, rather than just pattern-matching the exact scenarios you listed. Few-shot examples are also one of the most effective levers for reducing hallucination in extraction tasks, particularly around informal measurements and varied document structures.</p><p>Guidelines: 2-4 targeted examples for an ambiguous scenario are usually enough, and each is more useful if it shows the <em>reasoning</em> for why one action was chosen over plausible alternatives, not just the final answer. Include examples that demonstrate the exact desired output format (location, issue, severity, suggested fix) to lock in consistency. Distinguish acceptable patterns from genuine issues in your examples to reduce false positives while still letting the model generalize. For extraction specifically, show correct handling of varied document structures (inline citations vs. a bibliography, a methodology section vs. embedded detail) rather than assuming one canonical layout.</p>"
          },
          {
            heading: "Enforcing structured output with tool_use and JSON schemas",
            body: `<p>Using <strong>tool_use</strong> with a JSON schema is the most reliable approach for guaranteed schema-compliant structured output — it eliminates JSON syntax errors outright, since the model is filling in a schema rather than freehand-generating text that happens to look like JSON. What it does <em>not</em> eliminate is semantic errors: line items that don't sum to the stated total, or a value placed in the wrong field, are both perfectly valid JSON and still wrong.</p><pre><code>{
  "type": "object",
  "properties": {
    "amount": { "type": ["number", "null"] },
    "category": { "enum": ["refund", "credit", "other"] },
    "category_detail": { "type": "string" }
  },
  "required": ["category"]
}</code></pre><p>Schema design choices matter: make a field <strong>optional/nullable</strong> when the source document may simply not contain that information — this prevents the model from fabricating a value just to satisfy a required field. An <strong>enum + "other" + detail string</strong> pattern (as above) gives you a fixed, known set of categories plus an escape hatch for cases that don't fit. On tool_choice: use <code>"any"</code> when multiple extraction schemas exist and the document type isn't known ahead of time, and forced selection (<code>{"type": "tool", "name": "extract_metadata"}</code>) when a specific extraction must run before dependent enrichment steps.</p>`
          },
          {
            heading: "Validation, retry, and feedback loops",
            body: "<p>A <strong>retry-with-error-feedback</strong> loop appends the specific validation errors from a failed attempt to the next prompt, guiding the model toward the correction rather than just asking it to try again blind. Retries are effective for format and structural errors, but <strong>ineffective when the required information is simply absent from the source document</strong> — no amount of retrying invents data that was never there, and it's worth explicitly tracking which failure mode you're in.</p><p>Feedback loops also support quality tracking over time: a <code>detected_pattern</code> field on structured findings lets you systematically analyze which code constructs trigger dismissed (false-positive) findings. For self-correction on numeric data, extract a <code>calculated_total</code> alongside the document's own <code>stated_total</code> so a mismatch is flagged automatically rather than silently trusted, and add a <code>conflict_detected</code> boolean when source data is internally inconsistent.</p>"
          },
          {
            heading: "Batch processing and multi-pass review",
            body: "<p>The <strong>Message Batches API</strong> trades latency for cost: roughly 50% cost savings, in exchange for a processing window of up to 24 hours with no guaranteed latency SLA. It fits non-blocking, latency-tolerant workloads — overnight reports, weekly audits, nightly test generation — and is the wrong choice for blocking workflows like a pre-merge check that a developer is actively waiting on. It also doesn't support multi-turn tool calling within a single request (you can't execute a tool mid-request and get results back in the same batch call). <code>custom_id</code> fields correlate each request with its response, which is also how you identify and resubmit only the documents that failed.</p><p>On review architecture: a model that generated some code retains its own reasoning context from that generation, which makes it less likely to question its own decisions in the same session — an <strong>independent review instance</strong>, without that prior reasoning context, is more effective at catching subtle issues than asking the same session to self-review. For large multi-file changes, a <strong>multi-pass review</strong> — a focused per-file pass for local issues, plus a separate cross-file integration pass — avoids the attention dilution and contradictory findings that come from analyzing everything at once.</p>"
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
        }
      ],
      flashcards: [
        { front: "Why does \"be conservative\" or \"only report high-confidence findings\" fail to improve precision?", back: "They're vague, non-categorical instructions; explicit criteria naming exactly which issues to report vs skip work far better." },
        { front: "What's the risk of a review prompt with a high false-positive rate in one category?", back: "It undermines developer trust in the tool's accurate categories too — not just the noisy one." },
        { front: "When are few-shot examples most valuable?", back: "When detailed prose instructions alone produce inconsistent output — for ambiguous-case handling, format consistency, and generalizing judgment to novel patterns." },
        { front: "How many few-shot examples are typically enough for an ambiguous scenario?", back: "2-4 targeted examples, showing the reasoning for why one action was chosen over plausible alternatives." },
        { front: "Why is tool_use with a JSON schema more reliable than asking for JSON in prose?", back: "It guarantees schema-compliant output and eliminates JSON syntax errors — though it does NOT eliminate semantic errors." },
        { front: "Give an example of a semantic error that a valid JSON schema won't catch.", back: "Line items that don't sum to the stated total, or a value placed in the wrong field — structurally valid JSON that's still wrong." },
        { front: "Why make a schema field nullable instead of required, when source documents sometimes lack that data?", back: "To prevent the model from fabricating a value just to satisfy a required field — nullable + optional lets it honestly report \"not present.\"" },
        { front: "What's the \"enum + other + detail string\" schema pattern for?", back: "Extensible categorization — a fixed enum for known categories plus an \"other\" value with a free-text detail field for cases that don't fit." },
        { front: "When is a retry-with-error-feedback loop ineffective?", back: "When the required information is simply absent from the source document — retries only help with format/structural errors, not missing data." },
        { front: "What are the Message Batches API's core tradeoffs?", back: "50% cost savings and up to a 24-hour processing window, but no guaranteed latency SLA and no multi-turn tool calling within a single request." },
        { front: "When should you use the Batches API vs. the synchronous API?", back: "Batches for non-blocking, latency-tolerant work (overnight reports, nightly test generation); synchronous for blocking workflows like pre-merge checks." },
        { front: "Why is an independent review instance often better than having the generating session review its own output?", back: "The generating session retains its own reasoning context, making it less likely to question decisions it just made; a fresh instance without that context catches subtler issues." }
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
            body: `<p>Progressive summarization carries a specific risk: condensing numerical values, percentages, dates, and customer-stated expectations into a vague summary loses exactly the details that matter most later. Compounding this is the <strong>"lost in the middle" effect</strong> — models reliably process information at the beginning and end of a long input but may under-weight or omit findings buried in the middle. Meanwhile, tool results accumulate in context and consume tokens disproportionately to their relevance (40+ fields returned from an order lookup when only 5 are ever used).</p><pre><code>CASE FACTS (persisted, not summarized):
- order_id: 88213, amount: $142.50, status: shipped
- customer requested: refund by Friday</code></pre><p>Mitigations: extract transactional facts (amounts, dates, order numbers, statuses) into a persistent "case facts" block included in every prompt, kept outside the summarized conversation history so it never gets vagued-out; trim verbose tool outputs to only the fields that matter before they accumulate in context; place key-findings summaries at the start of aggregated inputs and organize detailed results under explicit section headers to counteract position effects; and require subagents to include metadata (dates, source locations, methodology) in their structured outputs so downstream synthesis has what it needs.</p>`
          },
          {
            heading: "Escalation and ambiguity resolution",
            body: "<p>Appropriate escalation triggers are: an explicit customer request for a human, a policy exception or gap (not simply \"this case is complex\"), and genuine inability to make progress. When a customer explicitly asks for a human, honor that immediately rather than first forcing an autonomous resolution attempt. But when an issue is within the agent's actual capability, it's usually better to acknowledge frustration and offer resolution, escalating only if the customer reiterates their preference for a human. Escalate when policy is ambiguous or silent on the customer's specific request — e.g., policy that only addresses on-site price adjustments says nothing about competitor price matching, so that gap should be escalated rather than resolved by guessing.</p><p><strong>Sentiment-based escalation and self-reported confidence scores are unreliable proxies for actual case complexity</strong> — a calm request can hide a genuine policy gap, and a frustrated customer can have a trivially resolvable issue. When a lookup tool returns multiple matching customers, the correct move is to ask for additional identifying information, not to guess based on a heuristic.</p>"
          },
          {
            heading: "Error propagation across multi-agent systems",
            body: "<p>A subagent should return <strong>structured error context</strong> to its coordinator — failure type, the query that was attempted, any partial results, and potential alternative approaches — so the coordinator can make an informed recovery decision (retry with a modified query, try an alternative approach, or proceed with partial results and annotate the gap). Distinguish <strong>access failures</strong> (the query itself failed — this needs a retry decision) from <strong>valid empty results</strong> (the query succeeded and legitimately found nothing) so the coordinator doesn't retry a query that already worked, or trust a result that never actually completed.</p><p>Two anti-patterns to avoid: a generic error status like \"search unavailable\" that hides the context the coordinator needs to recover intelligently, and either silently suppressing an error (returning empty results marked as success) or terminating the entire workflow on a single subagent failure. The better pattern is local recovery within the subagent for transient failures, propagating to the coordinator only the errors that can't be resolved locally — along with partial results and what was attempted — and structuring the final synthesis output with coverage annotations showing which findings are well-supported versus which topic areas have gaps due to an unavailable source.</p>"
          },
          {
            heading: "Context management in large codebase exploration",
            body: "<p>A telltale sign of context degradation during extended codebase exploration: the model starts giving inconsistent answers and referencing \"typical patterns\" instead of the specific classes it actually discovered earlier in the same session. <strong>Scratchpad files</strong> persist key findings across context boundaries so an agent (or a resumed session) doesn't have to rediscover them from scratch. <strong>Subagent delegation</strong> for specific investigative questions (\"find all test files,\" \"trace refund flow dependencies\") isolates verbose exploration output while the main agent maintains high-level coordination — summarize key findings from one exploration phase before spawning subagents for the next, injecting those summaries into their initial context.</p><p>For crash recovery in long-running multi-agent work, use <strong>structured state persistence</strong>: each agent exports its state to a known location, and the coordinator loads a manifest on resume and injects it into agent prompts, rather than relying on the raw conversation history surviving intact. The <code>/compact</code> command reduces context usage during extended exploration sessions when the context window is filling up with verbose discovery output.</p>"
          },
          {
            heading: "Human review, confidence calibration, and provenance",
            body: "<p>An aggregate accuracy metric (\"97% overall\") can mask poor performance on specific document types or fields — always validate accuracy by document type and field segment before reducing human review for that segment. <strong>Stratified random sampling</strong> of high-confidence extractions supports ongoing error-rate measurement and helps detect novel error patterns that wouldn't show up in aggregate numbers. Field-level confidence scores, calibrated against a labeled validation set, let you route review attention efficiently — sending low-confidence or ambiguous/contradictory-source extractions to human review while prioritizing limited reviewer capacity on the cases most likely to be wrong.</p><p>On provenance: source attribution is easily lost when findings are compressed during summarization without preserving <strong>claim-source mappings</strong> (source URL, document name, relevant excerpt) — require subagents to output these structured mappings and require downstream synthesis to preserve them, not just the prose conclusion. When two credible sources report conflicting statistics, annotate the conflict with source attribution for both values rather than arbitrarily picking one — and check whether differing publication or collection dates explain the discrepancy rather than a genuine contradiction. Render different content types appropriately in a synthesis output (financial data as tables, news as prose, technical findings as structured lists) rather than forcing everything into one uniform format.</p>"
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
        }
      ],
      flashcards: [
        { front: "What's the \"lost in the middle\" effect?", back: "Models reliably process information at the start and end of long inputs but may omit or underweight findings buried in the middle." },
        { front: "Why is progressive summarization risky for transactional details?", back: "It tends to condense numerical values, percentages, dates, and customer-stated expectations into vague language, losing exactly the details that matter later." },
        { front: "What's a \"case facts\" block and why keep it separate from summarized history?", back: "A persistent block of key transactional facts (amounts, dates, order numbers, statuses) included in every prompt, kept outside the summarized/condensed conversation history so it never gets vagued-out." },
        { front: "When should an agent escalate to a human immediately, without attempting resolution first?", back: "When the customer explicitly requests a human — honor that immediately rather than forcing an autonomous attempt first." },
        { front: "Why are sentiment analysis and self-reported confidence scores unreliable escalation triggers?", back: "They don't reliably correlate with actual case complexity — a calm request can be a genuine policy gap, and a frustrated one can be trivially resolvable." },
        { front: "What should an agent do when a lookup returns multiple matching customers?", back: "Ask for additional identifying information rather than picking one heuristically." },
        { front: "What four things should structured error context include for a coordinator to recover intelligently?", back: "Failure type, the attempted query, any partial results, and potential alternative approaches." },
        { front: "What's the difference between an access failure and a valid empty result, in error propagation terms?", back: "An access failure means the query itself failed (needs a retry decision); a valid empty result means the query succeeded and legitimately found nothing." },
        { front: "Name two anti-patterns in multi-agent error propagation.", back: "Silently suppressing errors (returning empty results marked as success), and terminating the entire workflow on a single subagent failure." },
        { front: "What's a scratchpad file used for in long codebase-exploration sessions?", back: "Persisting key findings across context boundaries so the agent (or a resumed session) doesn't have to rediscover them from scratch." },
        { front: "Why can't a single aggregate accuracy number (e.g., 97%) be trusted on its own?", back: "It can mask poor performance on specific document types or fields; always validate accuracy by segment before reducing human review for that segment." },
        { front: "How should conflicting statistics from two credible sources be handled in synthesis?", back: "Annotate the conflict with source attribution for both values rather than arbitrarily picking one — and check whether differing collection dates explain the discrepancy." }
      ]
    }
  ]
};
