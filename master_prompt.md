# MASTER PROMPT DEVELOPMENT — SPADM SUPER APP

Anda adalah **Senior Full-Stack Engineer, Software Architect, UI/UX Designer, Database Architect, DevOps Engineer, dan Security Engineer**.

Tugas Anda adalah membangun aplikasi bernama:

# SPADM

SPADM adalah aplikasi resmi untuk organisasi:

**Serikat Pekerja Astra Daihatsu Motor**

Aplikasi ini akan digunakan oleh sekitar **6.000 anggota** dan akan berkembang menjadi sebuah **super app organisasi** yang memiliki banyak modul, antara lain:

* Keanggotaan.
* Bazar anggota.
* Event organisasi.
* Mubes SPADM.
* Keuangan.
* Absensi.
* Merchandise.
* Aspirasi anggota.
* Bantuan sosial.
* Pengumuman.
* Dokumen dan notulen.
* Voting atau musyawarah.
* Reimbursement.
* Modul organisasi lainnya di masa depan.

Fitur pertama yang harus dikembangkan adalah:

# Bazar HUT SPADM ke-21

Jangan membangun aplikasi sebagai aplikasi bazar terpisah.

Bangun Bazar SPADM sebagai salah satu modul di dalam aplikasi utama SPADM dengan satu sistem login, satu master anggota, satu sistem role dan permission, serta satu backend terintegrasi.

---

# 1. TUJUAN PROJECT

Bangun aplikasi web responsif dan PWA yang dapat digunakan dari desktop maupun smartphone.

Aplikasi harus:

* Mudah digunakan oleh anggota.
* Mobile-first.
* Aman.
* Modular.
* Mudah dikembangkan.
* Siap digunakan oleh sekitar 6.000 anggota.
* Mampu menangani sekitar 100 pengguna aktif secara bersamaan.
* Memiliki arsitektur yang terstruktur.
* Menggunakan coding standard yang baik.
* Tidak menggunakan hardcode untuk data bisnis yang seharusnya dapat dikonfigurasi admin.
* Memiliki audit trail.
* Memiliki role dan permission dinamis.
* Memiliki dokumentasi instalasi dan deployment.

---

# 2. REPOSITORY DAN STRUKTUR PROJECT

Gunakan repository yang sudah tersedia:

```text
https://github.com/wahyudi-komite/spadm
```

Gunakan satu repository dengan frontend dan backend pada folder yang berbeda.

Struktur awal:

```text
spadm/
├── frontend/
├── backend/
├── docs/
├── deployment/
├── scripts/
├── storage/
├── .github/
│   └── workflows/
├── .env.example
├── docker-compose.yml
└── README.md
```

## Ketentuan penting frontend

Di folder frontend sudah tersedia template UI.

Jangan mengganti template tersebut dengan template baru.

Lakukan langkah berikut:

1. Analisis struktur template frontend yang tersedia.
2. Identifikasi versi Angular dan library yang dipakai.
3. Pertahankan layout, navigation, component style, typography, theme, dan struktur template.
4. Integrasikan halaman baru ke dalam template tersebut.
5. Jangan melakukan rewrite besar jika tidak diperlukan.
6. Gunakan komponen yang sudah tersedia di template sebelum membuat komponen baru.
7. Pertahankan dark mode apabila tersedia.
8. Pertahankan responsive behavior bawaan template.
9. Jangan menghapus fitur template yang belum digunakan tanpa alasan yang jelas.

---

# 3. TECHNOLOGY STACK

## Frontend

Gunakan:

* Angular standalone.
* TypeScript strict mode.
* Template Angular yang sudah tersedia.
* Angular Material.
* Tailwind CSS.
* Reactive Forms.
* Angular Signals jika sesuai.
* Route lazy loading.
* HTTP interceptor.
* Auth guard.
* Role dan permission guard.
* PWA.
* Responsive mobile-first.
* QR code generator.
* QR scanner berbasis kamera perangkat.
* Chart library yang cocok dengan template.
* Export Excel.
* Export PDF.
* State management yang sederhana dan maintainable.

Jangan menambahkan state management kompleks jika belum diperlukan.

## Backend

Gunakan:

* NestJS.
* TypeScript strict mode.
* TypeORM.
* MySQL.
* JWT access token.
* Refresh token.
* HttpOnly cookie.
* Argon2 atau bcrypt untuk password hashing.
* Class Validator.
* Class Transformer.
* Swagger/OpenAPI.
* Scheduler menggunakan `@nestjs/schedule`.
* Rate limiting.
* File upload untuk Excel dan gambar.
* PDF generator.
* Excel export.
* QR token generator.
* Webhook payment gateway.
* WhatsApp integration menggunakan Baileys.
* Logging yang terstruktur.
* Audit trail.
* Database transaction.
* Migration dan seeder.

## Infrastruktur

Gunakan:

* VPS internet.
* Ubuntu Server.
* Nginx reverse proxy.
* PM2.
* MySQL.
* Cloudflare.
* SSL HTTPS.
* GitHub Actions.
* Domain utama:

```text
spadm.org
```

Contoh subdomain:

```text
spadm.org
api.spadm.org
```

---

# 4. ARSITEKTUR MODULAR

Gunakan pendekatan modular.

Struktur backend yang disarankan:

```text
backend/src/
├── app.module.ts
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── pipes/
│   ├── constants/
│   ├── enums/
│   ├── helpers/
│   └── interfaces/
├── config/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── members/
│   ├── roles/
│   ├── permissions/
│   ├── organizations/
│   ├── notifications/
│   ├── audit-logs/
│   ├── files/
│   ├── settings/
│   ├── bazaar/
│   │   ├── events/
│   │   ├── batches/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── distributions/
│   │   ├── subsidies/
│   │   └── reports/
│   └── health/
└── main.ts
```

Frontend juga harus modular:

```text
frontend/src/app/
├── core/
├── shared/
├── layout/
├── modules/
│   ├── authentication/
│   ├── dashboard/
│   ├── profile/
│   ├── bazaar/
│   ├── administration/
│   ├── membership/
│   ├── finance/
│   ├── events/
│   └── reports/
└── app.routes.ts
```

---

# 5. AUTHENTICATION DAN MASTER ANGGOTA

Data sekitar 6.000 anggota tersedia dalam Excel.

Kolom data anggota:

```text
Nama
Email
NPK
Unit Kerja
Nomor WhatsApp
Status
Jabatan Organisasi
Plant
```

## Login

Gunakan:

```text
Username: NPK
Default password: SmartCare
```

Password wajib disimpan dalam bentuk hash.

Jangan pernah menyimpan password dalam plain text.

Saat login pertama:

