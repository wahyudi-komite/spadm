# Arsitektur

SPADM memakai modular monolith: Angular PWA memanggil satu NestJS API, sedangkan MySQL menjadi sumber data transaksional. Modul backend dipisahkan menjadi auth, members, RBAC, bazaar master, order, payment, distribution, notifications, reports, audit, dan health.

Proses kritis—checkout, webhook payment, dan konfirmasi distribusi—menggunakan transaksi serta constraint database. Pekerjaan WhatsApp masuk antrean database dan diproses scheduler agar response payment tidak menunggu koneksi eksternal. Provider QRIS dan WhatsApp berada di balik interface agar dapat diganti.

API memakai envelope konsisten, validasi DTO, JWT access token, refresh token HttpOnly, permission guard, ownership check, rate limit, Helmet, dan audit trail. Frontend memakai lazy routes, auth/permission guard, interceptor, dan service worker yang hanya cache app shell/aset statis, bukan API sensitif.
