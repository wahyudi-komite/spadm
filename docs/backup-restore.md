# Backup dan Restore

Jalankan `scripts/backup-mysql.sh` lewat cron harian dengan environment database dari file permission `600`. Default retention 14 hari. Salin backup terenkripsi ke storage di luar VPS dan uji restore berkala.

Restore ke database kosong dengan guard konfirmasi:

```bash
BACKUP_FILE=/var/backups/spadm/spadm_YYYYMMDD_HHMMSS.sql.gz \
RESTORE_CONFIRM=spadm bash scripts/restore-mysql.sh
```

Hentikan write traffic saat restore, verifikasi checksum file, ambil backup terbaru sebelum tindakan, lalu jalankan migration hanya bila versi aplikasi memerlukannya. Validasi jumlah anggota/order/payment, login, dan health check sebelum membuka traffic.
