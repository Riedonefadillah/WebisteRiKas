<?php
require_once '../includes/header.php';
require_once '../includes/sidebar.php';
require_once '../includes/navbar.php';

// Filter
$bulan_id = (int)($_GET['bulan_id'] ?? 0);
$tahun    = (int)($_GET['tahun'] ?? date('Y'));

// Fetch list bulan untuk dropdown filter
$stmt_b = $pdo->query("SELECT * FROM bulan_pembayaran ORDER BY urutan ASC, id ASC");
$options_bulan = $stmt_b->fetchAll();

// Query Pemasukan
$query_in = "
    SELECT p.*, s.nama AS nama_siswa, s.nis, b.nama_bulan
    FROM pembayaran_kas p
    JOIN siswa s ON p.siswa_id = s.id
    JOIN bulan_pembayaran b ON p.bulan_id = b.id
    WHERE 1=1
";
$params_in = [];
if ($bulan_id > 0) {
    $query_in .= " AND p.bulan_id = ?";
    $params_in[] = $bulan_id;
}
$query_in .= " ORDER BY p.tanggal ASC";
$stmt_in = $pdo->prepare($query_in);
$stmt_in->execute($params_in);
$pemasukan = $stmt_in->fetchAll();

// Query Pengeluaran
$query_out = "SELECT * FROM pengeluaran_kas WHERE 1=1";
$params_out = [];
if ($bulan_id > 0) {
    // jika filter bulan aktif
    $stmt_binfo = $pdo->prepare("SELECT nama_bulan FROM bulan_pembayaran WHERE id = ?");
    $stmt_binfo->execute([$bulan_id]);
    $binfo = $stmt_binfo->fetch();
}
$query_out .= " ORDER BY tanggal ASC";
$stmt_out = $pdo->prepare($query_out);
$stmt_out->execute($params_out);
$pengeluaran = $stmt_out->fetchAll();

// Calculate Totals
$total_in = array_sum(array_column($pemasukan, 'nominal'));
$total_out = array_sum(array_column($pengeluaran, 'nominal'));
$saldo_akhir = $total_in - $total_out;
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 no-print">
    <div>
        <h4 class="fw-bold mb-1 text-primary"><i class="bi bi-file-earmark-bar-graph-fill me-2"></i>Laporan Rekapitulasi Kas</h4>
        <p class="text-muted small mb-0">Laporan pemasukan, pengeluaran, dan saldo akhir kas kelas</p>
    </div>
    <div class="d-flex gap-2">
        <button type="button" class="btn btn-dark btn-sm rounded-3 px-3 py-2" onclick="window.print()">
            <i class="bi bi-printer-fill me-1"></i>Cetak Laporan / PDF
        </button>
    </div>
</div>

<!-- Filter Card -->
<div class="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4 no-print">
    <form action="" method="GET" class="row g-3 align-items-center">
        <div class="col-12 col-md-5">
            <label class="form-label small fw-semibold text-secondary">Filter Periode Bulan</label>
            <select name="bulan_id" class="form-select form-select-sm" onchange="this.form.submit()">
                <option value="0">-- Semua Periode Bulan --</option>
                <?php foreach ($options_bulan as $b): ?>
                <option value="<?= $b['id']; ?>" <?= $bulan_id == $b['id'] ? 'selected' : ''; ?>>
                    <?= htmlspecialchars($b['nama_bulan']); ?>
                </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-12 col-md-4">
            <label class="form-label small fw-semibold text-secondary">Filter Tahun</label>
            <input type="number" name="tahun" class="form-control form-control-sm" value="<?= $tahun; ?>" onchange="this.form.submit()">
        </div>
        <div class="col-12 col-md-3 d-flex align-items-end">
            <a href="laporan.php" class="btn btn-outline-secondary btn-sm w-100"><i class="bi bi-arrow-counterclockwise me-1"></i>Reset Filter</a>
        </div>
    </form>
</div>

<!-- Print Header -->
<div class="d-none d-print-block mb-4 text-center">
    <h3 class="fw-bold mb-0">LAPORAN REKAPITULASI UANG KAS KELAS</h3>
    <h5 class="fw-semibold text-primary mb-1"><?= htmlspecialchars($setting['nama_kelas']); ?> - T.A <?= htmlspecialchars($setting['tahun_ajaran']); ?></h5>
    <p class="small text-muted mb-0">Dicetak Pada: <?= format_tanggal_indo(date('Y-m-d')); ?> | Oleh: <?= htmlspecialchars($_SESSION['nama_lengkap'] ?? 'Bendahara'); ?></p>
    <hr class="my-3">
