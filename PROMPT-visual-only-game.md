# Rebuild Size It Up as a pure eye-measurement game

## Product decisions (locked — do not reopen)

These decisions were made by the product owner. Treat them as law.

1. **During play: zero measurement UI.** No metres, centimetres, kilometres, unit symbols, numeric estimates, numeric reference sizes, axis names, ruler ticks, or dimension labels on objects.
2. **After lock: numbers are the reward.** Reveal actual size in metres, reference size in metres, relative error, and score. This is the learning moment. Do not hide numbers after commitment.
3. **The skill is memory + eye.** The player recognises both objects from real life and resizes the mystery silhouette until its *relative* size looks right next to the reference. The game never tells them the reference’s size. The rendered reference is the only scale they get.
4. **During play, each object shows:** its name + a **unitless visual bracket** marking the compared span. Never the words length / height / wingspan / width / diameter.
5. **Internal centimetres stay.** `cm` on every object is hidden source of truth for scale, scoring, and reveal. Do not delete the measurement system. Do not show it while guessing.

If a later choice conflicts with these five, these five win.

---

## 0. Your role

You are a senior product engineer and game UX designer with full repository access.

This is **not** a polish pass. This is a **core-loop redesign**.

Success is a player who never looks for a number, never does arithmetic, and still produces a fair guess because:

- they know roughly how big a horse is relative to a lion;
- both silhouettes are drawn on **one truthful scale**;
- the larger real object **always looks larger** on the compared span.

Read the code first. Map data → challenge → display → UI. Implement the smallest coherent redesign that satisfies every acceptance criterion. Do not stop at a mockup.

---

## 1. What this game is (and is not)

**It is:** a visual judgment game. Two named silhouettes, same pixels-per-centimetre, same ground line. The player drags the mystery object until it *feels* right.

**It is not:** a ruler app, a conversion quiz, or a “read the metres and type them back” puzzle.

The current build accidentally tests **label-reading**. That is the bug.

The finished build must feel like:

> “I know the albatross is bigger. I can *see* it. I don’t need a number.”
>
> After lock: “3.50 m vs 3.20 m. My eye was right.”

That sentence is the product.

---

## 2. Product context

- Game: **Size It Up / Scale Clash** — browser game comparing real sizes of animals, landmarks, vehicles, buildings, everyday objects.
- Stack: **React + TypeScript + Vite + Tailwind**. Local SVG silhouettes. Solo + online multiplayer.
- Every object has: `axis` (`height` | `length` | `wingspan` | `width` | `diameter`), real-world `cm`, SVG art, `aspect` / sometimes `aspectOverride`, English and Arabic names.
- Each round: **reference** (visual anchor) + **target** (mystery, resizable). Same axis. Player locks a guess. Score = relative error on hidden `cm`.

Keep scoring, categories, curated duels, and online flow unless a change is required for fairness.

---

## 3. The problem (why the current loop is wrong)

### 3.1 The UI teaches arithmetic, not sight

Today the play surface shows:

- the reference’s real size in metres (`GameStage` captions + `DimensionGuide` labels);
- the live estimate in metres with decimals (`AnswerCard`);
- the measurement axis in words (“Measuring wingspan”);
- numeric labels on dimension guides.

A player can ignore the picture and still score well. That is a failed game.

**Remove every unit display from objects and HUD during guessing.** Names stay. Brackets stay. Numbers wait until lock.

### 3.2 The picture is not always truthful

Hiding labels is useless if the silhouettes lie.

Current geometry failures:

- Silhouettes are fitted using SVG pose/aspect.
- Stage fit uses **only the reference** (`REFERENCE_MAX_WIDTH_RATIO = 0.36`, `REFERENCE_MAX_HEIGHT_RATIO = 0.5` in `GameStage.tsx`).
- The target overflows and is clipped (`overflow-hidden`).
- The measured bracket spans the full SVG box, including tails/appendages that are **not** in `cm`.
- Global clamps (`WINGSPAN_ASPECT = 2.8`, `MIN_LENGTH_ASPECT = 1.35`) distort real body depth.

Result: a smaller real animal can look bigger. A much larger target can be cut off. The eye is given false evidence.

**No-numbers and truthful-scale are one rule.** You cannot ship one without the other.

