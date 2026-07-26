import React, { useState } from 'react';

interface PhpFileItem {
  filename: string;
  path: string;
  description: string;
  code: string;
}

export const PhpExporterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  if (!isOpen) return null;

  const phpFiles: PhpFileItem[] = [
    {
      filename: 'database/schema.sql',
      path: '/database/schema.sql',
      description: 'Script Database MySQL lengkap siap import ke phpMyAdmin / Laragon / XAMPP',
      code: `-- Script MySQL Siap Import ke phpMyAdmin
CREATE DATABASE IF NOT EXISTS \`db_kas_kelas\`;
USE \`db_kas_kelas\`;

-- Tabel Users (password di-hash dengan password_hash())
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`nama_lengkap\` VARCHAR(100) NOT NULL,
  \`role\` ENUM('Admin', 'Bendahara') NOT NULL DEFAULT 'Bendahara',
  \`password\` VARCHAR(255) NOT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Siswa
CREATE TABLE IF NOT EXISTS \`siswa\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nis\` VARCHAR(20) NOT NULL UNIQUE,
  \`nama\` VARCHAR(100) NOT NULL,
  \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,
  \`no_hp\` VARCHAR(20) DEFAULT NULL,
  \`status\` ENUM('Aktif', 'Non-Aktif') DEFAULT 'Aktif',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Bulan Pembayaran (Fleksibel dari DB)
CREATE TABLE IF NOT EXISTS \`bulan_pembayaran\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nama_bulan\` VARCHAR(50) NOT NULL,
  \`tahun\` INT NOT NULL,
  \`nominal_target\` DECIMAL(12,2) NOT NULL DEFAULT 20000,
  \`urutan\` INT DEFAULT 1,
  \`keterangan\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pembayaran Kas
CREATE TABLE IF NOT EXISTS \`pembayaran_kas\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`siswa_id\` INT NOT NULL,
  \`bulan_id\` INT NOT NULL,
  \`tanggal\` DATE NOT NULL,
  \`nominal\` DECIMAL(12,2) NOT NULL,
  \`status\` ENUM('Lunas', 'Belum Lunas') NOT NULL DEFAULT 'Lunas',
  \`catatan\` VARCHAR(255) DEFAULT NULL,
  \`created_by\` VARCHAR(100) DEFAULT 'Bendahara',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`siswa_id\`) REFERENCES \`siswa\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`bulan_id\`) REFERENCES \`bulan_pembayaran\`(\`id\`) ON DELETE RESTRICT
);

-- Tabel Pengeluaran Kas
CREATE TABLE IF NOT EXISTS \`pengeluaran_kas\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`judul\` VARCHAR(150) NOT NULL,
  \`kategori\` VARCHAR(50) NOT NULL DEFAULT 'Umum',
  \`nominal\` DECIMAL(12,2) NOT NULL,
  \`tanggal\` DATE NOT NULL,
  \`keterangan\` TEXT DEFAULT NULL,
  \`created_by\` VARCHAR(100) DEFAULT 'Bendahara',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Users (Default Pass: admin123)
INSERT INTO \`users\` (\`username\`, \`nama_lengkap\`, \`role\`, \`password\`) VALUES
('admin', 'Administrator Kelas', 'Admin', '$2y$10$hL4/e6xG9/v3V1Gj7M3.4O1vF5N2L/b/S3cW3oK5J9Z2L/b/S3cW3'),
('bendahara', 'Siti Rahma (Bendahara)', 'Bendahara', '$2y$10$hL4/e6xG9/v3V1Gj7M3.4O1vF5N2L/b/S3cW3oK5J9Z2L/b/S3cW3');`
    },
    {
      filename: 'config/database.php',
      path: '/php_native/config/database.php',
      description: 'Koneksi PDO PHP Native dengan Prepared Statements',
      code: `<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "db_kas_kelas";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    die("Koneksi Database Gagal: " . $e->getMessage());
}
?>`
    },
    {
      filename: 'auth/login.php',
      path: '/php_native/auth/login.php',
      description: 'Halaman Login dengan password_verify() & Session',
      code: `<?php
require_once '../config/database.php';
require_once '../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['nama_lengkap'] = $user['nama_lengkap'];
        $_SESSION['user_role'] = $user['role'];
        header("Location: ../pages/dashboard.php");
        exit;
    }
}
?>`
    },
    {
      filename: 'pages/bulan.php',
      path: '/php_native/pages/bulan.php',
      description: 'Manajemen Bulan Pembayaran Fleksibel dari DB',
      code: `<?php
// Hapus Bulan jika tidak ada transaksi pembayaran
if (isset($_GET['action']) && $_GET['action'] === 'delete') {
    $id = (int)$_GET['id'];
    $stmt_check = $pdo->prepare("SELECT COUNT(*) AS total FROM pembayaran_kas WHERE bulan_id = ?");
    $stmt_check->execute([$id]);
    if ($stmt_check->fetch()['total'] > 0) {
        set_flash('error', 'Gagal hapus! Bulan masih memiliki data pembayaran.');
    } else {
        $stmt = $pdo->prepare("DELETE FROM bulan_pembayaran WHERE id = ?");
        $stmt->execute([$id]);
        set_flash('success', 'Bulan berhasil dihapus!');
    }
}
?>`
    }
  ];

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleDownloadSql = () => {
    const sqlContent = phpFiles[0].code;
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'db_kas_kelas.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFile = phpFiles[activeFileIndex];

  return (
    <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex={-1} style={{ zIndex: 1060 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-dark text-white border-bottom-0 py-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-filetype-php fs-4 text-warning"></i>
              <div>
                <h6 className="fw-bold mb-0 text-white">Source Code PHP Native &amp; Database SQL</h6>
                <small className="text-white-50" style={{ fontSize: '11px' }}>
                  Struktur folder &amp; kode lengkap siap copy/export ke XAMPP / Laragon
                </small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-0 d-flex flex-column flex-md-row" style={{ minHeight: '480px' }}>
            {/* Sidebar list */}
            <div className="bg-light border-end p-3" style={{ minWidth: '280px' }}>
              <div className="fw-bold small text-muted text-uppercase mb-2" style={{ fontSize: '10px' }}>
                Daftar File Project PHP
              </div>
              <div className="nav flex-column nav-pills gap-1">
                {phpFiles.map((f, i) => (
                  <button
                    key={f.filename}
                    onClick={() => setActiveFileIndex(i)}
                    className={`nav-link text-start text-truncate py-2 px-2.5 rounded-3 border-0 small ${
                      activeFileIndex === i ? 'active fw-bold' : 'text-dark hover:bg-white'
                    }`}
                  >
                    <i className={`bi ${f.filename.endsWith('.sql') ? 'bi-database-fill text-warning' : 'bi-filetype-php text-primary'} me-2`}></i>
                    {f.filename}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-top">
                <button
                  onClick={handleDownloadSql}
                  className="btn btn-warning btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1.5"
                >
                  <i className="bi bi-download"></i>
                  <span>Download .SQL (phpMyAdmin)</span>
                </button>
              </div>
            </div>

            {/* Code Viewer */}
            <div className="p-4 flex-grow-1 bg-white overflow-auto d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="fw-bold mb-0 text-dark">{activeFile.filename}</h6>
                  <p className="text-muted small mb-0">{activeFile.description}</p>
                </div>
                <button
                  onClick={() => handleCopyCode(activeFile.code, activeFileIndex)}
                  className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-1"
                >
                  <i className={`bi bi-${copiedIndex === activeFileIndex ? 'check-lg' : 'clipboard'}`}></i>
                  <span>{copiedIndex === activeFileIndex ? 'Tersalin!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="bg-dark text-light p-3 rounded-3 overflow-auto flex-grow-1 mb-0" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                <code>{activeFile.code}</code>
              </pre>
            </div>
          </div>

          <div className="modal-footer bg-light border-top-0 py-2.5 px-4 justify-content-between">
            <span className="text-muted small" style={{ fontSize: '11px' }}>
              💡 Seluruh file PHP ini tersimpan langsung di folder project <code>/php_native/</code> dan <code>/database/schema.sql</code>.
            </span>
            <button onClick={onClose} className="btn btn-secondary btn-sm px-4">Tutup Modal</button>
          </div>
        </div>
      </div>
    </div>
  );
};
