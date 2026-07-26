export type UserRole = 'Admin' | 'Bendahara';

export interface User {
  id: number;
  username: string;
  nama_lengkap: string;
  role: UserRole;
  password_hash?: string;
  created_at: string;
}

export interface Siswa {
  id: number;
  nis: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  no_hp: string;
  status: 'Aktif' | 'Non-Aktif';
  created_at: string;
}

export interface BulanPembayaran {
  id: number;
  nama_bulan: string; // e.g. "Juli 2026", "Agustus 2026"
  tahun: number;      // e.g. 2026
  nominal_target: number; // e.g. 20000
  urutan: number;
  keterangan?: string;
  created_at: string;
}

export interface PembayaranKas {
  id: number;
  siswa_id: number;
  bulan_id: number;
  tanggal: string; // YYYY-MM-DD
  nominal: number;
  status: 'Lunas' | 'Belum Lunas';
  catatan?: string;
  created_by?: string;
  created_at: string;
}

export interface PengeluaranKas {
  id: number;
  judul: string;
  kategori: string; // e.g., "Alat Tulis", "Konsumsi", "Kegiatan", "Sosial", "Lainnya"
  nominal: number;
  tanggal: string; // YYYY-MM-DD
  keterangan?: string;
  created_by?: string;
  created_at: string;
}

export interface PengaturanKelas {
  nama_kelas: string;
  nominal_kas_mingguan: number;
  tahun_ajaran: string;
  nama_wali_kelas: string;
  nama_bendahara: string;
}

export type ThemeColor = 'blue' | 'emerald' | 'purple' | 'sunset' | 'crimson';
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  color: ThemeColor;
}
