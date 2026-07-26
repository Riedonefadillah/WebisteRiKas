<?php
/**
 * Helper Functions & Session Control
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cek apakah user sudah login
function check_login() {
    if (!isset($_SESSION['user_id'])) {
        $_SESSION['flash_error'] = "Anda harus login terlebih dahulu!";
        header("Location: ../auth/login.php");
        exit;
    }
}

// Cek apakah user adalah Admin
function is_admin() {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Admin';
}

// Format Rupiah
function format_rupiah($nominal) {
    return "Rp " . number_format($nominal, 0, ',', '.');
}

// Format Tanggal Indonesia
function format_tanggal_indo($tanggal) {
    if (!$tanggal) return '-';
    $bulan_indo = [
        1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    $split = explode('-', $tanggal);
    return $split[2] . ' ' . $bulan_indo[(int)$split[1]] . ' ' . $split[0];
}

// Set Flash Alert
function set_flash($type, $message) {
    $_SESSION['flash_' . $type] = $message;
}

// Show Flash Alert
function display_flash() {
    if (isset($_SESSION['flash_success'])) {
        echo '<div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>' . htmlspecialchars($_SESSION['flash_success']) . '
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
              </div>';
        unset($_SESSION['flash_success']);
    }
    if (isset($_SESSION['flash_error'])) {
        echo '<div class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>' . htmlspecialchars($_SESSION['flash_error']) . '
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
              </div>';
        unset($_SESSION['flash_error']);
    }
}
?>
