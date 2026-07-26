<?php
require_once '../config/database.php';
require_once '../includes/functions.php';

// Proteksi Halaman: Wajib Login
check_login();

// Ambil info pengaturan kelas
$stmt_setting = $pdo->query("SELECT * FROM pengaturan WHERE id = 1");
$setting = $stmt_setting->fetch() ?: [
    'nama_kelas' => 'XII RPL 1',
    'nominal_kas_mingguan' => 5000,
    'tahun_ajaran' => '2026/2027'
];
?>
<!DOCTYPE html>
<html lang="id" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Uang Kas Kelas - <?= htmlspecialchars($setting['nama_kelas']); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; }
        .sidebar { width: 260px; min-height: 100vh; background: #ffffff; border-right: 1px solid #e2e8f0; }
        .sidebar .nav-link { color: #64748b; font-weight: 500; padding: 10px 16px; border-radius: 10px; margin-bottom: 4px; }
        .sidebar .nav-link:hover, .sidebar .nav-link.active { color: #0d6efd; background-color: #e7f1ff; font-weight: 600; }
        .content-area { flex: 1; padding: 24px; }
        .card-stat { border: none; border-radius: 16px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04); transition: transform 0.2s ease; }
        .card-stat:hover { transform: translateY(-3px); }
    </style>
</head>
<body>
<div class="d-flex min-vh-100">