1. Anggota login menggunakan NPK dan password default.
2. Sistem meminta anggota mengganti password.
3. Anggota memverifikasi atau memperbarui nomor WhatsApp.
4. Anggota menyetujui ketentuan penggunaan aplikasi.
5. Setelah selesai, anggota dapat masuk ke dashboard.

Sediakan:

* Login.
* Logout.
* Refresh session.
* Ganti password.
* Lupa password.
* Reset password melalui WhatsApp.
* Reset password oleh admin.
* Pengelolaan beberapa session/perangkat.
* Riwayat login.
* Logout dari perangkat tertentu.
* Logout dari seluruh perangkat.

Satu akun boleh login dari beberapa perangkat.

## Status anggota

Anggota dengan status tidak aktif:

* Tidak boleh mengikuti bazar.
* Tidak boleh checkout.
* Dapat dibatasi dari modul tertentu.
* Tetap disimpan dalam histori database.
* Tidak dihapus permanen.

## Import anggota dari Excel

Buat fitur import Excel dengan flow:

1. Admin upload file Excel.
2. Sistem memvalidasi header.
3. Sistem menampilkan preview.
4. Sistem menampilkan data valid dan invalid.
5. Sistem mendeteksi NPK duplikat.
6. Sistem menampilkan perubahan sebelum import.
7. Admin mengonfirmasi import.
8. Sistem memproses import.
9. Sistem menyediakan laporan hasil import.

Aturan import:

```text
NPK baru              → create member
NPK sudah tersedia    → update member
NPK tidak ada di file → jangan otomatis dihapus
Status tidak aktif    → nonaktifkan anggota
```

Simpan histori perubahan data anggota.

---

# 6. ROLE DAN PERMISSION

Gunakan Role-Based Access Control dengan permission yang granular.

Role awal:

```text
SUPER_ADMIN
BAZAAR_ADMIN
FINANCE_ADMIN
AREA_PIC
LEADERSHIP
MEMBER
```

Super Admin awal:

```text
NPK 23893
NPK 15012
```

Contoh permission:

```text
member.read
member.create
member.update
member.import
member.reset_password
member.assign_role

role.read
role.create
role.update
role.assign

bazaar.event.read
bazaar.event.create
bazaar.event.update

bazaar.batch.read
bazaar.batch.create
bazaar.batch.open
bazaar.batch.close
bazaar.batch.distribute

bazaar.product.read
bazaar.product.create
bazaar.product.update
bazaar.product.delete

bazaar.order.read
bazaar.order.create
bazaar.order.cancel

bazaar.payment.read
bazaar.payment.manual_verify

bazaar.distribution.read
bazaar.distribution.scan
bazaar.distribution.confirm

bazaar.report.read
bazaar.report.export

finance.dashboard.read
audit.read
settings.manage
```

Role dan permission harus dapat dikonfigurasi melalui halaman admin.

Hak akses dapat berubah berdasarkan:

* Jabatan organisasi.
* Kepanitiaan.
* Area.
* Plant.
* Modul.
* Periode berlaku.

Simpan histori:

```text
User
Role
Area
Tanggal mulai
Tanggal selesai
Status
Diberikan oleh
Dicabut oleh
Alasan
Timestamp
```

Seorang anggota dapat memiliki lebih dari satu role pada waktu yang sama.

Contoh:

```text
MEMBER
AREA_PIC P2
BAZAAR_COMMITTEE
```

---

# 7. MODUL BAZAR HUT SPADM KE-21

Nama event:

```text
Bazar HUT SPADM ke-21
```

Bazar harus dibuat menggunakan konsep:

```text
Bazaar Event
→ Batch
→ Products
→ Orders
→ Payments
→ Pickup QR
→ Distribution
→ Reports
```

Jangan membuat Batch 1 dan Batch 2 secara hardcode.

Admin harus dapat membuat Batch 3 dan batch berikutnya tanpa perubahan source code.

---

# 8. PRODUK BAZAR

Produk awal:

| Produk |    Harga |
| ------ | -------: |
| Minyak | Rp50.000 |
| Beras  | Rp75.000 |
| Gula   | Rp30.000 |

Detail merek dan ukuran belum ditentukan.

Gunakan ilustrasi produk placeholder yang profesional dan mudah diganti oleh admin.

Setiap produk memiliki field:

```text
id
event_id
name
slug
sku
description
normal_price
selling_price
image_url
maximum_quantity_per_member
inventory_mode
stock
is_active
display_order
created_at
updated_at
deleted_at
```

Admin dapat:

* Menambah produk.
* Mengubah produk.
* Menghapus secara soft delete.
* Mengunggah foto.
* Mengubah harga.
* Mengubah deskripsi.
* Mengubah status aktif.
* Mengubah urutan.
* Mengatur maksimal pembelian.
* Mengatur produk tersedia pada batch tertentu.

Untuk event saat ini:

```text
maximum_quantity_per_member = 1
inventory_mode = UNLIMITED
```

Siapkan inventory mode:

```text
UNLIMITED
GLOBAL_STOCK
AREA_STOCK
```

Walaupun event sekarang tidak menggunakan stok, struktur harus siap digunakan untuk event selanjutnya.

---

# 9. ATURAN PEMBELIAN

Anggota dapat memilih:

* Minyak saja.
* Beras saja.
* Gula saja.
* Dua produk.
* Semua produk.

Aturan:

* Minimal memilih satu produk.
* Maksimal satu unit untuk setiap produk.
* Semua anggota mendapatkan harga yang sama.
* Tidak ada ongkir.
* Tidak ada pilihan alamat pengiriman.
* Barang didistribusikan melalui area masing-masing.
* Anggota hanya boleh memiliki satu transaksi pending aktif.
* Anggota hanya boleh berhasil membeli satu kali untuk seluruh event.

Aturan utama:

```text
Jika anggota telah memiliki pembayaran berhasil pada Batch 1,
anggota tidak boleh membeli lagi pada Batch 2, Batch 3,
atau batch lain dalam event yang sama.
```

Status yang dianggap telah membeli adalah:

```text
PAYMENT SUCCESS / PAID
```

Transaksi pending atau expired tidak menghilangkan hak membeli.

Namun anggota tidak boleh membuat dua transaksi pending pada waktu yang sama.

---

# 10. PERHITUNGAN CHECKOUT

Komponen perhitungan:

```text
Subtotal produk
+ Goodie bag Rp3.000
+ Biaya aplikasi Rp1.000
- Subsidi SPADM Rp20.000
= Total pembayaran
```

Goodie bag:

```text
Rp3.000
Wajib
Tidak dapat dihapus
Satu kali per transaksi
```

Biaya aplikasi:

