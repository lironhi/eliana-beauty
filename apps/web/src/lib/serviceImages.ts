/**
 * Photos par défaut des prestations et des catégories.
 *
 * Les fichiers déposés dans `src/assets/services/` et `src/assets/categories/`
 * sont ramassés au build : aucune liste à tenir à jour, et Vite les compresse
 * et leur ajoute une empreinte dans le nom — changer une photo ne laisse donc
 * pas l'ancienne en cache chez les clientes.
 *
 * La clé est l'identifiant de la prestation (ou le slug de la catégorie), pas
 * son nom : en hébreu l'API renvoie `nameHe` dans le champ `name`, une clé
 * basée sur le nom se briserait donc dans une langue sur deux.
 */

type ImageMap = Record<string, string>;

function indexAssets(modules: Record<string, string>): ImageMap {
  const map: ImageMap = {};

  for (const [path, url] of Object.entries(modules)) {
    const filename = path.split('/').pop() ?? '';
    const key = filename.replace(/\.[^.]+$/, '').toLowerCase();
    map[key] = url;
  }

  return map;
}

const SERVICE_IMAGES = indexAssets(
  import.meta.glob<string>('../assets/services/*.{jpg,jpeg,png,webp,avif}', {
    eager: true,
    import: 'default',
  }),
);

const CATEGORY_IMAGES = indexAssets(
  import.meta.glob<string>('../assets/categories/*.{jpg,jpeg,png,webp,avif}', {
    eager: true,
    import: 'default',
  }),
);

/**
 * Noms de fichiers tolérés en plus du slug de la catégorie.
 *
 * Le slug en base ne colle pas toujours à l'intitulé affiché — la catégorie
 * « Eyebrows » a le slug `brows`, « Permanent Makeup » a `makeup`. Sans ces
 * alias, une photo nommée d'après le titre de la catégorie reste invisible,
 * et rien ne le signale.
 */
const CATEGORY_ALIASES: Record<string, string> = {
  eyebrows: 'brows',
  eyesbrows: 'brows',
  brow: 'brows',
  'permanent-makeup': 'makeup',
  permanentmakeup: 'makeup',
  lash: 'lashes',
  nail: 'nails',
  wax: 'waxing',
};

function categoryAsset(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const key = slug.toLowerCase();
  return CATEGORY_IMAGES[key] ?? null;
}

// Les alias sont résolus une fois pour toutes : un fichier `eyebrows.jpg`
// devient joignable sous la clé `brows`.
for (const [alias, slug] of Object.entries(CATEGORY_ALIASES)) {
  if (CATEGORY_IMAGES[alias] && !CATEGORY_IMAGES[slug]) {
    CATEGORY_IMAGES[slug] = CATEGORY_IMAGES[alias];
  }
}

interface ServiceLike {
  id?: string;
  imageUrl?: string | null;
  category?: { slug?: string | null } | null;
}

interface CategoryLike {
  slug?: string | null;
  imageUrl?: string | null;
}

/**
 * Photo à afficher pour une prestation, par ordre de priorité :
 * l'image téléversée depuis le back-office, puis la photo par défaut du
 * dossier `assets/services/`, puis celle de sa catégorie. `null` si rien n'est
 * disponible — les pages retombent alors sur leur propre habillage.
 */
export function serviceImage(service: ServiceLike): string | null {
  if (service.imageUrl) return service.imageUrl;

  const id = service.id?.toLowerCase();
  if (id) {
    // On accepte le nom de fichier avec ou sans le préfixe `svc-`, pour que
    // `manicure.jpg` marche aussi bien que `svc-nail-manicure.jpg`.
    const byId = SERVICE_IMAGES[id] ?? SERVICE_IMAGES[id.replace(/^svc-/, '')];
    if (byId) return byId;
  }

  return categoryAsset(service.category?.slug);
}

/** Photo à afficher pour une catégorie : téléversée, puis `assets/categories/`. */
export function categoryImage(category: CategoryLike): string | null {
  if (category.imageUrl) return category.imageUrl;

  return categoryAsset(category.slug);
}
