import { ANIMAL_OBJECTS } from '@/data/objects/animals';
import { LANDMARK_OBJECTS } from '@/data/objects/landmarks';
import { WORLD_OBJECTS } from '@/data/objects/world';
import type { ObjectEntry } from '@/types/game';

/**
 * Every object in the game, exactly once. The cross-domain collection is the
 * union of the living world, buildings and monuments, and the world objects.
 */
export const MIXED_OBJECTS: ObjectEntry[] = [
  ...ANIMAL_OBJECTS,
  ...LANDMARK_OBJECTS,
  ...WORLD_OBJECTS,
];