### 3.3 Proof cases (must become impossible)

| Pair | Truth | Current failure | Required |
|---|---|---|---|
| Wandering Albatross **350 cm** wingspan vs Andean Condor **320 cm** | Albatross larger | Condor’s raised-wing pose is tall; albatross pose is wide; smaller condor can appear larger | Albatross measured span **must** be wider, regardless of SVG pose |
| Horse **240 cm** length vs Lion **200 cm** | Horse longer | Tail / square art / aspect can equalise them | Horse **must** render longer; bracket stops at tail base if length excludes tail |
| Quetzalcoatlus **1100 cm** vs Albatross **350 cm** | ~3.14× | Stage fits only the reference; target clips | Both fully visible at default zoom; quetzalcoatlus ~3.14× wider |

If any of these fail after your change, the redesign has failed.

---

## 4. Desired play loop

### Round start (guessing phase)

- Reference left (or first), mystery right (or second).
- **One** `pxPerCm` for the round. Both objects use it.
- Both fully visible. Shared ground line. No clipping at default zoom.
- Labels: names only.
  - “Reference — Wandering Albatross”
  - “Mystery — Andean Condor”
- Unitless bracket/arrow on **each** object, same visual language:
  - horizontal for `length`, `wingspan`, `width`;
  - vertical for `height`;
  - square/circle for `diameter`.
- Compact hint: “Drag until it feels right.” (Arabic: equivalent tone, not a literal calque.)
- HUD may show category, round, score, zoom %, timer. Never a length.

### Dragging

- Keep drag-to-move and drag-the-edge-to-resize.
- Bracket follows the silhouette.
- Resize handle always reachable; auto-fit / zoom-out if the guess grows past the view. Never hide overflow with `overflow-hidden`.
- Keyboard arrows resize. Screen reader says “larger / smaller” or a percentage — **never centimetres**.

### Lock (reveal)

- Mystery animates to actual size at the **same** `pxPerCm`.
- Ghost outline of the true silhouette over the player’s guess.
- Reveal card (reserved layout, not overlapping art):
  - actual size in metres;
  - reference size in metres;
  - relative error / accuracy;
  - score.
- Stage brackets may stay unitless. Numbers live in the reveal card.

### Results / online

- Results may show metres.
- Online: same no-number rule until the round is locked/revealed. Fit reference + actual target + all guesses. Keep scoring and room flow.

---

## 5. Non-negotiable rules

### R1 — No numbers in the guessing phase

**Forbidden while unlocked:**

- m, cm, mm, km, or any unit symbol;
- reference numeric size;
- player numeric estimate;
- axis names in UI copy;
- numeric ruler / guide labels;
- tooltips, captions, or ARIA that reveal a measurement.

**Allowed while unlocked:**

- object names;
- round, score, zoom %, timer, progress;
- unitless brackets;
- unitless hints (“Drag until it feels right.”).

Metres appear **only after lock**.

### R2 — One truthful scale per round

```
measuredPx = realCm × pxPerCm
```

If A.cm > B.cm on the shared axis, A’s measured pixel span **must** be larger than B’s. No pose exceptions. No rounding that reverses order.

### R3 — Same-axis only

Never compare length to height to wingspan. Axis is an internal contract. The player sees only the bracket. If a target has no valid same-axis reference, skip it. Do not invent a cross-axis fallback.

### R4 — Normalise the pose, not the measurement

SVG pose must never set the measured span.

Display proportions (measured region, not necessarily full SVG bbox):

- `height`: `heightPx = cm × scale`; width from published body width/height, capped so upright objects are not wider than tall.
- `length`: `widthPx = cm × scale`; height from published length/depth.
- `wingspan`: `widthPx = cm × scale`; height from published wingspan/depth. **Ignore SVG aspect for wingspan.**
- `diameter`: square.

Ratios come from **published real-world proportions**, stored as `aspectOverride` (or `displayAspect`) with:

- `aspectSource: 'published'`
- short `aspectNote`

Do not use a global `1.35` length clamp as a substitute; it fattens whale shark / orca into squares.

If stretching a pose looks broken, add a **canonical silhouette**:

- side view, fully horizontal → `length`;
- upright, feet on ground → `height`;
- wings tip-to-tip → `wingspan`.

