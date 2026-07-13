# API

Base path adalah `/api`. Swagger tersedia di `/api/docs` pada development atau jika `SWAGGER_ENABLED=true`. Semua endpoint privat memakai Bearer access token; refresh token dikirim sebagai cookie HttpOnly.

Kelompok endpoint: `/auth`, `/members`, `/roles`, `/permissions`, `/bazaar/events`, `/bazaar/batches`, `/bazaar/products`, `/bazaar/orders`, `/payments`, `/bazaar/distributions`, `/notifications`, `/bazaar/reports`, dan `/health`. Response normal dibungkus `{ success, message, data }`; frontend interceptor mengambil `data`. Error berisi status, pesan aman, path, dan timestamp.
