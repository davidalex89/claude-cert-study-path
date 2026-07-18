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

  // Two-click-confirm reset button, reused on the home and About pages.
  function resetProgressButton(opts) {
    opts = opts || {};
    var btn = el("button", { class: "btn" }, [opts.label || "Reset all my progress"]);
    btn.addEventListener("click", function () {
      if (btn.getAttribute("data-armed") !== "true") {
        btn.setAttribute("data-armed", "true");
        btn.classList.add("btn-danger");
        btn.textContent = "Click again to confirm — this can't be undone";
        return;
      }
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      if (opts.onDone) opts.onDone();
      else {
        btn.classList.remove("btn-danger");
        btn.removeAttribute("data-armed");
        btn.textContent = "✓ Progress cleared";
        btn.setAttribute("disabled", "true");
      }
    });
    return btn;
  }

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
  function unregisterKeyHandler(fn) {
    var i = liveKeyHandlers.indexOf(fn);
    if (i !== -1) liveKeyHandlers.splice(i, 1);
    document.removeEventListener("keydown", fn);
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
    if (parts[0] === "resources") return renderResources(root);
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
    nav.appendChild(el("a", { onclick: go("#/resources") }, ["Resources"]));
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

  // Compact schematic of the whole program: Associate is the shared first stop,
  // then the road forks — Developer dead-ends, the Architect road continues to
  // Professional. Clicking a node drives the carousel below. onSelect(index).
  function renderMiniRoadmap(onSelect) {
    var W = 300, H = 168;
    var pts = {
      "associate": { x: 30, y: 84 },
      "developer": { x: 210, y: 42 },
      "architect-foundations": { x: 158, y: 128 },
      "architect-professional": { x: 250, y: 128 }
    };
    var roads = [
      "M30,84 L110,84",                       // Associate → fork
      "M110,84 C150,84 168,42 210,42",        // fork → Developer
      "M210,42 L272,42",                      // Developer → dead-end stub
      "M110,84 C140,84 122,128 158,128",      // fork → Architect-Foundations
      "M158,128 L250,128"                     // Architect-F → Architect-Pro
    ];
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, class: "mm-svg" });
    roads.forEach(function (d) { svg.appendChild(svgEl("path", { d: d, class: "road-bed" })); });
    roads.forEach(function (d) { svg.appendChild(svgEl("path", { d: d, class: "road-dash" })); });

    // dead-end + summit flags
    var flag = svgEl("text", { x: 280, y: 46, class: "mm-flag" }); flag.textContent = "🏁"; svg.appendChild(flag);
    var peak = svgEl("text", { x: 258, y: 132, class: "mm-flag" }); peak.textContent = "🏔"; svg.appendChild(peak);

    var nodeEls = {};
    CERT_ORDER.forEach(function (id, i) {
      var p = pts[id]; if (!p) return;
      var g = svgEl("g", { class: "mm-node", tabindex: "0", role: "button" });
      var title = svgEl("title", {}); title.textContent = CERTS[id].name; g.appendChild(title);
      var c = svgEl("circle", { cx: p.x, cy: p.y, r: 13 });
      c.style.setProperty("--accent", ACCENTS[id]);
      g.appendChild(c);
      var t = svgEl("text", { x: p.x, y: p.y + 4, class: "mm-num" }); t.textContent = String(i + 1);
      g.appendChild(t);
      g.addEventListener("click", function () { onSelect(i); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(i); } });
      svg.appendChild(g);
      nodeEls[i] = g;
    });

    var wrap = el("div", { class: "mini-roadmap" }, [
      el("div", { class: "mm-title" }, ["The path, cert to cert"]),
      svg
    ]);
    return {
      el: wrap,
      setActive: function (i) { Object.keys(nodeEls).forEach(function (k) { nodeEls[k].classList.toggle("active", +k === i); }); }
    };
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
      var domainNum = i + 1;
      var node = el("button", {
        class: "node " + status,
        type: "button",
        style: "left:" + p.x + "px; top:" + p.y + "px;",
        onclick: (function (d, n) { return function (e) { if (e) e.preventDefault(); openDomainZoom(certId, d, n); }; })(dom, domainNum)
      }, [
        el("span", {}, [status === "mastered" ? "✓" : String(domainNum)]),
        el("div", { class: "node-tip" + tipEdgeClass }, [
          el("div", { class: "nt-title" }, [dom.title]),
          el("div", { class: "nt-meta" }, [dom.weight + "% of exam · click to preview"]),
          el("div", { class: "nt-status" }, [statusText])
        ])
      ]);
      track.appendChild(node);
    });

    lane.appendChild(el("div", { class: "lane-scroll" }, [track]));
    return lane;
  }

  // Clicking a domain node on the home road opens a zoom-in preview of that
  // domain: its concepts and a short description, each jumpable. Click the
  // backdrop or press Esc to zoom back out.
  function closeDomainZoom() {
    var existing = document.querySelector(".zoom-overlay");
    if (!existing) return;
    existing.classList.remove("in");
    if (existing._esc) unregisterKeyHandler(existing._esc);
    setTimeout(function () { if (existing.parentNode) existing.parentNode.removeChild(existing); }, 200);
  }

  function openDomainZoom(certId, domain, domainNum) {
    closeDomainZoom();
    var cert = CERTS[certId];
    var accent = ACCENTS[certId];
    var status = domainStatus(certId, domain.id);
    var cp = getCertProgress(certId);
    var quiz = cp.domainQuizBest[domain.id];
    var statusText = status === "mastered" ? "Mastered ✓" : status === "started" ? (quiz ? "Quiz best: " + quiz.pct + "%" : "Lesson started") : "Not started yet";
    var base = "#/track/" + certId + "/domain/" + domain.id;

    var concepts = el("div", { class: "zoom-concepts" });
    (domain.lesson.sections || []).forEach(function (sec, si) {
      concepts.appendChild(el("a", { class: "zoom-concept", onclick: go(base + "/step/" + si) }, [
        el("span", { class: "zc-num" }, [String(si + 1)]),
        el("span", {}, [sec.heading])
      ]));
    });

    var panel = el("div", { class: "zoom-panel", role: "dialog", "aria-modal": "true" });
    panel.style.setProperty("--accent", accent);
    panel.appendChild(el("button", { class: "zoom-close", type: "button", "aria-label": "Close", onclick: closeDomainZoom }, ["✕"]));
    panel.appendChild(el("div", { class: "zoom-head" }, [
      el("div", { class: "zoom-badge" }, [status === "mastered" ? "✓" : String(domainNum)]),
      el("div", {}, [
        el("div", { class: "zoom-meta" }, ["Domain " + domainNum + " of " + cert.domains.length + " · " + domain.weight + "% of exam · " + statusText]),
        el("h3", {}, [domain.title])
      ])
    ]));
    panel.appendChild(el("div", { class: "zoom-desc" }, [domain.summary]));
    panel.appendChild(el("div", { class: "zoom-concepts-label" }, ["What you'll learn — " + (domain.lesson.sections || []).length + " concepts"]));
    panel.appendChild(concepts);
    panel.appendChild(el("div", { class: "zoom-actions" }, [
      el("a", { class: "btn btn-primary btn-sm", onclick: go(base + "/step/0") }, ["Start walkthrough →"]),
      el("a", { class: "btn btn-sm", onclick: go(base + "/quiz") }, ["Domain quiz"]),
      el("a", { class: "btn btn-sm", onclick: go(base) }, ["Full details"])
    ]));

    var overlay = el("div", { class: "zoom-overlay" }, [panel]);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeDomainZoom(); });
    overlay._esc = function (e) { if (e.key === "Escape") closeDomainZoom(); };
    // Registered via the key-handler registry so a route change (e.g. clicking a
    // concept, which navigates rather than calling close) tears the listener down.
    registerKeyHandler(overlay._esc);

    // Append into #app so a route change tears it down with everything else.
    (document.getElementById("app") || document.body).appendChild(overlay);
    // next frame → trigger the zoom-in transition
    requestAnimationFrame(function () { overlay.classList.add("in"); });
  }

  function renderHome(root) {
    renderTopbar(null);
    var shell = el("div", { class: "shell wide" });

    // scrollTo/setActive are used by the mini-roadmap callback (created first),
    // so declare them as hoisted function declarations and fill the refs below.
    var carousel, panels = [], dotEls = [], mini, active = 0;
    function setActive(i) {
      active = Math.max(0, Math.min(CERT_ORDER.length - 1, i));
      dotEls.forEach(function (d, di) { d.classList.toggle("active", di === active); });
      if (mini) mini.setActive(active);
    }
    function scrollToCert(i) {
      i = Math.max(0, Math.min(CERT_ORDER.length - 1, i));
      if (carousel) carousel.scrollTo({ left: i * carousel.clientWidth, behavior: "smooth" });
      setActive(i);
    }

    mini = renderMiniRoadmap(scrollToCert);

    shell.appendChild(el("div", { class: "hero" }, [
      el("div", { class: "hero-row" }, [
        el("div", { class: "hero-main" }, [
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
        ]),
        el("div", { class: "hero-map" }, [mini.el])
      ])
    ]));

    // ---------------------------------------------------- certification carousel
    var map = el("div", { class: "route-map" });

    var prevBtn = el("button", { class: "cc-arrow", type: "button", "aria-label": "Previous certification" }, ["←"]);
    var nextBtn = el("button", { class: "cc-arrow", type: "button", "aria-label": "Next certification" }, ["→"]);
    var dots = el("div", { class: "cc-dots" });
    map.appendChild(el("div", { class: "cc-head" }, [
      el("h2", {}, ["The route"]),
      el("div", { class: "cc-controls" }, [prevBtn, dots, nextBtn])
    ]));

    carousel = el("div", { class: "cert-carousel" });
    CERT_ORDER.forEach(function (id, i) {
      if (!CERTS[id]) return;
      var panel = el("div", { class: "cert-panel" }, [renderLane(id)]);
      carousel.appendChild(panel);
      panels.push(panel);
      var dot = el("button", { class: "cc-dot", type: "button", "aria-label": CERTS[id].code, title: CERTS[id].name });
      dot.style.setProperty("--dot", ACCENTS[id]);
      dot.addEventListener("click", function () { scrollToCert(i); });
      dots.appendChild(dot);
      dotEls.push(dot);
    });
    map.appendChild(carousel);
    shell.appendChild(map);

    prevBtn.addEventListener("click", function () { scrollToCert(active - 1); });
    nextBtn.addEventListener("click", function () { scrollToCert(active + 1); });

    // Keep dots/minimap in sync when the user scroll-swipes the carousel directly.
    var scrollRaf;
    carousel.addEventListener("scroll", function () {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(function () {
        if (!carousel.clientWidth) return;
        var idx = Math.round(carousel.scrollLeft / carousel.clientWidth);
        if (idx !== active) setActive(idx);
      });
    });
    setActive(0);

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
      el("p", {}, ["Progress is stored in your browser's localStorage only — per certification, per domain. Nothing leaves your machine, and you can wipe it here any time."]),
      el("div", { class: "btn-row" }, [resetProgressButton({ onDone: function () { render(); } })])
    ]));
    shell.appendChild(two);

    shell.appendChild(el("div", { class: "footer-note" }, [
      "Registration for the real exams is handled through Anthropic's Partner Academy and delivered via Pearson VUE. This site does not sell, proctor, or issue certifications — it's just a free study companion."
    ]));

    root.appendChild(shell);

    // Only show a lane's right-edge fade when its road actually overflows.
    shell.querySelectorAll(".lane-scroll").forEach(function (scrollEl) {
      if (scrollEl.scrollWidth <= scrollEl.clientWidth + 2) scrollEl.classList.add("fits");
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

    var shell = el("div", { class: "shell reading" });
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

    var shell = el("div", { class: "shell reading" });
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
    var shell = el("div", { class: "shell reading" });
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
    var shell = el("div", { class: "shell reading" });
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
      el("div", { class: "btn-row" }, [resetProgressButton({})]),
      el("h3", {}, ["Open source"]),
      el("p", {}, ["This project is open source. Corrections to the domain content, additional practice questions, and new flashcards are welcome via pull request."])
    ]));
    root.appendChild(shell);
  }

  // ---------------------------------------------------------------------
  // RESOURCES — curated external links (vetted; no exam dumps)
  // ---------------------------------------------------------------------
  // Every doc URL below was checked to resolve (200). Docs live on
  // platform.claude.com; Claude Code docs on code.claude.com.
  var RESOURCES = [
    {
      group: "Official — register, schedule, read the source",
      note: "The authoritative sources. The Exam Guide PDFs (behind the Partner Academy) are the same ones this site's blueprints, weights, and sample questions are drawn from.",
      links: [
        { title: "Claude Partner Network", url: "https://claude.com/partners", for: "Register", desc: "Registration runs through the Partner Academy — needs a Partner Network account with a company-domain email. Where you request access and download the official Exam Guides." },
        { title: "Pearson VUE — Claude Certification Program", url: "https://www.pearsonvue.com/us/en/anthropic.html", for: "Schedule", desc: "Schedule and sit the exam here — online-proctored or at a test center. Handles rescheduling, accommodations, and results." },
        { title: "Claude documentation", url: "https://docs.claude.com/", for: "All tracks", desc: "The docs home. When a practice question here and the docs ever disagree, the docs win." }
      ]
    },
    {
      group: "Claude API & core building blocks",
      note: "The mechanics behind the Developer and Architect exams.",
      links: [
        { title: "Messages API reference", url: "https://platform.claude.com/docs/en/api/messages", for: "Developer", desc: "Request/response shape, roles, and the stop_reason field the agentic loop hinges on." },
        { title: "Tool use — overview", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview", for: "Developer · Architect", desc: "Defining tools, tool_choice, and how function calling actually works." },
        { title: "Handling tool calls", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls", for: "Developer · Architect", desc: "The execute-and-feed-results loop, plus client- vs. server-side tools." },
        { title: "Streaming", url: "https://platform.claude.com/docs/en/build-with-claude/streaming", for: "Developer", desc: "Server-sent events and incremental responses." },
        { title: "Extended thinking", url: "https://platform.claude.com/docs/en/build-with-claude/extended-thinking", for: "Developer · Architect", desc: "How thinking/effort levels change model behavior and cost." },
        { title: "Prompt caching", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching", for: "Developer · Architect", desc: "Cache a stable prefix to cut latency and cost — the recurring cost-optimization answer." },
        { title: "Message Batches API", url: "https://platform.claude.com/docs/en/build-with-claude/batch-processing", for: "Developer · Architect", desc: "Async, high-volume, ~50% cheaper, 24-hour window — batch-vs-realtime tradeoffs." },
        { title: "Structured outputs", url: "https://platform.claude.com/docs/en/build-with-claude/structured-outputs", for: "Developer · Architect", desc: "Getting reliable JSON out, and validating it." },
        { title: "Context windows", url: "https://platform.claude.com/docs/en/build-with-claude/context-windows", for: "All tracks", desc: "What fits, how it fills, and why position matters." },
        { title: "Context editing", url: "https://platform.claude.com/docs/en/build-with-claude/context-editing", for: "Architect", desc: "Pruning and compaction to keep long-running agents reliable." }
      ]
    },
    {
      group: "Models, prompting & context",
      note: "Shared across all four exams.",
      links: [
        { title: "Models overview", url: "https://platform.claude.com/docs/en/about-claude/models/overview", for: "All tracks", desc: "The current Haiku / Sonnet / Opus lineup and what each is for." },
        { title: "Choosing a model", url: "https://platform.claude.com/docs/en/about-claude/models/choosing-a-model", for: "All tracks", desc: "The cost / speed / capability tradeoff, made concrete." },
        { title: "Pricing", url: "https://platform.claude.com/docs/en/about-claude/pricing", for: "Developer · Architect", desc: "Per-token pricing and caching/batch discounts for cost questions." },
        { title: "Prompt engineering — overview", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview", for: "All tracks", desc: "The starting point: what to reach for, in what order." },
        { title: "Prompting best practices", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices", for: "All tracks", desc: "XML tags, chain-of-thought, few-shot examples, system prompts — the whole toolkit on one page." }
      ]
    },
    {
      group: "Agents, MCP & Claude Code",
      note: "The heart of the Architect exam and much of Developer.",
      links: [
        { title: "Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents", for: "Architect", desc: "Anthropic's engineering essay on workflow-vs-agent patterns — genuinely worth reading in full." },
        { title: "Model Context Protocol", url: "https://modelcontextprotocol.io/", for: "Developer · Architect", desc: "The open MCP spec: servers, tools, resources, and transports." },
        { title: "Claude Agent SDK — overview", url: "https://code.claude.com/docs/en/agent-sdk/overview", for: "Architect", desc: "Custom agent loops, subagents, and lifecycle hooks." },
        { title: "Claude Code — overview", url: "https://code.claude.com/docs/en/overview", for: "Developer · Architect", desc: "The CLI/agent surface Claude Code domains are built on." },
        { title: "Claude Code — memory (CLAUDE.md)", url: "https://code.claude.com/docs/en/memory", for: "Architect", desc: "The CLAUDE.md hierarchy, imports, and scope — heavily tested." },
        { title: "Claude Code — settings", url: "https://code.claude.com/docs/en/settings", for: "Developer · Architect", desc: "settings.json, permissions, and configuration precedence." },
        { title: "Claude Code — hooks", url: "https://code.claude.com/docs/en/hooks", for: "Architect", desc: "Deterministic enforcement via PreToolUse/PostToolUse — hooks vs. prompt guidance." },
        { title: "Claude Code — subagents", url: "https://code.claude.com/docs/en/sub-agents", for: "Architect", desc: "Defining and delegating to subagents with isolated context." },
        { title: "Claude Code — slash commands", url: "https://code.claude.com/docs/en/slash-commands", for: "Developer · Architect", desc: "Built-in and custom commands, including /compact and /memory." },
        { title: "Agent Skills — overview", url: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview", for: "Developer · Architect", desc: "What Skills are and when to reach for them over tools or MCP." },
        { title: "MCP in Claude Code", url: "https://code.claude.com/docs/en/mcp", for: "Architect", desc: "Project- vs. user-scoped .mcp.json and connecting MCP servers." },
        { title: "Testing & evaluation", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests", for: "Architect", desc: "Building evals and success criteria for production systems." }
      ]
    },
    {
      group: "For the Associate track (claude.ai)",
      note: "The Associate exam is about using Claude as a product — no code. These are the official help-center pages.",
      links: [
        { title: "Claude features (help center)", url: "https://support.claude.com/en/collections/4078531-claude-features", for: "Associate", desc: "The hub for Projects, Artifacts, memory, connectors, and more." },
        { title: "What are Projects?", url: "https://support.claude.com/en/articles/9517075-what-are-projects", for: "Associate", desc: "Persistent instructions + knowledge sources — the core Associate workflow." },
        { title: "What are Artifacts?", url: "https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them", for: "Associate", desc: "When and how to use the artifact output format." }
      ]
    },
    {
      group: "Community study resources",
      note: "Independent, free, and (in our judgment) high-quality — linked because they're useful, not as endorsements. Always cross-check against the official Exam Guide.",
      links: [
        { title: "paullarionov/claude-certified-architect", url: "https://github.com/paullarionov/claude-certified-architect", for: "Architect", desc: "A thorough written study guide for Architect – Foundations, plus PDF/EPUB, Anki decks, and 14 translations." },
        { title: "claude-guides.com", url: "https://claude-guides.com/", for: "Developer · Architect", desc: "A free Claude Code reference: shortcuts, slash commands, MCP config, and workflow tips." }
      ]
    }
  ];

  function hostOf(url) {
    try { return new URL(url).host.replace(/^www\./, ""); } catch (e) { return url; }
  }

  function renderResources(root) {
    renderTopbar(null);
    var shell = el("div", { class: "shell reading" });
    shell.appendChild(el("div", { class: "crumbs" }, [el("a", { onclick: go("#/") }, ["Home"]), el("span", { class: "sep" }, ["/"]), "Resources"]));
    shell.appendChild(el("h1", {}, ["Resources & references"]));
    shell.appendChild(el("p", { class: "lede" }, ["Where to register and sit the real exam, the official docs the material is built on, and a few outside study resources worth your time."]));

    RESOURCES.forEach(function (section) {
      shell.appendChild(el("h2", {}, [section.group]));
      if (section.note) shell.appendChild(el("p", {}, [section.note]));
      var list = el("div", { class: "resource-list" });
      section.links.forEach(function (r) {
        list.appendChild(el("a", { class: "resource", href: r.url, target: "_blank", rel: "noopener noreferrer" }, [
          el("div", { class: "res-head" }, [
            el("div", { class: "res-title-wrap" }, [
              el("span", { class: "res-title" }, [r.title]),
              r["for"] ? el("span", { class: "res-for" }, [r["for"]]) : null
            ]),
            el("span", { class: "res-host" }, [hostOf(r.url), " ↗"])
          ]),
          el("div", { class: "res-desc" }, [r.desc])
        ]));
      });
      shell.appendChild(list);
    });

    shell.appendChild(el("div", { class: "callout warn" }, [
      el("span", { class: "callout-label" }, ["A note on what's not here"]),
      "We deliberately don't link sites advertising real or leaked exam questions (\"braindumps\"). Reproducing live exam items violates the confidentiality agreement every candidate accepts, and studying from them is a fast way to get a credential revoked. Everything above is original study material or an official source."
    ]));

    shell.appendChild(el("div", { class: "footer-note" }, [
      "Know a genuinely useful, free resource that isn't a braindump? Open a pull request adding it to the list."
    ]));

    root.appendChild(shell);
  }

  // ---------------------------------------------------------------------
  render();
})();
