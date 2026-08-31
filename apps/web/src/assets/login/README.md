# Photos de la page de connexion

Dépose ici les photos du salon : elles apparaissent automatiquement dans le
panneau de gauche de `/login`, en diaporama, sans toucher au code.

- Formats acceptés : `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`
- L'ordre suit le nom du fichier — nomme-les `01-…`, `02-…`, `03-…`
- Cadrage **portrait** (le panneau est plus haut que large), idéalement
  1200 × 1600 px, compressées sous 300 Ko chacune
- Tant que ce dossier est vide, la page retombe sur `public/videos/studio1.mp4`

Les images sont récupérées par `import.meta.glob` dans `src/pages/Login.tsx` :
Vite les compresse et leur ajoute une empreinte au build, donc pas de cache
périmé chez les clientes après un changement de photo.
