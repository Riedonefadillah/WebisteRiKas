<?php
require_once '../includes/header.php';
require_once '../includes/sidebar.php';
require_once '../includes/navbar.php';

// 1. Total Pemasukan
$stmt_in = $pdo->query("SELECT COALESCE(SUM(nominal), 0) AS total FROM pembayaran_kas");
$total_pemasukan = $stmt_in->fetch()['total'];

// 2. Total Pengeluaran
$stmt_out = $pdo->query("SELECT COALESCE(SUM(nominal), 0) AS total FROM pengeluaran_kas");
$total_pengeluaran = $stmt_out->fetch()['total'];

// 3. Total Saldo Kas
$total_saldo = $total_pemasukan - $total_pengeluaran;

// 4. Jumlah Siswa Total
$stmt_siswa = $pdo->query("SELECT COUNT(*) AS total FROM siswa WHERE status = 'Aktif'");
$jumlah_siswa = $stmt_siswa->fetch()['total'];

// 5. Jumlah Siswa Sudah Membayar (pada bulan terbaru/terdaftar)
$stmt_paid = $pdo->query("SELECT COUNT(DISTINCT siswa_id) AS total FROM pembayaran_kas WHERE status = 'Lunas'");
$jumlah_siswa_sudah_bayar = $stmt_paid->fetch()['total'];

// 6. Jumlah Siswa Belum Membayar
$jumlah_siswa_belum_bayar = max(0, $jumlah_siswa - $jumlah_siswa_sudah_bayar);

// Recent Transactions
$stmt_recent_in = $pdo->query("
    SELECT p.*, s.nama AS nama_siswa, b.nama_bulan
    FROM pembayaran_kas p
    JOIN siswa s ON p.siswa_id = s.id
    JOIN bulan_pembayaran b ON p.bulan_id = b.id
    ORDER BY p.id DESC LIMIT 5
");
$recent_in = $stmt_recent_in->fetchAll();

$stmt_recent_out = $pdo->query("SELECT * FROM pengeluaran_kas ORDER BY id DESC LIMIT 5");
$recent_out = $stmt_recent_out->fetchAll();
?>

<div class="row g-3 mb-4">
    <!-- Card 1: Saldo Kas -->
    <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-stat bg-primary text-white p-3">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-white-50 small fw-bold text-uppercase">Total Saldo Kas</span>
                    <h3 class="fw-bold mb-0 mt-1"><?= format_rupiah($total_saldo); ?></h3>
                </div>
                <div class="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 54px; height: 54px;">
                    <i class="bi bi-wallet2 fs-3 text-white"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Card 2: Total Pemasukan -->
    <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-stat bg-success text-white p-3">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-white-50 small fw-bold text-uppercase">Total Pemasukan</span>
                    <h3 class="fw-bold mb-0 mt-1"><?= format_rupiah($total_pemasukan); ?></h3>
                </div>
                <div class="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 54px; height: 54px;">
                    <i class="bi bg-opacity-10 bi-arrow-down-left-circle fs-3 text-white"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Card 3: Total Pengeluaran -->
    <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-stat bg-danger text-white p-3">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-white-50 small fw-bold text-uppercase">Total Pengeluaran</span>
                    <h3 class="fw-bold mb-0 mt-1"><?= format_rupiah($total_pengeluaran); ?></h3>
                </div>
                <div class="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 54px; height: 54px;">
                    <i class="bi bi-arrow-up-right-circle fs-3 text-white"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Card 4: Jumlah Siswa -->
    <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-stat bg-info text-white p-3">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-white-50 small fw-bold text-uppercase">Total Siswa Aktif</span>
                    <h3 class="fw-bold mb-0 mt-1"><?= $jumlah_siswa; ?> Siswa</h3>
                </div>
                <div class="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 54px; height: 54px;">
                    <i class="bi bi-people fs-3 text-white"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Card 5: Siswa Sudah Membayar -->
    <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-stat bg-teal text-white p-3" style="background-color: #0d9488;">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-white-50 small fw-bold text-uppercase">Siswa Sudah Membayar</span>
                    <h3 class="fw-bold mb-0 mt-1"><?= $jumlah_siswa_sudah_bayar; ?> Siswa</h3>
                </div>
                <div class="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 54px; height: 54px;">
                    <i class="bi bi-check-circle fs-3 text-white"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Card 6: Siswa Belum Membayar -->
    <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-stat bg-warning text-dark p-3">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-dark-50 small fw-bold text-uppercase">Siswa Belum Membayar</span>
                    <h3 class="fw-bold mb-0 mt-1"><?= $jumlah_siswa_belum_bayar; ?> Siswa</h3>
                </div>
                <div class="bg-dark bg-opacity-10 rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 54px; height: 54px;">
                    <i class="bi bi-exclamation-circle fs-3 text-dark"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Recent Tables -->
<div class="row g-4">
    <div class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-primary mb-0"><i class="bi bi-arrow-down-left-circle me-2"></i>Pemasukan Terakhir</h6>
                <a href="pembayaran.php" class="btn btn-sm btn-outline-primary rounded-pill">Lihat Semua</a>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" style="font-size: 13px;">
                    <thead class="table-light">
                        <tr>
                            <th>Siswa</th>
                            <th>Bulan</th>
                            <th>Nominal</th>
                            <th>Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recent_in as $row): ?>
                        <tr>
                            <td class="fw-semibold"><?= htmlspecialchars($row['nama_siswa']); ?></td>
                            <td><span class="badge bg-primary-subtle text-primary"><?= htmlspecialchars($row['nama_bulan']); ?></span></td>
                            <td class="text-success fw-bold">+<?= format_rupiah($row['nominal']); ?></td>
                            <td class="text-muted"><?= format_tanggal_indo($row['tanggal']); ?></td>
                        </tr>
                        <?php endforeach; ?>
                        <?php if (empty($recent_in)): ?>
                        <tr><td colspan="4" class="text-center text-muted py-3">Belum ada transaksi pemasukan.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-danger mb-0"><i class="bi bi-arrow-up-right-circle me-2"></i>Pengeluaran Terakhir</h6>
                <a href="pengeluaran.php" class="btn btn-sm btn-outline-danger rounded-pill">Lihat Semua</a>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" style="font-size: 13px;">
                    <thead class="table-light">
                        <tr>
                            <th>Pengeluaran</th>
                            <th>Kategori</th>
                            <th>Nominal</th>
                            <th>Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recent_out as $row): ?>
                        <tr>
                            <td class="fw-semibold"><?= htmlspecialchars($row['judul']); ?></td>
                            <td><span class="badge bg-secondary-subtle text-secondary"><?= htmlspecialchars($row['kategori']); ?></span></td>
                            <td class="text-danger fw-bold">-<?= format_rupiah($row['nominal']); ?></td>
                            <td class="text-muted"><?= format_tanggal_indo($row['tanggal']); ?></td>
                        </tr>
                        <?php endforeach; ?>
                        <?php if (empty($recent_out)): ?>
                        <tr><td colspan="4" class="text-center text-muted py-3">Belum ada transaksi pengeluaran.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
