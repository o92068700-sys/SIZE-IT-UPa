import type { ObjectEntry } from '@/types/game';

/**
 * Objects that are neither animals nor buildings: prehistoric life, aerospace,
 * ships, road vehicles, sport and everyday objects. They only appear in the
 * cross-domain collection, which keeps them available for surprising duels.
 */
export const WORLD_OBJECTS: ObjectEntry[] = [
  // --- Prehistoric ---
  { id: 't_rex', en: 'Tyrannosaurus Rex (Average Adult)', ar: 'تيرانوصوروس ركس', axis: 'length', cm: 1200, aspect: 1.9, difficulty: 1, domain: 'prehistoric', art: 'suggested' },
  { id: 'brachiosaurus', en: 'Brachiosaurus (Average Adult)', ar: 'براكيوصوروس', axis: 'height', cm: 1300, aspect: 1.0, difficulty: 2, domain: 'prehistoric', art: 'suggested' },
  { id: 'argentinosaurus', en: 'Argentinosaurus (Average Adult)', ar: 'أرجنتينوصوروس', axis: 'length', cm: 3500, aspect: 2.6, difficulty: 2, domain: 'prehistoric', art: 'suggested' },
  { id: 'megalodon', en: 'Megalodon (Estimated Adult)', ar: 'ميغالودون', axis: 'length', cm: 1500, aspect: 2.4, difficulty: 1, domain: 'prehistoric', art: 'suggested' },
  { id: 'quetzalcoatlus', en: 'Quetzalcoatlus (Wingspan)', ar: 'كويتزالكواتلس', axis: 'wingspan', cm: 1100, aspect: 1.347, aspectOverride: 3.14, aspectSource: 'published', aspectNote: '11 m wingspan ÷ ~3.5 m flying depth ≈ 3.14. SVG pose ignored.', difficulty: 3, domain: 'prehistoric', art: 'suggested' },

  // --- Aerospace ---
  { id: 'airbus_a380', en: 'Airbus A380', ar: 'إيرباص A380', axis: 'length', cm: 7270, aspect: 1.5, difficulty: 1, domain: 'aerospace', art: 'suggested' },
  {
    id: 'antonov_an225',
    en: 'Antonov An-225 Mriya',
    ar: 'أنتونوف An-225',
    axis: 'length',
    cm: 8400,
    aspect: 4.7,
    difficulty: 2,
    domain: 'aerospace',
    art: 'suggested',
    aspectSource: 'published',
    aspectNote: '84 m length ÷ 18 m height ≈ 4.7 (side elevation).',
  },
  {
    id: 'concorde',
    en: 'Concorde Supersonic Airliner',
    ar: 'طائرة كونكورد',
    axis: 'length',
    cm: 6200,
    aspect: 5.2,
    difficulty: 2,
    domain: 'aerospace',
    art: 'suggested',
    aspectSource: 'published',
    aspectNote: '62 m length ÷ 12 m tail height ≈ 5.2 (side elevation).',
  },
  { id: 'saturn_v', en: 'Saturn V Rocket', ar: 'صاروخ ساتورن 5', axis: 'height', cm: 11100, aspect: 0.12, difficulty: 2, domain: 'aerospace', art: 'suggested' },
  { id: 'space_shuttle', en: 'Space Shuttle Orbiter', ar: 'مكوك الفضاء', axis: 'length', cm: 3700, aspect: 1.2, difficulty: 1, domain: 'aerospace', art: 'suggested' },
  { id: 'falcon_9', en: 'Falcon 9 Rocket', ar: 'صاروخ فالكون 9', axis: 'height', cm: 7000, aspect: 0.1, difficulty: 2, domain: 'aerospace', art: 'suggested' },
  {
    id: 'iss',
    en: 'International Space Station',
    ar: 'المحطة الفضائية الدولية',
    axis: 'length',
    cm: 10900,
    aspect: 1.5,
    difficulty: 3,
    domain: 'aerospace',
    art: 'suggested',
    aspectSource: 'published',
    aspectNote: '109 m truss length ÷ 73 m width ≈ 1.5 (plan view).',
  },
  {
    id: 'hubble',
    en: 'Hubble Space Telescope',
    ar: 'تلسكوب هابل',
    axis: 'length',
    cm: 1320,
    aspect: 3.1,
    difficulty: 3,
    domain: 'aerospace',
    art: 'suggested',
    aspectSource: 'published',
    aspectNote: '13.2 m length ÷ 4.3 m diameter ≈ 3.1 (side elevation).',
  },
  { id: 'lunar_module', en: 'Apollo Lunar Module', ar: 'مركبة أبولو القمرية', axis: 'height', cm: 700, aspect: 0.65, difficulty: 3, domain: 'aerospace', art: 'suggested' },

  // --- Ships ---
  { id: 'titanic', en: 'RMS Titanic', ar: 'سفينة تيتانيك', axis: 'length', cm: 26900, aspect: 2.5, difficulty: 1, domain: 'ship', art: 'suggested' },
  {
    id: 'queen_mary_2',
    en: 'Queen Mary 2 Ocean Liner',
    ar: 'سفينة كوين ماري 2',
    axis: 'length',
    cm: 34500,
    aspect: 4.8,
    difficulty: 2,
    domain: 'ship',
    art: 'suggested',
    aspectSource: 'published',
    aspectNote: '345 m length ÷ 72 m height ≈ 4.8 (side elevation).',
  },

  // --- Road ---
  { id: 'school_bus', en: 'School Bus (Type C, 40 ft)', ar: 'حافلة مدرسية', axis: 'length', cm: 1220, aspect: 2.6, difficulty: 1, domain: 'road', art: 'suggested' },
  { id: 'routemaster', en: 'London Routemaster Bus', ar: 'حافلة روتماستر اللندنية', axis: 'length', cm: 838, aspect: 2.1, difficulty: 2, domain: 'road', art: 'suggested' },

  // --- Sport ---
  { id: 'basketball_hoop', en: 'Basketball Hoop (Rim Height)', ar: 'سلة كرة السلة', axis: 'height', cm: 305, aspect: 1.0, difficulty: 1, domain: 'sport', art: 'suggested' },
  { id: 'tennis_court', en: 'Tennis Court (Singles)', ar: 'ملعب تنس', axis: 'length', cm: 2377, aspect: 1.9, difficulty: 1, domain: 'sport', art: 'suggested' },
  { id: 'olympic_pool', en: 'Olympic Swimming Pool', ar: 'المسبح الأولمبي', axis: 'length', cm: 5000, aspect: 1.6, difficulty: 1, domain: 'sport', art: 'suggested' },
  { id: 'bowling_lane', en: 'Bowling Lane', ar: 'ممر البولينغ', axis: 'length', cm: 1829, aspect: 5.0, difficulty: 2, domain: 'sport', art: 'suggested' },
  { id: 'hockey_goal', en: 'Ice Hockey Goal (Width)', ar: 'مرمى الهوكي', axis: 'length', cm: 183, aspect: 1.4, difficulty: 2, domain: 'sport', art: 'suggested' },
  { id: 'foosball_table', en: 'Foosball Table', ar: 'طاولة كرة القدم الخشبية', axis: 'length', cm: 140, aspect: 1.9, difficulty: 2, domain: 'sport', art: 'suggested' },

  // --- Everyday ---
  {
    id: 'electric_guitar',
    en: 'Electric Guitar (Fender Stratocaster)',
    ar: 'جيتار كهربائي',
    axis: 'length',
    cm: 99,
    aspect: 3.0,
    difficulty: 1,
    domain: 'everyday',
    art: 'suggested',
    aspectSource: 'published',
    aspectNote: '99 cm overall length ÷ 33 cm body width ≈ 3.0.',
  },
  { id: 'baguette', en: 'French Baguette', ar: 'خبز الباغيت الفرنسي', axis: 'length', cm: 60, aspect: 0.18, difficulty: 1, domain: 'everyday', art: 'suggested' },
  { id: 'watermelon', en: 'Watermelon (Large)', ar: 'بطيخة', axis: 'length', cm: 40, aspect: 1.2, difficulty: 1, domain: 'everyday', art: 'suggested' },
];
