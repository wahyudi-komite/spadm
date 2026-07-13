# WhatsApp Baileys

Set `WHATSAPP_PROVIDER=baileys`, `WHATSAPP_QUEUE_ENABLED=true`, dan `WHATSAPP_SESSION_PATH` ke direktori privat yang persisten serta writable. Buka endpoint monitoring admin, mulai koneksi, lalu scan QR dari perangkat organisasi.

Pesan disimpan pada notification delivery sebelum dikirim. Worker memproses bertahap, mencatat provider message ID, dan retry eksponensial maksimal lima kali. Session Baileys adalah secret: permission direktori harus ketat, tidak boleh masuk Git/backup publik, dan harus memiliki prosedur rotasi/logout. Untuk skala lebih besar, interface yang sama dapat diarahkan ke WhatsApp Business API.
