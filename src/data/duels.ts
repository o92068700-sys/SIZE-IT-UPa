import type { CategoryId } from '@/types/game';

export type DuelArchetype = 'twin' | 'trap' | 'giant' | 'dwarf' | 'flip' | 'chain';

export interface Duel {
  /** Object the player has to size. */
  targetId: string;
  /** Object used as the visual (unlabelled) size anchor. */
  referenceId: string;
  /** Excitement curve position, 1 (familiar) to 4 (awe). */
  act: 1 | 2 | 3 | 4;
  archetype: DuelArchetype;
}

/**
 * Hand-picked pairings for the objects that need a specific opponent.
 * Remaining objects still appear: the deal fills them with a nearby-sized
 * reference. Each game shuffles the finished list so the opening round changes.
 *
 * Rules used while curating (validated against the shipped catalog):
 * - ratio target ÷ reference stays inside 0.45–2.2;
 * - the target always fits the stage (fit ≤ 1.05) and stays at least 24 px;
 * - both objects in a pair share the same measurement axis (height, length or
 *   wingspan) to ensure a fair and visually consistent comparison.
 */
export const DUELS: Partial<Record<CategoryId, Duel[]>> = {
  mixed: [
    { targetId: 'watermelon', referenceId: 'turtle', act: 1, archetype: 'twin' },
    { targetId: 'electric_guitar', referenceId: 'cheetah', act: 1, archetype: 'trap' },
    { targetId: 'foosball_table', referenceId: 'red_wolf', act: 1, archetype: 'twin' },
    { targetId: 'basketball_hoop', referenceId: 'ostrich', act: 1, archetype: 'giant' },

    { targetId: 'tennis_court', referenceId: 'blue_whale', act: 2, archetype: 'trap' },
    { targetId: 'lunar_module', referenceId: 'moai', act: 2, archetype: 'twin' },
    { targetId: 'colossal_squid', referenceId: 'school_bus', act: 2, archetype: 'twin' },
    { targetId: 'whale_shark', referenceId: 't_rex', act: 2, archetype: 'giant' },
    { targetId: 'quetzalcoatlus', referenceId: 'albatross', act: 2, archetype: 'giant' },

    { targetId: 'brachiosaurus', referenceId: 'moai', act: 3, archetype: 'trap' },
    { targetId: 'colosseum', referenceId: 'dome-of-the-rock', act: 3, archetype: 'trap' },
    { targetId: 'concorde', referenceId: 'olympic_pool', act: 3, archetype: 'dwarf' },
    { targetId: 'airbus_a380', referenceId: 'iss', act: 3, archetype: 'twin' },

    { targetId: 'saturn_v', referenceId: 'big-ben', act: 4, archetype: 'trap' },
    { targetId: 'titanic', referenceId: 'queen_mary_2', act: 4, archetype: 'trap' },
    { targetId: 'burj-khalifa', referenceId: 'shanghai_tower', act: 4, archetype: 'trap' },
  ],

  animals: [
    // Every comparable animal has a hand-picked opponent. The auto-fill
    // (nearest-sized reference) would recreate famous near-ties, so it never
    // runs for this category: all 48 playable animals are curated below.
    // Rules: same measurement axis on both sides, ratio 0.45–2.2, and no pair
    // the world already knows is near-equal (lion/tiger, rhino/hippo,
    // ostrich/emu, rabbit/cat, sheep/goat, cassowary/emu...). Every remaining
    // pairing must be solvable by thinking, not memory.

    // act 1 — familiar sizes
    { targetId: 'cat', referenceId: 'dog', act: 1, archetype: 'dwarf' },
    { targetId: 'dog', referenceId: 'cat', act: 1, archetype: 'giant' },
    { targetId: 'rabbit', referenceId: 'dog', act: 1, archetype: 'dwarf' },
    { targetId: 'turtle', referenceId: 'red_panda', act: 1, archetype: 'trap' },
    { targetId: 'red_wolf', referenceId: 'cheetah', act: 1, archetype: 'trap' },
    { targetId: 'panda', referenceId: 'dog', act: 1, archetype: 'dwarf' },

    // act 2 — wild mid-size
    { targetId: 'lemur', referenceId: 'red_panda', act: 2, archetype: 'trap' },
    { targetId: 'red_panda', referenceId: 'giant_anteater', act: 2, archetype: 'giant' },
    { targetId: 'giant_anteater', referenceId: 'capybara', act: 2, archetype: 'trap' },
    { targetId: 'capybara', referenceId: 'aardvark', act: 2, archetype: 'twin' },
    { targetId: 'goat', referenceId: 'spotted_hyena', act: 2, archetype: 'trap' },
    { targetId: 'cheetah', referenceId: 'wild_boar', act: 2, archetype: 'trap' },
    { targetId: 'lion', referenceId: 'horse', act: 2, archetype: 'trap' },
    { targetId: 'horse', referenceId: 'camel', act: 2, archetype: 'trap' },
    { targetId: 'chimpanzee', referenceId: 'panda', act: 2, archetype: 'giant' },
    { targetId: 'southern_cassowary', referenceId: 'chimpanzee', act: 2, archetype: 'trap' },
    { targetId: 'kangaroo', referenceId: 'southern_cassowary', act: 2, archetype: 'twin' },
    { targetId: 'penguin', referenceId: 'flamingo', act: 2, archetype: 'trap' },
    { targetId: 'flamingo', referenceId: 'mute_swan', act: 2, archetype: 'twin' },
    { targetId: 'bald_eagle', referenceId: 'andean_condor', act: 2, archetype: 'trap' },
    { targetId: 'albatross', referenceId: 'bald_eagle', act: 2, archetype: 'trap' },

    // act 3 — big land mammals
    { targetId: 'aardvark', referenceId: 'goat', act: 3, archetype: 'trap' },
    { targetId: 'sheep', referenceId: 'wild_boar', act: 3, archetype: 'trap' },
    { targetId: 'spotted_hyena', referenceId: 'lion', act: 3, archetype: 'giant' },
    { targetId: 'wild_boar', referenceId: 'lowland_tapir', act: 3, archetype: 'giant' },
    { targetId: 'tiger', referenceId: 'moose', act: 3, archetype: 'giant' },
    { targetId: 'lowland_tapir', referenceId: 'horse', act: 3, archetype: 'trap' },
    { targetId: 'polar_bear', referenceId: 'walrus', act: 3, archetype: 'trap' },
    { targetId: 'bottlenose_dolphin', referenceId: 'komodo_dragon', act: 3, archetype: 'twin' },
    { targetId: 'moose', referenceId: 'american_bison', act: 3, archetype: 'twin' },
    { targetId: 'komodo_dragon', referenceId: 'moose', act: 3, archetype: 'twin' },
    { targetId: 'walrus', referenceId: 'komodo_dragon', act: 3, archetype: 'twin' },
    { targetId: 'camel', referenceId: 'american_bison', act: 3, archetype: 'twin' },
    { targetId: 'emu', referenceId: 'flamingo', act: 3, archetype: 'trap' },
    { targetId: 'mute_swan', referenceId: 'emu', act: 3, archetype: 'trap' },
    { targetId: 'ostrich', referenceId: 'kangaroo', act: 3, archetype: 'giant' },
    { targetId: 'andean_condor', referenceId: 'albatross', act: 3, archetype: 'trap' },

    // act 4 — giants and sea monsters
    { targetId: 'american_bison', referenceId: 'hippo', act: 4, archetype: 'trap' },
    { targetId: 'hippo', referenceId: 'great_white_shark', act: 4, archetype: 'trap' },
    { targetId: 'white_rhinoceros', referenceId: 'saltwater_crocodile', act: 4, archetype: 'giant' },
    { targetId: 'elephant', referenceId: 'white_rhinoceros', act: 4, archetype: 'giant' },
    { targetId: 'great_white_shark', referenceId: 'saltwater_crocodile', act: 4, archetype: 'trap' },
    { targetId: 'saltwater_crocodile', referenceId: 'orca', act: 4, archetype: 'giant' },
    { targetId: 'orca', referenceId: 'colossal_squid', act: 4, archetype: 'trap' },
    { targetId: 'colossal_squid', referenceId: 'whale_shark', act: 4, archetype: 'trap' },
    { targetId: 'whale_shark', referenceId: 'orca', act: 4, archetype: 'giant' },
    // The blue whale's only same-axis partner is the whale shark — the duel
    // is the 2× ladder between the biggest animal and the biggest fish.
    { targetId: 'blue_whale', referenceId: 'whale_shark', act: 4, archetype: 'giant' },
    { targetId: 'giraffe', referenceId: 'ostrich', act: 4, archetype: 'giant' },
  ],

  landmarks: [
    { targetId: 'dome-of-the-rock', referenceId: 'christ_redeemer', act: 1, archetype: 'trap' },
    { targetId: 'colosseum', referenceId: 'christ_redeemer', act: 1, archetype: 'trap' },
    { targetId: 'leaning-tower-of-pisa', referenceId: 'colosseum', act: 1, archetype: 'chain' },
    { targetId: 'taj-mahal', referenceId: 'leaning-tower-of-pisa', act: 1, archetype: 'chain' },

    { targetId: 'statue-of-liberty', referenceId: 'taj-mahal', act: 2, archetype: 'chain' },
    { targetId: 'big-ben', referenceId: 'statue-of-liberty', act: 2, archetype: 'twin' },
    { targetId: 'great-pyramid', referenceId: 'big-ben', act: 2, archetype: 'chain' },
    { targetId: 'london_eye', referenceId: 'great-pyramid', act: 2, archetype: 'twin' },

    { targetId: 'statue_of_unity', referenceId: 'london_eye', act: 3, archetype: 'chain' },
    { targetId: 'sydney_opera', referenceId: 'statue_of_unity', act: 3, archetype: 'twin' },
    { targetId: 'gateway_arch', referenceId: 'sydney_opera', act: 3, archetype: 'twin' },
    { targetId: 'shard', referenceId: 'gateway_arch', act: 3, archetype: 'giant' },

    { targetId: 'burj_al_arab', referenceId: 'shard', act: 4, archetype: 'twin' },
    { targetId: 'empire-state-building', referenceId: 'burj_al_arab', act: 4, archetype: 'chain' },
    { targetId: 'burj-khalifa', referenceId: 'empire-state-building', act: 4, archetype: 'giant' },
  ],

  // World maps: all pairs compare area. The easy set keeps recognised giants;
  // the hard set deliberately pairs countries whose areas are within a few
  // percent, so the silhouette itself — not prior knowledge — decides.
  'maps-easy': [
    { targetId: 'ru', referenceId: 'ca', act: 1, archetype: 'twin' },
    { targetId: 'cn', referenceId: 'us', act: 1, archetype: 'twin' },
    { targetId: 'br', referenceId: 'au', act: 2, archetype: 'twin' },
    { targetId: 'in', referenceId: 'ar', act: 2, archetype: 'twin' },
    { targetId: 'eg', referenceId: 'fr', act: 2, archetype: 'giant' },
    { targetId: 'mx', referenceId: 'sa', act: 3, archetype: 'twin' },
    { targetId: 'jp', referenceId: 'de', act: 3, archetype: 'twin' },
    { targetId: 'gb', referenceId: 'it', act: 3, archetype: 'twin' },
    { targetId: 'es', referenceId: 'fr', act: 4, archetype: 'twin' },
    { targetId: 'za', referenceId: 'id', act: 4, archetype: 'dwarf' },
  ],

  'maps-medium': [
    { targetId: 'kz', referenceId: 'dz', act: 1, archetype: 'twin' },
    { targetId: 'cd', referenceId: 'ly', act: 1, archetype: 'twin' },
    { targetId: 'ir', referenceId: 'mn', act: 2, archetype: 'twin' },
    { targetId: 'pe', referenceId: 'td', act: 2, archetype: 'trap' },
    { targetId: 'ne', referenceId: 'ao', act: 2, archetype: 'trap' },
    { targetId: 'ml', referenceId: 'et', act: 3, archetype: 'twin' },
    { targetId: 'bo', referenceId: 'co', act: 3, archetype: 'twin' },
    { targetId: 'mr', referenceId: 'tz', act: 3, archetype: 'twin' },
    { targetId: 'ng', referenceId: 've', act: 4, archetype: 'trap' },
    { targetId: 'na', referenceId: 'mz', act: 4, archetype: 'twin' },
  ],

  'maps-hard': [
    { targetId: 'zw', referenceId: 'no', act: 1, archetype: 'twin' },
    { targetId: 'vn', referenceId: 'fi', act: 1, archetype: 'twin' },
    { targetId: 'pl', referenceId: 'ph', act: 2, archetype: 'twin' },
    { targetId: 'ec', referenceId: 'nz', act: 2, archetype: 'twin' },
    { targetId: 'ug', referenceId: 'gh', act: 2, archetype: 'trap' },
    { targetId: 'ro', referenceId: 'la', act: 3, archetype: 'trap' },
    { targetId: 'by', referenceId: 'kg', act: 3, archetype: 'twin' },
    { targetId: 'sn', referenceId: 'sy', act: 3, archetype: 'twin' },
    { targetId: 'kh', referenceId: 'uy', act: 4, archetype: 'trap' },
    { targetId: 'tn', referenceId: 'bd', act: 4, archetype: 'twin' },
  ],
};
