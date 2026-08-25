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