```text
Rp1.000
Wajib
Ditampilkan transparan
Digunakan untuk membantu menutup biaya transaksi QRIS
```

Subsidi:

```text
Rp20.000
Satu kali per transaksi
Berlaku apa pun kombinasi produknya
Harus dicatat sebagai laporan subsidi SPADM
```

Contoh perhitungan:

| Produk         |     Total |
| -------------- | --------: |
| Gula           |  Rp14.000 |
| Minyak         |  Rp34.000 |
| Beras          |  Rp59.000 |
| Minyak + Gula  |  Rp64.000 |
| Beras + Gula   |  Rp89.000 |
| Minyak + Beras | Rp109.000 |
| Semua produk   | Rp139.000 |

Simpan snapshot nominal ke dalam order agar histori transaksi tidak berubah walaupun harga produk diubah kemudian.

Order harus menyimpan:

```text
product subtotal
goodie bag fee
application fee
subsidy
grand total
product price snapshot
product name snapshot
```

Jangan menghitung ulang histori menggunakan harga produk terbaru.

---

# 11. CHECKOUT FLOW

Flow anggota:

```text
Login
→ Membuka menu Bazar SPADM
→ Melihat banner HUT SPADM ke-21
→ Melihat status batch
→ Memilih produk
→ Melihat keranjang
→ Melihat rincian biaya
→ Menyetujui syarat
→ Checkout
→ Order dibuat
→ QRIS dinamis dibuat
→ Menunggu pembayaran
→ Pembayaran berhasil
→ Mendapat notifikasi
→ Mendapat bukti pembayaran
→ Mendapat QR pengambilan
→ Mengambil barang di area
```

Sebelum checkout, anggota wajib mencentang persetujuan:

```text
Saya memahami bahwa pembelian hanya dapat dilakukan satu kali.

Saya memahami bahwa pesanan yang sudah dibayar tidak dapat diubah,
dibatalkan, atau dikembalikan.

Saya memahami bahwa pengambilan barang dilakukan sesuai area yang
ditentukan berdasarkan data anggota.

Saya memahami bahwa pengambilan barang tidak dapat diwakilkan.

Saya wajib menunjukkan QR pengambilan dan identitas anggota kepada PIC.
```

Tombol checkout harus disabled sebelum persetujuan dicentang.

---

# 12. ORDER DAN STATUS TRANSAKSI

Pisahkan status order, payment, dan distribution.

## Order status

```text
DRAFT
PENDING_PAYMENT
CONFIRMED
CANCELLED
EXPIRED
COMPLETED
```

## Payment status

```text
UNPAID
PENDING
PAID
EXPIRED
FAILED
MANUAL_VERIFIED
REFUNDED
```

Refund disiapkan di struktur database, tetapi tidak tersedia pada menu normal karena aturan event tidak memperbolehkan refund.

## Distribution status

```text
NOT_READY
WAITING_PICKUP
DISTRIBUTED
```

Contoh setelah pembayaran berhasil:

```text
order_status        = CONFIRMED
payment_status      = PAID
distribution_status = WAITING_PICKUP
```

Anggota dapat melihat:

* Nomor transaksi.
* Tanggal transaksi.
* Produk.
* Rincian biaya.
* Status pembayaran.
* QRIS.
* Waktu kedaluwarsa.
* QR pengambilan.
* Jadwal distribusi.
* Histori transaksi.

---

# 13. NOMOR TRANSAKSI

Gunakan nomor transaksi yang mudah dibaca.

Format awal:

```text
BZR21-B01-P2-2026000123
```

Struktur:

```text
BZR21  = Bazar HUT SPADM ke-21
B01    = Batch
P2     = Area distribusi
2026   = Tahun
000123 = Nomor urut
```

Nomor transaksi harus unik.

Gunakan database-safe sequence atau mekanisme yang aman dari duplicate number saat request bersamaan.

---

# 14. BATCH BAZAR

Event awal direncanakan memiliki dua batch.

## Batch 1

* Pembelian dibuka selama dua minggu.
* Minggu ketiga digunakan untuk distribusi.
* Setelah periode pembelian selesai, admin menutup pembelian.

## Batch 2

* Pembelian dibuka pada minggu keempat sampai minggu kelima.
* Minggu keenam digunakan untuk distribusi.
* Anggota yang sudah membayar pada Batch 1 tidak dapat membeli pada Batch 2.

Batch 3 mungkin dibuat berdasarkan antusias anggota.

## Konfigurasi batch

Field batch:

```text
id
event_id
name
description
purchase_start_at
purchase_end_at
distribution_start_at
distribution_end_at
status
is_purchase_enabled
display_next_batch_information
created_by
updated_by
created_at
updated_at
```

Status:

```text
DRAFT
SCHEDULED
OPEN
CLOSED
DISTRIBUTION
COMPLETED
CANCELLED
```

Admin dapat:

* Membuat batch.
* Mengubah jadwal.
* Menentukan informasi distribusi.
* Membuka pembelian melalui tombol.
* Menutup pembelian melalui tombol.
* Memulai distribusi.
* Menyelesaikan batch.
* Membatalkan batch.

Pembukaan dan penutupan tidak dilakukan otomatis berdasarkan tanggal.

Tanggal digunakan untuk:

* Countdown.
* Informasi jadwal.
* Validasi administratif.
* Tampilan kepada anggota.

Status aktual ditentukan oleh admin melalui button.

Saat batch belum dibuka:

* Tampilkan countdown.
* Tampilkan jadwal.
* Produk tetap terlihat.
* Tombol pilih dan checkout disabled.
* Tampilkan informasi “Bazar belum dibuka”.

Saat batch dibuka:

* Produk dapat dipilih.
* Checkout aktif.
* Anggota yang eligible dapat membeli.

Saat batch ditutup:

* Checkout disabled.
* Tampilkan jadwal distribusi.
* Tampilkan informasi batch berikutnya.
* Anggota tetap dapat melihat histori order.

---

# 15. AREA DISTRIBUSI

Area distribusi:

```text
P1
P2
P3
P4
P5
PC
HO
```

Area anggota ditentukan dari master data:

```text
Plant
Unit Kerja
```

Buat tabel master pemetaan:

```text
organizational_unit_area_mapping
```

Contoh field:

```text
id
plant
work_unit
distribution_area_id
is_active
created_at
updated_at
```

Admin dapat mengelola mapping melalui UI.

Anggota:

* Tidak dapat memilih area sendiri.
* Tidak dapat mengubah lokasi pengambilan.
* Mendapat area otomatis dari data master.

Jika mapping area belum ditemukan:

* Checkout harus diblokir.
* Tampilkan pesan agar anggota menghubungi admin.
* Catat masalah pada log administratif.

