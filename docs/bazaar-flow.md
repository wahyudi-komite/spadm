# Flow Bazar

Admin membuat event, batch, produk, serta mapping plant/unit ke area. Status batch dibuka manual. Anggota aktif dengan mapping valid memilih minimal satu produk, menyetujui ketentuan, lalu checkout.

Checkout mengambil snapshot nama/harga dan fee event, mengunci aturan satu pending/satu paid, serta membuat nomor transaksi dari sequence database. Payment provider membuat QRIS. Webhook valid mengonfirmasi order, membuat pickup QR, dan antrekan notifikasi. PIC dengan role area yang sesuai memindai signed token saat batch DISTRIBUTION; transaksi atomik menandai token terpakai, membuat distribution, dan menyelesaikan order. QR kedua kali selalu ditolak.
