# Claude Certification Study Path

An interactive, local-first study companion for Anthropic's four **Claude Certification** exams. No build step, no account, no server — clone it and open `index.html`.

**⚠️ Unofficial.** This project is not produced, reviewed, or endorsed by Anthropic. See [Sources & disclaimer](#sources--disclaimer) below.

![Screenshot of the four certification tracks on the home page](docs/screenshot-home.png)

## What's inside

For each of the four certifications, the app walks the exact domain blueprint Anthropic publishes in its Exam Guides:

| Track | Code | Cost | Questions | Domains |
|---|---|---|---|---|
| Claude Certified Associate – Foundations | CCAO-F | $99 | 60 | 7 |
| Claude Certified Developer – Foundations | CCDV-F | $125 | 53 | 8 |
| Claude Certified Architect – Foundations | CCAR-F | $125 | 60 | 5 |
| Claude Certified Architect – Professional | CCAR-P | $175 | 63 | 7 |

For every domain you get:

- **A lesson** — concise, practical coverage of the domain's objectives, with worked examples and a couple of embedded checkpoint questions with instant feedback.
- **A domain quiz** — a bank of scenario-style practice questions in the same format as the real exam (single-select and multi-select, "select N" items).
- **A full practice exam per track** — every domain's question bank shuffled together, with a domain-by-domain score breakdown at the end.
- **Flashcards** — flip cards per domain covering terms, mechanisms, and anti-patterns from the blueprint, with a "know it / still learning" flow so mastered cards drop out of rotation.

Progress (lessons read, best quiz scores, flashcard mastery) is saved to your browser's `localStorage`, scoped per track and per domain. Nothing is sent anywhere — there's no backend at all.

## Running it locally

No dependencies, no build. Either:

```bash
# open the file directly
open index.html

# or serve it (needed if your browser restricts localStorage/fetch under file://)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
index.html              shell page — loads data + app.js
css/style.css            design system + layout (light/dark, theme-aware)
js/app.js                hash router, lesson/quiz/flashcard rendering, localStorage progress
js/data/associate.js               content for Claude Certified Associate – Foundations
js/data/developer.js               content for Claude Certified Developer – Foundations
js/data/architect-foundations.js   content for Claude Certified Architect – Foundations
js/data/architect-professional.js  content for Claude Certified Architect – Professional
```

Each `js/data/*.js` file registers itself into a shared `window.CERT_DATA` object — that's the entire "database." Adding or correcting content means editing plain JS/HTML in one of those files; nothing else needs to change.

## Sources & disclaimer

Domain blueprints, weightings, task statements, and exam mechanics (format, cost, passing score, retake policy) are sourced from **Anthropic's official Exam Guide PDFs (Version 1.0, effective July 2026)** for each of the four certifications, published via the Anthropic Partner Academy, plus Pearson VUE's public program page.

All lesson content, practice questions, and flashcards in this repository are **original** — written to teach the published blueprint objectives, not drawn from or reproducing any live exam item bank. (Doing so would violate the confidentiality agreement every candidate accepts before sitting the real exam.) A small number of quiz items are tagged `source: "official"` in the data files — these are the illustrative sample questions Anthropic itself publishes in each Exam Guide for candidate preparation, reproduced with their published answer and rationale.

This project does not register candidates, proctor exams, or issue credentials. To sit a real exam, go through the Anthropic Partner Academy and schedule via Pearson VUE.

If you're studying for the real thing and notice something here that's outdated or wrong relative to the current official Exam Guide, please open an issue or PR — Anthropic updates these blueprints over time and this content should track them.

## Contributing

PRs welcome — corrections to existing content, new practice questions, additional flashcards, or accessibility/UX improvements. Keep new data changes inside `js/data/*.js` following the existing schema (read an existing file for the shape), and validate with `node --check js/data/<file>.js` before submitting.

## License

MIT — see [LICENSE](LICENSE).
