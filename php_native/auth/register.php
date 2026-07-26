<?php
require_once '../config/database.php';
require_once '../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username     = trim($_POST['username'] ?? '');
    $nama_lengkap = trim($_POST['nama_lengkap'] ?? '');
    $password     = trim($_POST['password'] ?? '');
    $role         = $_POST['role'] ?? 'Bendahara';

    if (empty($username) || empty($nama_lengkap) || empty($password)) {
        set_flash('error', 'Semua kolom wajib diisi!');
    } else {
        // Cek apakah username sudah dipakai
        $stmt_check = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt_check->execute([$username]);
        if ($stmt_check->rowCount() > 0) {
            set_flash('error', 'Username sudah terdaftar! Gunakan username lain.');
        } else {
            // Hash password dengan password_hash()
            $password_hashed = password_hash($password, PASSWORD_DEFAULT);

            $stmt_insert = $pdo->prepare("INSERT INTO users (username, nama_lengkap, role, password, created_at) VALUES (?, ?, ?, ?, NOW())");
            if ($stmt_insert->execute([$username, $nama_lengkap, $role, $password_hashed])) {
                set_flash('success', 'Registrasi berhasil! Silakan login.');
                header("Location: login.php");
                exit;
            } else {
                set_flash('error', 'Gagal mendaftarkan akun baru!');
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Website Uang Kas Kelas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>
<body class="bg-light d-flex align-items-center justify-content-center min-vh-100">
    <div class="card border-0 shadow-sm p-4 p-md-5" style="width: 100%; max-width: 450px; border-radius: 16px;">
        <h4 class="fw-bold mb-1 text-primary"><i class="bi bi-person-plus-fill me-2"></i>Registrasi Pengguna</h4>
        <p class="text-muted small mb-4">Buat akun petugas kas kelas baru</p>

        <?php display_flash(); ?>

        <form action="" method="POST">
            <div class="mb-3">
                <label class="form-label small fw-semibold">Nama Lengkap</label>
                <input type="text" name="nama_lengkap" class="form-control" placeholder="Contoh: Budi Santoso" required>
            </div>
            <div class="mb-3">
                <label class="form-label small fw-semibold">Username</label>
                <input type="text" name="username" class="form-control" placeholder="Contoh: budi123" required>
            </div>
            <div class="mb-3">
                <label class="form-label small fw-semibold">Role Hak Akses</label>
                <select name="role" class="form-select">
                    <option value="Bendahara">Bendahara</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="form-label small fw-semibold">Password</label>
                <input type="password" name="password" class="form-control" placeholder="Minimal 6 karakter" required>
            </div>
            <button type="submit" class="btn btn-primary w-100 py-2">Daftar Sekarang</button>
        </form>
        <div class="text-center mt-3 small">
            Sudah punya akun? <a href="login.php" class="text-decoration-none fw-semibold">Login di sini</a>
        </div>
    </div>
</body>
</html>
