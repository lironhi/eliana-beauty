# 📁 Guide d'Organisation des Assets - Eliana Beauty

## 🎯 Où Mettre Vos Fichiers

### 📂 Dossier `public/` - Assets Statiques

Placez dans `apps/web/public/` tous les fichiers qui doivent être **servis directement sans transformation** par Vite:

#### 1. **Logo & Branding**
```
public/
├── logo.svg              # Logo principal (recommandé SVG)
├── logo.png              # Logo PNG 512x512 (fallback)
├── logo-white.svg        # Logo blanc pour fond sombre
└── logo-dark.svg         # Logo sombre pour fond clair
```

**Utilisation dans le code:**
```tsx
<img src="/logo.svg" alt="Eliana Beauty" className="h-12" />
```

#### 2. **Favicons** (Icônes du site)
```
public/
├── favicon.ico           # 32x32 ou 16x16 (format ICO)
├── favicon-16x16.png     # 16x16 PNG
├── favicon-32x32.png     # 32x32 PNG
├── apple-touch-icon.png  # 180x180 PNG (pour iOS)
├── android-chrome-192x192.png  # 192x192 PNG
└── android-chrome-512x512.png  # 512x512 PNG
```

**Génération facile:** Utilisez https://realfavicongenerator.net/
1. Uploadez votre logo
2. Téléchargez le package généré
3. Décompressez dans `public/`

#### 3. **Images Statiques**
```
public/images/
├── hero/                 # Images pour la bannière d'accueil
│   ├── banner-1.jpg
│   ├── banner-2.jpg
│   └── banner-mobile.jpg
├── services/             # Photos des services
│   ├── nails.jpg
│   ├── facial.jpg
│   └── massage.jpg
├── gallery/              # Galerie de photos
│   ├── work-1.jpg
│   ├── work-2.jpg
│   └── ...
├── team/                 # Photos de l'équipe
│   ├── stylist-1.jpg
│   └── stylist-2.jpg
└── about/                # Photos du salon
    ├── salon-interior.jpg
    └── salon-exterior.jpg
```

**Utilisation:**
```tsx
<img src="/images/services/nails.jpg" alt="Nail Service" />
<img src="/images/hero/banner-1.jpg" alt="Welcome" />
```

#### 4. **Vidéos**
```
public/videos/
├── hero-background.mp4   # Vidéo d'accueil
├── intro.mp4             # Vidéo d'introduction
└── testimonials/         # Vidéos témoignages clients
    ├── client-1.mp4
    └── client-2.mp4
```

**Utilisation:**
```tsx
<video src="/videos/hero-background.mp4" autoPlay loop muted />
```

**Formats recommandés:**
- MP4 (H.264) - Meilleure compatibilité
- WebM - Alternative moderne
- Ajoutez les deux pour maximum compatibilité

#### 5. **Fichiers de Configuration**
```
public/
├── manifest.json         # PWA manifest (✅ déjà créé)
├── robots.txt           # SEO robots (✅ déjà créé)
└── sitemap.xml          # Plan du site (à créer)
```

---

## 📦 Dossier `src/assets/` - Assets Importés

Pour les fichiers qui doivent être **optimisés et transformés** par Vite, créez:

```
apps/web/src/assets/
├── images/              # Images importées dans les composants
│   └── icons/          # Petites icônes SVG
├── fonts/               # Polices personnalisées
└── styles/              # Fichiers CSS/SCSS additionnels
```

**Utilisation (avec import):**
```tsx
import heroImg from '@/assets/images/hero.jpg';

function Hero() {
  return <img src={heroImg} alt="Hero" />;
}
```

**Avantages:**
- Optimisation automatique par Vite
- Cache-busting (hash dans le nom)
- Transformation (WebP, compression)

---

## 🎨 Exemples d'Utilisation

### Logo dans le Header
```tsx
// apps/web/src/components/Layout.tsx
<Link to="/">
  <img
    src="/logo.svg"
    alt="Eliana Beauty"
    className="h-10 md:h-12"
  />
</Link>
```

