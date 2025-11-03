# Public Assets Directory

This directory contains static assets that are served directly by the web server.

## Directory Structure

```
public/
├── favicon.ico           # Main favicon (32x32 or 16x16)
├── logo.svg             # Logo principal du site (SVG recommandé)
├── logo.png             # Logo en PNG (fallback)
├── apple-touch-icon.png # Icon pour iOS (180x180)
├── favicon-16x16.png    # Favicon 16x16
├── favicon-32x32.png    # Favicon 32x32
├── manifest.json        # Web app manifest (PWA)
├── robots.txt           # SEO: Instructions pour les robots
├── images/              # Images statiques
│   ├── hero/           # Images pour la section hero
│   ├── services/       # Images des services
│   ├── gallery/        # Galerie de photos
│   └── about/          # Images de l'équipe/salon
└── videos/             # Vidéos
    ├── hero-video.mp4  # Vidéo d'accueil
    └── testimonials/   # Vidéos témoignages
```

## Usage

### Dans votre code React/TypeScript:

```tsx
// Pour accéder aux fichiers du dossier public, utilisez des chemins absolus:
<img src="/logo.svg" alt="Eliana Beauty" />
<img src="/images/services/nails.jpg" alt="Nail Service" />
<video src="/videos/hero-video.mp4" />

// Le favicon est automatiquement chargé depuis /favicon.ico
```

## Fichiers Recommandés

### Favicons (pour tous les navigateurs/appareils):
- `favicon.ico` - 32x32 ou 16x16 (format ICO)
- `favicon-16x16.png` - 16x16 PNG
- `favicon-32x32.png` - 32x32 PNG
- `apple-touch-icon.png` - 180x180 PNG (iOS)
- `android-chrome-192x192.png` - 192x192 PNG (Android)
- `android-chrome-512x512.png` - 512x512 PNG (Android)

### Logo:
- `logo.svg` - Format vectoriel (recommandé, s'adapte à toutes tailles)
- `logo.png` - Format bitmap (backup, 512x512 ou plus)
- `logo-white.svg` - Version blanche pour fonds sombres
- `logo-dark.svg` - Version sombre pour fonds clairs

### Génération de favicons:
Utilisez un outil comme https://realfavicongenerator.net/ pour générer tous les formats nécessaires.

## Notes Importantes

1. **Chemins absolus**: Dans le code, utilisez toujours `/` au début du chemin
2. **Optimisation**: Compressez vos images avant de les ajouter
3. **Formats vidéo**: Utilisez MP4 (H.264) pour la meilleure compatibilité
4. **Nommage**: Utilisez des noms descriptifs en minuscules avec tirets (hero-banner.jpg)
