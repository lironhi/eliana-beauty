-- Les comptes créés via Google n'ont jamais de mot de passe : la colonne
-- devient optionnelle. Changement additif et non destructeur — aucune donnée
-- existante n'est touchée, et l'ancien code continue de fonctionner puisqu'il
-- écrit toujours un mot de passe.
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
