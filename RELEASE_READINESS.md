# Release Readiness

AlgoVista is at a publishable release baseline.

## Verified release state

Verified against main commit `cbbf0d059ba0e8afa43f652bcd3aaf9330883579`.

- GitHub Pages build: **success**
- GitHub Pages deploy: **success**
- Catalog lessons: **202**
- Execution-driven lessons: **202 / 202**
- Semantic-only lessons: **0**
- Teaching-template audit: **202 / 202 ready**
- Deep renderer scan: **0 critical crashes, 0 renderer bugs**
- Knowledge graph audit: **pass**
- AP325 guide audit: **pass**
- Animation structural audit: **pass**
- Primary animation ↔ code synchronization gate: **pass**
- Full-catalog execution gate: **pass**

## Animation remediation result

The old generated timeline system is no longer used.

Every lesson now uses authored execution state. Advanced lessons that cannot be explained by the generic renderer use typed rich execution views for:

- residual / matching networks,
- matrices,
- advanced tree and pointer structures,
- geometry / spatial algorithms,
- algorithm tables and event logs.

CI blocks deployment if any catalog lesson falls back to semantic-only mode.

## Performance baseline

The original release bundled the application into one JavaScript chunk of roughly:

- **1,151 kB minified**
- **398 kB gzip**

The current release splits the application into lazy / cacheable chunks. Representative production output:

| Chunk | Minified | Gzip |
|---|---:|---:|
| Main entry | 17.37 kB | 6.44 kB |
| LessonPlayer | 79.96 kB | 24.82 kB |
| React vendor | 192.35 kB | 60.29 kB |
| Motion vendor | 126.68 kB | 41.65 kB |
| Icons vendor | 5.23 kB | 2.22 kB |
| Other vendor | 27.51 kB | 8.68 kB |

The previous >500 kB single-chunk warning is no longer present.

## Navigation

Main lesson navigation and AP325 navigation both preserve browser history and restore state on Back / Forward.

Direct lesson navigation remains URL-addressable.

## C++ teaching snippets

C++ coverage is intentionally **not** a release blocker.

Latest isolated C++17 coverage audit:

- standalone syntax-verified: **53 / 202**
- teaching snippets requiring external problem context / helper APIs: **149**

The UI and documentation label these as teaching snippets rather than promising that every displayed fragment is a complete judge-ready program.

Stage 9 may continue improving standalone compilation where the missing environment can be inferred safely. It must **not** invent fake APIs or clutter lessons merely to force 202 / 202 compilation.

## Release gates

The Pages workflow currently blocks deployment on:

1. catalog integrity,
2. teaching-template integrity,
3. knowledge graph integrity,
4. deep renderer safety,
5. AP325 integrity,
6. animation structure,
7. representative semantic probes,
8. animation ↔ primary-code synchronization,
9. 202 / 202 execution coverage,
10. production build success.

C++ standalone compilation coverage runs in a separate report-only workflow.

## Release policy

A future change is release-safe only if the Pages workflow is fully green.

C++ coverage improvements are accepted only when they also keep the full Pages release workflow green.
