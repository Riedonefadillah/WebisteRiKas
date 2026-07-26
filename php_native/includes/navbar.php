<div class="content-area">
    <nav class="navbar navbar-expand-lg navbar-light bg-white rounded-3 shadow-sm mb-4 px-3 py-2 border">
        <div class="container-fluid p-0">
            <span class="navbar-brand fw-bold fs-6 text-primary me-auto">
                <i class="bi bi-wallet2 me-2"></i>Uang Kas Kelas <?= htmlspecialchars($setting['nama_kelas']); ?>
            </span>
            <div class="d-flex align-items-center gap-2">
                <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill small">
                    <i class="bi bi-person-badge me-1"></i>Role: <?= htmlspecialchars($_SESSION['user_role'] ?? 'Bendahara'); ?>
                </span>
                <a href="../auth/logout.php" class="btn btn-outline-danger btn-sm d-md-none">
                    <i class="bi bi-box-arrow-right"></i>
                </a>
            </div>
        </div>
    </nav>

    <?php display_flash(); ?>
