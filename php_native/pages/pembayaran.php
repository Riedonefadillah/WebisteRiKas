<?php
require_once '../includes/header.php';
require_once '../includes/sidebar.php';
require_once '../includes/navbar.php';

// Fetch bulan dari DB untuk dropdown
$stmt_bulan_dd = $pdo->query("SELECT * FROM bulan_pembayaran ORDER BY urutan ASC, id ASC");
$options_bulan = $stmt_bulan_dd->fetchAll();

// Fetch siswa dari DB
$stmt_siswa_dd = $pdo->query("SELECT * FROM siswa WHERE status = 'Aktif' ORDER BY nama ASC");
$options_siswa = $stmt_siswa_dd->fetchAll();

// 1. TAMBAH PEMBAYARAN
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['tambah_pembayaran'])) {
    $siswa_id = (int)$_POST['siswa_id'];
    $bulan_id = (int)$_POST['bulan_id'];
    $tanggal  = $_POST['tanggal'];
    $nominal  = (float)$_POST['nominal'];
    $status   = $_POST['status'];
    $catatan  = trim($_POST['catatan']);

    if (empty($siswa_id) || empty($bulan_id) || empty($nominal)) {
        set_flash('error', 'Pilih Siswa, Bulan, dan Nominal!');
    } else {
        // Cek apakah sudah pernah bayar di bulan ini
        $stmt_check = $pdo->prepare("SELECT id FROM pembayaran_kas WHERE siswa_id = ? AND bulan_id = ?");
        $stmt_check->execute([$siswa_id, $bulan_id]);
        if ($stmt_check->rowCount() > 0) {
            set_flash('error', 'Siswa tersebut sudah memiliki catatan pembayaran untuk bulan ini!');
        } else {
            $stmt = $pdo->prepare("INSERT INTO pembayaran_kas (siswa_id, bulan_id, tanggal, nominal, status, catatan, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$siswa_id, $bulan_id, $tanggal, $nominal, $status, $catatan, $_SESSION['username'] ?? 'Bendahara']);
            set_flash('success', 'Pembayaran kas berhasil dicatat!');
            header("Location: pembayaran.php");
            exit;
        }
    }
}

// 2. EDIT PEMBAYARAN
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['edit_pembayaran'])) {
    $id       = (int)$_POST['id'];
    $siswa_id = (int)$_POST['siswa_id'];
    $bulan_id = (int)$_POST['bulan_id'];
    $tanggal  = $_POST['tanggal'];
    $nominal  = (float)$_POST['nominal'];
    $status   = $_POST['status'];
    $catatan  = trim($_POST['catatan']);

    $stmt = $pdo->prepare("UPDATE pembayaran_kas SET siswa_id = ?, bulan_id = ?, tanggal = ?, nominal = ?, status = ?, catatan = ? WHERE id = ?");
    $stmt->execute([$siswa_id, $bulan_id, $tanggal, $nominal, $status, $catatan, $id]);
    set_flash('success', 'Data pembayaran berhasil diperbarui!');
    header("Location: pembayaran.php");
    exit;
}

// 3. HAPUS PEMBAYARAN
if (isset($_GET['action']) && $_GET['action'] === 'delete') {
    $id = (int)$_GET['id'];
    $stmt = $pdo->prepare("DELETE FROM pembayaran_kas WHERE id = ?");
    $stmt->execute([$id]);
    set_flash('success', 'Transaksi pembayaran berhasil dihapus!');
    header("Location: pembayaran.php");
    exit;
}

// SEARCH & FILTER
$search = trim($_GET['search'] ?? '');
$filter_bulan = (int)($_GET['filter_bulan'] ?? 0);

$query = "
    SELECT p.*, s.nama AS nama_siswa, s.nis, b.nama_bulan, b.tahun
    FROM pembayaran_kas p
    JOIN siswa s ON p.siswa_id = s.id
    JOIN bulan_pembayaran b ON p.bulan_id = b.id
    WHERE 1=1
";
$params = [];

if (!empty($search)) {
    $query .= " AND (s.nama LIKE ? OR s.nis LIKE ? OR p.catatan LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if ($filter_bulan > 0) {
    $query .= " AND p.bulan_id = ?";
    $params[] = $filter_bulan;
}