### Image de Service
```tsx
// apps/web/src/pages/Services.tsx
<div className="aspect-[4/3] overflow-hidden">
  <img
    src="/images/services/nails.jpg"
    alt="Manucure"
    className="w-full h-full object-cover"
  />
</div>
```

### Vidéo d'Accueil
```tsx
// apps/web/src/pages/Home.tsx
<video
  src="/videos/hero-background.mp4"
  className="absolute inset-0 w-full h-full object-cover"
  autoPlay
  loop
  muted
  playsInline
/>
```

### Galerie d'Images
```tsx
const galleryImages = [
  '/images/gallery/work-1.jpg',
  '/images/gallery/work-2.jpg',
  '/images/gallery/work-3.jpg',
];

{galleryImages.map((img, i) => (
  <img key={i} src={img} alt={`Gallery ${i + 1}`} />
))}
```

---

## ✅ Checklist de Configuration

### Étape 1: Créer la Structure
```bash
# Déjà fait! La structure existe dans public/
```

### Étape 2: Ajouter Vos Fichiers

**Logo & Favicons:**
1. ✅ Créez votre logo (format SVG recommandé)
2. ✅ Générez les favicons sur https://realfavicongenerator.net/
3. ✅ Placez tout dans `public/`

**Images:**
1. ✅ Compressez vos images (utilisez TinyPNG, Squoosh, etc.)
2. ✅ Nommez-les de manière descriptive: `nail-service-hero.jpg`
3. ✅ Placez-les dans les sous-dossiers appropriés

**Vidéos:**
1. ✅ Encodez en MP4 (H.264)
2. ✅ Compressez pour le web (max 1080p)
3. ✅ Placez dans `public/videos/`

### Étape 3: Optimisation

**Images:**
- Format: JPEG pour photos, PNG pour transparence, SVG pour logos
- Taille: Maximum 1920px de largeur
- Poids: Visez < 200KB par image

**Vidéos:**
- Codec: H.264
- Résolution: 1080p maximum
- Bitrate: 3-5 Mbps
- Durée: 30s maximum pour vidéos d'arrière-plan

---

## 🔧 Outils Recommandés

### Compression d'Images
- **TinyPNG**: https://tinypng.com/ (PNG/JPEG)
- **Squoosh**: https://squoosh.app/ (tous formats)
- **ImageOptim**: https://imageoptim.com/ (Mac)

### Génération de Favicons
- **RealFaviconGenerator**: https://realfavicongenerator.net/

### Compression Vidéo
- **HandBrake**: https://handbrake.fr/ (gratuit)
- **FFmpeg**: Ligne de commande pour experts

### Édition SVG
- **Figma**: https://figma.com/ (design)
- **SVGOMG**: https://jakearchibald.github.io/svgomg/ (optimisation)

---

## 📝 Notes Importantes

1. **Chemins absolus**: Utilisez `/` au début (`/logo.svg`, pas `logo.svg`)
2. **Nommage**: Minuscules avec tirets (`hero-banner.jpg`)
3. **Alt text**: Toujours ajouter un texte alternatif descriptif
4. **Lazy loading**: Utilisez `loading="lazy"` pour images hors viewport
5. **Responsive**: Fournissez plusieurs tailles avec `srcset` si possible

---

## 🚀 Prochaines Étapes

1. [ ] Créer/ajouter le logo dans `public/logo.svg`
2. [ ] Générer et ajouter les favicons
3. [ ] Ajouter les images des services
4. [ ] Créer une galerie de photos
5. [ ] Ajouter une vidéo d'accueil (optionnel)
6. [ ] Mettre à jour les meta tags avec les bons URLs
7. [ ] Créer un sitemap.xml pour le SEO

---

**Besoin d'aide?** Consultez la documentation Vite: https://vitejs.dev/guide/assets.html
