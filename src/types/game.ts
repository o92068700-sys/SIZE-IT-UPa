export type CategoryId =
  | 'mixed'
  | 'food-kitchen'
  | 'musical-instruments'
  | 'animals'
  | 'vehicles'
  | 'sports'
  | 'everyday-technology'
  | 'landmarks'
  | 'maps-easy'
  | 'maps-medium'
  | 'maps-hard';

/**
 * `area` is measured in square kilometres and scaled with its own coverage
 * correction, so the painted area on stage stays proportional to the real
 * area even for island nations and concave coastlines.
 */
export type MeasureAxis = 'height' | 'width' | 'length' | 'diameter' | 'wingspan' | 'area';

/** The unit shown after lock. `area` renders as km², everything else as cm/m. */
export type MeasureUnit = 'length' | 'area';

export type Difficulty = 1 | 2 | 3;

/**
 * Broad family of an object. Used to keep curated duels cross-domain and to
 * describe the content without leaking gameplay rules.
 */
export type Domain =
  | 'animal'
  | 'marine'
  | 'prehistoric'
  | 'building'
  | 'tower'
  | 'monument'
  | 'aerospace'
  | 'ship'
  | 'road'
  | 'sport'
  | 'everyday'
  | 'country';

/**
 * How the `aspect` value was obtained:
 * - `published`: derived from published real-world dimensions (length ÷ height).
 * - `art`: measured from the local SVG bounding box to preserve the drawing.
 */
export type AspectSource = 'published' | 'art';

export interface ObjectEntry {
  id: string;
  en: string;
  ar: string;
  axis: MeasureAxis;
  cm: number;
  aspect: number;
  difficulty: Difficulty;
  /** Object family, used for curation and future filters. */
  domain?: Domain;
  /** Folder under `public/assets/objects/` that holds this object's SVG. */
  art?: string;
  /**
   * Absolute URL for art that is not stored in this repository. Used by the
   * world-maps collection, whose silhouettes live in the pinned mapsicon repo.
   * Takes precedence over `art`.
   */
  artUrl?: string;
  /** Display unit after lock. Defaults to `length` (cm/m). */
  unit?: MeasureUnit;
  /** Present only when the aspect value was deliberately audited. */
  aspectSource?: AspectSource;
  /** Human-readable derivation of the aspect value. */
  aspectNote?: string;
  /**
   * When set, overrides both the data `aspect` fallback AND the SVG frame
   * aspect derived from pixel scanning. Use for animals whose SVG art has
   * proportions that don't match the real-world measurement axis (e.g. a
   * nearly-square moose SVG that should display as a wide horizontal animal).
   */
  aspectOverride?: number;
  /**
   * Fraction along the measured axis where the real `cm` span starts and ends.
   * 0..1. Horizontal: left → right. Vertical: ground → top of the art.
   * Defaults to the full silhouette. Tails and excluded horns live outside.
   */
  measureStart?: number;
  measureEnd?: number;
  /**
   * When false, skip this object as a target or reference. Used for coiled
   * snakes whose bounding box cannot honestly represent body length.
   */
  comparable?: boolean;
  imageUrl?: string;
  sourceUrl?: string;
  location?: string;
  yearBuilt?: string;
  descriptionAr?: string;
  descriptionEn?: string;
}

export interface GameObject extends ObjectEntry {
  categoryId: CategoryId;
  imagePath: string;
}

export interface Challenge {
  id: string;
  categoryId: CategoryId;
  target: GameObject;
  reference: GameObject;
  /**
   * The size the mystery wears when the round opens. Deliberately wrong by a
   * guaranteed margin (see `wrongFootedSpawn`), so locking in without engaging
   * never pays. Baked at deal time so every player of an online room sees the
   * same starting size. Rooms dealt before this field existed fall back to the
   * reference's size.
   */
  startCm?: number;
}

export interface RoundResult {
  challengeId: string;
  estimateCm: number;
  actualCm: number;
  relativeError: number;
  score: number;
  /** Unit of the compared measurement, so the reveal can print km² for maps. */
  unit: MeasureUnit;
}