$query .= " ORDER BY p.id DESC";

$stmt_list = $pdo->prepare($query);
$stmt_list->execute($params);
$list_pembayaran = $stmt_list->fetchAll();
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
    <div>
        <h4 class="fw-bold mb-1 text-primary"><i class="bi bi-wallet-fill me-2"></i>Pembayaran Uang Kas</h4>
        <p class="text-muted small mb-0">Catat dan kelola riwayat iuran kas siswa</p>
    </div>
    <div>
        <button type="button" class="btn btn-primary btn-sm rounded-3 shadow-sm px-3 py-2" data-bs-toggle="modal" data-bs-target="#modalTambahBayar">
            <i class="bi bi-plus-circle-fill me-1"></i>Catat Pembayaran Baru
        </button>
    </div>
</div>

<div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
    <form action="" method="GET" class="row g-2 mb-3">
        <div class="col-12 col-sm-5 col-md-4">
            <select name="filter_bulan" class="form-select form-select-sm" onchange="this.form.submit()">
                <option value="0">-- Semua Bulan Pembayaran --</option>
                <?php foreach ($options_bulan as $b): ?>
                <option value="<?= $b['id']; ?>" <?= $filter_bulan == $b['id'] ? 'selected' : ''; ?>>
                    <?= htmlspecialchars($b['nama_bulan']); ?>
                </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-12 col-sm-7 col-md-4 ms-auto">
            <div class="input-group input-group-sm">
                <input type="text" name="search" class="form-control" placeholder="Cari Nama Siswa / NIS..." value="<?= htmlspecialchars($search); ?>">
                <button class="btn btn-outline-primary" type="submit"><i class="bi bi-search"></i></button>
            </div>
        </div>
    </form>

    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="font-size: 13.5px;">
            <thead class="table-light">
                <tr>
                    <th width="50">No</th>
                    <th>NIS</th>
                    <th>Nama Siswa</th>
                    <th>Periode Bulan</th>
                    <th>Nominal</th>
                    <th>Tanggal Bayar</th>
                    <th>Status</th>
                    <th>Catatan</th>
                    <th width="100" class="text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <?php $no = 1; foreach ($list_pembayaran as $p): ?>
                <tr>
                    <td><?= $no++; ?></td>
                    <td class="text-secondary fw-semibold"><?= htmlspecialchars($p['nis']); ?></td>
                    <td class="fw-bold text-dark"><?= htmlspecialchars($p['nama_siswa']); ?></td>
                    <td><span class="badge bg-primary-subtle text-primary"><?= htmlspecialchars($p['nama_bulan']); ?></span></td>
                    <td class="fw-bold text-success"><?= format_rupiah($p['nominal']); ?></td>
                    <td class="text-muted"><?= format_tanggal_indo($p['tanggal']); ?></td>
                    <td>
                        <span class="badge bg-<?= $p['status'] == 'Lunas' ? 'success' : 'warning'; ?>-subtle text-<?= $p['status'] == 'Lunas' ? 'success' : 'warning'; ?>">
                            <i class="bi bi-<?= $p['status'] == 'Lunas' ? 'check-circle' : 'clock'; ?> me-1"></i><?= $p['status']; ?>
                        </span>
                    </td>
                    <td class="text-muted small"><?= htmlspecialchars($p['catatan'] ?: '-'); ?></td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-light border text-primary me-1" data-bs-toggle="modal" data-bs-target="#modalEditBayar<?= $p['id']; ?>">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <a href="pembayaran.php?action=delete&id=<?= $p['id']; ?>" class="btn btn-sm btn-light border text-danger" onclick="return confirm('Hapus riwayat pembayaran ini?')">
                            <i class="bi bi-trash-fill"></i>
                        </a>
                    </td>
                </tr>

                <!-- Modal Edit Pembayaran -->
                <div class="modal fade" id="modalEditBayar<?= $p['id']; ?>" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content border-0 shadow rounded-4">
                            <div class="modal-header border-bottom-0">
                                <h5 class="modal-title fw-bold text-primary">Edit Transaksi Pembayaran</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <form action="" method="POST">
                                <div class="modal-body">
                                    <input type="hidden" name="id" value="<?= $p['id']; ?>">
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Pilih Siswa</label>
                                        <select name="siswa_id" class="form-select" required>
                                            <?php foreach ($options_siswa as $s): ?>
                                            <option value="<?= $s['id']; ?>" <?= $p['siswa_id'] == $s['id'] ? 'selected' : ''; ?>>
                                                <?= htmlspecialchars($s['nama']); ?> (<?= $s['nis']; ?>)
                                            </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Pilih Bulan Pembayaran</label>
                                        <select name="bulan_id" class="form-select" required>
                                            <?php foreach ($options_bulan as $b): ?>
                                            <option value="<?= $b['id']; ?>" <?= $p['bulan_id'] == $b['id'] ? 'selected' : ''; ?>>
                                                <?= htmlspecialchars($b['nama_bulan']); ?>
                                            </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Tanggal Pembayaran</label>
                                        <input type="date" name="tanggal" class="form-control" value="<?= $p['tanggal']; ?>" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Nominal (Rp)</label>
                                        <input type="number" name="nominal" class="form-control" value="<?= $p['nominal']; ?>" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Status Pembayaran</label>
                                        <select name="status" class="form-select">
                                            <option value="Lunas" <?= $p['status'] == 'Lunas' ? 'selected' : ''; ?>>Lunas</option>
                                            <option value="Belum Lunas" <?= $p['status'] == 'Belum Lunas' ? 'selected' : ''; ?>>Belum Lunas</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Catatan / Keterangan</label>
                                        <input type="text" name="catatan" class="form-control" value="<?= htmlspecialchars($p['catatan']); ?>">
                                    </div>
                                </div>
                                <div class="modal-footer border-top-0">
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                                    <button type="submit" name="edit_pembayaran" class="btn btn-primary">Simpan Perubahan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>

                <?php if (empty($list_pembayaran)): ?>
                <tr><td colspan="9" class="text-center text-muted py-4">Belum ada transaksi pembayaran kas.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Tambah Pembayaran -->
