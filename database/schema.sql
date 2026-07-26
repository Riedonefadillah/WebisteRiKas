-- ============================================================
-- DATABASE SCHEMA & SEED DATA FOR "WEBSITE UANG KAS KELAS"
-- Compatible with MySQL / MariaDB (phpMyAdmin / XAMPP / Laragon)
-- Engine: InnoDB | Charset: utf8mb4
-- ============================================================

-- ------------------------------------------------------------
-- ERD & DOKUMENTASI RELASI TABEL:
-- 1. users (id PK)
-- 2. siswa (id PK)
-- 3. bulan_pembayaran (id PK)
-- 4. pembayaran_kas (id PK, siswa_id FK -> siswa.id, bulan_id FK -> bulan_pembayaran.id)
-- 5. pengeluaran_kas (id PK)
-- 6. pengaturan (id PK)
-- ------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `db_kas_kelas` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_kas_kelas`;

-- ------------------------------------------------------------
-- 1. TABEL USERS (Autentikasi & Role Admin / Bendahara)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `pembayaran_kas`;
DROP TABLE IF EXISTS `pengeluaran_kas`;
DROP TABLE IF EXISTS `bulan_pembayaran`;
DROP TABLE IF EXISTS `siswa`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `pengaturan`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `role` ENUM('Admin', 'Bendahara') NOT NULL DEFAULT 'Bendahara',
  `password` VARCHAR(255) NOT NULL, -- Di-hash menggunakan password_hash()
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Users (Password Default: admin123 & bendahara123)
-- Hash BCRYPT contoh ($2y$10$...)
INSERT INTO `users` (`id`, `username`, `nama_lengkap`, `role`, `password`, `created_at`) VALUES
(1, 'admin', 'Administrator Kelas', 'Admin', '$2y$10$hL4/e6xG9/v3V1Gj7M3.4O1vF5N2L/b/S3cW3oK5J9Z2L/b/S3cW3', NOW()),
(2, 'bendahara', 'Siti Rahma (Bendahara)', 'Bendahara', '$2y$10$hL4/e6xG9/v3V1Gj7M3.4O1vF5N2L/b/S3cW3oK5J9Z2L/b/S3cW3', NOW());

-- ------------------------------------------------------------
-- 2. TABEL SISWA
-- ------------------------------------------------------------
CREATE TABLE `siswa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nis` VARCHAR(20) NOT NULL UNIQUE,
  `nama` VARCHAR(100) NOT NULL,
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `no_hp` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('Aktif', 'Non-Aktif') DEFAULT 'Aktif',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data Siswa
INSERT INTO `siswa` (`id`, `nis`, `nama`, `jenis_kelamin`, `no_hp`, `status`, `created_at`) VALUES
(1, '1001', 'Ahmad Rizky Pratama', 'L', '081234567801', 'Aktif', NOW()),
(2, '1002', 'Anisa Fitriani', 'P', '081234567802', 'Aktif', NOW()),
(3, '1003', 'Budi Santoso', 'L', '081234567803', 'Aktif', NOW()),
(4, '1004', 'Citra Dewi', 'P', '081234567804', 'Aktif', NOW()),
(5, '1005', 'Dedi Wijaya', 'L', '081234567805', 'Aktif', NOW()),
(6, '1006', 'Eka Putri Rahayu', 'P', '081234567806', 'Aktif', NOW()),
(7, '1007', 'Fajar Ramadhan', 'L', '081234567807', 'Aktif', NOW()),
(8, '1008', 'Gita Gutawa', 'P', '081234567808', 'Aktif', NOW());

-- ------------------------------------------------------------
-- 3. TABEL BULAN PEMBAYARAN (Manajemen Bulan Fleksibel)
-- ------------------------------------------------------------
CREATE TABLE `bulan_pembayaran` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_bulan` VARCHAR(50) NOT NULL,
  `tahun` INT NOT NULL,
  `nominal_target` DECIMAL(12,2) NOT NULL DEFAULT 20000,
  `urutan` INT DEFAULT 1,
  `keterangan` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data Bulan
