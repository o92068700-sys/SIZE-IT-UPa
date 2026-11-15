import type { Difficulty, ObjectEntry } from '@/types/game';

/**
 * World-maps collection.
 *
 * The silhouettes are not stored in this repository. They are loaded from the
 * public `djaiss/mapsicon` project at a pinned commit, so the collection adds
 * no binary assets to the bundle while still using a stable URL. GitHub's raw
 * host sends `Access-Control-Allow-Origin: *`, which lets the game measure the
 * painted pixels on a canvas.
 *
 * Each entry compares **area** in square kilometres. `cm` therefore stores km²
 * for this collection (the field name is historical); `unit: 'area'` makes the
 * reveal print km² instead of cm/m. The stage divides by the silhouette's
 * painted coverage, so the visible area — not its rectangular bounding box —
 * stays proportional to the real country area.
 *
 * Definition used for all entries:
 *   total area = land + inland water, excluding coastal and territorial water.
 * Source: the UN-sourced table at
 *   https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_area
 *
 * Four entries are matched to the territory the mapsicon silhouette actually
 * draws. Using the full sovereign area there would make the shape lie:
 *   - FR: metropolitan France incl. Corsica (551,695). `all/fr` excludes the
 *     overseas departments and collectivities.
 *   - NO: mainland Norway (323,802). `all/no` excludes Svalbard and Jan Mayen.
 *   - US: the contiguous 48 states + DC (8,080,464). `all/us` excludes Alaska
 *     and Hawaii; those have their own `us/<state>` maps in mapsicon.
 *   - EC: Ecuador excluding Galápagos (276,841). `all/ec` does not draw the
 *     archipelago at a measurable scale.
 * China's 9,596,960 figure excludes Taiwan, matching `all/cn` (which includes
 * Hainan). Australia's figure includes Tasmania, and the UK's includes
 * Northern Ireland — both are present in their silhouettes.
 */
const MAPSICON_COMMIT = '33ba28808f8d32b5bae0ffada9cadd07073852e1';
const AREA_SOURCE = 'https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_area';
const METRO_FRANCE_SOURCE = 'https://en.wikipedia.org/wiki/Metropolitan_France';
const MAINLAND_NORWAY_SOURCE = 'https://en.wikipedia.org/wiki/Norway';
const CONTIGUOUS_US_SOURCE = 'https://en.wikipedia.org/wiki/Contiguous_United_States';
const ECUADOR_SOURCE = 'https://en.wikipedia.org/wiki/Ecuador';

const mapArt = (code: string) =>
  `https://raw.githubusercontent.com/djaiss/mapsicon/${MAPSICON_COMMIT}/all/${code.toLowerCase()}/vector.svg`;

function country(
  code: string,
  en: string,
  ar: string,
  areaKm2: number,
  difficulty: Difficulty,
  sourceUrl: string = AREA_SOURCE,
): ObjectEntry {
  return {
    id: code.toLowerCase(),
    en,
    ar,
    axis: 'area',
    unit: 'area',
    cm: areaKm2,
    // The live content frame supplies the real aspect. This is only a fallback.
    aspect: 1,
    aspectSource: 'art',
    aspectNote: 'Derived from the mapsicon silhouette content frame at runtime.',
    difficulty,
    domain: 'country',
    artUrl: mapArt(code),
    sourceUrl,
  };
}

/** Familiar giants and iconic outlines. */
export const MAP_EASY_OBJECTS: ObjectEntry[] = [
  country('RU', 'Russia', 'روسيا', 17098246, 1),
  country('CA', 'Canada', 'كندا', 9984670, 1),
  country('CN', 'China', 'الصين', 9596960, 1),
  country('US', 'United States', 'الولايات المتحدة', 8080464, 1, CONTIGUOUS_US_SOURCE),
  country('BR', 'Brazil', 'البرازيل', 8510346, 1),
  country('AU', 'Australia', 'أستراليا', 7741220, 1),
  country('IN', 'India', 'الهند', 3287263, 1),
  country('AR', 'Argentina', 'الأرجنتين', 2780400, 1),
  country('EG', 'Egypt', 'مصر', 1001450, 1),
  country('FR', 'France', 'فرنسا', 551695, 1, METRO_FRANCE_SOURCE),
  country('JP', 'Japan', 'اليابان', 377915, 1),
  country('DE', 'Germany', 'ألمانيا', 357581, 1),
  country('GB', 'United Kingdom', 'المملكة المتحدة', 244376, 1),
  country('IT', 'Italy', 'إيطاليا', 302068, 1),
  country('ES', 'Spain', 'إسبانيا', 505370, 1),
  country('MX', 'Mexico', 'المكسيك', 1964375, 1),
  country('ID', 'Indonesia', 'إندونيسيا', 1904569, 1),
  country('SA', 'Saudi Arabia', 'السعودية', 2149690, 1),
  country('TR', 'Türkiye', 'تركيا', 783562, 1),
  country('ZA', 'South Africa', 'جنوب أفريقيا', 1219090, 1),
];

