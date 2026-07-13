# Role dan Permission

Role awal: SUPER_ADMIN, BAZAAR_ADMIN, FINANCE_ADMIN, AREA_PIC, LEADERSHIP, dan MEMBER. Permission granular disimpan di database dan dipetakan melalui `role_permissions`.

Assignment role menyimpan area, tanggal mulai/akhir, status, pemberi, pencabut, alasan, dan histori. Guard hanya menerima assignment aktif dalam periode berlaku. AREA_PIC juga diverifikasi terhadap area order pada scan/konfirmasi; permission saja tidak cukup. Perubahan role wajib dilakukan melalui endpoint admin dan tercatat di audit log.