Do not keep a lying pose and call it realistic.

### R5 — Fit the pair, not just the reference

At default zoom, fit **both** the reference **and** the target’s actual size in a safe stage (HUD, captions, brackets, ground line). Extreme ratios (3.14×) shrink **both** objects. After lock, animate at that fitted scale.

Principle:

```ts
const scale = Math.min(
  safeWidth / Math.max(referenceDims.widthCm, targetActualDims.widthCm),
  safeHeight / Math.max(referenceDims.heightCm, targetActualDims.heightCm),
);
```

If the player’s guess exceeds the view, auto-fit. Do not clip.

### R6 — No visual reversal from the unmeasured side

Audit at least: whale shark, orca, blue whale, saltwater crocodile, moose, reticulated python, ring-tailed lemur, giant anteater, camel, elephant, tiger, cheetah, aardvark, walrus, bottlenose dolphin, capybara, red wolf, turtle.

**Coiled animals:** a snake’s `length` is along the body, not the bbox. Use a fully extended silhouette or exclude from length rounds. Do not fake length with a coil box.

### R7 — Bracket marks the measured span, not the whole art

- Head-body length: bracket stops at **tail base**. Tail may extend past the bracket.
- Height: bracket stops at the measured top (head), not excluded ears/horns/hair.
- Wingspan: tip to tip.
- Scale maps **measured span** to `cm × pxPerCm`, not the full SVG box.

Suggested:

```ts
measureStart?: number; // 0..1 along measured axis
measureEnd?: number;
```

Default `0..1` only when nothing is excluded. Optionally de-emphasise excluded tails (opacity / hatch).

### R8 — Composition and RTL

- No overlapping answer card, captions, brackets, zoom, silhouettes.
- Compact unitless chip during play; reveal card in a reserved band (below, side rail, or top).
- Captions inside the stage; names may truncate; **no values** during play.
- Stage geometry may stay `dir="ltr"`; all copy follows app language. Arabic RTL must be complete.
- Desktop and mobile: no horizontal scroll, no clipped text, no overlapping labels.

---

## 6. Code map (search beyond this list)

| Area | File | Change |
|---|---|---|
| Stage / fit | `src/components/GameStage.tsx` | Pair fit, not reference-only. Strip `formatLength` from play captions and guides. |
| Answer card | `src/components/AnswerCard.tsx` | No estimate metres, no “Measuring {axis}” before lock. Unitless chip. Reveal card after lock. |
| Dimension guide | `src/components/DimensionGuide.tsx` | Unitless bracket only during play. |
| Geometry | `src/lib/geometry.ts` | Drop global pose patches as truth; measured span = `cm`; published display aspects. |
| Objects | `src/data/objects/*.ts` | Keep `cm`. Add published display aspects and measure spans. |
| Pairing | `src/lib/challenges.ts`, `src/data/duels.ts` | Keep same-axis + curated duels. Keep horse–lion and albatross–condor. |
| Solo | `src/components/PlayScreen.tsx` | Names + lock/next. No measurement copy. |
| Online play | `src/components/online/PlayView.tsx` | No reference size, no numeric estimate before lock. |
| Online reveal | `src/components/online/RevealStage.tsx` | Same visual rules; numbers only on reveal. |
| Results | `src/components/ResultsView.tsx` | Metres OK after lock. |
| i18n | `src/i18n/translations.ts` | Replace “Start measuring”, “Measuring {axis}”, “Your answer 3.50 m”, “Ruler” on the play surface. |
| Landing | How-to, hero, ruler motif | Promise is **“No numbers. Just your eye.”** A ruler as texture is OK; as mechanic copy it is not. |

Grep the whole repo for `formatLength`, axis labels, unit strings, and ruler copy. Do not assume this table is complete.

---

## 7. Copy direction

| Current | New |
|---|---|
| Start measuring | Trust your eye / Start guessing |
| Measuring {axis} | removed (bracket only) |
| Your answer 3.50 m | Your guess (no value) while unlocked |
| Drag until it matches the blue reference | Drag until it feels right |
| Ruler / numeric ticks | gone from play |
| Actual size | keep, **after lock only** |

Arabic must match tone. Keep bilingual structure. Test RTL.

