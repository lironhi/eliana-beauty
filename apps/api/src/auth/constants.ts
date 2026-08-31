export const JWT_ACCESS_TOKEN_EXPIRATION = '15m'; // 15 minutes

/**
 * Fenêtre de rafraîchissement volontairement longue : les clientes réservent
 * depuis leur propre téléphone et ne devraient pas avoir à se reconnecter entre
 * deux rendez-vous. Chaque rafraîchissement fait tourner le jeton et révoque
 * l'ancien, donc une longue fenêtre n'équivaut pas à un secret à longue vie.
 *
 * Source unique : la durée du cookie et celle enregistrée en base en dérivent.
 */
export const REFRESH_TOKEN_DAYS = 90;
export const REFRESH_TOKEN_MAX_AGE_MS = REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;

export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

/**
 * Durée de validité d'un lien de réinitialisation.
 *
 * Une heure : assez pour aller chercher le courriel sans se presser, assez
 * court pour qu'un lien resté dans une boîte partagée cesse vite de servir.
 */
export const PASSWORD_RESET_TTL_MIN = 60;
export const PASSWORD_RESET_TTL_MS = PASSWORD_RESET_TTL_MIN * 60 * 1000;

/**
 * Délai minimal entre deux demandes pour un même compte.
 *
 * Empêche d'inonder une boîte mail en martelant le formulaire, sans dépendance
 * supplémentaire côté serveur.
 */
export const PASSWORD_RESET_MIN_INTERVAL_MS = 60 * 1000;
