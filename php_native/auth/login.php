<?php
require_once '../config/database.php';
require_once '../includes/functions.php';

// Jika sudah login, lempar ke dashboard
if (isset($_SESSION['user_id'])) {
    header("Location: ../pages/dashboard.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($username) || empty($password)) {
        set_flash('error', 'Username dan password wajib diisi!');
    } else {
        // Query prepared statement untuk mencegah SQL Injection
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['nama_lengkap'] = $user['nama_lengkap'];
            $_SESSION['user_role'] = $user['role'];

            set_flash('success', 'Selamat datang kembali, ' . $user['nama_lengkap'] . '!');
            header("Location: ../pages/dashboard.php");
            exit;
        } else {
            set_flash('error', 'Username atau password tidak cocok!');
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Website Uang Kas Kelas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0f6ff; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .card-login { border: none; border-radius: 20px; box-shadow: 0 15px 35px rgba(13, 110, 253, 0.1); width: 100%; max-width: 420px; }
        .btn-blue { background-color: #0d6efd; color: #fff; border-radius: 10px; font-weight: 600; }
        .btn-blue:hover { background-color: #0b5ed7; color: #fff; }
    </style>
</head>
<body>
    <div class="container p-3">
        <div class="card card-login mx-auto p-4 p-md-5 bg-white">
            <div class="text-center mb-4">
                <div class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 64px; height: 64px;">
                    <i class="bi bi-wallet2 fs-2"></i>
                </div>
                <h4 class="fw-bold text-dark mb-1">Kas Kelas App</h4>
                <p class="text-muted small">Masuk untuk mengelola uang kas kelas</p>
            </div>

            <?php display_flash(); ?>

            <form action="" method="POST">
                <div class="mb-3">
                    <label class="form-label fw-semibold small text-secondary">Username</label>
                    <div class="input-group">
                        <span class="input-group-text bg-light border-end-0"><i class="bi bi-person"></i></span>
                        <input type="text" name="username" class="form-control bg-light border-start-0" placeholder="Masukkan username" required autofocus>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="form-label fw-semibold small text-secondary">Password</label>
                    <div class="input-group">
                        <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock"></i></span>
                        <input type="password" name="password" class="form-control bg-light border-start-0" placeholder="Masukkan password" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-blue w-full py-2.5 mb-3">
                    <i class="bi bi-box-arrow-in-right me-2"></i>Masuk Aplikasi
                </button>
            </form>
            <div class="text-center mt-3 small text-muted">
                Belum punya akun? <a href="register.php" class="text-primary text-decoration-none fw-semibold">Daftar Akun Baru</a>
            </div>
        </div>
    </div>
</body>
</html>
