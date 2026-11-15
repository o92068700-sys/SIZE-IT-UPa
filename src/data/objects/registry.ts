import { MIXED_OBJECTS } from '@/data/objects/mixed';
import type { ObjectEntry } from '@/types/game';

/**
 * Single catalog index. `MIXED_OBJECTS` already contains every object exactly
 * once, so the registry is a lookup layer rather than a second list.
 */
export const ALL_OBJECTS: ObjectEntry[] = MIXED_OBJECTS;

export const OBJECTS_BY_ID: ReadonlyMap<string, ObjectEntry> = new Map(
  ALL_OBJECTS.map((object) => [object.id, object]),
);

export function getObjectEntry(id: string): ObjectEntry | undefined {
  return OBJECTS_BY_ID.get(id);
}
