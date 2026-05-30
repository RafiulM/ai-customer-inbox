-- Demo data — mirrors the frontend dummy dataset so the inbox is populated.
-- agent_id is left NULL: real CS staff self-assign after signing up.

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
insert into public.customers (id, name, email, phone, company, joined_at, total_tickets) values
  ('c0000001-0000-4000-8000-000000000001', 'Budi Santoso',   'budi.santoso@gmail.com', '+62 812-3456-7890', 'Toko Berkah Jaya',    '2023-02-14', 12),
  ('c0000002-0000-4000-8000-000000000002', 'Maya Anggraini',  'maya.a@yahoo.com',       '+62 813-9988-1122', 'Freelancer',          '2024-06-01', 3),
  ('c0000003-0000-4000-8000-000000000003', 'Henry Tanjaya',   'henry.tan@outlook.com',  '+62 821-5566-7788', 'PT Sinar Abadi',      '2022-11-20', 27),
  ('c0000004-0000-4000-8000-000000000004', 'Dewi Lestari',    'dewi.lestari@gmail.com', '+62 856-1234-5678', 'Warung Kopi Senja',   '2024-09-12', 5),
  ('c0000005-0000-4000-8000-000000000005', 'Agus Pratama',    'agus.pratama@gmail.com', '+62 819-4321-8765', 'Bengkel Motor Cepat', '2023-07-30', 8);

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------
insert into public.conversations
  (id, customer_id, channel, subject, status, sentiment, tags, ai_summary, unread, created_at, last_message_at) values
  ('cf000001-0000-4000-8000-000000000001', 'c0000003-0000-4000-8000-000000000003', 'WhatsApp',
    'Pesanan belum sampai sudah 2 minggu!', 'open', 'marah',
    array['Darurat', 'Pengiriman', 'Refund'], null, 4,
    '2026-05-21 07:10:00+07', '2026-05-21 09:42:00+07'),
  ('cf000002-0000-4000-8000-000000000002', 'c0000001-0000-4000-8000-000000000001', 'Email',
    'Salah kirim ukuran produk', 'open', 'marah',
    array['Prioritas Tinggi', 'Penukaran'], null, 2,
    '2026-05-21 08:00:00+07', '2026-05-21 09:15:00+07'),
  ('cf000003-0000-4000-8000-000000000003', 'c0000002-0000-4000-8000-000000000002', 'Live Chat',
    'Cara aktivasi garansi produk', 'pending', 'netral',
    array['Garansi', 'Pertanyaan'], null, 0,
    '2026-05-20 14:20:00+07', '2026-05-21 08:30:00+07'),
  ('cf000004-0000-4000-8000-000000000004', 'c0000005-0000-4000-8000-000000000005', 'Instagram',
    'Tanya stok sparepart', 'pending', 'netral',
    array['Stok', 'Pertanyaan'], null, 1,
    '2026-05-20 11:00:00+07', '2026-05-21 07:55:00+07'),
  ('cf000005-0000-4000-8000-000000000005', 'c0000004-0000-4000-8000-000000000004', 'WhatsApp',
    'Terima kasih, masalah sudah beres', 'closed', 'puas',
    array['Selesai'],
    array[
      'Pelanggan sempat kesulitan login ke akun member.',
      'Agen membantu reset password lewat email terdaftar.',
      'Masalah selesai, pelanggan puas dengan kecepatan respons.'
    ], 0,
    '2026-05-19 10:00:00+07', '2026-05-20 16:40:00+07');

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
insert into public.messages
  (conversation_id, sender_type, content, attachment_name, attachment_url, created_at) values
  -- cv1 — Henry, marah, pengiriman
  ('cf000001-0000-4000-8000-000000000001', 'customer',
    'Halo, saya pesan barang tanggal 7 Mei dengan nomor order #INV-88213. Sudah 2 minggu belum sampai juga!',
    null, null, '2026-05-21 07:10:00+07'),
  ('cf000001-0000-4000-8000-000000000001', 'customer',
    'Saya sudah bayar lunas Rp 1.450.000. Ini bukti transfernya.',
    'bukti-transfer.jpg', '#', '2026-05-21 07:12:00+07'),
  ('cf000001-0000-4000-8000-000000000001', 'customer',
    'Saya cek nomor resi di aplikasi kurir, statusnya tidak update sama sekali. Tolong dong ini gimana?',
    null, null, '2026-05-21 08:30:00+07'),
  ('cf000001-0000-4000-8000-000000000001', 'customer',
    'Kalau memang tidak bisa dikirim, saya minta REFUND penuh hari ini juga. Saya sudah kecewa banget.',
    null, null, '2026-05-21 09:42:00+07'),
  -- cv2 — Budi, marah, salah ukuran
  ('cf000002-0000-4000-8000-000000000002', 'customer',
    'Selamat pagi. Saya order sepatu ukuran 42 tapi yang datang ukuran 40. Order #INV-90011.',
    null, null, '2026-05-21 08:00:00+07'),
  ('cf000002-0000-4000-8000-000000000002', 'customer',
    'Ini foto label paket dan sepatunya. Jelas beda dengan yang saya pesan.',
    'foto-produk.png', '#', '2026-05-21 09:15:00+07'),
  -- cv3 — Maya, netral, garansi
  ('cf000003-0000-4000-8000-000000000003', 'customer',
    'Hai, saya mau tanya cara mengaktifkan garansi untuk blender yang baru saya beli.',
    null, null, '2026-05-20 14:20:00+07'),
  ('cf000003-0000-4000-8000-000000000003', 'agent',
    'Halo Maya! Untuk aktivasi garansi, cukup daftarkan nomor seri produk di halaman garansi.iultech.com dalam 14 hari setelah pembelian ya.',
    null, null, '2026-05-20 14:35:00+07'),
  ('cf000003-0000-4000-8000-000000000003', 'customer',
    'Oh gitu, nomor serinya yang mana ya? Yang di kardus atau di badan blender?',
    null, null, '2026-05-21 08:30:00+07'),
  -- cv4 — Agus, netral, stok
  ('cf000004-0000-4000-8000-000000000004', 'customer',
    'Bro, ada stok kampas rem Honda Beat tahun 2021 ga?',
    null, null, '2026-05-20 11:00:00+07'),
  ('cf000004-0000-4000-8000-000000000004', 'agent',
    'Halo Pak Agus, ada Pak. Stok ready 8 set. Mau saya bantu siapkan?',
    null, null, '2026-05-20 11:20:00+07'),
  ('cf000004-0000-4000-8000-000000000004', 'customer',
    'Sip, tolong siapkan 2 set ya. Nanti saya ambil sore.',
    null, null, '2026-05-21 07:55:00+07'),
  -- cv5 — Dewi, puas, closed
  ('cf000005-0000-4000-8000-000000000005', 'customer',
    'Saya tidak bisa login ke akun member, selalu gagal padahal password benar.',
    null, null, '2026-05-19 10:00:00+07'),
  ('cf000005-0000-4000-8000-000000000005', 'agent',
    'Halo Bu Dewi, saya sudah kirim tautan reset password ke email terdaftar. Silakan dicek ya.',
    null, null, '2026-05-19 10:25:00+07'),
  ('cf000005-0000-4000-8000-000000000005', 'ai_system',
    'Email notifikasi balasan agen telah terkirim ke dewi.lestari@gmail.com.',
    null, null, '2026-05-19 10:25:30+07'),
  ('cf000005-0000-4000-8000-000000000005', 'customer',
    'Sudah bisa login! Terima kasih banyak, cepat banget responnya.',
    null, null, '2026-05-20 16:40:00+07');
