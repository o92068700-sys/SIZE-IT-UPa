import { Globe2, Landmark, PawPrint, Shapes, type LucideIcon } from 'lucide-react';
import { ANIMAL_OBJECTS } from '@/data/objects/animals';
import {
  MAP_EASY_OBJECTS,
  MAP_HARD_OBJECTS,
  MAP_MEDIUM_OBJECTS,
} from '@/data/objects/countries';
import { LANDMARK_OBJECTS } from '@/data/objects/landmarks';
import { MIXED_OBJECTS } from '@/data/objects/mixed';
import type { CategoryId, ObjectEntry } from '@/types/game';

export interface Category {
  id: CategoryId;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  icon: LucideIcon;
  objects: ObjectEntry[];
  /** Optional showcase ids for the landing card; falls back to the first four. */
  sampleIds?: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'mixed',
    name: 'Cross-Domain',
    nameAr: 'عوالم مختلطة',
    description:
      'Everything against everything: animals, buildings, aircraft, ships and everyday objects. Maximum surprise.',
    descriptionAr:
      'كل شي ضد كل شي: حيوانات وأبنية وطيّارات وسفن وأشياء يومية. الدهشة بحدّاها.',
    icon: Shapes,
    objects: MIXED_OBJECTS,
    sampleIds: ['watermelon', 'electric_guitar', 'basketball_hoop', 'blue_whale'],
  },
  {
    id: 'animals',
    name: 'Living World',
    nameAr: 'كائنات حيّة',
    description: 'From a house cat to a blue whale — judge them with your eye, not a labelled ruler.',
    descriptionAr: 'من قطة بيتية لحوت أزرق — احكم بعينك، مش بمسطرة عليها أرقام.',
    icon: PawPrint,
    objects: ANIMAL_OBJECTS,
    sampleIds: ['cat', 'tiger', 'giraffe', 'blue_whale'],
  },
  {
    id: 'landmarks',
    name: 'Buildings & Monuments',
    nameAr: 'أبنية ومعالم',
    description: 'Climb from a statue to the tallest towers, one silhouette at a time.',
    descriptionAr: 'اتسلق من تمثال لأعلى الأبراج، ظل ورا ظل.',
    icon: Landmark,
    objects: LANDMARK_OBJECTS,
    sampleIds: ['dome-of-the-rock', 'sydney_opera', 'great-pyramid', 'burj-khalifa'],
  },
  {
    id: 'maps-easy',
    name: 'World Maps — Easy',
    nameAr: 'خرائط العالم — سهل',
    description: 'Familiar giants with iconic outlines. Start with countries everyone recognises.',
    descriptionAr: 'دول كبيرة ومشهورة وحدود يعرفها الكل. ابدأ من هون.',
    icon: Globe2,
    objects: MAP_EASY_OBJECTS,
    sampleIds: ['ru', 'ca', 'cn', 'us'],
  },
  {
    id: 'maps-medium',
    name: 'World Maps — Medium',
    nameAr: 'خرائط العالم — متوسط',
    description: 'Large and mid-sized countries whose areas sit much closer together.',
    descriptionAr: 'دول كبيرة ومتوسطة، ومساحاتها أقرب لبعضها.',
    icon: Globe2,
    objects: MAP_MEDIUM_OBJECTS,
    sampleIds: ['kz', 'dz', 'cd', 'ly'],
  },
  {
    id: 'maps-hard',
    name: 'World Maps — Hard',
    nameAr: 'خرائط العالم — صعب',
    description: 'Near-tied areas and less familiar outlines. Every pixel counts.',
    descriptionAr: 'مساحات متقاربة كتير وحدود أقل شهرة. كل بيكسل مهم.',
    icon: Globe2,
    objects: MAP_HARD_OBJECTS,
    sampleIds: ['zw', 'no', 'vn', 'fi'],
  },
];