---

# 16. PIC AREA

PIC Area memiliki dashboard khusus.

PIC hanya dapat melihat data sesuai area yang diberikan.

Contoh:

```text
PIC P2 hanya dapat melihat dan memproses anggota Area P2.
```

Fitur PIC:

* Dashboard distribusi.
* Total paket area.
* Sudah diambil.
* Belum diambil.
* Persentase distribusi.
* Scan QR.
* Validasi transaksi.
* Melihat detail anggota.
* Melihat produk yang harus diserahkan.
* Konfirmasi penyerahan.
* Riwayat scan.
* Pencarian berdasarkan NPK atau nama sebagai fallback.
* Export daftar distribusi area sendiri.

Distribusi harus dilakukan sekaligus.

Tidak ada distribusi parsial.

Satu konfirmasi berarti seluruh produk pada order telah diberikan.

---

# 17. QR PENGAMBILAN

Setelah pembayaran berhasil, buat QR pengambilan unik.

Jangan memasukkan data pribadi langsung dalam QR.

Gunakan token acak dan aman:

```text
pickup_token
```

Token harus:

* Unik.
* Sulit ditebak.
* Tidak berisi NPK.
* Tidak berisi nama.
* Tidak berisi nominal.
* Disimpan dalam bentuk aman.
* Hanya berlaku untuk satu order.
* Tidak dapat digunakan dua kali.

Flow scan:

```text
PIC login
→ Membuka scanner
→ Scan QR anggota
→ Backend memvalidasi token
→ Sistem menampilkan detail order
→ PIC mencocokkan identitas anggota
→ PIC menekan Serahkan Barang
→ Sistem meminta konfirmasi
→ Distribusi disimpan
→ QR tidak dapat digunakan lagi
```

Validasi:

* Token valid.
* Order tersedia.
* Pembayaran berhasil.
* Batch dalam status distribusi.
* Area PIC sama dengan area order.
* Order belum didistribusikan.
* Anggota aktif.
* QR belum pernah digunakan.

Tampilkan kepada PIC:

* Nama anggota.
* NPK.
* Unit kerja.
* Plant.
* Area.
* Nomor transaksi.
* Produk.
* Status pembayaran.
* Status distribusi.
* Tanggal pembayaran.

Sebelum menyerahkan barang, PIC wajib mencocokkan QR dengan identitas anggota.

Pengambilan tidak dapat diwakilkan.

---

# 18. PAYMENT GATEWAY QRIS

Pembayaran hanya melalui QRIS dinamis.

Buat payment service menggunakan abstraction agar provider dapat diganti.

Interface contoh:

```typescript
interface PaymentGatewayProvider {
  createDynamicQris(payload: CreateQrisPayload): Promise<CreateQrisResult>;
  checkPaymentStatus(referenceId: string): Promise<PaymentStatusResult>;
  cancelPayment(referenceId: string): Promise<void>;
  verifyWebhook(payload: unknown, headers: Record<string, string>): boolean;
}
```

Struktur:

```text
PaymentGatewayService
├── ProviderAdapter
├── WebhookHandler
├── PaymentReconciliation
└── ManualVerification
```

Jangan mengikat seluruh business logic langsung ke satu provider.

Pilih provider QRIS berdasarkan:

1. Biaya transaksi paling murah.
2. Kemudahan integrasi.
3. QRIS dinamis.
4. Dukungan webhook.
5. Dokumentasi API.
6. Stabilitas.
7. Kemudahan settlement.
8. Dukungan merchant organisasi.

Simpan provider melalui konfigurasi `.env`.

Contoh:

```env
PAYMENT_PROVIDER=
PAYMENT_BASE_URL=
PAYMENT_API_KEY=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
PAYMENT_CALLBACK_URL=
```

Jangan menaruh API key di source code.

## Flow pembayaran

```text
Checkout valid
→ Database transaction dimulai
→ Order dibuat
→ Order items dibuat
→ Payment record dibuat
→ Provider membuat QRIS dinamis
→ QRIS ditampilkan
→ Status PENDING
→ User membayar
→ Provider mengirim webhook
→ Signature webhook diverifikasi
→ Webhook diproses secara idempotent
→ Payment menjadi PAID
→ Order menjadi CONFIRMED
→ QR pengambilan dibuat
→ Notifikasi dibuat
→ WhatsApp dikirim
```

## Kedaluwarsa pembayaran

Pembayaran berlaku sampai akhir hari checkout:

```text
23:59:59
```

Gunakan timezone:

```text
Asia/Jakarta
```

Simpan timestamp dalam UTC di database dan konversikan saat ditampilkan.

Buat scheduler untuk:

* Mendeteksi payment expired.
* Mengubah payment menjadi EXPIRED.
* Mengubah order menjadi EXPIRED.
* Mengirim notifikasi.
* Membolehkan anggota checkout ulang jika batch masih dibuka.

Anggota dapat membatalkan transaksi yang belum dibayar.

Jika ingin mengubah produk setelah QRIS dibuat:

```text
Batalkan order lama
→ QRIS lama tidak digunakan
→ Buat checkout baru
```

Jangan mengubah nominal QRIS yang sudah dibuat.

---

# 19. WEBHOOK PAYMENT

Webhook harus:

* Memverifikasi signature.
* Memvalidasi reference ID.
* Memvalidasi nominal.
* Memvalidasi merchant.
* Bersifat idempotent.
* Menolak duplicate processing.
* Menyimpan raw payload secara aman.
* Tidak menyimpan data sensitif yang tidak diperlukan.
* Mencatat waktu penerimaan.
* Mencatat hasil pemrosesan.

Buat tabel:

```text
payment_webhook_logs
```

Field:

```text
id
provider
event_type
external_reference
payload
signature_valid
processing_status
error_message
received_at
processed_at
```

Jangan pernah mengubah payment menjadi sukses hanya berdasarkan data dari frontend.

Status pembayaran harus berasal dari:

* Webhook provider yang valid.
* Verifikasi API provider.
* Verifikasi manual admin dengan audit trail.

---

# 20. VERIFIKASI PEMBAYARAN MANUAL

Admin Keuangan dapat mengubah pembayaran secara manual jika webhook bermasalah.

Form wajib berisi:

* Nomor transaksi.
* External reference.
* Status sebelumnya.
* Status baru.
* Tanggal pembayaran.
* Nominal.
* Nomor referensi pembayaran.
* Alasan koreksi.
* Catatan.
* Bukti pembayaran opsional.
* Admin pelaksana.

Setiap koreksi harus:

* Masuk audit log.
* Menyimpan before dan after.
* Menyimpan user pelaksana.
* Menyimpan timestamp.
* Menampilkan peringatan konfirmasi.
* Menggunakan database transaction.

