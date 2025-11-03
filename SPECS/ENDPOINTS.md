GET  /health
GET  /services/public                    # liste active (+category, image_url)
GET  /staff/public?serviceId=…           # staff compatibles
GET  /availability?staffId=…&date=YYYY-MM-DD
POST /appointments                       # crée (anti-chevauchement)
PATCH/DELETE /appointments/:id           # annule / met à jour
Auth JWT: POST /auth/register, /auth/login, /auth/me
Back-office (ADMIN/STAFF): CRUD services, catégories, staff, horaires, absences.
