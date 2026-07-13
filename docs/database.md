# Database

Schema dikelola melalui `backend/src/database/migrations`. `synchronize` selalu `false`. Tabel utama: members/users/sessions, roles/permissions/history, bazaar events/batches/products, orders/items/history, payments/webhooks/manual verification, pickup/distribution/history, notifications/deliveries, dan audit logs.

Jalankan `npm run migration:run` dari `backend`. Production seed hanya berisi master awal dan super admin; data contoh berada di `seed:dev`. Constraint unik mencegah lebih dari satu pending aktif dan lebih dari satu pembelian berhasil per anggota/event. Backup harus konsisten dengan `--single-transaction`.