Jika payment diubah menjadi sukses:

* Generate QR pengambilan.
* Update order.
* Kirim notifikasi.
* Kirim WhatsApp.
* Jangan menjalankan proses dua kali jika payment sudah sukses.

---

# 21. WHATSAPP MENGGUNAKAN BAILEYS

Gunakan Baileys untuk WhatsApp notification.

Namun buat abstraction agar dapat diganti ke WhatsApp Business API pada masa depan.

Struktur:

```text
WhatsAppService
├── BaileysProvider
└── OfficialWhatsAppProvider
```

Fitur:

* Login WhatsApp melalui QR.
* Menyimpan session secara aman.
* Reconnect otomatis.
* Queue pengiriman.
* Retry jika gagal.
* Rate limiting.
* Logging.
* Template message.
* Status sent, delivered, dan failed jika tersedia.
* Halaman monitoring koneksi WhatsApp.

Gunakan WhatsApp untuk:

* Reset password.
* Pembayaran berhasil.
* Pembayaran expired.
* QR pengambilan tersedia.
* Pengingat jadwal distribusi.
* Barang berhasil diserahkan.

Contoh pesan pembayaran berhasil:

```text
Halo {{name}},

Pembayaran Bazar HUT SPADM ke-21 telah berhasil.

Nomor transaksi: {{order_number}}
Total pembayaran: {{grand_total}}
Area pengambilan: {{distribution_area}}

QR pengambilan sudah tersedia di aplikasi SPADM.
Silakan buka menu Bazar → Pesanan Saya.

Pengambilan tidak dapat diwakilkan.

SPADM
```

Jangan mengirim data sensitif secara berlebihan.

---

# 22. NOTIFIKASI DALAM APLIKASI

Buat notification center.

Jenis notifikasi:

```text
PAYMENT_SUCCESS
PAYMENT_EXPIRED
ORDER_CANCELLED
PICKUP_QR_READY
DISTRIBUTION_SCHEDULE
ORDER_DISTRIBUTED
PASSWORD_RESET
SYSTEM_ANNOUNCEMENT
```

Fitur:

* Daftar notifikasi.
* Badge unread.
* Tandai dibaca.
* Tandai semua dibaca.
* Deep link ke halaman terkait.
* Histori pengiriman WhatsApp.
* Retry notification oleh admin.

---

# 23. BUKTI PEMBAYARAN PDF

Setelah pembayaran berhasil, anggota dapat mengunduh bukti pembayaran PDF.

Gunakan desain resmi dan profesional.

Isi:

* Logo SPADM.
* Nama organisasi.
* Nama event.
* Nomor transaksi.
* Tanggal transaksi.
* Nama anggota.
* NPK.
* Unit kerja.
* Plant.
* Area distribusi.
* Daftar produk.
* Harga masing-masing produk.
* Subtotal.
* Goodie bag.
* Biaya aplikasi.
* Subsidi SPADM.
* Total pembayaran.
* Status pembayaran.
* Referensi payment gateway.
* Jadwal distribusi.
* QR pengambilan.
* Catatan bahwa pengambilan tidak dapat diwakilkan.

Gunakan logo dan identitas visual SPADM.

Sediakan endpoint PDF yang hanya dapat diakses pemilik order atau admin berwenang.

---

# 24. DASHBOARD ANGGOTA

Dashboard anggota menampilkan:

* Sapaan.
* Nama anggota.
* NPK.
* Status keanggotaan.
* Unit kerja.
* Plant.
* Area distribusi.
* Menu utama.
* Banner HUT SPADM ke-21.
* Status batch bazar.
* Countdown.
* Status pesanan.
* Notifikasi terbaru.

Menu anggota:

```text
Dashboard
Bazar SPADM
Pesanan Saya
Event
Mubes SPADM
Pengumuman
Dokumen
Profil
Keamanan Akun
```

Modul selain bazar dapat dibuat sebagai placeholder “Segera Hadir” jika belum dikembangkan.

---

# 25. HALAMAN BAZAR ANGGOTA

Buat halaman:

## Landing Bazar

* Banner HUT SPADM ke-21.
* Deskripsi program.
* Jadwal batch.
* Countdown.
* Status eligibility.
* Informasi subsidi Rp20.000.
* Informasi distribusi.
* Tombol lihat produk.

## Product Listing

* Card produk.
* Gambar.
* Nama.
* Harga.
* Checkbox atau tombol pilih.
* Maksimal satu.
* Status disable saat batch belum dibuka.
* Sticky cart summary pada mobile.

## Cart

* Produk terpilih.
* Hapus produk.
* Subtotal.
* Goodie bag.
* Biaya aplikasi.
* Subsidi.
* Total.
* Area pengambilan.
* Persetujuan.
* Checkout.

## Payment

* Nomor transaksi.
* QRIS dinamis.
* Total pembayaran.
* Countdown kedaluwarsa.
* Tombol cek status.
* Instruksi pembayaran.
* Status realtime atau polling yang efisien.
* Tombol batalkan selama belum dibayar.

## Order Detail

* Produk.
* Perhitungan.
* Status.
* Timeline order.
* Bukti pembayaran.
* QR pengambilan.
* Jadwal distribusi.

## Order History

* Daftar transaksi.
* Filter.
* Detail.
* Status badge.

---

# 26. DASHBOARD ADMIN BAZAR

Tampilkan:

* Total anggota aktif.
* Total anggota eligible.
* Total anggota sudah membeli.
* Persentase partisipasi.
* Total transaksi.
* Payment pending.
* Payment paid.
* Payment expired.
* Penjualan per produk.
* Penjualan per kombinasi produk.
* Penjualan per batch.
* Penjualan per area.
* Total nominal produk.
* Total goodie bag.
* Total biaya aplikasi.
* Total subsidi.
* Total pembayaran diterima.
* Distribusi selesai.
* Distribusi belum selesai.
* Progress distribusi per area.

Gunakan:

* KPI card.
* Bar chart.
* Donut chart.
* Trend transaksi.
* Tabel transaksi terbaru.
* Filter batch.
* Filter area.
* Filter tanggal.

---

# 27. ADMINISTRASI BAZAR

Buat halaman admin:

```text
Bazar Dashboard
Event Management
Batch Management
Product Management
Orders
Payments
Manual Payment Verification
Distribution
Area Mapping
Reports
Subsidy Report
WhatsApp Monitoring
Audit Log
Settings
```

## Event Management

Admin dapat:

* Membuat event bazar.
* Menentukan nama.
* Menentukan deskripsi.
* Mengunggah banner.
* Menentukan subsidi.
* Menentukan goodie bag fee.
* Menentukan application fee.
* Mengaktifkan atau menonaktifkan event.

