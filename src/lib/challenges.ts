import { CATEGORIES } from '@/data/categories';
import { DUELS } from '@/data/duels';
import type { CategoryId, Challenge, GameObject, ObjectEntry } from '@/types/game';

export function getCategory(categoryId: CategoryId) {
  const category = CATEGORIES.find((item) => item.id === categoryId);
  if (!category) throw new Error(`Unknown category: ${categoryId}`);
  return category;
}

/**
 * Art lives in the folder recorded on the object, not in the category folder.
 * The cross-domain collection reuses animals, landmarks and world art, so the
 * old `/assets/objects/{categoryId}/` rule would produce broken paths.
 */
export function imagePathFor(categoryId: CategoryId, entry: ObjectEntry) {
  if (entry.artUrl) return entry.artUrl;
  return `/assets/objects/${entry.art ?? categoryId}/${entry.id}.svg`;
}

function toGameObject(categoryId: CategoryId, entry: ObjectEntry): GameObject {
  return { ...entry, categoryId, imagePath: imagePathFor(categoryId, entry) };
}

/**
 * Wrong-footed spawn.
 *
 * A mystery that opens at the reference's size hands free points to curated
 * close pairs — the player can lock in immediately and score 90+. So every
 * mystery is born wrong, on purpose: a random factor between 1.45× and 3.2×
 * of the true size, sampled log-uniformly (the same scale the duel dial
 * reads, so surprises stay perceptually even) on a random side. Locking
 * without engaging can therefore never score above 36, while the guess stays
 * far enough from the edges to always fit the stage without clamping.
 *
 * The factor is baked into the challenge at deal time: solo games reshuffle
 * it every playthrough, and an online room deals one starting size to every
 * player because the rounds are stored once and shared.
 */
const SPAWN_MIN_RATIO = 1.45;
const SPAWN_MAX_RATIO = 3.2;

function wrongFootedSpawn(trueCm: number) {
  const logMin = Math.log(SPAWN_MIN_RATIO);
  const logMax = Math.log(SPAWN_MAX_RATIO);
  const factor = Math.exp(logMin + Math.random() * (logMax - logMin));
  return trueCm * (Math.random() < 0.5 ? factor : 1 / factor);
}

function challengeFor(categoryId: CategoryId, target: GameObject, reference: GameObject): Challenge {
  return {
    id: `${categoryId}:${target.id}`,
    categoryId,
    target,
    reference,
    startCm: wrongFootedSpawn(target.cm),
  };
}

const PREFERRED_RATIO_MIN = 0.45;
const PREFERRED_RATIO_MAX = 2.2;

function sizeDistance(a: GameObject, b: GameObject) {
  return Math.abs(Math.log(a.cm) - Math.log(b.cm));
}

/**
 * Pick the best reference object for a given target.
 *
 * A round may only compare the same measurement type on both sides. A 2.4 m
 * body length and a 2.4 m shoulder height are not the same visual span, so a
 * cross-axis fallback is never allowed — even if it would make the catalog
 * easier to fill. If a measurement type has no second object, the target is
 * skipped rather than shown with a misleading ruler.
 *
 * Within the matching type the closest logarithmic size wins. Preferring the
 * 0.45–2.2 ratio keeps both silhouettes readable on the stage.
 */
export function isComparable(object: Pick<GameObject, 'comparable'>) {
  return object.comparable !== false;
}

function pickReference(target: GameObject, objects: GameObject[]): GameObject | null {
  const sameAxis = objects.filter(
    (object) => object.id !== target.id && object.axis === target.axis && isComparable(object),
  );
  if (!sameAxis.length) return null;

  const preferred = sameAxis.filter((o) => {
    const ratio = target.cm / o.cm;
    return ratio >= PREFERRED_RATIO_MIN && ratio <= PREFERRED_RATIO_MAX;
  });

  const pool = preferred.length > 0 ? preferred : sameAxis;

  return pool.reduce((best, object) =>
    sizeDistance(object, target) < sizeDistance(best, target) ? object : best,
  );
}

/**
 * One comparison per object. Curated pairings stay when they exist; anything
 * not yet used as a target gets a nearby-sized reference so the full catalog
 * is playable. Call `dealChallenges` to shuffle for a game.
 */
export function buildChallenges(categoryId: CategoryId): Challenge[] {
  const category = getCategory(categoryId);
  const objects = category.objects.map((entry) => toGameObject(categoryId, entry));
  const byId = new Map(objects.map((object) => [object.id, object]));
  const usedTargets = new Set<string>();
  const challenges: Challenge[] = [];

  for (const duel of DUELS[categoryId] ?? []) {
    const target = byId.get(duel.targetId);
    const reference = byId.get(duel.referenceId);
    if (!target || !reference) continue;
    // Defensive guard: keep hand-picked pairs honest even if the catalog changes.
    if (target.axis !== reference.axis) continue;
    if (!isComparable(target) || !isComparable(reference)) continue;
    challenges.push(challengeFor(categoryId, target, reference));
    usedTargets.add(target.id);
  }

  for (const target of objects) {
    if (usedTargets.has(target.id) || !isComparable(target)) continue;
    const reference = pickReference(target, objects);
    if (!reference) continue;
    challenges.push(challengeFor(categoryId, target, reference));
  }

  return challenges;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Fresh random order for this game. Pairings stay the same; sequence does not. */
export function dealChallenges(categoryId: CategoryId): Challenge[] {
  return shuffle(buildChallenges(categoryId));
}
