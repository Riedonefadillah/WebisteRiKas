import { Siswa, BulanPembayaran, PembayaranKas, PengeluaranKas, PengaturanKelas, User } from '../types';

export const initialUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    nama_lengkap: 'Administrator',
    role: 'Admin',
    created_at: '2026-07-01 08:00:00'
  }
];

export const initialSiswa: Siswa[] = [];

export const initialBulan: BulanPembayaran[] = [];

export const initialPembayaran: PembayaranKas[] = [];

export const initialPengeluaran: PengeluaranKas[] = [];

export const initialPengaturan: PengaturanKelas = {
  nama_kelas: '',
  nominal_kas_mingguan: 0,
  tahun_ajaran: '',
  nama_wali_kelas: '',
  nama_bendahara: '',
  qris_merchant_name: '',
  gopay_number: '',
  dana_number: '',
  ovo_number: '',
  shopeepay_number: '',
  bank_account: ''
};
