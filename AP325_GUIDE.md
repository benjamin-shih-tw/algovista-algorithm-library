# AP325 Guide

AP325 Guide is integrated into AlgoVista as a dedicated self-learning path that keeps the AP325 chapter/problem order while adding a modern learning layer.

## Live

- AP325 Guide: https://benjamin-shih-tw.github.io/algovista-algorithm-library/ap325/
- AlgoVista: https://benjamin-shih-tw.github.io/algovista-algorithm-library/
- AP325 v1.3 PDF: https://jmj.cmgsh.tp.edu.tw/files/AP325_v1.3.pdf
- TCIRC AP325 Judge: https://judge.tcirc.tw/problems/?category=3

## Curriculum coverage

- 38 AP325 modules
- 122 original P/Q problems
- World 0–8 roadmap
- original P / Q / @@ / * semantics preserved
- Focus / Practice / Challenge / Beyond-APCS labels
- chapter/world Boss problems

## Learning flow

This is no longer a chapter-summary UI. Every World 0–8 module has a full Guide article.

Each module now contains:

1. a Focus Problem to think about before reading
2. a full tutorial article split into named sections
3. derivation / proof / invariant explanations
4. worked examples with step-by-step traces
5. reusable C++17 implementations and implementation notes
6. warning / tip callouts for common traps
7. a sticky in-page table of contents
8. inline AlgoVista visualization when a semantically correct lesson exists
9. a curated AP325 Practice Ladder (Focus → Core → Challenge → Beyond)
10. mastery questions with expandable answers
11. original AP325 P/Q problems and progressive hints
12. quick-check quiz, XP, review, and previous / next navigation

The full articles are stored by AP325 World in `public/ap325/guides/world0.js` through `world8.js`.

## Progress system

- XP
- streak
- module mastery
- solved-problem tracking
- visualization exploration tracking
- quiz completion
- problem filters by chapter, difficulty, status, and search
- 7-day spaced review
- weakest-module review list
- localStorage persistence

## Quality gates

Every GitHub Pages deployment runs:

```bash
npm run audit:ap325
npm run build
```

The AP325 audit checks JavaScript syntax, module/problem counts, full Guide coverage and article depth for all 38 modules, Boss references, problem-to-module links, and all AlgoVista visualization IDs.

See [AP325_ANIMATION_AUDIT.md](./AP325_ANIMATION_AUDIT.md) for the semantic animation audit.

## Design rule

AP325 remains the curriculum source of truth. The project changes the self-learning experience, not the original teaching intent.
