import { Siswa, BulanPembayaran, PembayaranKas, PengeluaranKas, PengaturanKelas, User } from '../types';

export const initialUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    nama_lengkap: 'Administrator Kelas',
    role: 'Admin',
    created_at: '2026-07-01 08:00:00'
  },
  {
    id: 2,
    username: 'bendahara',
    nama_lengkap: 'Siti Rahma (Bendahara)',
    role: 'Bendahara',
    created_at: '2026-07-01 08:30:00'
  },
  {
    id: 3,
    username: 'siswa_ahmad',
    nama_lengkap: 'Ahmad Rizky Pratama',
    role: 'Siswa',
    siswa_id: 1,
    nis: '1001',
    created_at: '2026-07-01 09:00:00'
  }
];

export const initialSiswa: Siswa[] = [
  { id: 1, nis: '1001', nama: 'Ahmad Rizky Pratama', jenis_kelamin: 'L', no_hp: '081234567801', status: 'Aktif', created_at: '2026-07-01' },
  { id: 2, nis: '1002', nama: 'Anisa Fitriani', jenis_kelamin: 'P', no_hp: '081234567802', status: 'Aktif', created_at: '2026-07-01' },
  { id: 3, nis: '1003', nama: 'Budi Santoso', jenis_kelamin: 'L', no_hp: '081234567803', status: 'Aktif', created_at: '2026-07-01' },
  { id: 4, nis: '1004', nama: 'Citra Dewi', jenis_kelamin: 'P', no_hp: '081234567804', status: 'Aktif', created_at: '2026-07-01' },
  { id: 5, nis: '1005', nama: 'Dedi Wijaya', jenis_kelamin: 'L', no_hp: '081234567805', status: 'Aktif', created_at: '2026-07-01' },
  { id: 6, nis: '1006', nama: 'Eka Putri Rahayu', jenis_kelamin: 'P', no_hp: '081234567806', status: 'Aktif', created_at: '2026-07-01' },
  { id: 7, nis: '1007', nama: 'Fajar Ramadhan', jenis_kelamin: 'L', no_hp: '081234567807', status: 'Aktif', created_at: '2026-07-01' },
  { id: 8, nis: '1008', nama: 'Gita Gutawa', jenis_kelamin: 'P', no_hp: '081234567808', status: 'Aktif', created_at: '2026-07-01' },
];

export const initialBulan: BulanPembayaran[] = [
  { id: 1, nama_bulan: 'Juli 2026', tahun: 2026, nominal_target: 20000, urutan: 1, keterangan: 'Kas Bulan Pertama TA 2026/2027', created_at: '2026-07-01' },
  { id: 2, nama_bulan: 'Agustus 2026', tahun: 2026, nominal_target: 20000, urutan: 2, keterangan: 'Kas Bulan Kedua TA 2026/2027', created_at: '2026-07-01' },
  { id: 3, nama_bulan: 'September 2026', tahun: 2026, nominal_target: 20000, urutan: 3, keterangan: 'Kas Bulan Ketiga TA 2026/2027', created_at: '2026-07-01' },
  { id: 4, nama_bulan: 'Oktober 2026', tahun: 2026, nominal_target: 20000, urutan: 4, keterangan: 'Kas Bulan Keempat TA 2026/2027', created_at: '2026-07-01' },
];

export const initialPembayaran: PembayaranKas[] = [
  { id: 1, siswa_id: 1, bulan_id: 1, tanggal: '2026-07-05', nominal: 20000, status: 'Lunas', metode_pembayaran: 'Tunai', status_konfirmasi: 'Disetujui', catatan: 'Pembayaran Tunai', created_by: 'bendahara', created_at: '2026-07-05' },
  { id: 2, siswa_id: 2, bulan_id: 1, tanggal: '2026-07-06', nominal: 20000, status: 'Lunas', metode_pembayaran: 'QRIS', status_konfirmasi: 'Disetujui', nomor_referensi: 'QRIS-8829102', catatan: 'Scan QRIS DANA', created_by: 'bendahara', created_at: '2026-07-06' },
  { id: 3, siswa_id: 3, bulan_id: 1, tanggal: '2026-07-07', nominal: 20000, status: 'Lunas', metode_pembayaran: 'E-Wallet', status_konfirmasi: 'Disetujui', nomor_referensi: 'GOPAY-99382', catatan: 'Transfer GoPay', created_by: 'bendahara', created_at: '2026-07-07' },
  { id: 4, siswa_id: 4, bulan_id: 1, tanggal: '2026-07-10', nominal: 20000, status: 'Lunas', metode_pembayaran: 'Tunai', status_konfirmasi: 'Disetujui', catatan: 'Pembayaran Tunai', created_by: 'bendahara', created_at: '2026-07-10' },
  { id: 5, siswa_id: 1, bulan_id: 2, tanggal: '2026-07-20', nominal: 20000, status: 'Lunas', metode_pembayaran: 'QRIS', status_konfirmasi: 'Disetujui', nomor_referensi: 'QRIS-991203', catatan: 'Pembayaran QRIS Lunas', created_by: 'bendahara', created_at: '2026-07-20' },
];

export const initialPengeluaran: PengeluaranKas[] = [
  { id: 1, judul: 'Pembelian Spidol & Penghapus Board', kategori: 'Alat Tulis', nominal: 25000, tanggal: '2026-07-08', keterangan: '2 Spidol Hitam, 1 Penghapus', created_by: 'bendahara', created_at: '2026-07-08' },
  { id: 2, judul: 'Fotocopy Jadwal & Denah Kelas', kategori: 'Foto Copy', nominal: 15000, tanggal: '2026-07-12', keterangan: 'Cetak 36 Lembar Berwarna', created_by: 'bendahara', created_at: '2026-07-12' },
];

export const initialPengaturan: PengaturanKelas = {
  nama_kelas: 'XII RPL 1',
  nominal_kas_mingguan: 5000,
  tahun_ajaran: '2026/2027',
  nama_wali_kelas: 'Dra. Endang Susilowati',
  nama_bendahara: 'Siti Rahma',
  qris_merchant_name: 'KAS KELAS XII RPL 1',
  gopay_number: '081234567801 (a.n Siti Rahma)',
  dana_number: '081234567801 (a.n Siti Rahma)',
  ovo_number: '081234567801 (a.n Siti Rahma)',
  shopeepay_number: '081234567801 (a.n Siti Rahma)',
  bank_account: 'BCA 8820123456 a.n Siti Rahma (Bendahara)'
};
