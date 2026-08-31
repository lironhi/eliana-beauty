/**
 * Catalogue des prestations du salon.
 *
 * Source unique : le seed en dérive, et les identifiants sont stables pour
 * qu'une nouvelle exécution mette à jour les fiches existantes plutôt que d'en
 * créer des doublons.
 *
 * `durationMin` est une estimation métier — les durées n'ont pas été fournies
 * avec les tarifs. Elles pilotent la largeur des créneaux dans le calendrier :
 * à corriger ici, ou depuis le back-office, dès qu'Eliana a les vraies.
 */

export interface CatalogService {
  id: string;
  name: string;
  nameHe: string;
  durationMin: number;
  priceIls: number;
  /** Tarif « à partir de » : la prestation est facturée dans une fourchette. */
  priceFrom?: boolean;
}

export interface CatalogCategory {
  /** Réutilise les slugs déjà en base pour ne pas laisser de catégorie orpheline. */
  slug: string;
  name: string;
  nameHe: string;
  order: number;
  services: CatalogService[];
}

export const CATALOG: CatalogCategory[] = [
  {
    slug: 'brows',
    name: 'Eyebrows',
    nameHe: 'גבות',
    order: 1,
    services: [
      {
        id: 'svc-brow-shaping-lip',
        name: 'Eyebrow Shaping + Upper Lip',
        nameHe: 'עיצוב גבות + שפם',
        durationMin: 30,
        priceIls: 50,
      },
      {
        id: 'svc-brow-color-addon',
        name: 'Color Add-On',
        nameHe: 'תוספת צבע',
        durationMin: 15,
        priceIls: 20,
      },
      {
        id: 'svc-brow-lamination',
        name: 'Brow Lamination',
        nameHe: 'למינציה לגבות',
        durationMin: 60,
        priceIls: 150,
      },
    ],
  },
  {
    slug: 'waxing',
    name: 'Waxing',
    nameHe: 'הסרת שיער בשעווה',
    order: 2,
    services: [
      { id: 'svc-wax-arms', name: 'Arms', nameHe: 'ידיים', durationMin: 30, priceIls: 60 },
      {
        id: 'svc-wax-underarms',
        name: 'Underarms',
        nameHe: 'בית שחי',
        durationMin: 15,
        priceIls: 30,
      },
      { id: 'svc-wax-stomach', name: 'Stomach', nameHe: 'בטן', durationMin: 15, priceIls: 40 },
      {
        id: 'svc-wax-half-legs',
        name: 'Half Legs',
        nameHe: 'חצי רגליים',
        durationMin: 30,
        priceIls: 70,
      },
      {
        id: 'svc-wax-full-legs',
        name: 'Full Legs',
        nameHe: 'רגליים מלאות',
        durationMin: 45,
        priceIls: 100,
      },
      {
        id: 'svc-wax-bikini-line',
        name: 'Bikini Line',
        nameHe: 'קו ביקיני',
        durationMin: 20,
        priceIls: 60,
      },
      {
        id: 'svc-wax-full-bikini',
        name: 'Full Bikini',
        nameHe: 'ביקיני מלא',
        durationMin: 30,
        priceIls: 80,
      },
      {
        id: 'svc-wax-buttocks-strip',
        name: 'Buttocks Strip',
        nameHe: 'פס ישבן',
        durationMin: 15,
        priceIls: 50,
      },
    ],
  },
  {
    slug: 'makeup',
    name: 'Permanent Makeup',
    nameHe: 'איפור קבוע',
    order: 3,
    services: [
      {
        id: 'svc-pmu-microblading-1',
        name: 'Microblading / Microshading — First Session',
        nameHe: 'מיקרובליידינג / מיקרושיידינג — מפגש ראשון',
        durationMin: 150,
        priceIls: 600,
      },
      {
        id: 'svc-pmu-microblading-2',
        name: 'Microblading / Microshading — Second Session',
        nameHe: 'מיקרובליידינג / מיקרושיידינג — מפגש שני',
        durationMin: 120,
        priceIls: 500,
      },
      {
        id: 'svc-pmu-microblading-extra',
        name: 'Microblading / Microshading — Additional Session',
        nameHe: 'מיקרובליידינג / מיקרושיידינג — מפגש נוסף',
        durationMin: 90,
        priceIls: 300,
      },
      {
        id: 'svc-pmu-lip-blush-1',
        name: 'Lip Blush — First Session',
        nameHe: 'ליפ בלאש — מפגש ראשון',
        durationMin: 150,
        priceIls: 500,
      },
      {
        id: 'svc-pmu-lip-blush-2',
        name: 'Lip Blush — Second Session',
        nameHe: 'ליפ בלאש — מפגש שני',
        durationMin: 120,
        priceIls: 400,
      },
      {
        id: 'svc-pmu-lip-blush-extra',
        name: 'Lip Blush — Additional Session',
        nameHe: 'ליפ בלאש — מפגש נוסף',
        durationMin: 90,
        priceIls: 200,
      },
    ],
  },
  {
    slug: 'lashes',
    name: 'Lashes',
    nameHe: 'ריסים',
    order: 4,
    services: [
      {
        id: 'svc-lash-lift',
        name: 'Lash Lift',
        nameHe: 'הרמת ריסים',
        durationMin: 60,
        priceIls: 170,
      },
      {
        id: 'svc-lash-classic',
        name: 'Lash Extensions — Classic',
        nameHe: 'תוספות ריסים — קלאסי',
        durationMin: 120,
        priceIls: 250,
      },
      {
        id: 'svc-lash-volume',
        name: 'Lash Extensions — Volume or Mix',
        nameHe: 'תוספות ריסים — וולום או מיקס',
        durationMin: 150,
        priceIls: 320,
      },
      {
        id: 'svc-lash-refill',
        name: 'Lash Extensions — Refill up to 3 Weeks',
        nameHe: 'מילוי ריסים עד 3 שבועות',
        durationMin: 90,
        priceIls: 250,
      },
      {
        id: 'svc-lash-removal',
        name: 'Lash Extension Removal',
        nameHe: 'הסרת תוספות ריסים',
        durationMin: 30,
        priceIls: 40,
      },
    ],
  },
  {
    slug: 'nails',
    name: 'Nails',
    nameHe: 'ציפורניים',
    order: 5,
    services: [
      {
        id: 'svc-nail-gel-extensions',
        name: 'Gel Nail Extensions',
        nameHe: "תוספות ציפורניים בג'ל",
        durationMin: 120,
        priceIls: 230,
      },
      {
        id: 'svc-nail-gel-refill',
        name: 'Gel Refill',
        nameHe: "מילוי ג'ל",
        durationMin: 90,
        priceIls: 120,
      },
      {
        // ₪10 à ₪50 selon le motif : on stocke le plancher avec priceFrom.
        id: 'svc-nail-art',
        name: 'Nail Art / Design',
        nameHe: 'עיצוב ציפורניים',
        durationMin: 15,
        priceIls: 10,
        priceFrom: true,
      },
      {
        id: 'svc-nail-repair',
        name: 'Nail Repair',
        nameHe: 'תיקון ציפורן',
        durationMin: 15,
        priceIls: 5,
      },
      { id: 'svc-nail-removal', name: 'Removal', nameHe: 'הסרה', durationMin: 30, priceIls: 40 },
      {
        id: 'svc-nail-manicure',
        name: 'Manicure',
        nameHe: 'מניקור',
        durationMin: 30,
        priceIls: 50,
      },
      {
        id: 'svc-nail-gel-polish',
        name: 'Gel Polish / Structured Gel Manicure',
        nameHe: "לק ג'ל / מניקור ג'ל בונה",
        durationMin: 90,
        priceIls: 120,
      },
      {
        id: 'svc-nail-acrylic-extensions',
        name: 'Acrylic Nail Extensions',
        nameHe: 'תוספות ציפורניים באקריל',
        durationMin: 120,
        priceIls: 230,
      },
      {
        id: 'svc-nail-acrylic-refill',
        name: 'Acrylic Refill',
        nameHe: 'מילוי אקריל',
        durationMin: 90,
        priceIls: 120,
      },
    ],
  },
];
