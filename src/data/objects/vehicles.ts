import type { ObjectEntry } from '@/types/game';

export const VEHICLE_OBJECTS: ObjectEntry[] = [
  { id: 'bicycle', en: 'Bicycle', ar: 'دراجة هوائية', axis: 'length', cm: 175, aspect: 1.6, difficulty: 1 },
  { id: 'motorcycle', en: 'Motorcycle', ar: 'دراجة نارية', axis: 'length', cm: 210, aspect: 1.8, difficulty: 1 },
  { id: 'scooter', en: 'Scooter', ar: 'سكوتر', axis: 'length', cm: 115, aspect: 1.2, difficulty: 2 },
  { id: 'sedan-car', en: 'Sedan car', ar: 'سيارة سيدان', axis: 'length', cm: 470, aspect: 3.2, difficulty: 1 },
  { id: 'sports-car', en: 'Sports car', ar: 'سيارة رياضية', axis: 'length', cm: 440, aspect: 3.6, difficulty: 2 },
  { id: 'pickup-truck', en: 'Pickup truck', ar: 'شاحنة بيك أب', axis: 'length', cm: 540, aspect: 2.9, difficulty: 1 },
  { id: 'city-bus', en: 'City bus', ar: 'حافلة مدينة', axis: 'length', cm: 1200, aspect: 3.7, difficulty: 2 },
  { id: 'school-bus', en: 'School bus', ar: 'حافلة مدرسية', axis: 'length', cm: 1050, aspect: 3.4, difficulty: 2 },
  { id: 'ambulance', en: 'Ambulance', ar: 'سيارة إسعاف', axis: 'length', cm: 600, aspect: 2.5, difficulty: 2 },
  { id: 'fire-truck', en: 'Fire truck', ar: 'شاحنة إطفاء', axis: 'length', cm: 1000, aspect: 3.1, difficulty: 2 },
  { id: 'delivery-van', en: 'Delivery van', ar: 'شاحنة توصيل', axis: 'length', cm: 550, aspect: 2.2, difficulty: 2 },
  { id: 'train', en: 'Train', ar: 'قطار', axis: 'length', cm: 2500, aspect: 6.5, difficulty: 3 },
  { id: 'airplane', en: 'Airplane', ar: 'طائرة', axis: 'length', cm: 3760, aspect: 3.2, difficulty: 2 },
  { id: 'helicopter', en: 'Helicopter', ar: 'مروحية', axis: 'length', cm: 1300, aspect: 3.4, difficulty: 2 },
  { id: 'sailboat', en: 'Sailboat', ar: 'قارب شراعي', axis: 'height', cm: 1500, aspect: 0.6, difficulty: 3 },
];
