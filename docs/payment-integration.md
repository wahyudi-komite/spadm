# Integrasi Payment

Payment memakai `PaymentGatewayProvider`. Development dapat memakai provider mock; production harus mengisi `PAYMENT_PROVIDER`, endpoint, API key, secret, callback, dan webhook secret milik acquirer yang dipilih.

Provider membuat QRIS dinamis dengan reference unik dan expiry akhir hari Asia/Jakarta. Webhook harus diverifikasi signature-nya, dicatat utuh pada webhook log, dicocokkan reference serta nominalnya, lalu diproses idempoten. Status payment dan order diubah dalam transaksi; pickup token dibuat satu kali. Jangan mengaktifkan mock pada production.

Manual verification memerlukan permission finance, nominal yang sama, alasan, referensi bukti, audit log, dan histori status.