</div>

<!-- Summary Cards -->
<div class="row g-3 mb-4">
    <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-success text-white">
            <span class="small text-white-50 font-bold text-uppercase">Total Pemasukan</span>
            <h4 class="fw-bold mb-0 mt-1"><?= format_rupiah($total_in); ?></h4>
        </div>
    </div>
    <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-danger text-white">
            <span class="small text-white-50 font-bold text-uppercase">Total Pengeluaran</span>
            <h4 class="fw-bold mb-0 mt-1"><?= format_rupiah($total_out); ?></h4>
        </div>
    </div>
    <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-primary text-white">
            <span class="small text-white-50 font-bold text-uppercase">Saldo Akhir Kas</span>
            <h4 class="fw-bold mb-0 mt-1"><?= format_rupiah($saldo_akhir); ?></h4>
        </div>
    </div>
</div>

<!-- Table Pemasukan -->
<div class="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
    <h6 class="fw-bold text-success mb-3"><i class="bi bi-arrow-down-left-circle me-2"></i>Rincian Pemasukan Kas</h6>
    <div class="table-responsive">
        <table class="table table-bordered align-middle mb-0" style="font-size: 13px;">
            <thead class="table-light">
                <tr>
                    <th width="40">No</th>
                    <th>NIS</th>
                    <th>Nama Siswa</th>
                    <th>Bulan</th>
                    <th>Tanggal</th>
                    <th>Nominal</th>
                </tr>
            </thead>
            <tbody>
                <?php $no = 1; foreach ($pemasukan as $p): ?>
                <tr>
                    <td><?= $no++; ?></td>
                    <td><?= htmlspecialchars($p['nis']); ?></td>
                    <td class="fw-semibold"><?= htmlspecialchars($p['nama_siswa']); ?></td>
                    <td><?= htmlspecialchars($p['nama_bulan']); ?></td>
                    <td><?= format_tanggal_indo($p['tanggal']); ?></td>
                    <td class="fw-bold text-success">+<?= format_rupiah($p['nominal']); ?></td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($pemasukan)): ?>
                <tr><td colspan="6" class="text-center text-muted py-3">Tidak ada data pemasukan pada periode ini.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Table Pengeluaran -->
<div class="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
    <h6 class="fw-bold text-danger mb-3"><i class="bi bi-arrow-up-right-circle me-2"></i>Rincian Pengeluaran Kas</h6>
    <div class="table-responsive">
        <table class="table table-bordered align-middle mb-0" style="font-size: 13px;">
            <thead class="table-light">
                <tr>
                    <th width="40">No</th>
                    <th>Judul Pengeluaran</th>
                    <th>Kategori</th>
                    <th>Tanggal</th>
                    <th>Nominal</th>
                </tr>
            </thead>
            <tbody>
                <?php $no = 1; foreach ($pengeluaran as $p): ?>
                <tr>
                    <td><?= $no++; ?></td>
                    <td class="fw-semibold"><?= htmlspecialchars($p['judul']); ?></td>
                    <td><?= htmlspecialchars($p['kategori']); ?></td>
                    <td><?= format_tanggal_indo($p['tanggal']); ?></td>
                    <td class="fw-bold text-danger">-<?= format_rupiah($p['nominal']); ?></td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($pengeluaran)): ?>
                <tr><td colspan="5" class="text-center text-muted py-3">Tidak ada data pengeluaran pada periode ini.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Signatures for Print -->
<div class="d-none d-print-block mt-5 pt-4">
    <div class="row text-center">
        <div class="col-6">
            <p class="mb-5">Mengetahui,<br><strong>Wali Kelas</strong></p>
            <p class="fw-bold mb-0 text-decoration-underline"><?= htmlspecialchars($setting['nama_wali_kelas'] ?: 'Dra. Endang Susilowati'); ?></p>
        </div>
        <div class="col-6">
            <p class="mb-5">Mengetahui,<br><strong>Bendahara Kelas</strong></p>
            <p class="fw-bold mb-0 text-decoration-underline"><?= htmlspecialchars($setting['nama_bendahara'] ?: 'Siti Rahma'); ?></p>
        </div>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
