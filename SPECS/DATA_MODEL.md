User(id,email,phone?,name,role:ADMIN|STAFF|CLIENT,locale:'en'|'he',active,createdAt)
Category(id,name,slug,active,order?,image_url?)
Service(id,category_id->Category,name,description?,duration_min,price_ils,active,image_url)
ServiceImage(id,service_id->Service,url,type:'main'|'gallery',order?,alt_text?,uploaded_at?)   # optionnel
Staff(id,name,bio?,active)
StaffService(staff_id->Staff,service_id->Service)
WorkingHours(id,staff_id->Staff,weekday(0..6),start_hhmm,end_hhmm)
TimeOff(id,staff_id->Staff,startsAt,endsAt,reason?)
Appointment(id,client_id->User,service_id->Service,staff_id->Staff?,
            startsAt,endsAt,status,notes?,source?)
Indexes:
- Appointment(staff_id,startsAt) WHERE status IN (PENDING,CONFIRMED)
Règles:
- end = start + (service.duration + Σaddons)
- UTC en DB, conversion front.