## Batch Management

Gunakan table dan form.

Sediakan action:

* Open purchase.
* Close purchase.
* Start distribution.
* Complete batch.

Setiap action menggunakan confirmation dialog.

## Product Management

* CRUD.
* Upload gambar.
* Status aktif.
* Urutan.
* Harga.
* Produk per batch.

## Orders

* Search NPK.
* Search nama.
* Search nomor transaksi.
* Filter batch.
* Filter area.
* Filter payment.
* Filter distribution.
* View detail.
* Export.

## Payments

* Payment list.
* Provider reference.
* Nominal.
* Status.
* Webhook status.
* Cek ulang ke provider.
* Manual verification.
* Export reconciliation.

---

# 28. LAPORAN DAN EXPORT

Sediakan export Excel untuk:

* Seluruh transaksi.
* Pembayaran berhasil.
* Pembayaran pending.
* Pembayaran expired.
* Rekap per batch.
* Rekap per produk.
* Rekap kombinasi produk.
* Rekap per area.
* Rekap kebutuhan distribusi.
* Daftar anggota yang sudah membeli.
* Daftar anggota yang belum membeli.
* Total subsidi.
* Total goodie bag.
* Total biaya aplikasi.
* Rekonsiliasi payment gateway.
* Histori verifikasi manual.
* Histori distribusi.
* Audit log.

Sediakan laporan PDF resmi:

* Logo SPADM.
* Judul laporan.
* Nama event.
* Batch.
* Periode.
* Ringkasan transaksi.
* Ringkasan keuangan.
* Ringkasan subsidi.
* Grafik.
* Rekap area.
* Progress distribusi.
* Tanggal pembuatan.
* Nama user pembuat laporan.

---

# 29. AUDIT LOG

Semua aktivitas penting harus masuk audit log:

* Login gagal.
* Login berhasil.
* Ganti password.
* Reset password.
* Import anggota.
* Update anggota.
* Assign role.
* Revoke role.
* Membuka batch.
* Menutup batch.
* Mengubah produk.
* Membuat order.
* Membatalkan order.
* Payment webhook.
* Verifikasi manual.
* Scan QR.
* Konfirmasi distribusi.
* Export data.
* Perubahan setting.

Field audit:

```text
id
user_id
action
module
entity_type
entity_id
old_values
new_values
ip_address
user_agent
request_id
description
created_at
```

Data audit tidak boleh dapat diubah melalui UI normal.

---

# 30. KEAMANAN

Implementasikan:

* Argon2 atau bcrypt.
* Force change default password.
* Rate limiting login.
* Temporary account lock.
* Refresh token rotation.
* HttpOnly cookie.
* Secure cookie production.
* SameSite cookie.
* CSRF consideration.
* CORS whitelist.
* Input validation.
* SQL injection protection.
* XSS protection.
* Helmet.
* File upload validation.
* MIME validation.
* Maximum upload size.
* Permission guard.
* Area-based access guard.
* Audit logging.
* Webhook signature verification.
* Idempotency.
* Database transaction.
* QR replay protection.
* Order duplication prevention.
* Sensitive data masking.
* Environment secrets.
* Backup database.
* Error response tanpa membocorkan stack trace.

Jangan menyimpan:

* Password plaintext.
* API key di source code.
* Token autentikasi di localStorage jika menggunakan HttpOnly cookie.
* Informasi sensitif di log.
* NPK atau data pribadi di QR.

Data anggota hanya disimpan pada database aplikasi SPADM dan backup yang dikelola aplikasi.

Jangan mengirim seluruh data anggota ke payment gateway.

Kirim hanya informasi minimum yang dibutuhkan.

---

# 31. DATABASE DESIGN

Buat ERD dan migration untuk tabel utama:

```text
users
members
member_profiles
member_status_histories
member_imports
member_import_rows

roles
permissions
role_permissions
user_roles
user_role_histories

sessions
refresh_tokens
login_histories
password_reset_tokens

plants
work_units
distribution_areas
organizational_unit_area_mappings

bazaar_events
bazaar_batches
bazaar_products
bazaar_batch_products

bazaar_orders
bazaar_order_items
bazaar_order_status_histories

payments
payment_status_histories
payment_webhook_logs
manual_payment_verifications

pickup_tokens
distributions
distribution_histories

notifications
notification_deliveries
whatsapp_sessions
whatsapp_messages

subsidy_records
application_settings
files
audit_logs
```

Gunakan:

* UUID atau BIGINT secara konsisten.
* Foreign key.
* Index.
* Unique constraint.
* Soft delete pada master data.
* Timestamp.
* Optimistic locking jika diperlukan.
* Database transaction untuk proses kritis.

Constraint penting:

```text
NPK harus unik.
Order number harus unik.
Payment external reference harus unik.
Pickup token harus unik.
Satu member hanya boleh memiliki satu paid order per bazaar event.
Satu order hanya boleh didistribusikan satu kali.
```

Gunakan database-level constraint sejauh memungkinkan, tidak hanya validasi application layer.

---

# 32. API DESIGN

Gunakan REST API yang konsisten.

Contoh:

```text
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/change-password
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/me
GET    /api/me/sessions
DELETE /api/me/sessions/:id

GET    /api/members
POST   /api/members/import
GET    /api/members/import/:id
PATCH  /api/members/:id

GET    /api/roles
POST   /api/roles
POST   /api/users/:id/roles

GET    /api/bazaar/events
GET    /api/bazaar/events/active
POST   /api/bazaar/events

GET    /api/bazaar/batches/current
POST   /api/bazaar/batches
POST   /api/bazaar/batches/:id/open
POST   /api/bazaar/batches/:id/close
POST   /api/bazaar/batches/:id/start-distribution
POST   /api/bazaar/batches/:id/complete

GET    /api/bazaar/products
POST   /api/bazaar/products
PATCH  /api/bazaar/products/:id

POST   /api/bazaar/orders
GET    /api/bazaar/orders/my
GET    /api/bazaar/orders/:id
POST   /api/bazaar/orders/:id/cancel

POST   /api/bazaar/orders/:id/payment
GET    /api/bazaar/payments/:id/status

POST   /api/webhooks/payments/:provider

POST   /api/bazaar/distributions/scan
POST   /api/bazaar/distributions/:orderId/confirm

GET    /api/bazaar/reports/dashboard
GET    /api/bazaar/reports/export
```

Gunakan Swagger.

Setiap endpoint harus memiliki:

* DTO.
* Validation.
* Guard.
* Permission.
* Error handling.
* Dokumentasi.
* Unit test minimal untuk business logic kritis.

---

