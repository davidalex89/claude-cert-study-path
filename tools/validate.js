#!/usr/bin/env node
/* Schema + integrity validator for the content data files.
 *
 * Run: node tools/validate.js
 *
 * This exists because the expensive failures in this project are the ones that
 * still render fine. A classify item whose `answer` isn't among its own
 * `options` looks perfect on the page and marks every answer wrong; a `correct`
 * index past the end of `options` makes a question unpassable; a duplicated
 * stem quietly wastes a slot in the bank. `node --check` catches none of that.
 * Exits non-zero on any problem so it can gate CI.
 */

"use strict";
var path = require("path");

var TRACKS = ["associate", "developer", "architect-foundations", "architect-professional"];
var WIDGET_TYPES = ["stepThrough", "scenario", "classify", "sequence"];
var STOP_REASONS = ["tool_use", "end_turn"];
var MSG_KINDS = ["tool_call", "tool_result", "final"];
var DEFAULT_CLASSIFY_OPTIONS = [["hook", ""], ["prompt", ""]];

var problems = [];
function bad(where, msg) { problems.push(where + ": " + msg); }

global.window = {};
TRACKS.forEach(function (t) {
  require(path.join(__dirname, "..", "js", "data", t + ".js"));
});

var totals = { sections: 0, widgets: 0, checks: 0, quiz: 0, flashcards: 0, prose: 0, multi: 0, official: 0 };
var widgetTypeCounts = {};

function validateQuestion(where, q) {
  if (!q.question) return bad(where, "missing question text");
  if (!Array.isArray(q.options) || q.options.length < 2) return bad(where, "needs at least 2 options");
  if (!q.explanation) bad(where, "missing explanation");
  if (!Array.isArray(q.correct) || !q.correct.length) return bad(where, "missing correct answer");
  q.correct.forEach(function (i) {
    if (typeof i !== "number" || i < 0 || i >= q.options.length) bad(where, "correct index " + i + " out of range (0-" + (q.options.length - 1) + ")");
  });
  if (new Set(q.correct).size !== q.correct.length) bad(where, "duplicate index in correct[]");
  if (q.type === "multi" && q.correct.length < 2) bad(where, 'type "multi" but only one correct answer');
  if (q.type !== "multi" && q.correct.length > 1) bad(where, "single-select but multiple correct answers");
  if (q.source && q.source !== "official") bad(where, 'source must be "official" or absent (found "' + q.source + '")');
}

function validateWidget(where, w) {
  if (WIDGET_TYPES.indexOf(w.type) === -1) return bad(where, "unknown widget type " + w.type);
  widgetTypeCounts[w.type] = (widgetTypeCounts[w.type] || 0) + 1;

  if (w.type === "classify") {
    if (!w.items || !w.items.length) return bad(where, "classify has no items");
    w.items.forEach(function (item, i) {
      var opts = (item.options || DEFAULT_CLASSIFY_OPTIONS).map(function (o) { return o[0]; });
      if (opts.indexOf(item.answer) === -1) {
        bad(where + " item" + i, 'answer "' + item.answer + '" is not one of its options [' + opts.join(", ") + '] — item is unanswerable');
      }
      if (!item.why) bad(where + " item" + i, "missing why");
      if (!item.text) bad(where + " item" + i, "missing text");
    });
  }

  if (w.type === "scenario") {
    if (!w.setup) bad(where, "scenario missing setup");
    if (!w.choices || w.choices.length < 2) return bad(where, "scenario needs at least 2 choices");
    if (!w.choices.some(function (c) { return c.outcome === "good"; })) bad(where, "scenario has no good branch — unwinnable");
    w.choices.forEach(function (c, i) {
      if (!c.text) bad(where + " choice" + i, "missing text");
      if (!c.feedback) bad(where + " choice" + i, "missing feedback");
      if (["good", "bad"].indexOf(c.outcome) === -1) bad(where + " choice" + i, 'outcome must be "good" or "bad"');
    });
  }

  if (w.type === "sequence") {
    if (!w.items || w.items.length < 3) bad(where, "sequence needs at least 3 items");
    if (!w.explanation) bad(where, "sequence missing explanation");
    (w.items || []).forEach(function (it, i) { if (!it.text) bad(where + " item" + i, "missing text"); });
  }

  if (w.type === "stepThrough") {
    if (!w.steps || !w.steps.length) return bad(where, "stepThrough has no steps");
    w.steps.forEach(function (st, i) {
      if (!st.narration) bad(where + " step" + i, "missing narration");
      if (st.stopReason && STOP_REASONS.indexOf(st.stopReason) === -1) bad(where + " step" + i, "invalid stopReason " + st.stopReason);
      (st.messages || []).forEach(function (m, mi) {
        if (MSG_KINDS.indexOf(m.kind) === -1) bad(where + " step" + i + " msg" + mi, "invalid kind " + m.kind);
        if (!m.role) bad(where + " step" + i + " msg" + mi, "missing role");
      });
    });
  }
}