/** Large and mid-sized countries with closer areas. */
export const MAP_MEDIUM_OBJECTS: ObjectEntry[] = [
  country('KZ', 'Kazakhstan', 'كازاخستان', 2724910, 2),
  country('DZ', 'Algeria', 'الجزائر', 2381741, 2),
  country('CD', 'DR Congo', 'الكونغو الديمقراطية', 2344858, 2),
  country('LY', 'Libya', 'ليبيا', 1759540, 2),
  country('IR', 'Iran', 'إيران', 1648195, 2),
  country('MN', 'Mongolia', 'منغوليا', 1564116, 2),
  country('PE', 'Peru', 'بيرو', 1285216, 2),
  country('TD', 'Chad', 'تشاد', 1284000, 2),
  country('NE', 'Niger', 'النيجر', 1267000, 2),
  country('AO', 'Angola', 'أنغولا', 1246700, 2),
  country('ML', 'Mali', 'مالي', 1240192, 2),
  country('ET', 'Ethiopia', 'إثيوبيا', 1104300, 2),
  country('BO', 'Bolivia', 'بوليفيا', 1098581, 2),
  country('CO', 'Colombia', 'كولومبيا', 1138910, 2),
  country('MR', 'Mauritania', 'موريتانيا', 1030700, 2),
  country('TZ', 'Tanzania', 'تنزانيا', 947303, 2),
  country('NG', 'Nigeria', 'نيجيريا', 923768, 2),
  country('VE', 'Venezuela', 'فنزويلا', 912050, 2),
  country('NA', 'Namibia', 'ناميبيا', 824292, 2),
  country('MZ', 'Mozambique', 'موزمبيق', 799380, 2),
];

/** Near-tied areas and less familiar outlines. */
export const MAP_HARD_OBJECTS: ObjectEntry[] = [
  country('ZW', 'Zimbabwe', 'زيمبابوي', 390757, 3),
  country('NO', 'Norway', 'النرويج', 323802, 3, MAINLAND_NORWAY_SOURCE),
  country('VN', 'Vietnam', 'فيتنام', 331340, 3),
  country('FI', 'Finland', 'فنلندا', 338145, 3),
  country('PL', 'Poland', 'بولندا', 312685, 3),
  country('PH', 'Philippines', 'الفلبين', 300000, 3),
  country('EC', 'Ecuador', 'الإكوادور', 276841, 3, ECUADOR_SOURCE),
  country('NZ', 'New Zealand', 'نيوزيلندا', 268838, 3),
  country('UG', 'Uganda', 'أوغندا', 241550, 3),
  country('GH', 'Ghana', 'غانا', 238537, 3),
  country('RO', 'Romania', 'رومانيا', 238398, 3),
  country('LA', 'Laos', 'لاوس', 236800, 3),
  country('BY', 'Belarus', 'بيلاروسيا', 207600, 3),
  country('KG', 'Kyrgyzstan', 'قيرغيزستان', 199949, 3),
  country('SN', 'Senegal', 'السنغال', 196712, 3),
  country('SY', 'Syria', 'سوريا', 185180, 3),
  country('KH', 'Cambodia', 'كمبوديا', 181035, 3),
  country('UY', 'Uruguay', 'الأوروغواي', 176215, 3),
  country('TN', 'Tunisia', 'تونس', 163610, 3),
  country('BD', 'Bangladesh', 'بنغلاديش', 148460, 3),
];