---

## 8. Acceptance criteria

### A. No numeric measurement leaks before lock

Automated scan of the play screen’s rendered text. Fail on:

```text
\d+(\.\d+)?\s?(mm|cm|m|km)
```

and on axis names (`length`, `height`, `wingspan`, `diameter`, `width` and Arabic equivalents) in the play surface.

Allow: round, score, zoom %, timer.

### B. Same-axis

Every challenge: `target.axis === reference.axis`.

### C. Measured-span monotonicity

At a common scale, if `target.cm > reference.cm` then `targetMeasuredPx > referenceMeasuredPx`. Including tailed mammals, birds, marine animals.

### D. Joint fit

Desktop reference stage ~1104×520 and mobile ~360×400, with reserved HUD/caption/bracket zones. Both objects fit at default zoom. Handle reachable. No clip, no overlap.

### E. Key pairs (visual + measured)

1. Albatross 350 vs condor 320 — albatross wider; pose does not reverse; both fit.
2. Horse 240 vs lion 200 — horse longer; tail handled by bracket; both fit.
3. Quetzalcoatlus 1100 vs albatross 350 — ~3.14×; both fully visible; bracket readable.
4. Whale shark 1200 vs orca 800 / colossal squid 1200 — length correct; depth realistic; no square distortion.
5. Giraffe 550 vs ostrich 270 — giraffe taller; both fit.
6. Sydney Opera House 6500 vs Gateway Arch 19200 — taller is taller; both fit; labels unclipped.

### F. RTL + mobile

Arabic desktop and mobile: no overlap, no horizontal scroll, no clipped text. Brackets/ground geometrically correct in RTL.

### G. Build

`npm run typecheck`, `npm run lint`, `npm run build` pass.

### H. Online

No measurement leaks before lock. Reveal after lock. Joint fit with multiple guesses. Flow and scoring intact.

---

## 9. Tests you must add

If there is no test runner, add Vitest (or lightweight Node) and document how to run it.

1. Geometry unit tests: measured span ∝ `cm`; monotonicity per axis; no zero/negative dims; clamps only on the unmeasured side.
2. Catalogue audit: every challenge same-axis, monotonic, joint-fit desktop+mobile; key pairs exist.
3. Play-surface text audit: fail on units/axis names before lock.
4. Visual check of key pairs: desktop LTR/RTL, mobile LTR/RTL.
5. Manual: drag, resize, arrows, zoom, handle reachability, lock animation, next, results, one online round.

Do not skip audits because the UI “looks fine.”

---

## 10. Deliverables

1. Short design note: `pxPerCm`, measured-span mapping, pose normalisation, why albatross/condor cannot reverse, extreme-ratio fit, tail exclusion.
2. Implementation: play surface, geometry, data, copy, landing promise, online play.
3. Tests / audit script.
4. Screenshots of key pairs (desktop/mobile, LTR/RTL).
5. Data change list with sources for new display aspects / measure spans.
6. Definition-of-done checklist against section 8.

Also read `GAME-PRINCIPLE.md` in this repo. It is the standing design bible. If your implementation would violate it, stop and ask.

---

## 11. Constraints

- Keep real `cm` data. Hidden truth, not dead weight.
- Do not change real-world values without a cited source.
- Do not use colour alone for the compared dimension.
- Do not rely on hover-only info for the comparison.
- Do not solve layout with clipping.
- Do not remove object names.
- Do not show reference size during play.
- Do not compare different axes.
- Do not let SVG pose decide the measurement.
- Do not turn the game into a metres-memorisation quiz. The *feeling* during play is visual. The *lesson* after lock is numeric.

If a data change is irreversible or a rule is ambiguous, ask. Otherwise implement the smallest coherent change and verify the key pairs.

---

## 12. How to work

1. Read the repository and `GAME-PRINCIPLE.md`.
2. Map current flow; grep for every numeric leak.
3. Write a short plan (geometry, UI, data, i18n, tests).
4. Implement end-to-end: solo play, landing copy, online guessing/reveal.
5. Run typecheck, lint, build, and the new audits.
6. Verify the six key pairs. If any reverse or clip, fix before declaring done.

Build the game where the eye is the only ruler until the player commits.
