# Size It Up — design bible

Standing reference for **any** future model, contributor, or session.

This file is not an implementation ticket. It is the constitutive rules of the game. If a change would violate this document, the change is wrong unless the product owner explicitly amends this file.

Implementation work for the current visual-only rebuild lives in `PROMPT-visual-only-game.md`. After that work lands, keep **this** file as the long-term source of truth.

---

## Arabic summary — مبدأ اللعبة

اللعبة لعبة **نظر**، مش لعبة أمتار.

اللاعب بشوف كائنين معروفين من الحياة: مرجع ثابت وشكل غامض قابل للسحب. الاثنين مرسومين على **نفس المقياس الحقيقي**. اللاعب يكبّر أو يصغّر الغامض لحد ما الحجم **يبان صح** بعينو، مقارنة بالمرجع.

- أثناء التخمين: **صفر أرقام**. اسم الكائن + قوس بصري بدون وحدة قياس.
- بعد التثبيت: يظهر الحجم الحقيقي بالأمتار، حجم المرجع، نسبة الخطأ، والنقاط. هاي لحظة التعلّم.
- الأمتار موجودة داخل النظام (`cm`) عشان المقياس والسكور، بس ما بتنعرض قبل الالتزام.
- الشكل الأكبر في الواقع **لازم يبان أكبر** على البعد المقارن. الرسم الكاذب = لعبة كاذبة.

المهارة: معرفة واقعية + تقدير بصري. مش قراءة مسطرة.

---

## 1. One-sentence product

**The eye is the only ruler until the player commits. Numbers are the verdict, not the tool.**

---

## 2. What the player is doing

Each round:

1. The player **recognises** two real-world things (names are visible).
2. They already have a rough sense of how big those things are in life.
3. They **see** both silhouettes at one shared physical scale.
4. They **resize** the mystery silhouette until the relative size *feels* right.
5. They **lock**.
6. The game shows the truth: actual metres, reference metres, error, score.

The player is not converting units. They are not reading a labelled ruler. They are not solving “the blue one is 3.50 m so the other should be…”.

If a feature lets them skip the picture and still score, delete that feature from the guessing phase.

---

## 3. Two clocks: play vs reveal

| Phase | What the player may see | What they must not see |
|---|---|---|
| **Guessing** (unlocked) | Names, silhouettes, unitless brackets, round/score/zoom/timer, “drag until it feels right” | Metres, cm, km, live estimate, reference size, axis words (length/height/wingspan/…) |
| **Reveal** (locked) | Ghost of the true size, animation to actual scale, metres, error, score | Nothing required to stay hidden; numbers are the lesson |

Internal state may always use centimetres. UI during guessing may not.

---

## 4. Core loop (mechanism)

```
challenge = { reference, target }   // same axis, both named, both have hidden cm
pxPerCm  = fit(reference actual, target actual, safe stage)
draw(reference at reference.cm × pxPerCm)
draw(target   at estimate.cm   × pxPerCm)   // player controls estimate.cm
bracket each object on the measured span only
on lock:
  animate target to target.cm × same pxPerCm
  score from relative error |estimate - actual| / actual
  show metres in the reveal card
```

Invariants:

- **One scale per round.** Same `pxPerCm` for reference, guess, and truth.
- **Same axis per round.** Never length vs height vs wingspan.
- **Monotonic truth.** If A.cm > B.cm, A’s measured pixel span > B’s. Pose cannot reverse this.
- **Joint fit.** At default zoom, both *actual* sizes fit. Extreme ratios shrink both, they do not clip the large one.
- **Names stay.** You cannot judge a mystery you cannot identify.

---

## 5. What “realistic” means here

Realistic does **not** mean photoreal shading. It means **physically honest display**:

1. The compared span on screen is proportional to real `cm`.
2. Body proportions on the unmeasured side come from published real-world ratios, not from a square SVG frame.
3. Wings are compared tip-to-tip; standing things stand on a shared ground line; long animals are long, not fattened into squares.
4. Tails, raised ears, coiled snakes: the **bracket** marks what `cm` actually measures. Art may extend beyond the bracket. The bracket must not lie.
5. If the pose cannot be normalised without looking broken, replace the art with a canonical view (side for length, upright for height, spread wings for wingspan). Do not ship a lying pose.

A beautiful silhouette that reverses horse vs lion is a bug, not style.