INSERT INTO `bulan_pembayaran` (`id`, `nama_bulan`, `tahun`, `nominal_target`, `urutan`, `keterangan`, `created_at`) VALUES
(1, 'Juli 2026', 2026, 20000, 1, 'Kas Bulan Pertama TA 2026/2027', NOW()),
(2, 'Agustus 2026', 2026, 20000, 2, 'Kas Bulan Kedua TA 2026/2027', NOW()),
(3, 'September 2026', 2026, 20000, 3, 'Kas Bulan Ketiga TA 2026/2027', NOW()),
(4, 'Oktober 2026', 2026, 20000, 4, 'Kas Bulan Keempat TA 2026/2027', NOW());

-- ------------------------------------------------------------
-- 4. TABEL PEMBAYARAN KAS
-- ------------------------------------------------------------
CREATE TABLE `pembayaran_kas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `siswa_id` INT NOT NULL,
  `bulan_id` INT NOT NULL,
  `tanggal` DATE NOT NULL,
  `nominal` DECIMAL(12,2) NOT NULL,
  `status` ENUM('Lunas', 'Belum Lunas') NOT NULL DEFAULT 'Lunas',
  `catatan` VARCHAR(255) DEFAULT NULL,
  `created_by` VARCHAR(100) DEFAULT 'Bendahara',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_pembayaran_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pembayaran_bulan` FOREIGN KEY (`bulan_id`) REFERENCES `bulan_pembayaran` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data Pembayaran Kas
INSERT INTO `pembayaran_kas` (`id`, `siswa_id`, `bulan_id`, `tanggal`, `nominal`, `status`, `catatan`, `created_by`, `created_at`) VALUES
(1, 1, 1, '2026-07-05', 20000, 'Lunas', 'Pembayaran via Cash', 'bendahara', NOW()),
(2, 2, 1, '2026-07-06', 20000, 'Lunas', 'Pembayaran Transfer', 'bendahara', NOW()),
(3, 3, 1, '2026-07-07', 20000, 'Lunas', 'Pembayaran Cash', 'bendahara', NOW()),
(4, 4, 1, '2026-07-10', 20000, 'Lunas', 'Pembayaran Cash', 'bendahara', NOW()),
(5, 1, 2, '2026-07-20', 20000, 'Lunas', 'Lunas Bulan Agustus', 'bendahara', NOW());

-- ------------------------------------------------------------
-- 5. TABEL PENGELUARAN KAS
-- ------------------------------------------------------------
CREATE TABLE `pengeluaran_kas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `judul` VARCHAR(150) NOT NULL,
  `kategori` VARCHAR(50) NOT NULL DEFAULT 'Umum',
  `nominal` DECIMAL(12,2) NOT NULL,
  `tanggal` DATE NOT NULL,
  `keterangan` TEXT DEFAULT NULL,
  `created_by` VARCHAR(100) DEFAULT 'Bendahara',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data Pengeluaran
INSERT INTO `pengeluaran_kas` (`id`, `judul`, `kategori`, `nominal`, `tanggal`, `keterangan`, `created_by`, `created_at`) VALUES
(1, 'Pembelian Spidol & Penghapus Board', 'Alat Tulis', 25000, '2026-07-08', '2 Spidol Hitam, 1 Penghapus', 'bendahara', NOW()),
(2, 'Fotocopy Jadwal & Denah Kelas', 'Foto Copy', 15000, '2026-07-12', 'Cetak 36 Lembar Berwarna', 'bendahara', NOW());

-- ------------------------------------------------------------
-- 6. TABEL PENGATURAN KELAS
-- ------------------------------------------------------------
CREATE TABLE `pengaturan` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `nama_kelas` VARCHAR(50) NOT NULL DEFAULT 'XII RPL 1',
  `nominal_kas_mingguan` DECIMAL(12,2) NOT NULL DEFAULT 5000,
  `tahun_ajaran` VARCHAR(20) NOT NULL DEFAULT '2026/2027',
  `nama_wali_kelas` VARCHAR(100) DEFAULT 'Dra. Endang Susilowati',
  `nama_bendahara` VARCHAR(100) DEFAULT 'Siti Rahma'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data Pengaturan
INSERT INTO `pengaturan` (`id`, `nama_kelas`, `nominal_kas_mingguan`, `tahun_ajaran`, `nama_wali_kelas`, `nama_bendahara`) VALUES
(1, 'XII RPL 1', 5000, '2026/2027', 'Dra. Endang Susilowati', 'Siti Rahma');
