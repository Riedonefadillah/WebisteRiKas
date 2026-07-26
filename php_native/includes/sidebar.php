<?php
$current_page = basename($_SERVER['PHP_SELF']);
?>
<div class="sidebar p-3 d-none d-md-block">
    <div class="d-flex align-items-center gap-2 mb-4 px-2">
        <div class="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
            <i class="bi bi-cash-stack fs-4"></i>
        </div>
        <div>
            <h6 class="fw-bold mb-0 text-dark"><?= htmlspecialchars($setting['nama_kelas']); ?></h6>
            <small class="text-muted" style="font-size: 11px;">T.A <?= htmlspecialchars($setting['tahun_ajaran']); ?></small>
        </div>
    </div>

    <div class="text-uppercase text-muted px-3 mb-2" style="font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">Menu Utama</div>

    <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item">
            <a href="dashboard.php" class="nav-link <?= $current_page == 'dashboard.php' ? 'active' : ''; ?>">
                <i class="bi bi-grid-1x2-fill me-2"></i>Dashboard
            </a>
        </li>
        <li class="nav-item">
            <a href="siswa.php" class="nav-link <?= $current_page == 'siswa.php' ? 'active' : ''; ?>">
                <i class="bi bi-people-fill me-2"></i>Data Siswa
            </a>
        </li>
        <li class="nav-item">
            <a href="bulan.php" class="nav-link <?= $current_page == 'bulan.php' ? 'active' : ''; ?>">
                <i class="bi bi-calendar-check-fill me-2"></i>Manajemen Bulan
            </a>
        </li>
        <li class="nav-item">
            <a href="pembayaran.php" class="nav-link <?= $current_page == 'pembayaran.php' ? 'active' : ''; ?>">
                <i class="bi bi-wallet-fill me-2"></i>Pembayaran Kas
            </a>
        </li>
        <li class="nav-item">
            <a href="pengeluaran.php" class="nav-link <?= $current_page == 'pengeluaran.php' ? 'active' : ''; ?>">
                <i class="bi bi-receipt-cutoff me-2"></i>Pengeluaran Kas
            </a>
        </li>
        <li class="nav-item">
            <a href="laporan.php" class="nav-link <?= $current_page == 'laporan.php' ? 'active' : ''; ?>">
                <i class="bi bi-file-earmark-bar-graph-fill me-2"></i>Laporan Kas
            </a>
        </li>
        <li class="nav-item mt-3">
            <a href="pengaturan.php" class="nav-link <?= $current_page == 'pengaturan.php' ? 'active' : ''; ?>">
                <i class="bi bi-gear-fill me-2"></i>Pengaturan
            </a>
        </li>
    </ul>

    <hr class="my-3 text-secondary opacity-25">

    <div class="px-2">
        <div class="d-flex align-items-center gap-2 p-2 rounded bg-light">
            <div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-weight: bold; font-size: 12px;">
                <?= strtoupper(substr($_SESSION['username'] ?? 'U', 0, 1)); ?>
            </div>
            <div class="overflow-hidden" style="flex: 1;">
                <div class="fw-semibold text-truncate small"><?= htmlspecialchars($_SESSION['nama_lengkap'] ?? 'User'); ?></div>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 10px;"><?= htmlspecialchars($_SESSION['user_role'] ?? 'Bendahara'); ?></span>
            </div>
        </div>
        <a href="../auth/logout.php" class="btn btn-outline-danger btn-sm w-100 mt-2">
            <i class="bi bi-box-arrow-right me-1"></i>Logout
        </a>
    </div>
</div>
