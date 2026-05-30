// Internal company SOP knowledge base. Injected as context into the AI
// reply-draft prompt so generated drafts follow company policy (RAG-style).

export const SOP_KNOWLEDGE = `
SOP PERUSAHAAN — IUL Tech Customer Service

1. KETERLAMBATAN PENGIRIMAN
   - Keterlambatan > 10 hari kerja: agen berwenang menawarkan refund penuh
     ATAU pengiriman ulang prioritas tanpa biaya.
   - Selalu minta maaf dan sebutkan nomor order pelanggan.

2. KESALAHAN PRODUK / UKURAN
   - Kesalahan dari gudang (salah ukuran/varian/barang): penukaran gratis ongkir.
   - Penjemputan barang dijadwalkan maksimal 1x24 jam.

3. REFUND
   - Refund penuh diproses pada hari yang sama jika disetujui.
   - Dana kembali ke metode pembayaran asal dalam 3-5 hari kerja.

4. GARANSI
   - Nomor seri 12 digit tercetak pada stiker di badan produk (bukan kardus).
   - Aktivasi garansi di garansi.iultech.com dalam 14 hari setelah pembelian.

5. STOK & PENGAMBILAN
   - Konfirmasi ketersediaan stok sebelum menjanjikan ke pelanggan.
   - Barang dapat diambil di counter; pembayaran bisa di tempat.

6. NADA KOMUNIKASI
   - Sopan, empatik, ringkas. Gunakan Bahasa Indonesia.
   - Untuk pelanggan marah: akui kekecewaan mereka lebih dulu sebelum solusi.
`.trim();