<div class="modal fade" id="modalTambahBayar" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content border-0 shadow rounded-4">
            <div class="modal-header border-bottom-0">
                <h5 class="modal-title fw-bold text-primary"><i class="bi bi-plus-circle-fill me-2"></i>Catat Pembayaran Kas</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="" method="POST">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Pilih Siswa</label>
                        <select name="siswa_id" class="form-select" required>
                            <option value="">-- Pilih Siswa --</option>
                            <?php foreach ($options_siswa as $s): ?>
                            <option value="<?= $s['id']; ?>"><?= htmlspecialchars($s['nama']); ?> (NIS: <?= $s['nis']; ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Pilih Bulan Pembayaran (Dari Database)</label>
                        <select name="bulan_id" id="selectBulan" class="form-select" required>
                            <option value="">-- Pilih Bulan --</option>
                            <?php foreach ($options_bulan as $b): ?>
                            <option value="<?= $b['id']; ?>" data-nominal="<?= $b['nominal_target']; ?>">
                                <?= htmlspecialchars($b['nama_bulan']); ?> - Target: Rp <?= number_format($b['nominal_target']); ?>
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Tanggal Bayar</label>
                        <input type="date" name="tanggal" class="form-control" value="<?= date('Y-m-d'); ?>" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Nominal Pembayaran (Rp)</label>
                        <input type="number" name="nominal" id="inputNominal" class="form-control" value="20000" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Status Pembayaran</label>
                        <select name="status" class="form-select">
                            <option value="Lunas">Lunas</option>
                            <option value="Belum Lunas">Belum Lunas</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Catatan / Keterangan</label>
                        <input type="text" name="catatan" class="form-control" placeholder="Contoh: Titip lewat ketua kelas">
                    </div>
                </div>
                <div class="modal-footer border-top-0">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" name="tambah_pembayaran" class="btn btn-primary">Simpan Transaksi</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    const selectBulan = document.getElementById('selectBulan');
    const inputNominal = document.getElementById('inputNominal');
    if (selectBulan && inputNominal) {
        selectBulan.addEventListener('change', function() {
            const selectedOpt = selectBulan.options[selectBulan.selectedIndex];
            const nominalTarget = selectedOpt.getAttribute('data-nominal');
            if (nominalTarget) {
                inputNominal.value = nominalTarget;
            }
        });
    }
</script>

<?php require_once '../includes/footer.php'; ?>