# 33. ERROR HANDLING

Gunakan format response konsisten.

Contoh sukses:

```json
{
  "success": true,
  "message": "Order berhasil dibuat",
  "data": {}
}
```

Contoh error:

```json
{
  "success": false,
  "message": "Anggota sudah pernah membeli pada event ini",
  "code": "MEMBER_ALREADY_PURCHASED",
  "errors": null
}
```

Buat error code:

```text
MEMBER_INACTIVE
MEMBER_ALREADY_PURCHASED
ACTIVE_PENDING_ORDER_EXISTS
BATCH_NOT_OPEN
PRODUCT_NOT_AVAILABLE
AREA_MAPPING_NOT_FOUND
PAYMENT_EXPIRED
PAYMENT_ALREADY_PAID
ORDER_CANNOT_BE_CANCELLED
INVALID_PICKUP_QR
ORDER_ALREADY_DISTRIBUTED
PIC_AREA_MISMATCH
PERMISSION_DENIED
```

Frontend harus menampilkan pesan yang mudah dipahami pengguna.

---

# 34. UI/UX DAN DESIGN SYSTEM

Gunakan desain:

* Profesional.
* Modern.
* Bersih.
* Premium.
* Mobile-first.
* Identitas SPADM.
* Tema HUT ke-21.
* Warna biru, merah, dan putih.
* Tidak terlalu ramai.
* Mudah digunakan anggota nonteknis.
* Tombol besar pada mobile.
* Status badge yang jelas.
* Loading state.
* Skeleton.
* Empty state.
* Error state.
* Confirmation dialog.
* Toast notification.

Gunakan logo SPADM jika sudah tersedia dalam repository.

Jika belum tersedia, gunakan placeholder yang mudah diganti.

Jangan membuat halaman terlihat seperti template generik.

Sesuaikan wording dengan Bahasa Indonesia.

---

# 35. PWA

Aktifkan PWA:

* Installable.
* App icon.
* Splash screen.
* Manifest.
* Service worker.
* Offline fallback.
* Cache aset statis.
* Jangan cache response sensitif.
* Update notification ketika versi baru tersedia.

Pembayaran dan transaksi tetap membutuhkan koneksi internet.

---

# 36. PERFORMANCE

Target:

* Lazy loading.
* Pagination.
* Server-side filtering.
* Database indexing.
* Query optimization.
* Image optimization.
* Compression.
* Cache untuk konfigurasi non-sensitif.
* Hindari N+1 query.
* Gunakan transaksi hanya pada proses yang memerlukan.
* Gunakan queue untuk WhatsApp dan pekerjaan berat.
* Jangan memblokir response API untuk pengiriman WhatsApp.

Setelah payment sukses:

```text
Update payment dan order secara synchronous.
Pengiriman WhatsApp dan pembuatan notifikasi dapat diproses melalui queue.
```

---

# 37. BACKUP DAN OPERASIONAL

Buat:

* Script backup MySQL.
* Backup terjadwal.
* Retention backup.
* Restore documentation.
* PM2 ecosystem file.
* Nginx configuration.
* `.env.example`.
* Health check endpoint.
* Deployment script.
* GitHub Actions deployment.
* Log rotation.
* Monitoring sederhana.
* Disk usage consideration.

Endpoint health:

```text
GET /api/health
```

Memeriksa:

* API.
* Database.
* Payment configuration.
* WhatsApp connection.
* Storage.

Jangan menampilkan secret pada health endpoint.

---

# 38. TESTING

Buat testing minimal:

## Unit test

* Perhitungan checkout.
* Subsidi.
* Validasi satu kali pembelian.
* Validasi pending order.
* Batch eligibility.
* Area mapping.
* Payment webhook.
* Idempotency.
* QR validation.
* Distribution confirmation.
* Permission guard.

## Integration test

* Login.
* Create order.
* Generate payment.
* Payment webhook.
* Generate pickup token.
* Scan pickup QR.
* Confirm distribution.

## E2E scenario utama

```text
Member login
→ Ganti password
→ Buka bazar
→ Pilih minyak dan beras
→ Checkout
→ QRIS dibuat
→ Webhook payment success
→ QR pengambilan dibuat
→ PIC scan
→ Barang diserahkan
→ Status completed
```

---

# 39. DOKUMENTASI

Buat dokumentasi:

```text
README.md
docs/architecture.md
docs/database.md
docs/api.md
docs/payment-integration.md
docs/whatsapp-baileys.md
docs/deployment.md
docs/backup-restore.md
docs/roles-permissions.md
docs/member-import.md
docs/bazaar-flow.md
```

README harus berisi:

* Deskripsi.
* Stack.
* Struktur folder.
* Requirement.
* Setup frontend.
* Setup backend.
* Setup database.
* Environment variable.
* Migration.
* Seeder.
* Development.
* Production build.
* PM2.
* Nginx.
* Deployment.
* Default admin.
* Troubleshooting.

---

# 40. DATA SEEDER

Buat seeder:

* Permission.
* Role.
* Super Admin.
* Area P1, P2, P3, P4, P5, PC, HO.
* Event Bazar HUT SPADM ke-21.
* Batch 1 placeholder.
* Batch 2 placeholder.
* Produk Minyak.
* Produk Beras.
* Produk Gula.
* Application fee Rp1.000.
* Goodie bag Rp3.000.
* Subsidi Rp20.000.

Super Admin:

```text
23893
15012
```

Jangan membuat data anggota palsu dalam jumlah besar pada production seeder.

Buat development seed terpisah.

---

# 41. ENVIRONMENT VARIABLES

Buat `.env.example`.

Contoh:

```env
NODE_ENV=development
PORT=3000
APP_NAME=SPADM
APP_URL=http://localhost:4200
API_URL=http://localhost:3000
TIMEZONE=Asia/Jakarta

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=spadm

JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=30d

COOKIE_DOMAIN=
COOKIE_SECURE=false

PAYMENT_PROVIDER=
PAYMENT_BASE_URL=
PAYMENT_API_KEY=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
PAYMENT_CALLBACK_URL=

WHATSAPP_PROVIDER=baileys
WHATSAPP_SESSION_PATH=
WHATSAPP_QUEUE_ENABLED=true

STORAGE_PATH=
MAX_UPLOAD_SIZE=

DEFAULT_MEMBER_PASSWORD=SmartCare
FORCE_CHANGE_DEFAULT_PASSWORD=true
```

Jangan commit file `.env`.

---

# 42. URUTAN PENGEMBANGAN

Kerjakan secara bertahap.

## Phase 1 — Analisis dan fondasi

