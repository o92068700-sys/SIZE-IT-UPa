export type ComingKind = 'field' | 'mode';
export type ComingPriority = 'high' | 'normal';

export interface ComingMatchup {
  a: string;
  aAr: string;
  b: string;
  bAr: string;
}

export interface ComingWorld {
  id: string;
  code: string;
  kind: ComingKind;
  priority: ComingPriority;
  featured?: boolean;
  /** Showcase entries get the wide creative card instead of the standard grid tile. */
  showcase?: boolean;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  description: string;
  descriptionAr: string;
  measure: string;
  measureAr: string;
  matchups: ComingMatchup[];
}

export const COMING_WORLDS: ComingWorld[] = [
  {
    id: 'space',
    code: 'SC-01',
    kind: 'field',
    priority: 'high',
    featured: true,
    name: 'Space & Planets',
    nameAr: 'عالم الفضاء',
    tagline: 'Worlds against worlds.',
    taglineAr: 'عوالم ضد عوالم.',
    description:
      'Compare planets, moons and celestial bodies until your eye learns the solar system the hard way.',
    descriptionAr: 'قارن أحجام الكواكب والأقمار والأجرام السماوية حتى تتعلّم العين النظام الشمسي بالقياس.',
    measure: 'Diameter · radius · orbital scale',
    measureAr: 'القطر · نصف القطر · مقياس المدار',
    matchups: [
      { a: 'Earth', aAr: 'الأرض', b: 'Neptune', bAr: 'نبتون' },
      { a: 'Mars', aAr: 'المريخ', b: 'Mercury', bAr: 'عطارد' },
      { a: 'The Moon', aAr: 'القمر', b: 'Earth', bAr: 'الأرض' },
    ],
  },
  {
    id: 'maps',
    code: 'SC-02',
    kind: 'field',
    priority: 'high',
    featured: true,
    name: 'Maps & Geography',
    nameAr: 'عالم الخرائط',
    tagline: 'Borders lie. Area does not.',
    taglineAr: 'الحدود تكذب. المساحة لا.',
    description:
      'Countries, islands, continents and lakes on the same map — Jordan against Lebanon, an island against a nation.',
    descriptionAr: 'دول وجزر وقارات وبحيرات على خريطة واحدة — الأردن ضد لبنان، جزيرة ضد دولة.',
    measure: 'Area · coastline · true scale',
    measureAr: 'المساحة · الساحل · المقياس الحقيقي',
    matchups: [
      { a: 'Jordan', aAr: 'الأردن', b: 'Lebanon', bAr: 'لبنان' },
      { a: 'Australia', aAr: 'أستراليا', b: 'Greenland', bAr: 'غرينلاند' },
      { a: 'An island', aAr: 'جزيرة', b: 'A country', bAr: 'دولة' },
    ],
  },
  {
    id: 'engineering',
    code: 'SC-03',
    kind: 'field',
    priority: 'normal',
    name: 'Engineering Monsters',
    nameAr: 'وحوش الهندسة',
    tagline: 'Not buildings. Beasts of steel.',
    taglineAr: 'ليست مبانٍ. وحوش من فولاذ.',
    description:
      'Dams, bridges, tunnels, radars, giant telescopes and particle accelerators — the largest things humans built besides ordinary towers.',
    descriptionAr:
      'سدود وجسور وأنفاق ورادارات وتلسكوبات عملاقة ومسرّعات جسيمات — أضخم ما صنعه الإنسان بعيداً عن المباني العادية.',
    measure: 'Height · length · span',
    measureAr: 'الارتفاع · الطول · الامتداد',
    matchups: [
      { a: 'A bridge', aAr: 'جسر', b: 'A dam', bAr: 'سد' },
      { a: 'Largest telescope', aAr: 'أكبر تلسكوب', b: 'A mega facility', bAr: 'منشأة عملاقة' },
    ],
  },
  {
    id: 'hidden',
    code: 'SC-04',
    kind: 'field',
    priority: 'normal',
    name: 'Hidden Giants',
    nameAr: 'العمالقة المخفيون',
    tagline: 'Around you. Invisible. Enormous.',
    taglineAr: 'حولك. غير مرئية. هائلة.',
    description:
      'The largest fungi, root networks, coral colonies, spider webs and termite mounds — sizes almost nobody believes.',
    descriptionAr:
      'أكبر الفطريات وشبكات الجذور والمستعمرات المرجانية وشبكات العناكب وتلال النمل الأبيض — أحجام لا يصدّقها أحد.',
    measure: 'Spread · colony · network',
    measureAr: 'الامتداد · المستعمرة · الشبكة',
    matchups: [
      { a: 'Fungal colony', aAr: 'مستعمرة فطرية', b: 'Coral forest', bAr: 'غابة مرجانية' },
      { a: 'Giant nest', aAr: 'عش عملاق', b: 'Root network', bAr: 'شبكة جذور' },
    ],
  },
  {
    id: 'ancient',
    code: 'SC-05',
    kind: 'field',
    priority: 'normal',
    name: 'Ancient Giants',
    nameAr: 'عمالقة التاريخ',
    tagline: 'Stone that still outmeasures us.',
    taglineAr: 'حجر ما زال أكبر منّا.',
    description:
      'Megaliths, obelisks, colossal statues, historic ships and ancient engineering — a duel across millennia.',
    descriptionAr: 'أحجار أثرية ومسلات وتماثيل ضخمة وسفن تاريخية وآثار هندسية قديمة — مبارزة عبر آلاف السنين.',
    measure: 'Height · mass · length',
    measureAr: 'الارتفاع · الكتلة · الطول',
    matchups: [
      { a: 'Megalith', aAr: 'حجر أثري عملاق', b: 'Colossal statue', bAr: 'تمثال ضخم' },
      { a: 'Obelisk', aAr: 'مسلة', b: 'Historic monument', bAr: 'نصب تاريخي' },
    ],
  },
  {
    id: 'anime',
    code: 'SC-08',
    kind: 'field',
    priority: 'high',
    showcase: true,
    name: 'Anime Scale',
    nameAr: 'مقاييس الأنمي',
    tagline: 'From chibi to colossus.',
    taglineAr: 'من شيبي صغير إلى عملاق.',
    description:
      'Line up anime characters on one height chart — the tiny sidekick against the tower-sized titan. The gap between them is the whole game.',
    descriptionAr:
      'رُتِّب شخصيات الأنمي على رسم طول واحد — الرفيق الصغير ضد التيتان البارتفاع كالبرج. والفرق بينهم هو اللعبة كلها.',
    measure: 'Height · scale · silhouette',
    measureAr: 'الطول · المقياس · الصورة الظلّية',
    matchups: [
      { a: 'Levi', aAr: 'ليفاي', b: 'Colossal Titan', bAr: 'تيتان العملاق' },
      { a: 'Chopper', aAr: 'شوبر', b: 'Kaido', bAr: 'كايدو' },
      { a: 'Doraemon', aAr: 'دورايمون', b: 'Nobita', bAr: 'نوبيتا' },
    ],
  },
  {
    id: 'athletes',
    code: 'SC-09',
    kind: 'field',
    priority: 'high',
    showcase: true,
    name: 'Athletes Arena',
    nameAr: 'ميدان الرياضيين',
    tagline: 'Every sport. One measuring tape.',
    taglineAr: 'كل الرياضات. شريط قياس واحد.',
    description:
      'A tableau of athletes from different games — the jockey beside the basketball centre, the sumo wrestler beside the gymnast — all pinned to the same scale.',
    descriptionAr:
      'تابلوه لاعبين من رياضات مختلفة — الفرساني جنب وسط كرة السلة، ومصارع السومو جنب لاعب الجمباز — وكلهم مثبّتون على نفس المقياس.',
    measure: 'Height · wingspan · build',
    measureAr: 'الطول · باع الأيدي · البنية',
    matchups: [
      { a: 'Basketball centre', aAr: 'وسط كرة سلة', b: 'Jockey', bAr: 'فرساني' },
      { a: 'Sumo wrestler', aAr: 'مصارع سومو', b: 'Gymnast', bAr: 'لاعب جمباز' },
      { a: 'Swimmer', aAr: 'سبّاح', b: 'Weightlifter', bAr: 'رافع أثقال' },
    ],
  },
  {
    id: 'fit',
    code: 'SC-06',
    kind: 'mode',
    priority: 'normal',
    name: 'Can It Fit?',
    nameAr: 'هل بتسع؟',
    tagline: 'Not who is bigger. Yes or no.',
    taglineAr: 'ليس مَن أكبر. نعم أو لا.',
    description:
      'Does the car fit the shipping container? The plane the hangar? A ship the tunnel? Pick yes or no, then the dimensions drop.',
    descriptionAr:
      'هل السيارة بتسع داخل الحاوية؟ الطائرة داخل الحظيرة؟ السفينة تمر من النفق؟ اختر نعم أو لا، ثم تُكشف الأبعاد.',
    measure: 'Yes / No · then the reveal',
    measureAr: 'نعم / لا · ثم الكشف',
    matchups: [
      { a: 'Car', aAr: 'سيارة', b: 'Container', bAr: 'حاوية شحن' },
      { a: 'Aircraft', aAr: 'طائرة', b: 'Hangar', bAr: 'حظيرة' },
      { a: 'Ship', aAr: 'سفينة', b: 'Tunnel', bAr: 'نفق' },
    ],
  },
  {
    id: 'price',
    code: 'SC-07',
    kind: 'mode',
    priority: 'normal',
    name: 'Price Clash',
    nameAr: 'مين أغلى؟',
    tagline: 'Value, not volume.',
    taglineAr: 'القيمة، لا الحجم.',
    description:
      'A new challenge: which thing costs more? Guess the richer object, then see the real price gap.',
    descriptionAr: 'تحدٍّ جديد: أيّ الشيئين أغلى؟ خمّن الأغلى، ثم اكشف الفرق الحقيقي في السعر.',
    measure: 'Market value · shock gap',
    measureAr: 'القيمة السوقية · صدمة الفرق',
    matchups: [
      { a: 'A painting', aAr: 'لوحة', b: 'A sports car', bAr: 'سيارة رياضية' },
      { a: 'A diamond', aAr: 'ماسة', b: 'A house', bAr: 'منزل' },
    ],
  },
];