---

## 6. How a round should feel

**Start.** Two shapes, two names, two silent brackets. A small hint. No card shouting “3.50 m”.

**Play.** Dragging changes *size*, not a numeric readout. The player looks back and forth. They think “the horse is longer than the lion, but not twice as long.”

**Lock.** The mystery slides to the truth. A ghost sits on the guess. Then — and only then — metres appear, as confirmation.

**Learn.** Next time they see an albatross, their eye is calibrated.

---

## 7. Scoring (internal)

Keep relative-error scoring. The player never needs to see the formula during play.

- Input: hidden `estimateCm` vs `actualCm`.
- Output after lock: score 0–100, accuracy band, percent off.
- Do not change the formula unless fairness requires it (e.g. after geometry bugs made some rounds unwinnable).

---

## 8. Pairing rules

- Same `axis` only.
- Reference must be **recognisable** with a reasonably known real-world size. An obscure fossil is a bad sole anchor.
- Curated duels (horse/lion, albatross/condor, giraffe/ostrich, extreme wingspans) are regression fixtures. Do not drop them.
- If the catalogue cannot pair a target fairly, skip the target. Do not cross axes to fill a hole.

---

## 9. UI grammar

**Guessing surface**

- Reference / mystery names.
- Unitless dimension bracket (orientation encodes axis; colour does not encode it alone).
- Resize handle; zoom; lock.
- Compact unitless chip is enough. No “Measuring {axis}”.

**Forbidden guessing chrome**

- `formatLength` on captions, guides, answer cards, online HUD.
- Ruler ticks with 1, 10, 100, 1000.
- Axis names in any language.

**Reveal / results / landing**

- Metres allowed after lock.
- Landing promise: no numbers, just your eye. A ruler as *texture* is optional; ruler-as-skill copy is not.

**RTL**

- Geometry may be LTR internally.
- Copy, chrome, and layout follow `dir`. Arabic must be first-class, not mirrored leftovers.

---

## 10. Data contract

Every object keeps:

- `id`, `en`, `ar`
- `axis`, `cm` (source of truth, cited if changed)
- art path
- display proportion (`aspectOverride` / `displayAspect`) with `aspectSource` and `aspectNote` when audited
- optional `measureStart` / `measureEnd` (0..1) when the SVG includes an excluded appendage

Never change `cm` without a cited source.

`cm` is not a player-facing feature. It is how the engine tells the truth.

---

## 11. Online mode

Same game. Same no-number guessing. Same truthful scale.

Differences are social (timer, submissions, reveal of others’ guesses), not mechanical. Other players’ guesses may appear as extra silhouettes **after** reveal, still on the same `pxPerCm`. Do not show anyone’s metre value before lock.

---

## 12. Tests that protect the idea

Any future change should still be able to prove:

1. Play-surface text contains no `mm|cm|m|km` (except zoom `%`, round, score, timer).
2. Every challenge is same-axis.
3. Measured pixel span is monotonic with `cm`.
4. Key pairs never reverse and both fit (albatross/condor, horse/lion, quetzalcoatlus/albatross, giraffe/ostrich, whale shark/orca, Opera House/Gateway Arch).
5. Typecheck, lint, and build pass.

If you add a feature that cannot survive these tests, the feature does not belong in guessing.

---

## 13. Non-goals

- Teaching the metric system as the primary skill.
- A sandbox ruler for converting units.
- Photoreal 3D.
- Cross-axis “fun” matchups (giraffe height vs shark length).
- Hover-only or colour-only dimension hints.
- Clipping as layout.

---

## 14. How future models should use this file

When asked to add a mode, object, HUD, tutorial, or scoring tweak:

1. Read this file first.
2. Ask: does the player still judge with their eye, with no numbers until lock?
3. Ask: is the larger real object still larger on screen on the compared span?
4. If yes to both, implement. If no, refuse or redesign until both are yes.
5. For a full rebuild of the current (leaky) loop, follow `PROMPT-visual-only-game.md`, then return here as the lasting spec.

Do not “helpfully” show the reference size to make rounds easier. That destroys the product.

---

## 15. Canonical feel

Wrong: “The reference is 3.50 m. I’ll type something close.”

Right: “That albatross looks a bit wider than the condor. Lock. — 3.50 vs 3.20. My eye was right.”
