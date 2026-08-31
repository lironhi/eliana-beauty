# Photos par défaut des prestations

Dépose les photos ici : elles apparaissent automatiquement sur les fiches, sans
toucher au code ni à la base.

- Formats acceptés : `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` (l'extension
  n'a pas d'importance, seul le nom compte)
- Cadrage **paysage 4:3**, idéalement 1200 × 900 px, sous 300 Ko par fichier
- Inutile de les fournir toutes : une prestation sans photo retombe sur celle
  de sa catégorie (`../categories/`), puis sur l'habillage dégradé de la page

## Ordre de priorité

1. la photo téléversée depuis le back-office, si elle existe ;
2. le fichier ci-dessous ;
3. la photo de la catégorie ;
4. l'habillage dégradé.

Une photo téléversée depuis le back-office l'emporte donc toujours : ces
fichiers sont des **valeurs par défaut**, pas un verrou.

## Noms de fichiers attendus

Le nom reprend l'identifiant de la prestation, sans le préfixe `svc-`
(`svc-nail-manicure.jpg` fonctionne aussi). Les identifiants sont définis dans
`apps/api/prisma/catalog.ts`.

### Eyebrows (brows)

| Fichier attendu | Prestation | Prix |
| --- | --- | --- |
| `brow-shaping-lip.jpg` | Eyebrow Shaping + Upper Lip | ₪50 |
| `brow-color-addon.jpg` | Color Add-On | ₪20 |
| `brow-lamination.jpg` | Brow Lamination | ₪150 |

### Waxing (waxing)

| Fichier attendu | Prestation | Prix |
| --- | --- | --- |
| `wax-arms.jpg` | Arms | ₪60 |
| `wax-underarms.jpg` | Underarms | ₪30 |
| `wax-stomach.jpg` | Stomach | ₪40 |
| `wax-half-legs.jpg` | Half Legs | ₪70 |
| `wax-full-legs.jpg` | Full Legs | ₪100 |
| `wax-bikini-line.jpg` | Bikini Line | ₪60 |
| `wax-full-bikini.jpg` | Full Bikini | ₪80 |
| `wax-buttocks-strip.jpg` | Buttocks Strip | ₪50 |

### Permanent Makeup (makeup)

| Fichier attendu | Prestation | Prix |
| --- | --- | --- |
| `pmu-microblading-1.jpg` | Microblading / Microshading — First Session | ₪600 |
| `pmu-microblading-2.jpg` | Microblading / Microshading — Second Session | ₪500 |
| `pmu-microblading-extra.jpg` | Microblading / Microshading — Additional Session | ₪300 |
| `pmu-lip-blush-1.jpg` | Lip Blush — First Session | ₪500 |
| `pmu-lip-blush-2.jpg` | Lip Blush — Second Session | ₪400 |
| `pmu-lip-blush-extra.jpg` | Lip Blush — Additional Session | ₪200 |

### Lashes (lashes)

| Fichier attendu | Prestation | Prix |
| --- | --- | --- |
| `lash-lift.jpg` | Lash Lift | ₪170 |
| `lash-classic.jpg` | Lash Extensions — Classic | ₪250 |
| `lash-volume.jpg` | Lash Extensions — Volume or Mix | ₪320 |
| `lash-refill.jpg` | Lash Extensions — Refill up to 3 Weeks | ₪250 |
| `lash-removal.jpg` | Lash Extension Removal | ₪40 |

### Nails (nails)

| Fichier attendu | Prestation | Prix |
| --- | --- | --- |
| `nail-gel-extensions.jpg` | Gel Nail Extensions | ₪230 |
| `nail-gel-refill.jpg` | Gel Refill | ₪120 |
| `nail-art.jpg` | Nail Art / Design | à partir de ₪10 |
| `nail-repair.jpg` | Nail Repair | ₪5 |
| `nail-removal.jpg` | Removal | ₪40 |
| `nail-manicure.jpg` | Manicure | ₪50 |
| `nail-gel-polish.jpg` | Gel Polish / Structured Gel Manicure | ₪120 |
| `nail-acrylic-extensions.jpg` | Acrylic Nail Extensions | ₪230 |
| `nail-acrylic-refill.jpg` | Acrylic Refill | ₪120 |
