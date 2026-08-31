# Photos par défaut des catégories

Une photo par catégorie, nommée d'après son **slug**. Elle sert de repli pour
toutes les prestations de la catégorie qui n'ont pas leur propre photo — cinq
fichiers suffisent donc à ce qu'aucune fiche ne reste sans image.

| Fichier attendu | Catégorie |
| --- | --- |
| `brows.jpg` | Eyebrows |
| `waxing.jpg` | Waxing |
| `makeup.jpg` | Permanent Makeup |
| `lashes.jpg` | Lashes |
| `nails.jpg` | Nails |

Quelques variantes de nommage sont tolérées — `eyebrows`, `permanent-makeup`,
`nail`, `wax`, `lash` — mais le slug reste le nom sûr.

Formats acceptés : `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.
Cadrage **paysage 4:3**, idéalement 1200 × 900 px, sous 300 Ko.

Attention : une image téléversée depuis le back-office est **prioritaire** sur
ces fichiers. Si une photo d'ici ne s'affiche pas, c'est en général que la
catégorie porte encore une `imageUrl` en base.

`_originals/` conserve les PNG d'origine, hors du dossier scanné : ils ne
partent donc pas dans le site livré.
