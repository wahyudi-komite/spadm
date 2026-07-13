# Deployment

Gunakan Ubuntu LTS, Node.js 22, MySQL 8, Nginx, PM2, Certbot, dan Cloudflare. Clone ke `/var/www/spadm`, buat `backend/.env` production, install dengan `npm ci`, build kedua aplikasi, jalankan migration, lalu `pm2 startOrReload ecosystem.config.cjs --env production`.

Salin `deployment/nginx/spadm.conf` ke `/etc/nginx/sites-available/spadm`, buat symlink, validasi `nginx -t`, dan reload. Terbitkan sertifikat untuk `spadm.org` dan `api.spadm.org`. Set `COOKIE_SECURE=true`, secret acak kuat, CORS ke `https://spadm.org`, dan Swagger off.

Gunakan `scripts/deploy.sh` dari pipeline/akun deployment terbatas. Setelah deploy cek `/api/health`, login, create payment sandbox, log PM2, koneksi WhatsApp, ruang disk, dan error Nginx. Jalankan `pm2 install pm2-logrotate` dengan retention sesuai kebijakan.
