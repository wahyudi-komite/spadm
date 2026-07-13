# Import Anggota

File XLS/XLSX wajib memiliki header: Nama, Email, NPK, Unit Kerja, Nomor WhatsApp, Status, Jabatan Organisasi, dan Plant. Ukuran maksimal 5 MB dan 10.000 baris.

Flow terdiri dari preview persisten lalu confirm menggunakan `importId`. Preview memvalidasi header, NPK, status, duplikat file, serta menandai CREATE/UPDATE. Confirm ditolak jika masih ada baris invalid dan diproses dalam transaksi. Anggota baru mendapat user, password hash awal, force-change, dan role MEMBER. NPK yang tidak ada di file tidak dihapus.
