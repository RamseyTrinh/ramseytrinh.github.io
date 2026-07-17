# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal technical documentation site built with [MkDocs](https://www.mkdocs.org/) + the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme. Content is Markdown under `docs/`; there is no application code. Published to GitHub Pages at https://ramseytrinh.github.io.

## Commands

```bash
# One-time setup (Windows paths shown in README; on Linux/macOS use venv/bin/activate)
python -m venv venv
source venv/bin/activate          # or: venv/Scripts/Activate on Windows
pip install mkdocs-material       # the only dependency; pulls in mkdocs itself

mkdocs serve                      # live-reloading preview at http://127.0.0.1:8000
mkdocs build                      # render static site into ./site (gitignored)
mkdocs gh-deploy --force          # build + push to the gh-pages branch (CI runs this)
```

There are no tests, linters, or a build step beyond `mkdocs build`.

## Architecture / how it fits together

- **`mkdocs.yml`** — single source of config: theme, palette (light/dark toggle), fonts, social links, and enabled `markdown_extensions`. There is **no `nav:` key**, so the sidebar navigation is auto-generated from the files in `docs/` (filename/heading order). To control ordering or titles, add an explicit `nav:` section here.
- **`docs/`** — every page. `docs/index.md` is the homepage; `docs/assets/` holds static files like the favicon referenced from `mkdocs.yml`.
- **`.github/workflows/ci.yml`** — on push to `main` or `master`, installs `mkdocs-material` and runs `mkdocs gh-deploy --force`, which builds and publishes to GitHub Pages. Deployment is fully automatic on merge; no manual step needed.

## Authoring notes

The following `pymdownx` / Material extensions are enabled and available in any page — use them rather than raw HTML where possible:

- `pymdownx.superfences` with a **mermaid** custom fence — write diagrams in ```` ```mermaid ```` blocks.
- `pymdownx.tabbed` (`alternate_style: true`) — content tabs via `=== "Tab name"`.
- `pymdownx.details` — collapsible `???`/`!!!` admonitions.
- `pymdownx.highlight` + `inlinehilite` — code highlighting with line anchors.
- `pymdownx.emoji` (twemoji) and `attr_list` — `:emoji:` shortcodes and `{ .class }` attributes.
