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

Each module now contains:

1. concept overview
2. why the technique works
3. derivation steps
4. invariant / mental model
5. reusable C++ or pseudocode template
6. common failure modes
7. inline AlgoVista visualization when a semantically correct lesson exists
8. original AP325 practice problems
9. progressive three-level hints
10. quick-check quiz
11. module mastery and XP
12. previous / next navigation

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

The AP325 audit checks JavaScript syntax, module/problem counts, lesson coverage, Boss references, problem-to-module links, and all AlgoVista visualization IDs.

See [AP325_ANIMATION_AUDIT.md](./AP325_ANIMATION_AUDIT.md) for the semantic animation audit.

## Design rule

AP325 remains the curriculum source of truth. The project changes the self-learning experience, not the original teaching intent.
