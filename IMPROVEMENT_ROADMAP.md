# Tonearm Music Player — Improvement Roadmap

**Version:** 0.1 proposal · **Date:** 15 October 2026  
**Status:** Updated 15 October 2026. Documentation review is complete; the catalog/asset gate, song-row keyboard improvement, and dependency-free app playback recorder have been implemented. Remaining roadmap items are proposals and require verification/owner decisions where noted. There are no schedule estimates because team capacity and release dates were not provided.

## Roadmap goals

- Protect existing playback, playlist, navigation, and visual behavior with executable checks.
- Keep `Songs/` and the generated manifest aligned at every release.
- Make local-vs-session persistence understandable and recoverable.
- Improve accessibility and responsive behavior without changing Tonearm’s identity.
- Avoid a backend unless the owner confirms automatic cross-device synchronization is needed.

## Phase plan

| Phase | Work | Backlog | Dependencies | Risk / mitigation | Exit criteria / outcome |
| --- | --- | --- | --- | --- | --- |
| 1. Study and document | Record source facts, limits, routes, storage, existing tests, assumptions; review SRS with owner. | Documentation set | Owner review | Mistaking a recommendation for an approved feature; mark every new requirement Proposed. | Study package prepared; owner still confirms scope, storage meaning, supported browsers, playlist edge rules. |
| 2. Baseline verification | Catalog/artwork verifier and GitHub Action added; still perform live/deployed UI smoke and record browser/network/console and per-codec results. | BL-01, BL-02, BL-13 | Working test environment and target browser list | Avoid modifying the only song library; use disposable fixtures. | CI check passes and deployed test evidence is recorded; no release claim based on static check alone. |
| 3. Playback and data reliability | A same-origin interactive recorder now observes real app selection, player controls, UI/media state, and browser errors. Use it; later decide if an unattended browser runner is justified for switch races, errors, playlists, and full-catalog regression. | BL-02, BL-03, BL-05, BL-12 | Phase 2 baseline; agree supported browsers and end-of-queue/session semantics before choosing an automation runner. | Recorder is user-driven; it cannot prove an action that was not performed or certify other browsers. | Record actual control results; add automated coverage only with an agreed browser matrix and reproducible runner. |
| 4. Accessibility and responsive quality | Fix verified keyboard focus/action mismatches, range labels, dialog focus, contrast, reduced motion, mobile spacing/targets. | BL-09, BL-10, BL-14 | Agreed viewport/assistive technology matrix; Phase 3 tests | Broad redesign can regress familiar flows; make small changes and compare screenshots. | Agreed accessibility checks and viewport matrix pass. |
| 5. Discovery and artwork refinement | Decide metadata/tag model for moods, search normalization, and asset performance; implement only evidence-backed improvements. | BL-06, BL-07, BL-08, BL-11 | Owner-approved classification rules; performance baseline | Incorrect auto-categorization or changed art; keep fixed artwork mappings and use reviewed tags. | Search/mood behavior passes fixtures; artwork unchanged in appearance; measurable asset result. |
| 6. Release preparation | Verify clean root deployment, deep-link refresh, all paths, all catalog files, privacy/network, and changelog. | BL-01, BL-13, BL-16 | Phases 3–5; deployment access | Local pass may not match host; validate deployed URL separately. | Release evidence record shows every required case Pass or approved exception. |
| 7. Future scale decision | Revisit modularization and possible remote playlist sync only after usage/requirements justify it. | BL-15; future scope | Maintenance evidence; owner decision on cross-device need | Backend raises security/privacy/operating burden. | Written decision: remain static or approve a separate service design. |

## Priority groupings

### Critical fixes / release gates

- Catalog parity and deployment gate (BL-01).
- Actual application playback and error/race regression suite (BL-02, BL-03).
- Proven deployment and path check (BL-13).

### Core usability and data confidence

- Storage scope and backup clarity (BL-04, BL-12).
- Protected permanent playlist regression (BL-05).
- Keyboard and assistive-technology parity (BL-10, BL-14).
- Responsive review (BL-09).

### Design and discovery improvements

- Search normalization/filters only after defining actual user needs (BL-06).
- Reviewed mood tags and curated classification (BL-07).
- Measured artwork optimization (BL-08, BL-11).

### Optional / long-term

- Incremental extraction from `index.html` when tests justify it (BL-15).
- Automatic cross-device sync only after explicit product approval and a separate privacy/security architecture.
- Lightweight YouTube link regression (BL-16).

## Phase 1 documentation checklist

- [x] Existing source and folder structure documented.
- [x] Facts separated from assumptions and unknowns.
- [x] Preliminary SRS and UI/UX specification prepared.
- [x] Backlog and test plan created.
- [x] System design and traceability artifacts added from the expanded brief.
- [ ] Owner review of proposed requirements and unresolved product decisions.
- [x] First reliability and keyboard-access improvements implemented after the user requested implementation.