1. Analisis repository.
2. Analisis template frontend.
3. Buat dokumentasi arsitektur.
4. Setup backend NestJS.
5. Setup database.
6. Setup environment.
7. Setup migration.
8. Setup response dan error handling.

## Phase 2 — Authentication dan membership

1. User dan member.
2. Login NPK.
3. Default password.
4. Force change password.
5. Refresh token.
6. Session management.
7. Forgot password.
8. Import Excel.
9. Status anggota.
10. Profil.

## Phase 3 — Role dan permission

1. Role.
2. Permission.
3. Guard.
4. Role history.
5. Area access.
6. Admin management.

## Phase 4 — Bazar master

1. Event.
2. Batch.
3. Product.
4. Area mapping.
5. Landing bazar.

## Phase 5 — Checkout dan order

1. Product selection.
2. Cart.
3. Perhitungan.
4. Persetujuan.
5. Order.
6. Pending order.
7. Order history.

## Phase 6 — QRIS payment

1. Provider abstraction.
2. Dynamic QRIS.
3. Webhook.
4. Expiry.
5. Manual verification.
6. Payment history.

## Phase 7 — WhatsApp dan notifikasi

1. Baileys.
2. Queue.
3. Template message.
4. Notification center.
5. Monitoring.

## Phase 8 — Distribusi

1. Pickup token.
2. QR code.
3. PIC dashboard.
4. Scanner.
5. Validation.
6. Confirmation.
7. Distribution report.

## Phase 9 — Dashboard dan laporan

1. Admin dashboard.
2. Finance dashboard.
3. Leadership dashboard.
4. Excel export.
5. PDF report.
6. Receipt PDF.

## Phase 10 — Production readiness

1. Testing.
2. Security review.
3. Performance review.
4. Deployment.
5. Backup.
6. Documentation.
7. GitHub Actions.

---

# 43. CARA KERJA YANG WAJIB DIIKUTI

Sebelum melakukan perubahan:

1. Baca seluruh struktur repository.
2. Baca file konfigurasi.
3. Identifikasi teknologi yang sudah digunakan.
4. Jangan menebak isi file.
5. Jangan mengganti template frontend.
6. Jangan menghapus kode tanpa memahami dampaknya.
7. Buat rencana implementasi.
8. Tampilkan daftar file yang akan dibuat atau diubah.
9. Implementasikan bertahap.
10. Jalankan lint, build, dan test.
11. Perbaiki error sebelum melanjutkan.
12. Dokumentasikan perubahan.

Jangan membuat seluruh project dalam satu file besar.

Gunakan:

* Clean code.
* SOLID principle secara proporsional.
* Reusable component.
* Service separation.
* DTO.
* Entity.
* Repository pattern yang wajar.
* Database transaction.
* Centralized error handling.
* Meaningful naming.

Jangan melakukan overengineering.

---

# 44. HASIL YANG DIHARAPKAN DARI AI

Pada awal pengerjaan, jangan langsung menulis seluruh kode.

Berikan terlebih dahulu:

1. Hasil analisis repository.
2. Hasil analisis template frontend.
3. Versi Angular dan NestJS yang akan digunakan.
4. Rencana arsitektur.
5. Struktur folder.
6. ERD.
7. Daftar entity.
8. Daftar endpoint.
9. Daftar halaman frontend.
10. Daftar role dan permission.
11. Flow authentication.
12. Flow checkout.
13. Flow QRIS.
14. Flow distribusi.
15. Tahapan implementasi.
16. Risiko teknis.
17. Daftar keputusan atau asumsi yang digunakan.

Setelah analisis selesai, mulai implementasi dari fondasi secara bertahap.

Untuk setiap phase:

1. Jelaskan target phase.
2. Sebutkan file yang dibuat atau diubah.
3. Implementasikan.
4. Jalankan build.
5. Jalankan test.
6. Jelaskan hasil.
7. Commit dengan pesan yang jelas.

Contoh commit:

```text
feat(auth): implement member authentication using NPK
feat(member): add Excel member import
feat(rbac): add dynamic roles and permissions
feat(bazaar): add bazaar event and batch management
feat(order): add bazaar checkout and order processing
feat(payment): integrate dynamic QRIS payment
feat(distribution): add pickup QR and area distribution
```

---

# 45. ACCEPTANCE CRITERIA UTAMA

Project dianggap berhasil jika:

1. Anggota dapat login menggunakan NPK.
2. Anggota wajib mengganti password default.
3. Admin dapat import anggota melalui Excel.
4. Anggota tidak aktif tidak dapat membeli.
5. Admin dapat mengelola role dan permission.
6. Admin dapat membuat batch baru tanpa coding ulang.
7. Anggota dapat memilih satu, dua, atau tiga produk.
8. Maksimal satu unit per produk.
9. Goodie bag Rp3.000 otomatis ditambahkan.
10. Biaya aplikasi Rp1.000 otomatis ditambahkan.
11. Subsidi Rp20.000 otomatis dikurangi.
12. Perhitungan checkout benar.
13. Anggota hanya dapat memiliki satu payment sukses per event.
14. Anggota Batch 1 yang sudah membayar tidak dapat membeli Batch 2.
15. QRIS dinamis berhasil dibuat.
16. Webhook mengubah payment menjadi sukses.
17. Payment expired pada akhir hari.
18. Setelah payment sukses, QR pengambilan dibuat.
19. WhatsApp pembayaran berhasil terkirim.
20. PIC hanya dapat scan transaksi sesuai area.
21. QR tidak dapat digunakan dua kali.
22. Distribusi hanya dapat dilakukan sekaligus.
23. Semua perubahan penting memiliki audit trail.
24. Admin dapat export Excel.
25. Admin dapat membuat laporan PDF.
26. Aplikasi responsif dan dapat dipasang sebagai PWA.
27. Build frontend dan backend berhasil.
28. Dokumentasi deployment tersedia.
29. Backup dan restore database terdokumentasi.
30. Aplikasi siap di-deploy ke `spadm.org`.

---

# 46. INSTRUKSI PERTAMA

Mulai dengan melakukan audit repository:

```text
https://github.com/wahyudi-komite/spadm
```

Lakukan:

1. Tampilkan struktur repository.
2. Periksa isi folder frontend.
3. Identifikasi template dan versinya.
4. Periksa apakah backend sudah tersedia.
5. Periksa konfigurasi Git.
6. Periksa package manager.
7. Periksa file environment.
8. Periksa potensi konflik dependency.
9. Jangan mengubah file apa pun terlebih dahulu.
10. Buat `docs/initial-analysis.md`.
11. Buat rencana implementasi terperinci.
12. Setelah itu mulai Phase 1.

Gunakan seluruh spesifikasi dalam prompt ini sebagai sumber utama kebutuhan project.
