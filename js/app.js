/* Claude Certification Study Path — app shell
   Hash router + lesson/quiz/flashcard rendering + localStorage progress.
   No build step, no external dependencies. Data comes from js/data/*.js,
   each of which registers itself into window.CERT_DATA[id].
*/

(function () {
  "use strict";

  var CERTS = window.CERT_DATA || {};
  var CERT_ORDER = ["associate", "developer", "architect-foundations", "architect-professional"];
  var ACCENTS = {
    "associate": "var(--c-associate)",
    "developer": "var(--c-developer)",
    "architect-foundations": "var(--c-arch-f)",
    "architect-professional": "var(--c-arch-p)"
  };
  var STORE_KEY = "ccp_progress_v1";

  // ---------------------------------------------------------------------
  // normalize data: assign stable ids to every question/flashcard
  // ---------------------------------------------------------------------
  CERT_ORDER.forEach(function (certId) {
    var cert = CERTS[certId];
    if (!cert) return;
    cert.domains.forEach(function (domain) {
      (domain.lesson && domain.lesson.checks || []).forEach(function (q, i) {
        q.id = certId + "." + domain.id + ".c" + i;
      });
      (domain.quiz || []).forEach(function (q, i) {
        q.id = certId + "." + domain.id + ".q" + i;
        q.domainId = domain.id;
        q.domainTitle = domain.title;
      });
      (domain.flashcards || []).forEach(function (f, i) {
        f.id = certId + "." + domain.id + ".f" + i;
        f.domainId = domain.id;
        f.domainTitle = domain.title;
      });
    });
  });

  // ---------------------------------------------------------------------
  // progress store
  // ---------------------------------------------------------------------
  function loadStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) { return {}; }
  }
  function saveStore(store) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
  }
  function getCertProgress(certId) {
    var store = loadStore();
    return store[certId] || { lessonsRead: {}, domainQuizBest: {}, examAttempts: [], flashMastered: {} };
  }
  function updateCertProgress(certId, fn) {
    var store = loadStore();
    var cp = store[certId] || { lessonsRead: {}, domainQuizBest: {}, examAttempts: [], flashMastered: {} };
    fn(cp);
    store[certId] = cp;
    saveStore(store);
  }
  function markLessonRead(certId, domainId) {
    updateCertProgress(certId, function (cp) { cp.lessonsRead[domainId] = true; });
  }
  function recordDomainQuiz(certId, domainId, score, total) {
    updateCertProgress(certId, function (cp) {
      var pct = total ? Math.round((score / total) * 100) : 0;
      var prev = cp.domainQuizBest[domainId];
      if (!prev || pct > prev.pct) {
        cp.domainQuizBest[domainId] = { score: score, total: total, pct: pct, date: new Date().toISOString() };
      }
    });
  }
  function recordExam(certId, score, total) {
    updateCertProgress(certId, function (cp) {
      var pct = total ? Math.round((score / total) * 100) : 0;
      cp.examAttempts.push({ score: score, total: total, pct: pct, date: new Date().toISOString() });
    });
  }
  function toggleMastered(certId, domainId, cardId, mastered) {
    updateCertProgress(certId, function (cp) {
      var list = cp.flashMastered[domainId] || [];
      var idx = list.indexOf(cardId);
      if (mastered && idx === -1) list.push(cardId);
      if (!mastered && idx !== -1) list.splice(idx, 1);
      cp.flashMastered[domainId] = list;
    });
  }
  function certCompletionPct(certId) {
    var cert = CERTS[certId];
    if (!cert) return 0;
    var cp = getCertProgress(certId);
    var total = cert.domains.length * 2;
    var done = 0;
    cert.domains.forEach(function (d) {
      if (cp.lessonsRead[d.id]) done++;
      if (cp.domainQuizBest[d.id]) done++;
    });
    return total ? Math.round((done / total) * 100) : 0;
  }

  // ---------------------------------------------------------------------
  // small helpers
  // ---------------------------------------------------------------------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === "class") node.className = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function navigate(hash) { window.location.hash = hash; }
  function go(hash) { return function (e) { if (e) e.preventDefault(); navigate(hash); }; }

  // Intervals (the exam timer) are torn down on every route change so a running
  // clock can't outlive the page that owns it.
  var liveIntervals = [];
  function registerInterval(id) { liveIntervals.push(id); return id; }
  function clearIntervals() {
    liveIntervals.forEach(clearInterval);
    liveIntervals = [];
  }

  // Same idea for document-level key handlers (flashcard shortcuts): a page that
  // is no longer rendered must not keep responding to keystrokes.
  var liveKeyHandlers = [];
  function registerKeyHandler(fn) {
    document.addEventListener("keydown", fn);
    liveKeyHandlers.push(fn);
  }
  function clearKeyHandlers() {
    liveKeyHandlers.forEach(function (fn) { document.removeEventListener("keydown", fn); });
    liveKeyHandlers = [];
  }

  // ---------------------------------------------------------------------
  // router
  // ---------------------------------------------------------------------
  function parseHash() {
    var h = window.location.hash.replace(/^#\/?/, "");
    var parts = h.split("/").filter(Boolean);
    return parts;
  }

  function render() {
    var root = document.getElementById("app");
    clearIntervals();
    clearKeyHandlers();
    root.innerHTML = "";
    var parts = parseHash();
    window.scrollTo(0, 0);

    if (parts.length === 0) return renderHome(root);
    if (parts[0] === "about") return renderAbout(root);
    if (parts[0] === "track" && parts[1]) {
      var certId = parts[1];
      if (!CERTS[certId]) return renderNotFound(root);
      if (parts.length === 2) return renderTrack(root, certId);
      if (parts[2] === "exam") return renderExam(root, certId);
      if (parts[2] === "flashcards") return renderFlashcards(root, certId, parts[3] || null);
      if (parts[2] === "domain" && parts[3]) {
        var domainId = parts[3];
        if (parts[4] === "quiz") return renderDomainQuiz(root, certId, domainId);
        if (parts[4] === "step") return renderDomainStep(root, certId, domainId, parseInt(parts[5], 10) || 0);
        return renderDomain(root, certId, domainId);
      }
    }
    renderNotFound(root);
  }
  window.addEventListener("hashchange", render);

  // ---------------------------------------------------------------------
  // topbar
  // ---------------------------------------------------------------------
  function renderTopbar(certId) {
    var bar = document.getElementById("topbar");
    bar.innerHTML = "";
    bar.appendChild(el("a", { class: "brand", onclick: go("#/") }, [
      "Claude Cert Study Path",
      el("small", {}, ["Unofficial · Community-built"])
    ]));
    var nav = el("nav", {});
    nav.appendChild(el("a", { onclick: go("#/") }, ["Home"]));
    if (certId && CERTS[certId]) {
      nav.appendChild(el("a", { onclick: go("#/track/" + certId + "/flashcards") }, ["Flashcards"]));
      nav.appendChild(el("a", { onclick: go("#/track/" + certId + "/exam") }, ["Practice Exam"]));
    }
    nav.appendChild(el("a", { onclick: go("#/about") }, ["About"]));
    nav.appendChild(el("button", { class: "icon-btn", title: "Toggle theme", onclick: toggleTheme }, [themeIcon()]));
    bar.appendChild(nav);
  }

  function themeIcon() { return document.documentElement.getAttribute("data-theme") === "dark" ? "☀" : "☽"; }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("ccp_theme", next); } catch (e) {}
    renderTopbar((parseHash()[1]) || null);
  }
  (function initTheme() {
    try {
      var saved = localStorage.getItem("ccp_theme");
      if (saved) document.documentElement.setAttribute("data-theme", saved);
    } catch (e) {}
  })();

  // ---------------------------------------------------------------------
  // HOME
  // ---------------------------------------------------------------------
  var LANE_BLURB = {
    "associate": "Mandatory first stop — the foundation the other three assume you already have.",
    "developer": "You're the one calling the API, wiring up tools, and shipping the thing.",
    "architect-foundations": "Less \"write the code,\" more deciding how a dozen agents cooperate without catching fire.",
    "architect-professional": "Governance, RAG pipelines, and a straight answer when someone asks \"but is it safe.\""
  };

  function domainStatus(certId, domainId) {
    var cp = getCertProgress(certId);
    var quiz = cp.domainQuizBest[domainId];
    if (quiz && quiz.pct >= 80) return "mastered";
    if (quiz || cp.lessonsRead[domainId]) return "started";
    return "new";
  }

  var SVG_NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function laneConnector(label) {
    var svg = svgEl("svg", { width: 20, height: 40, viewBox: "0 0 20 40" });
    svg.appendChild(svgEl("path", { d: "M10,0 L10,40", class: "road-bed" }));
    svg.appendChild(svgEl("path", { d: "M10,0 L10,40", class: "road-dash" }));
    return el("div", { class: "lane-connector" }, [svg, el("div", { class: "lc-label" }, [label])]);
  }

  function laneEndNote(label) {
    return el("div", { class: "lane-end-note" }, [label]);
  }

  function renderLane(certId) {
    var cert = CERTS[certId];
    var accent = ACCENTS[certId];
    var domains = cert.domains;
    var pct = certCompletionPct(certId);

    var lane = el("div", { class: "lane" });
    lane.style.setProperty("--lane-accent", accent);

    lane.appendChild(el("div", { class: "lane-head" }, [
      el("div", { class: "lane-title-wrap" }, [
        el("h3", {}, [cert.name]),
        el("p", { class: "lane-blurb" }, [LANE_BLURB[certId]])
      ]),
      el("div", { class: "lane-side" }, [
        el("a", { class: "lane-track-link", onclick: go("#/track/" + certId) }, ["Full track details →"]),
        el("div", { class: "lane-meta" }, [pct + "% complete · " + domains.length + " domains"])
      ])
    ]));

    var nodeSize = 44, spacing = 138, padX = 68, trackH = 215, centerY = 165, amp = 20;
    var width = padX * 2 + (domains.length - 1) * spacing;
    var points = domains.map(function (d, i) {
      return { x: padX + i * spacing, y: Math.round(centerY + amp * Math.sin(i * 1.05)), domain: d };
    });

    var svg = svgEl("svg", { width: width, height: trackH, viewBox: "0 0 " + width + " " + trackH });
    for (var i = 1; i < points.length; i++) {
      var prev = points[i - 1], cur = points[i];
      var midX = (prev.x + cur.x) / 2;
      var d = "M " + prev.x + "," + prev.y + " C " + midX + "," + prev.y + " " + midX + "," + cur.y + " " + cur.x + "," + cur.y;
      var traveled = domainStatus(certId, cur.domain.id) !== "new";
      svg.appendChild(svgEl("path", { d: d, class: "road-bed" + (traveled ? " traveled" : "") }));
      svg.appendChild(svgEl("path", { d: d, class: "road-dash" }));
    }

    var track = el("div", { class: "lane-track", style: "width:" + width + "px; height:" + trackH + "px;" });
    track.appendChild(svg);

    points.forEach(function (p, i) {
      var dom = p.domain;
      var status = domainStatus(certId, dom.id);
      var cp = getCertProgress(certId);
      var quiz = cp.domainQuizBest[dom.id];
      var statusText = status === "mastered" ? "Mastered ✓" : status === "started" ? (quiz ? "Quiz best: " + quiz.pct + "%" : "Lesson started") : "Not started yet";
      var tipEdgeClass = i === 0 ? " edge-start" : i === points.length - 1 ? " edge-end" : "";
      var node = el("button", {
        class: "node " + status,
        type: "button",
        style: "left:" + p.x + "px; top:" + p.y + "px;",
        onclick: go("#/track/" + certId + "/domain/" + dom.id)
      }, [
        el("span", {}, [status === "mastered" ? "✓" : String(i + 1)]),
        el("div", { class: "node-tip" + tipEdgeClass }, [
          el("div", { class: "nt-title" }, [dom.title]),
          el("div", { class: "nt-meta" }, [dom.weight + "% of exam"]),
          el("div", { class: "nt-status" }, [statusText])
        ])
      ]);
      track.appendChild(node);
    });

    lane.appendChild(el("div", { class: "lane-scroll" }, [track]));
    return lane;
  }

  function renderHome(root) {
    renderTopbar(null);
    var shell = el("div", { class: "shell wide" });

    shell.appendChild(el("div", { class: "hero" }, [
      el("span", { class: "eyebrow" }, ["Learning path"]),
      el("h1", {}, ["Claude Certification Study Path"]),
      el("p", { class: "lede" }, [
        "Four exams, one long afternoon of denial before you actually start studying. This walks you through all of " +
        "them — lessons, practice questions, full mock exams, and flashcards — right here in your browser. Nothing " +
        "gets uploaded anywhere, and nobody's watching you flub the multi-select questions."
      ]),
      el("div", { class: "disclaimer" }, [
        "Independent, community-built study aid — not produced, reviewed, or endorsed by Anthropic. " +
        "Domain blueprints are sourced from Anthropic's publicly published Exam Guides (v1.0, July 2026). " +
        "All practice questions and flashcards here are original and are not drawn from the live exam item bank. See ",
        el("a", { onclick: go("#/about") }, ["About & sources"]),
        "."
      ])
    ]));

    var nav = el("div", { class: "quicknav-row" });
    CERT_ORDER.forEach(function (id) {
      if (!CERTS[id]) return;
      var cert = CERTS[id];
      var pct = certCompletionPct(id);
      nav.appendChild(el("div", { class: "quicknav", onclick: go("#/track/" + id) }, [
        el("span", { class: "qn-dot", style: "background:" + ACCENTS[id] }),
        el("div", { class: "qn-body" }, [
          el("div", { class: "qn-name" }, [cert.code]),
          el("div", { class: "qn-meta" }, [cert.cost + " · " + cert.questions + "Q"])
        ]),
        el("div", { class: "qn-pct" }, [pct + "%"])
      ]));
    });
    shell.appendChild(nav);

    // ------------------------------------------------------------- route map
    var map = el("div", { class: "route-map" });
    map.appendChild(el("h2", {}, ["The route"]));
    map.appendChild(el("p", { class: "route-intro" }, [
      "Every marker below is a domain from Anthropic's own exam blueprint — hover one for what it covers, click to jump straight into that lesson. One mandatory first lane, then two directions depending on what you actually do at work."
    ]));

    var lanes = ["associate", "developer", "architect-foundations", "architect-professional"].map(renderLane);

    map.appendChild(lanes[0]);
    map.appendChild(laneConnector("Then pick a lane below, based on what you actually do at work — not which one sounds cooler"));
    map.appendChild(lanes[1]);
    map.appendChild(laneEndNote("🏁 End of this road — no further cert needed to ship."));
    map.appendChild(lanes[2]);
    map.appendChild(laneConnector("Ready for more?"));
    map.appendChild(lanes[3]);
    map.appendChild(laneEndNote("🏔 Summit — you're now the one other architects call."));

    shell.appendChild(map);

    shell.appendChild(el("h2", {}, ["How this works"]));
    var two = el("div", { class: "two-col" });
    two.appendChild(el("div", {}, [
      el("h3", {}, ["Full practice exams"]),
      el("p", {}, ["Once you've cleared the domains you're unsure about, take a full-length practice exam mixing questions from every domain, and see a domain-by-domain score breakdown."]),
      el("h3", {}, ["Flashcards"]),
      el("p", {}, ["Flip through flashcards for terms, mechanisms, and anti-patterns pulled straight from the exam blueprint. Mark cards “know it” to retire them from rotation — your mastery is saved locally."])
    ]));
    two.appendChild(el("div", {}, [
      el("h3", {}, ["Your progress, your machine"]),
      el("p", {}, ["Progress is stored in your browser's localStorage only — per certification, per domain. Clear your browser data and it resets; nothing leaves your machine."]),
      el("h3", {}, ["No prerequisites, really"]),
      el("p", {}, ["Anthropic doesn't gate any of the four exams behind another — the roadmap above reflects what the work looks like, not a checkpoint system."])
    ]));
    shell.appendChild(two);

    shell.appendChild(el("div", { class: "footer-note" }, [
      "Registration for the real exams is handled through Anthropic's Partner Academy and delivered via Pearson VUE. This site does not sell, proctor, or issue certifications — it's just a free study companion."
    ]));

    root.appendChild(shell);

    lanes.forEach(function (lane) {
      var scrollEl = lane.querySelector(".lane-scroll");
      if (scrollEl && scrollEl.scrollWidth <= scrollEl.clientWidth + 2) scrollEl.classList.add("fits");
    });
  }

  function renderNotFound(root) {
    renderTopbar(null);
    var shell = el("div", { class: "shell" }, [
      el("div", { class: "empty-state" }, [
        el("h2", {}, ["Page not found"]),
        el("a", { class: "btn", onclick: go("#/") }, ["Back home"])
      ])
    ]);
    root.appendChild(shell);
  }

  // ---------------------------------------------------------------------
  // TRACK OVERVIEW
  // ---------------------------------------------------------------------
  function renderTrack(root, certId) {
    var cert = CERTS[certId];
    renderTopbar(certId);
    var cp = getCertProgress(certId);
    var shell = el("div", { class: "shell" });

    shell.appendChild(el("div", { class: "crumbs" }, [
      el("a", { onclick: go("#/") }, ["Home"]), el("span", { class: "sep" }, ["/"]), cert.name
    ]));
    shell.appendChild(el("span", { class: "badge", style: "background:" + ACCENTS[certId] }, [cert.code]));
    shell.appendChild(el("h1", {}, [cert.name]));
    shell.appendChild(el("p", { class: "lede" }, [cert.audience]));

    var facts = el("div", { class: "facts-strip" }, [
      fact(cert.cost, "Exam fee"),
      fact(cert.questions, "Questions"),
      fact(cert.time, "Time limit"),
      fact(cert.passingScore, "Passing score"),
      fact(cert.validity, "Validity")
    ]);
    shell.appendChild(facts);

    if (cert.scenarios) {
      shell.appendChild(el("div", { class: "callout" }, [
        el("span", { class: "callout-label" }, ["Scenario format"]),
        cert.scenarios
      ]));
    }

    shell.appendChild(el("h2", {}, ["Exam blueprint"]));
    shell.appendChild(el("p", {}, ["Approximate share of scored items drawn from each domain, per Anthropic's official exam guide."]));
    var chart = el("div", { class: "weight-chart" });
    var maxW = Math.max.apply(null, cert.domains.map(function (d) { return d.weight; }));
    cert.domains.forEach(function (d) {
      chart.appendChild(el("div", { class: "weight-row" }, [
        el("div", { class: "label" }, [d.title]),
        el("div", { class: "bar-track" }, [el("div", { class: "bar-fill", style: "width:" + (d.weight / maxW * 100) + "%; background:" + ACCENTS[certId] })]),
        el("div", { class: "val" }, [d.weight + "%"])
      ]));
    });
    shell.appendChild(chart);

    shell.appendChild(el("div", { class: "section-head" }, [
      el("h2", {}, ["Study roadmap"]),
    ]));
    var roadmap = el("div", { class: "roadmap" });
    cert.domains.forEach(function (d, i) {
      var read = !!cp.lessonsRead[d.id];
      var quiz = cp.domainQuizBest[d.id];
      var step = el("div", { class: "road-step" + (read && quiz ? " done" : "") }, [
        el("div", { class: "node" }, [(read && quiz) ? "✓" : String(i + 1)]),
        el("div", { class: "body", onclick: go("#/track/" + certId + "/domain/" + d.id) }, [
          el("h4", {}, [d.title]),
          el("div", { class: "sub" }, [d.summary]),
          el("div", { class: "row" }, [
            el("span", { class: "pill" }, [d.weight + "% of exam"]),
            read ? el("span", { class: "pill" }, ["✓ Lesson read"]) : null,
            quiz ? el("span", { class: "pill" }, ["Best quiz: " + quiz.pct + "%"]) : null
          ])
        ])
      ]);
      roadmap.appendChild(step);
    });
    shell.appendChild(roadmap);

    shell.appendChild(el("div", { class: "btn-row" }, [
      el("a", { class: "btn btn-primary", onclick: go("#/track/" + certId + "/exam") }, ["Take full practice exam"]),
      el("a", { class: "btn", onclick: go("#/track/" + certId + "/flashcards") }, ["Study flashcards"])
    ]));

    root.appendChild(shell);
  }

  function fact(v, k) {
    return el("div", { class: "fact" }, [el("div", { class: "v" }, [String(v)]), el("div", { class: "k" }, [k])]);
  }

  // ---------------------------------------------------------------------
  // INTERACTIVE LESSON WIDGETS (step-through / scenario / classify)
  // ---------------------------------------------------------------------
  function widgetShell(icon, title, bodyNode) {
    return el("div", { class: "widget" }, [
      el("div", { class: "widget-head" }, [el("span", { class: "w-icon" }, [icon]), el("h4", {}, [title])]),
      el("div", { class: "widget-body" }, [bodyNode])
    ]);
  }

  function renderStepThrough(spec) {
    var state = { i: 0 };
    var body = el("div", {});
    function draw() {
      body.innerHTML = "";
      var step = spec.steps[state.i];

      var dots = el("div", { class: "step-dots" });
      spec.steps.forEach(function (s, i) {
        dots.appendChild(el("span", { class: "step-dot" + (i === state.i ? " active" : i < state.i ? " done" : "") }));
      });
      body.appendChild(dots);

      if (step.stopReason) {
        body.appendChild(el("div", { class: "stop-reason-badge " + step.stopReason }, [
          step.stopReason === "tool_use" ? "⚙ stop_reason: \"tool_use\"" : "✓ stop_reason: \"end_turn\""
        ]));
      }
      body.appendChild(el("div", { class: "step-narration" }, [
        step.label ? el("strong", {}, [step.label + " — "]) : null,
        step.narration
      ]));

      var transcript = el("div", { class: "transcript" });
      for (var i = 0; i <= state.i; i++) {
        (spec.steps[i].messages || []).forEach(function (m) {
          transcript.appendChild(el("div", { class: "transcript-msg " + m.kind }, [
            el("span", { class: "tm-role" }, [m.role]),
            m.text
          ]));
        });
      }
      body.appendChild(transcript);

      var nav = el("div", { class: "step-nav" });
      var backBtn = el("button", { class: "btn btn-sm", type: "button" }, ["← Back"]);
      backBtn.disabled = state.i === 0;
      backBtn.addEventListener("click", function () { if (state.i > 0) { state.i--; draw(); } });
      var nextBtn = el("button", { class: "btn btn-sm btn-primary", type: "button" }, [state.i < spec.steps.length - 1 ? "Next →" : "Restart ↺"]);
      nextBtn.addEventListener("click", function () {
        state.i = state.i < spec.steps.length - 1 ? state.i + 1 : 0;
        draw();
      });
      nav.appendChild(backBtn);
      nav.appendChild(nextBtn);
      nav.appendChild(el("span", { class: "step-count" }, ["Step " + (state.i + 1) + " of " + spec.steps.length]));
      body.appendChild(nav);
    }
    draw();
    return widgetShell("▶", spec.title || "Step through it", body);
  }

  function renderScenario(spec) {
    var body = el("div", {});
    body.appendChild(el("div", { class: "scenario-setup" }, [spec.setup]));
    var choicesWrap = el("div", { class: "scenario-choices" });
    var answered = false;
    var feedbackBox = el("div", {});
    spec.choices.forEach(function (choice) {
      var btn = el("button", { class: "scenario-choice", type: "button" }, [choice.text]);
      btn.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        btn.classList.add("picked", choice.outcome === "good" ? "good" : "bad");
        Array.prototype.forEach.call(choicesWrap.children, function (c) { c.setAttribute("data-disabled", "true"); });
        feedbackBox.appendChild(el("div", { class: "scenario-feedback " + (choice.outcome === "good" ? "good" : "bad") }, [
          el("span", { class: "sf-verdict" }, [choice.outcome === "good" ? "✓ Solid call" : "✗ This is the failure mode"]),
          choice.feedback
        ]));
      });
      choicesWrap.appendChild(btn);
    });
    body.appendChild(choicesWrap);
    body.appendChild(feedbackBox);
    return widgetShell("🧭", spec.title || "Scenario", body);
  }

  function renderClassifyGame(spec) {
    var body = el("div", {});
    if (spec.instructions) body.appendChild(el("p", { class: "classify-instructions" }, [spec.instructions]));
    var score = { correct: 0, answered: 0 };
    var scoreEl = el("div", { class: "classify-score" }, ["0 / " + spec.items.length + " answered"]);
    body.appendChild(scoreEl);
    var defaultOptions = [["hook", "🔒 Hook"], ["prompt", "💬 Prompt"]];
    spec.items.forEach(function (item) {
      var options = item.options || defaultOptions;
      var itemEl = el("div", { class: "classify-item" });
      itemEl.appendChild(el("div", { class: "classify-text" }, [item.text]));
      var btnsWrap = el("div", { class: "classify-btns" });
      var whyBox = el("div", {});
      options.forEach(function (opt) {
        var btn = el("button", { class: "classify-btn", type: "button" }, [opt[1]]);
        btn.addEventListener("click", function () {
          if (itemEl.classList.contains("answered")) return;
          itemEl.classList.add("answered");
          var isCorrect = opt[0] === item.answer;
          btn.classList.add(isCorrect ? "correct-pick" : "wrong-pick");
          if (!isCorrect) {
            Array.prototype.forEach.call(btnsWrap.children, function (b, bi) {
              if (options[bi][0] === item.answer) b.classList.add("correct-pick");
            });
          }
          score.answered++;
          if (isCorrect) score.correct++;
          scoreEl.textContent = score.correct + " / " + spec.items.length + " correct (" + score.answered + " answered)";
          whyBox.appendChild(el("div", { class: "classify-why" }, [item.why]));
        });
        btnsWrap.appendChild(btn);
      });
      itemEl.appendChild(btnsWrap);
      itemEl.appendChild(whyBox);
      body.appendChild(itemEl);
    });
    return widgetShell("🎯", spec.title || "Quick check", body);
  }

  function renderSequence(spec) {
    var body = el("div", {});
    if (spec.instructions) body.appendChild(el("p", { class: "classify-instructions" }, [spec.instructions]));

    var picked = [];              // indices into spec.items, in the order clicked
    var checked = false;
    var listWrap = el("div", { class: "seq-list" });
    var feedback = el("div", {});
    var actions = el("div", { class: "seq-actions" });
    var shuffled = shuffle(spec.items.map(function (item, i) { return { item: item, origIndex: i }; }));

    function draw() {
      listWrap.innerHTML = "";
      shuffled.forEach(function (entry, displayIdx) {
        var pos = picked.indexOf(displayIdx);
        var row = el("button", { class: "seq-item" + (pos !== -1 ? " picked" : ""), type: "button" }, [
          el("span", { class: "seq-badge" }, [pos !== -1 ? String(pos + 1) : ""]),
          el("span", { class: "seq-text" }, [entry.item.text])
        ]);
        if (checked) {
          // correct position for this item is its index in the authored (unshuffled) array
          var correctPos = entry.origIndex;
          row.classList.add(pos === correctPos ? "seq-right" : "seq-wrong");
          row.appendChild(el("span", { class: "seq-answer" }, ["#" + (correctPos + 1)]));
        }
        row.addEventListener("click", function () {
          if (checked) return;
          var at = picked.indexOf(displayIdx);
          if (at === -1) picked.push(displayIdx);
          else picked.splice(at, 1);
          draw();
        });
        listWrap.appendChild(row);
      });

      actions.innerHTML = "";
      var checkBtn = el("button", { class: "btn btn-sm btn-primary", type: "button" }, ["Check order"]);
      checkBtn.disabled = checked || picked.length !== spec.items.length;
      checkBtn.addEventListener("click", function () {
        checked = true;
        var allRight = picked.every(function (displayIdx, pos) { return shuffled[displayIdx].origIndex === pos; });
        feedback.innerHTML = "";
        feedback.appendChild(el("div", { class: "scenario-feedback " + (allRight ? "good" : "bad") }, [
          el("span", { class: "sf-verdict" }, [allRight ? "✓ Correct order" : "✗ Not the right order — the badges show where each step actually belongs"]),
          spec.explanation
        ]));
        draw();
      });
      var resetBtn = el("button", { class: "btn btn-sm", type: "button" }, ["Reset"]);
      resetBtn.addEventListener("click", function () {
        picked = []; checked = false; feedback.innerHTML = "";
        shuffled = shuffle(shuffled);
        draw();
      });
      actions.appendChild(checkBtn);
      actions.appendChild(resetBtn);
      actions.appendChild(el("span", { class: "seq-count" }, [picked.length + " / " + spec.items.length + " placed"]));
    }

    draw();
    body.appendChild(listWrap);
    body.appendChild(actions);
    body.appendChild(feedback);
    return widgetShell("🔢", spec.title || "Put these in order", body);
  }

  function renderInteractive(spec) {
    if (spec.type === "stepThrough") return renderStepThrough(spec);
    if (spec.type === "scenario") return renderScenario(spec);
    if (spec.type === "classify") return renderClassifyGame(spec);
    if (spec.type === "sequence") return renderSequence(spec);
    return null;
  }

  // ---------------------------------------------------------------------
  // DOMAIN LESSON — overview (concept menu) + one-concept-per-page steps
  // ---------------------------------------------------------------------

  // A domain's walkthrough is its lesson.sections, plus one trailing
  // "checks" step if it has checkpoint questions. Both step pages and the
  // overview's concept list are built from this same list.
  function domainSteps(domain) {
    var steps = (domain.lesson.sections || []).map(function (sec, i) {
      return { kind: "section", section: sec, label: sec.heading };
    });
    if (domain.lesson.checks && domain.lesson.checks.length) {
      steps.push({ kind: "checks", label: "Check your understanding" });
    }
    return steps;
  }

  function renderSectionNode(sec) {
    var s = el("div", { class: "lesson-section" }, [el("h2", {}, [sec.heading])]);
    s.appendChild(el("div", { html: sec.body }));
    if (sec.interactive) {
      var widget = renderInteractive(sec.interactive);
      if (widget) s.appendChild(widget);
    }
    return s;
  }

  function renderChecksNode(domain, certId) {
    var wrap = el("div", {});
    wrap.appendChild(el("h2", {}, ["Check your understanding"]));
    wrap.appendChild(el("p", {}, ["Quick checkpoints covering this domain — answer, then reveal the explanation."]));
    domain.lesson.checks.forEach(function (q) {
      wrap.appendChild(renderQuestionCard(q, certId, null, { revealMode: true }));
    });
    return wrap;
  }

  function renderDomain(root, certId, domainId) {
    var cert = CERTS[certId];
    var domain = cert.domains.filter(function (d) { return d.id === domainId; })[0];
    if (!domain) return renderNotFound(root);
    renderTopbar(certId);
    markLessonRead(certId, domainId);

    var idx = cert.domains.indexOf(domain);
    var prev = cert.domains[idx - 1];
    var next = cert.domains[idx + 1];
    var steps = domainSteps(domain);

    var shell = el("div", { class: "shell" });
    shell.appendChild(el("div", { class: "crumbs" }, [
      el("a", { onclick: go("#/") }, ["Home"]), el("span", { class: "sep" }, ["/"]),
      el("a", { onclick: go("#/track/" + certId) }, [cert.name]), el("span", { class: "sep" }, ["/"]),
      domain.title
    ]));
    shell.appendChild(el("span", { class: "pill" }, ["Domain " + (idx + 1) + " of " + cert.domains.length + " · " + domain.weight + "% of exam"]));
    shell.appendChild(el("h1", {}, [domain.title]));
    if (domain.objectives && domain.objectives.length) {
      shell.appendChild(el("div", { class: "callout" }, [
        el("span", { class: "callout-label" }, ["You should be able to…"]),
        el("ul", {}, domain.objectives.map(function (o) { return el("li", {}, [o]); }))
      ]));
    }

    shell.appendChild(el("h2", {}, ["What's in this lesson"]));
    shell.appendChild(el("p", { class: "lede" }, ["Broken into " + steps.length + " short stops — walk them in order, or jump to the one you need."]));
    var conceptList = el("div", { class: "concept-list" });
    steps.forEach(function (step, i) {
      conceptList.appendChild(el("a", { class: "concept-row", onclick: go("#/track/" + certId + "/domain/" + domainId + "/step/" + i) }, [
        el("span", { class: "concept-num" }, [step.kind === "checks" ? "✓" : String(i + 1)]),
        el("span", { class: "concept-label" }, [step.label]),
        el("span", { class: "concept-go" }, ["→"])
      ]));
    });
    shell.appendChild(conceptList);

    shell.appendChild(el("div", { class: "btn-row" }, [
      el("a", { class: "btn btn-primary", onclick: go("#/track/" + certId + "/domain/" + domainId + "/step/0") }, ["Start walkthrough →"]),
      el("a", { class: "btn", onclick: go("#/track/" + certId + "/domain/" + domainId + "/quiz") }, ["Skip to domain quiz"]),
      prev ? el("a", { class: "btn", onclick: go("#/track/" + certId + "/domain/" + prev.id) }, ["← " + prev.title]) : null,
      next ? el("a", { class: "btn", onclick: go("#/track/" + certId + "/domain/" + next.id) }, [next.title + " →"]) : null
    ]));

    root.appendChild(shell);
  }

  function renderDomainStep(root, certId, domainId, stepIndex) {
    var cert = CERTS[certId];
    var domain = cert.domains.filter(function (d) { return d.id === domainId; })[0];
    if (!domain) return renderNotFound(root);
    var steps = domainSteps(domain);
    if (!steps.length) return renderDomain(root, certId, domainId);
    if (stepIndex < 0) stepIndex = 0;
    if (stepIndex >= steps.length) stepIndex = steps.length - 1;

    renderTopbar(certId);
    markLessonRead(certId, domainId);

    var idx = cert.domains.indexOf(domain);
    var domPrev = cert.domains[idx - 1];
    var domNext = cert.domains[idx + 1];
    var step = steps[stepIndex];
    var isLast = stepIndex === steps.length - 1;

    var shell = el("div", { class: "shell" });
    shell.appendChild(el("div", { class: "crumbs" }, [
      el("a", { onclick: go("#/") }, ["Home"]), el("span", { class: "sep" }, ["/"]),
      el("a", { onclick: go("#/track/" + certId) }, [cert.name]), el("span", { class: "sep" }, ["/"]),
      el("a", { onclick: go("#/track/" + certId + "/domain/" + domainId) }, [domain.title]), el("span", { class: "sep" }, ["/"]),
      step.label
    ]));
    shell.appendChild(el("a", { class: "back-link", onclick: go("#/track/" + certId + "/domain/" + domainId) }, ["← Back to " + domain.title]));

    var dots = el("div", { class: "concept-dots" });
    steps.forEach(function (s, i) {
      var dot = el("span", { class: "concept-dot" + (i === stepIndex ? " active" : i < stepIndex ? " done" : "") });
      dot.addEventListener("click", go("#/track/" + certId + "/domain/" + domainId + "/step/" + i));
      dots.appendChild(dot);
    });
    shell.appendChild(dots);
    shell.appendChild(el("span", { class: "pill" }, [(step.kind === "checks" ? "Recap" : "Concept " + (stepIndex + 1) + " of " + (steps.length - (domain.lesson.checks && domain.lesson.checks.length ? 1 : 0))) + " · " + domain.title]));

    shell.appendChild(step.kind === "checks" ? renderChecksNode(domain, certId) : renderSectionNode(step.section));

    var nav = el("div", { class: "btn-row" }, [
      el("a", { class: "btn", onclick: go("#/track/" + certId + "/domain/" + domainId) }, ["↑ Lesson overview"]),
      stepIndex > 0
        ? el("a", { class: "btn", onclick: go("#/track/" + certId + "/domain/" + domainId + "/step/" + (stepIndex - 1)) }, ["← Back"])
        : null,
      !isLast ? el("a", { class: "btn btn-primary", onclick: go("#/track/" + certId + "/domain/" + domainId + "/step/" + (stepIndex + 1)) }, ["Next →"]) : null,
      isLast ? el("a", { class: "btn btn-primary", onclick: go("#/track/" + certId + "/domain/" + domainId + "/quiz") }, ["Take domain quiz →"]) : null
    ]);
    shell.appendChild(nav);

    if (isLast) {
      shell.appendChild(el("div", { class: "btn-row" }, [
        domPrev ? el("a", { class: "btn btn-sm", onclick: go("#/track/" + certId + "/domain/" + domPrev.id) }, ["← " + domPrev.title]) : null,
        domNext ? el("a", { class: "btn btn-sm", onclick: go("#/track/" + certId + "/domain/" + domNext.id) }, [domNext.title + " →"]) : null
      ]));
    }

    root.appendChild(shell);
  }

  // ---------------------------------------------------------------------
  // question card (used by checkpoints, domain quiz, exam)
  // ---------------------------------------------------------------------
  function renderQuestionCard(q, certId, onAnswered, opts) {
    opts = opts || {};
    var selectCount = q.type === "multi" ? (q.correct.length) : 1;
    var selected = [];
    var answered = false;

    var card = el("div", { class: "q-card" });
    var meta = el("div", { class: "q-meta" }, [
      q.type === "multi" ? ("Select " + selectCount) : "Select 1",
      q.source === "official" ? el("span", { class: "source-tag" }, ["Official sample — Anthropic Exam Guide"]) : el("span", { class: "source-tag" }, ["Practice question"])
    ]);
    card.appendChild(meta);
    card.appendChild(el("div", { class: "q-text" }, [q.question]));

    var optWrap = el("div", { class: "q-options" });
    var optNodes = [];
    q.options.forEach(function (optText, i) {
      var node = el("div", { class: "q-option" }, [
        el("div", { class: "mark" }, [q.type === "multi" ? "✓" : "●"]),
        el("div", {}, [optText])
      ]);
      node.addEventListener("click", function () {
        if (answered) return;
        if (q.type === "multi") {
          var pos = selected.indexOf(i);
          if (pos === -1) { if (selected.length < selectCount) selected.push(i); }
          else selected.splice(pos, 1);
        } else {
          selected = [i];
        }
        optNodes.forEach(function (n, ni) { n.classList.toggle("selected", selected.indexOf(ni) !== -1); });
      });
      optNodes.push(node);
      optWrap.appendChild(node);
    });
    card.appendChild(optWrap);

    var actions = el("div", { class: "q-actions" });
    var explanationBox = el("div", {});
    var submitBtn = el("button", { class: "btn btn-primary btn-sm" }, ["Check answer"]);
    submitBtn.addEventListener("click", function () {
      if (answered || selected.length === 0) return;
      answered = true;
      var correctSet = q.correct.slice().sort();
      var selSet = selected.slice().sort();
      var isCorrect = JSON.stringify(correctSet) === JSON.stringify(selSet);
      optNodes.forEach(function (n, i) {
        n.setAttribute("data-disabled", "true");
        var isSel = selected.indexOf(i) !== -1;
        var isAns = q.correct.indexOf(i) !== -1;
        if (isAns) n.classList.add("correct");
        else if (isSel) n.classList.add("incorrect");
      });
      var verdict = el("div", { class: "verdict " + (isCorrect ? "good" : "bad") }, [isCorrect ? "✓ Correct" : "✗ Not quite"]);
      var expl = el("div", { class: "explanation" }, [verdict, el("div", {}, [q.explanation])]);
      explanationBox.appendChild(expl);
      submitBtn.setAttribute("disabled", "true");
      if (onAnswered) onAnswered(isCorrect, selected.slice());
    });
    actions.appendChild(submitBtn);
    card.appendChild(actions);
    card.appendChild(explanationBox);
    return card;
  }

  // ---------------------------------------------------------------------
  // DOMAIN QUIZ
  // ---------------------------------------------------------------------
  function renderDomainQuiz(root, certId, domainId) {
    var cert = CERTS[certId];
    var domain = cert.domains.filter(function (d) { return d.id === domainId; })[0];
    if (!domain) return renderNotFound(root);
    renderTopbar(certId);

    runQuizFlow(root, {
      certId: certId,
      title: domain.title + " — Domain Quiz",
      crumbs: [["Home", "#/"], [cert.name, "#/track/" + certId], [domain.title, "#/track/" + certId + "/domain/" + domainId]],
      questions: shuffle(domain.quiz || []),
      backHash: "#/track/" + certId + "/domain/" + domainId,
      onFinish: function (score, total) { recordDomainQuiz(certId, domainId, score, total); },
      // Retry re-runs the flow in place: navigating to the hash we're already on
      // would not fire hashchange, so the button would do nothing.
      onRetry: function () { renderDomainQuiz(root, certId, domainId); }
    });
  }

  // ---------------------------------------------------------------------
  // FULL PRACTICE EXAM
  // ---------------------------------------------------------------------
  function renderExam(root, certId) {
    var cert = CERTS[certId];
    renderTopbar(certId);
    var allQ = [];
    cert.domains.forEach(function (d) { (d.quiz || []).forEach(function (q) { allQ.push(q); }); });

    // Mirror the real sitting: the exam's own item count, drawn from the bank.
    var questions = shuffle(allQ).slice(0, Math.min(cert.questions, allQ.length));

    runQuizFlow(root, {
      certId: certId,
      title: "Full Practice Exam",
      crumbs: [["Home", "#/"], [cert.name, "#/track/" + certId]],
      questions: questions,
      backHash: "#/track/" + certId,
      isExam: true,
      cert: cert,
      timeLimitMin: 120,
      onFinish: function (score, total) { recordExam(certId, score, total); },
      onRetry: function () { renderExam(root, certId); }
    });
  }

  function runQuizFlow(root, cfg) {
    root.innerHTML = "";
    var shell = el("div", { class: "shell" });
    var crumbs = el("div", { class: "crumbs" });
    cfg.crumbs.forEach(function (c, i) {
      if (i > 0) crumbs.appendChild(el("span", { class: "sep" }, ["/"]));
      crumbs.appendChild(el("a", { onclick: go(c[1]) }, [c[0]]));
    });
    shell.appendChild(crumbs);
    shell.appendChild(el("h1", {}, [cfg.title]));

    if (!cfg.questions.length) {
      shell.appendChild(el("div", { class: "empty-state" }, ["No questions available yet for this section."]));
      root.appendChild(shell);
      return;
    }

    // state.answers records every graded question so results can show a review.
    var state = { i: 0, score: 0, perDomain: {}, answers: [], timeUp: false };
    var body = el("div", {});

    var timerEl = null;
    if (cfg.timeLimitMin) {
      var secsLeft = cfg.timeLimitMin * 60;
      timerEl = el("div", { class: "exam-timer" }, []);
      var tick = function () {
        var mins = Math.floor(Math.abs(secsLeft) / 60);
        var secs = Math.abs(secsLeft) % 60;
        var label = (secsLeft < 0 ? "+" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
        timerEl.innerHTML = "";
        timerEl.appendChild(el("span", { class: "et-label" }, [state.timeUp ? "Over time" : "Time remaining"]));
        timerEl.appendChild(el("span", { class: "et-clock" }, [label]));
        timerEl.classList.toggle("warn", secsLeft <= 600 && secsLeft > 0);
        timerEl.classList.toggle("over", secsLeft <= 0);
        if (secsLeft <= 0) state.timeUp = true;
        secsLeft--;
      };
      tick();
      // Keep counting past zero rather than hard-stopping: this is practice, and
      // knowing how far over you ran is more useful than a locked screen.
      registerInterval(setInterval(tick, 1000));
      shell.appendChild(timerEl);
      shell.appendChild(el("p", { class: "lede" }, [
        "Timed like the real sitting: " + cfg.questions.length + " questions, " + cfg.timeLimitMin + " minutes. The clock keeps running past zero so you can see your true pace."
      ]));
    }

    shell.appendChild(body);
    root.appendChild(shell);

    function renderStep() {
      body.innerHTML = "";
      var total = cfg.questions.length;
      var pctDone = Math.round((state.i / total) * 100);
      body.appendChild(el("div", { class: "quiz-progress" }, [
        el("div", { class: "qp-track" }, [el("div", { class: "qp-fill", style: "width:" + pctDone + "%; background:" + ACCENTS[cfg.certId] })]),
        el("div", { class: "qp-label" }, ["Question " + (state.i + 1) + " of " + total])
      ]));
      var q = cfg.questions[state.i];
      var card = renderQuestionCard(q, cfg.certId, function (isCorrect, selected) {
        if (isCorrect) state.score++;
        state.answers.push({ q: q, selected: selected, isCorrect: isCorrect });
        if (q.domainId) {
          var pd = state.perDomain[q.domainId] = state.perDomain[q.domainId] || { correct: 0, total: 0, title: q.domainTitle };
          pd.total++;
          if (isCorrect) pd.correct++;
        }
        var nextBtn = el("button", { class: "btn btn-sm" }, [state.i + 1 < total ? "Next question →" : "See results →"]);
        nextBtn.addEventListener("click", function () {
          state.i++;
          if (state.i >= total) renderResults(); else renderStep();
        });
        card.querySelector(".q-actions").appendChild(nextBtn);
      });
      body.appendChild(card);
    }

    function renderResults() {
      clearIntervals();
      if (timerEl) timerEl.classList.add("done");
      body.innerHTML = "";
      var total = cfg.questions.length;
      var pct = Math.round((state.score / total) * 100);
      var pass = pct >= 80;
      if (cfg.onFinish) cfg.onFinish(state.score, total);

      body.appendChild(el("div", { class: "result-hero" }, [
        el("div", { class: "score" }, [state.score + " / " + total]),
        el("div", { class: "status " + (pass ? "pass" : "fail") }, [pct + "% correct"]),
        el("div", { class: "sub" }, [
          cfg.isExam
            ? "Illustrative only — the real exam is scaled 100–1,000 with a cut score of 720 (≈ 80% correct on a criterion-referenced test). This isn't a predicted scaled score."
            : "Domain mastery threshold used across this site: 80%."
        ])
      ]));

      if (cfg.isExam) {
        body.appendChild(el("h2", {}, ["Score by domain"]));
        body.appendChild(el("p", {}, ["The real score report breaks down percent-correct by domain too — weakest domains are where revision pays most."]));
        var breakdown = el("div", { class: "domain-breakdown" });
        cfg.cert.domains.forEach(function (d) {
          var pd = state.perDomain[d.id];
          var dpct = pd && pd.total ? Math.round((pd.correct / pd.total) * 100) : null;
          breakdown.appendChild(el("div", { class: "db-row" }, [
            el("a", { class: "db-name", onclick: go("#/track/" + cfg.certId + "/domain/" + d.id) }, [d.title]),
            el("div", { class: "db-track" }, [el("div", { class: "db-fill", style: "width:" + (dpct || 0) + "%; background:" + ACCENTS[cfg.certId] })]),
            el("div", {}, [dpct == null ? "—" : dpct + "%"])
          ]));
        });
        body.appendChild(breakdown);
      }

      var missed = state.answers.filter(function (a) { return !a.isCorrect; });
      body.appendChild(el("h2", {}, [missed.length ? "Review what you missed (" + missed.length + ")" : "Nothing missed 🎉"]));
      if (missed.length) {
        body.appendChild(el("p", {}, ["The questions you got wrong, with what you picked and why the right answer is right."]));
        missed.forEach(function (a) {
          var card = el("div", { class: "q-card review" });
          card.appendChild(el("div", { class: "q-meta" }, [
            a.q.domainTitle || "Practice question",
            a.q.source === "official" ? el("span", { class: "source-tag" }, ["Official sample"]) : null
          ]));
          card.appendChild(el("div", { class: "q-text" }, [a.q.question]));
          var opts = el("div", { class: "q-options" });
          a.q.options.forEach(function (optText, i) {
            var isAns = a.q.correct.indexOf(i) !== -1;
            var isSel = a.selected.indexOf(i) !== -1;
            if (!isAns && !isSel) return; // only show the right answer and what they picked
            opts.appendChild(el("div", { class: "q-option " + (isAns ? "correct" : "incorrect"), "data-disabled": "true" }, [
              el("div", { class: "mark" }, [isAns ? "✓" : "✗"]),
              el("div", {}, [
                optText,
                el("span", { class: "review-tag" }, [isAns ? (isSel ? " — correct (you picked this)" : " — correct answer") : " — you picked this"])
              ])
            ]));
          });
          card.appendChild(opts);
          card.appendChild(el("div", { class: "explanation" }, [a.q.explanation]));
          body.appendChild(card);
        });
      } else {
        body.appendChild(el("p", {}, ["Clean sweep — every question in this run was correct."]));
      }

      var retryBtn = el("button", { class: "btn btn-primary" }, ["Retry (reshuffled)"]);
      retryBtn.addEventListener("click", function () { cfg.onRetry(); });
      body.appendChild(el("div", { class: "btn-row" }, [
        retryBtn,
        el("a", { class: "btn", onclick: go(cfg.backHash) }, ["Back"])
      ]));
    }

    renderStep();
  }

  // ---------------------------------------------------------------------
  // FLASHCARDS
  // ---------------------------------------------------------------------
  function renderFlashcards(root, certId, domainFilter) {
    var cert = CERTS[certId];
    renderTopbar(certId);
    var cp = getCertProgress(certId);

    var shell = el("div", { class: "shell" });
    shell.appendChild(el("div", { class: "crumbs" }, [
      el("a", { onclick: go("#/") }, ["Home"]), el("span", { class: "sep" }, ["/"]),
      el("a", { onclick: go("#/track/" + certId) }, [cert.name]), el("span", { class: "sep" }, ["/"]),
      "Flashcards"
    ]));
    shell.appendChild(el("h1", {}, [cert.name + " — Flashcards"]));

    var allCards = [];
    cert.domains.forEach(function (d) { (d.flashcards || []).forEach(function (f) { allCards.push(f); }); });

    var toolbar = el("div", { class: "flash-toolbar" });
    var select = el("select", { class: "btn btn-sm" });
    select.appendChild(el("option", { value: "" }, ["All domains (" + allCards.length + " cards)"]));
    cert.domains.forEach(function (d) {
      var n = (d.flashcards || []).length;
      var opt = el("option", { value: d.id }, [d.title + " (" + n + ")"]);
      if (domainFilter === d.id) opt.setAttribute("selected", "true");
      select.appendChild(opt);
    });
    select.addEventListener("change", function () {
      navigate("#/track/" + certId + "/flashcards" + (select.value ? "/" + select.value : ""));
    });
    toolbar.appendChild(select);

    var hideMastered = el("label", { class: "pill", style: "cursor:pointer" }, []);
    var hideCb = el("input", { type: "checkbox" });
    hideCb.checked = true;
    hideMastered.appendChild(hideCb);
    hideMastered.appendChild(document.createTextNode(" Hide mastered"));
    toolbar.appendChild(hideMastered);

    var shuffleBtn = el("button", { class: "btn btn-sm" }, ["↻ Shuffle"]);
    toolbar.appendChild(el("div", { class: "spacer" }));
    var counter = el("div", { class: "flash-counter" }, [""]);
    toolbar.appendChild(counter);
    toolbar.appendChild(shuffleBtn);
    shell.appendChild(toolbar);

    var stageWrap = el("div", {});
    shell.appendChild(stageWrap);
    root.appendChild(shell);

    var deck = [];
    var keyActions = null;   // rebound by draw() to the currently visible card
    var pos = 0;

    function masteredSet() {
      var out = {};
      Object.keys(cp.flashMastered).forEach(function (dId) {
        (cp.flashMastered[dId] || []).forEach(function (id) { out[id] = true; });
      });
      return out;
    }

    function buildDeck() {
      var pool = domainFilter ? allCards.filter(function (f) { return f.domainId === domainFilter; }) : allCards;
      if (hideCb.checked) {
        var mastered = masteredSet();
        pool = pool.filter(function (f) { return !mastered[f.id]; });
      }
      deck = shuffle(pool);
      pos = 0;
      draw();
    }

    shuffleBtn.addEventListener("click", buildDeck);
    hideCb.addEventListener("change", buildDeck);

    function draw() {
      stageWrap.innerHTML = "";
      var masteredCount = Object.keys(masteredSet()).filter(function (id) {
        return allCards.some(function (f) { return f.id === id && (!domainFilter || f.domainId === domainFilter); });
      }).length;
      var totalPool = domainFilter ? allCards.filter(function (f) { return f.domainId === domainFilter; }).length : allCards.length;
      counter.textContent = masteredCount + " / " + totalPool + " mastered";

      if (!deck.length) {
        keyActions = null;   // no visible card — shortcuts must not fire on a retired one
        stageWrap.appendChild(el("div", { class: "flash-empty" }, [
          el("h3", {}, ["🎉 Nothing left in rotation"]),
          el("p", {}, ["Every card in this set is marked as known. Uncheck “Hide mastered” to review them again."])
        ]));
        return;
      }
      if (pos >= deck.length) pos = 0;
      var card = deck[pos];
      var flipped = false;

      var flash = el("div", { class: "flashcard" });
      var inner = el("div", { class: "inner" }, [
        el("div", { class: "face front" }, [
          el("span", { class: "eyebrow" }, [card.domainTitle]),
          el("div", { class: "txt" }, [card.front]),
          el("div", { class: "hint" }, ["Click to flip"])
        ]),
        el("div", { class: "face back" }, [
          el("span", { class: "eyebrow" }, ["Answer"]),
          el("div", { class: "txt" }, [card.back]),
          el("div", { class: "hint" }, ["Click to flip back"])
        ])
      ]);
      flash.appendChild(inner);
      var doFlip = function () {
        flipped = !flipped;
        flash.classList.toggle("flipped", flipped);
      };
      flash.addEventListener("click", doFlip);
      stageWrap.appendChild(el("div", { class: "flash-stage" }, [flash]));

      var markUnknown = function () {
        toggleMastered(certId, card.domainId, card.id, false);
        cp = getCertProgress(certId);
        advance();
      };
      var markKnown = function () {
        toggleMastered(certId, card.domainId, card.id, true);
        cp = getCertProgress(certId);
        if (hideCb.checked) {
          deck.splice(pos, 1);
          draw();
        } else {
          advance();
        }
      };
      keyActions = { flip: doFlip, known: markKnown, unknown: markUnknown };

      var againBtn = el("button", { class: "btn btn-again" }, ["← Still learning"]);
      againBtn.addEventListener("click", markUnknown);
      var knowBtn = el("button", { class: "btn btn-know" }, ["Know it ✓"]);
      knowBtn.addEventListener("click", markKnown);
      stageWrap.appendChild(el("div", { class: "flash-actions" }, [againBtn, knowBtn]));

      stageWrap.appendChild(el("div", { class: "btn-row", style: "justify-content:center" }, [
        el("span", { class: "flash-counter" }, ["Card " + (pos + 1) + " of " + deck.length])
      ]));
      stageWrap.appendChild(el("div", { class: "flash-keys" }, [
        el("span", {}, [el("span", { class: "kbd" }, ["Space"]), " flip"]),
        el("span", {}, [el("span", { class: "kbd" }, ["→"]), " know it"]),
        el("span", {}, [el("span", { class: "kbd" }, ["←"]), " still learning"])
      ]));
    }

    function advance() { pos = (pos + 1) % deck.length; draw(); }

    registerKeyHandler(function (e) {
      if (!keyActions) return;
      if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); keyActions.flip(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); keyActions.known(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); keyActions.unknown(); }
    });

    buildDeck();
  }

  // ---------------------------------------------------------------------
  // ABOUT
  // ---------------------------------------------------------------------
  function renderAbout(root) {
    renderTopbar(null);
    var shell = el("div", { class: "shell" });
    shell.appendChild(el("div", { class: "crumbs" }, [el("a", { onclick: go("#/") }, ["Home"]), el("span", { class: "sep" }, ["/"]), "About"]));
    shell.appendChild(el("h1", {}, ["About this project"]));
    shell.appendChild(el("div", { class: "lesson-section" }, [
      el("h3", {}, ["What this is"]),
      el("p", {}, ["An independent, open-source study companion for Anthropic's four Claude Certification exams: Claude Certified Associate – Foundations, Claude Certified Developer – Foundations, Claude Certified Architect – Foundations, and Claude Certified Architect – Professional."]),
      el("h3", {}, ["What it isn't"]),
      el("p", {}, ["It is not produced, reviewed, endorsed, or licensed by Anthropic. It does not contain, reproduce, or draw from any live exam item bank — doing so would violate the confidentiality terms every candidate agrees to before sitting an exam. Every lesson, practice question, and flashcard here is original content written to teach the concepts in Anthropic's publicly published exam blueprints, in a similar style and difficulty to the sample questions Anthropic itself publishes for candidate preparation."]),
      el("h3", {}, ["Sources"]),
      el("ul", {}, [
        el("li", {}, ["Anthropic's official Exam Guide PDFs for all four certifications (Version 1.0, effective July 2026), which publish the domain blueprints, task statements, and illustrative sample questions used to shape this content."]),
        el("li", {}, ["Anthropic Partner Academy certification pages (anthropic-partners.skilljar.com)."]),
        el("li", {}, ["Pearson VUE's Claude Certification Program page (pearsonvue.com/us/en/anthropic.html), which handles real exam registration and scheduling."])
      ]),
      el("h3", {}, ["Registering for the real exam"]),
      el("p", {}, ["This site can't register you for anything. To schedule an official exam, go through Anthropic's Partner Academy, download the current Exam Guide, and schedule through Pearson VUE."]),
      el("h3", {}, ["Your data"]),
      el("p", {}, ["Progress (lessons read, quiz scores, flashcard mastery) is stored only in your browser's localStorage. Nothing is sent to a server — there is no server. Clearing your browser storage resets everything."]),
      (function () {
        var wrap = el("div", { class: "btn-row" });
        var btn = el("button", { class: "btn" }, ["Reset all my progress"]);
        btn.addEventListener("click", function () {
          if (btn.getAttribute("data-armed") !== "true") {
            btn.setAttribute("data-armed", "true");
            btn.classList.add("btn-danger");
            btn.textContent = "Click again to confirm — this can't be undone";
            return;
          }
          try { localStorage.removeItem(STORE_KEY); } catch (e) {}
          btn.classList.remove("btn-danger");
          btn.removeAttribute("data-armed");
          btn.textContent = "✓ Progress cleared";
          btn.setAttribute("disabled", "true");
        });
        wrap.appendChild(btn);
        return wrap;
      })(),
      el("h3", {}, ["Open source"]),
      el("p", {}, ["This project is open source. Corrections to the domain content, additional practice questions, and new flashcards are welcome via pull request."])
    ]));
    root.appendChild(shell);
  }

  // ---------------------------------------------------------------------
  render();
})();
