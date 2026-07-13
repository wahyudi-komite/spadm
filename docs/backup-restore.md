# Backup dan Restore

Jalankan `scripts/backup-mysql.sh` lewat cron harian dengan environment database dari file permission `600`. Default retention 14 hari. Salin backup terenkripsi ke storage di luar VPS dan uji restore berkala.

Restore ke database kosong:

```bash
gunzip -c /var/backups/spadm/spadm_YYYYMMDD_HHMMSS.sql.gz | mysql -h HOST -u USER -p DATABASE
```

Hentikan write traffic saat restore, verifikasi checksum file, ambil backup terbaru sebelum tindakan, lalu jalankan migration hanya bila versi aplikasi memerlukannya. Validasi jumlah anggota/order/payment, login, dan health check sebelum membuka traffic.
