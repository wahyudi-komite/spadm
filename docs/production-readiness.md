# Production Readiness Phase 10

Dokumen ini adalah release gate SPADM. Semua item kritis harus lulus sebelum traffic production dibuka.

## Automated Gate

- Backend build, unit test, migration, dan e2e health smoke test lulus di GitHub Actions.
- Frontend production build dan test ChromeHeadless lulus.
- Endpoint '/api/health/live' dipakai untuk liveness proses.
- Endpoint '/api/health/ready' harus HTTP 200 dan database terhubung sebelum instance menerima traffic.

## Security Gate

- Semua secret production unik, acak, minimal 32 karakter, dan tidak tersimpan di Git.
- COOKIE_SECURE aktif; APP_URL atau semua CORS_ORIGINS menggunakan HTTPS.
- Swagger production nonaktif kecuali dibuka sementara melalui SWAGGER_ENABLED.
- Nginx, Cloudflare, dan Nest throttling aktif; origin HTTP dan Socket.IO dibatasi.
- Akun bootstrap mengganti password awal dan assignment role ditinjau.
- Payment webhook signature, izin upload, dan endpoint admin diuji dengan akun tanpa izin.

## Performance Gate

- DB_POOL_SIZE disesuaikan dengan kapasitas MySQL dan jumlah worker PM2.
- Query dashboard/report diuji memakai data representatif dan slow query log ditinjau.
- Migration performance menambahkan indeks untuk queue lease, distribusi harian, filter laporan order, dan tren pembayaran.
- Ukuran bundle frontend tetap di bawah budget Angular.
- CPU, memory, disk, latency p95, error rate, dan antrean notifikasi dipantau saat smoke/load test.

## Deployment And Rollback

1. Ambil backup dan simpan checksum di storage luar VPS.
2. Pastikan CI commit target hijau dan migration telah direview.
3. Jalankan 'scripts/deploy.sh' dengan akun deployment terbatas.
4. Verifikasi readiness, login, payment sandbox, notifikasi, scanner, dan laporan.
5. Jika smoke test gagal, hentikan traffic, kembalikan commit/release sebelumnya, lalu restore database hanya bila migration tidak backward-compatible.

## Backup Drill

- Backup MySQL berjalan harian dengan retention minimal 14 hari.
- Salinan terenkripsi tersedia di lokasi berbeda.
- Restore drill dilakukan berkala ke database non-production menggunakan 'scripts/restore-mysql.sh'.
- Setelah restore, validasi jumlah member, order, payment, distribusi, login, dan readiness.

## Sign-off

Catat commit, waktu deploy, operator, hasil CI, lokasi backup, hasil smoke test, dan keputusan go/no-go pada tiket release.
