# SPADM

Super app resmi Serikat Pekerja Astra Daihatsu Motor. Modul pertama adalah Bazar HUT SPADM dengan login NPK, master anggota, RBAC dinamis, QRIS, QR pengambilan, distribusi area, notifikasi WhatsApp, dan laporan.

## Stack

- Frontend: Angular 19 standalone, Fuse, Angular Material, Tailwind, PWA.
- Backend: NestJS 11, TypeORM, MySQL 8, JWT/refresh cookie, Swagger.
- Operasional: PM2 cluster, Nginx, Cloudflare/HTTPS, GitHub Actions.

## Struktur

- `frontend/starter`: aplikasi Angular.
- `backend`: API NestJS, migration, dan seeder.
- `docs`: arsitektur dan panduan operasional.
- `deployment`: konfigurasi server.
- `scripts`: deployment dan backup.

## Development

Requirement: Node.js 22, npm, dan MySQL 8.

```bash
cp backend/.env.example backend/.env
npm --prefix backend install
npm --prefix frontend/starter install
npm --prefix backend run migration:run
npm --prefix backend run seed:dev
npm --prefix backend run start:dev
npm --prefix frontend/starter start
```

Isi seluruh secret di `backend/.env`; file tersebut tidak boleh di-commit. API berjalan di `http://localhost:3000/api`, frontend di `http://localhost:4200`, dan Swagger development di `/api/docs`.

Production seed membuat super admin NPK `23893` dan `15012`; keduanya wajib mengganti password awal. Jangan memakai password default di luar bootstrap terkontrol.

## Build dan verifikasi

```bash
npm --prefix backend run build
npm --prefix backend test -- --runInBand
npm --prefix frontend/starter run build
npm --prefix frontend/starter test -- --watch=false
```

## Production

Build frontend disajikan oleh Nginx dan API dijalankan PM2:

```bash
npm --prefix backend ci
npm --prefix backend run build
npm --prefix frontend/starter ci
npm --prefix frontend/starter run build
npm --prefix backend run migration:run
pm2 startOrReload ecosystem.config.cjs --env production
```

Pasang [konfigurasi Nginx](deployment/nginx/spadm.conf), aktifkan TLS, lalu cek `GET /api/health`. Detail tersedia di [deployment](docs/deployment.md) dan [backup/restore](docs/backup-restore.md).

## Troubleshooting

- API gagal start: cek environment wajib, koneksi MySQL, dan migration.
- Login berulang: cek domain, HTTPS, `COOKIE_SECURE=true`, dan CORS `APP_URL`.
- WhatsApp belum kirim: lihat endpoint monitoring, scan QR Baileys, dan pastikan session path writable.
- PWA belum update: buka ulang setelah notifikasi versi baru; jangan cache response `/api` di proxy.