TRACKS.forEach(function (trackId) {
  var cert = global.window.CERT_DATA[trackId];
  if (!cert) return bad(trackId, "did not register into window.CERT_DATA");

  ["id", "name", "code", "cost", "time", "passingScore", "validity", "tagline", "audience"].forEach(function (k) {
    if (!cert[k]) bad(trackId, "missing cert field " + k);
  });
  if (typeof cert.questions !== "number") bad(trackId, "questions must be a number");
  if (cert.id !== trackId) bad(trackId, 'id "' + cert.id + '" does not match its filename');
  if (cert.scenarios && typeof cert.scenarios !== "string") bad(trackId, "scenarios must be a plain string");
  if (cert.scenarios && /<[a-z]/i.test(cert.scenarios)) bad(trackId, "scenarios is inserted as text — it must not contain HTML");

  var weightSum = 0;
  var stems = {};
  var seenDomainIds = {};

  cert.domains.forEach(function (d) {
    var dw = trackId + "/" + d.id;
    if (seenDomainIds[d.id]) bad(dw, "duplicate domain id");
    seenDomainIds[d.id] = 1;
    if (!d.title) bad(dw, "missing title");
    if (!d.summary) bad(dw, "missing summary");
    if (typeof d.weight !== "number") bad(dw, "weight must be a number");
    weightSum += d.weight || 0;
    if (!d.objectives || !d.objectives.length) bad(dw, "missing objectives");

    if (!d.lesson || !d.lesson.sections || !d.lesson.sections.length) return bad(dw, "no lesson sections");
    totals.sections += d.lesson.sections.length;
    d.lesson.sections.forEach(function (s, si) {
      if (!s.heading) bad(dw + " section" + si, "missing heading");
      if (!s.body) bad(dw + " section" + si, "missing body");
      totals.prose += (s.body || "").length;
      if (s.interactive) {
        totals.widgets++;
        validateWidget(dw + ' section"' + s.heading + '"', s.interactive);
      }
    });

    totals.checks += (d.lesson.checks || []).length;
    totals.quiz += (d.quiz || []).length;
    totals.flashcards += (d.flashcards || []).length;

    (d.quiz || []).concat(d.lesson.checks || []).forEach(function (q, qi) {
      validateQuestion(dw + " q" + qi, q);
      if (stems[q.question]) bad(dw + " q" + qi, "duplicate question stem within track");
      stems[q.question] = 1;
      if (q.type === "multi") totals.multi++;
      if (q.source === "official") totals.official++;
    });

    (d.flashcards || []).forEach(function (f, fi) {
      if (!f.front || !f.back) bad(dw + " flashcard" + fi, "missing front or back");
    });

    if ((d.quiz || []).length < 5) bad(dw, "quiz bank under 5 questions");
    if (!(d.lesson.checks || []).length) bad(dw, "no checkpoint questions");
  });

  // Blueprint weights should account for the whole exam (allow rounding slack).
  if (weightSum < 99 || weightSum > 101) bad(trackId, "domain weights sum to " + weightSum + " (expected ~100)");

  // A bank barely larger than the exam gets memorised in a couple of sittings.
  var bank = cert.domains.reduce(function (a, d) { return a + (d.quiz || []).length; }, 0);
  if (bank < cert.questions) bad(trackId, "quiz bank (" + bank + ") is smaller than the real exam (" + cert.questions + " items)");
});

console.log("Content validation");
console.log("  tracks       " + TRACKS.length);
console.log("  sections     " + totals.sections);
console.log("  interactive  " + totals.widgets + "  " + JSON.stringify(widgetTypeCounts));
console.log("  checkpoints  " + totals.checks);
console.log("  quiz         " + totals.quiz + "  (" + totals.multi + " multi-select, " + totals.official + " official samples)");
console.log("  flashcards   " + totals.flashcards);
console.log("  prose        ~" + Math.round(totals.prose / 1000) + "k chars");
console.log("");

if (problems.length) {
  console.error("FAILED — " + problems.length + " problem(s):");
  problems.forEach(function (p) { console.error("  ✗ " + p); });
  process.exit(1);
}
console.log("✅ All checks passed.");
