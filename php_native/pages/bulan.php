<?php
require_once '../includes/header.php';
require_once '../includes/sidebar.php';
require_once '../includes/navbar.php';

// 1. TAMBAH BULAN
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['tambah_bulan'])) {
    $nama_bulan     = trim($_POST['nama_bulan']);
    $tahun          = (int)$_POST['tahun'];
    $nominal_target = (float)$_POST['nominal_target'];
    $urutan         = (int)$_POST['urutan'];
    $keterangan     = trim($_POST['keterangan']);

    if (empty($nama_bulan) || empty($tahun)) {
        set_flash('error', 'Nama Bulan dan Tahun wajib diisi!');
    } else {
        $stmt = $pdo->prepare("INSERT INTO bulan_pembayaran (nama_bulan, tahun, nominal_target, urutan, keterangan, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$nama_bulan, $tahun, $nominal_target, $urutan, $keterangan]);
        set_flash('success', 'Bulan pembayaran berhasil ditambahkan!');
        header("Location: bulan.php");
        exit;
    }
}

// 2. EDIT BULAN
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['edit_bulan'])) {
    $id             = (int)$_POST['id'];
    $nama_bulan     = trim($_POST['nama_bulan']);
    $tahun          = (int)$_POST['tahun'];
    $nominal_target = (float)$_POST['nominal_target'];
    $urutan         = (int)$_POST['urutan'];
    $keterangan     = trim($_POST['keterangan']);

    $stmt = $pdo->prepare("UPDATE bulan_pembayaran SET nama_bulan = ?, tahun = ?, nominal_target = ?, urutan = ?, keterangan = ? WHERE id = ?");
    $stmt->execute([$nama_bulan, $tahun, $nominal_target, $urutan, $keterangan, $id]);
    set_flash('success', 'Bulan pembayaran berhasil diperbarui!');
    header("Location: bulan.php");
    exit;
}

// 3. HAPUS BULAN (DENGAN CEK DATA PEMBAYARAN RELEVAN)
if (isset($_GET['action']) && $_GET['action'] === 'delete') {
    $id = (int)$_GET['id'];

    // Cek apakah bulan ini memiliki data pembayaran
    $stmt_check = $pdo->prepare("SELECT COUNT(*) AS total FROM pembayaran_kas WHERE bulan_id = ?");
    $stmt_check->execute([$id]);
    $total_bayar = $stmt_check->fetch()['total'];

    if ($total_bayar > 0) {
        set_flash('error', "Gagal menghapus! Bulan ini masih memiliki $total_bayar data transaksi pembayaran. Hapus atau pindahkan data pembayaran terlebih dahulu.");
    } else {
        $stmt = $pdo->prepare("DELETE FROM bulan_pembayaran WHERE id = ?");
        $stmt->execute([$id]);
        set_flash('success', 'Bulan pembayaran berhasil dihapus!');
    }
    header("Location: bulan.php");
    exit;
}

// SEARCH
$search = trim($_GET['search'] ?? '');
if (!empty($search)) {
    $stmt = $pdo->prepare("SELECT b.*, (SELECT COUNT(*) FROM pembayaran_kas WHERE bulan_id = b.id) AS total_transaksi FROM bulan_pembayaran b WHERE nama_bulan LIKE ? OR tahun LIKE ? ORDER BY urutan ASC, id ASC");
    $stmt->execute(["%$search%", "%$search%"]);
} else {
    $stmt = $pdo->query("SELECT b.*, (SELECT COUNT(*) FROM pembayaran_kas WHERE bulan_id = b.id) AS total_transaksi FROM bulan_pembayaran b ORDER BY urutan ASC, id ASC");
}
$list_bulan = $stmt->fetchAll();
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
    <div>
        <h4 class="fw-bold mb-1 text-primary"><i class="bi bi-calendar-check-fill me-2"></i>Manajemen Bulan Pembayaran</h4>
        <p class="text-muted small mb-0">Kelola periode bulan kas kelas dan target nominal pembayaran</p>
    </div>
    <div>
        <button type="button" class="btn btn-primary btn-sm rounded-3 shadow-sm px-3 py-2" data-bs-toggle="modal" data-bs-target="#modalTambahBulan">
            <i class="bi bi-calendar-plus me-1"></i>Tambah Bulan Baru
        </button>
    </div>
</div>

<div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
    <div class="row justify-content-between align-items-center mb-3">
        <div class="col-12 col-md-4 ms-auto">
            <form action="" method="GET">
                <div class="input-group">
                    <input type="text" name="search" class="form-control form-control-sm" placeholder="Cari nama bulan atau tahun..." value="<?= htmlspecialchars($search); ?>">
                    <button class="btn btn-outline-primary btn-sm" type="submit"><i class="bi bi-search"></i></button>
                </div>
            </form>
        </div>
    </div>

    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="font-size: 13.5px;">
            <thead class="table-light">
                <tr>
                    <th width="50">No</th>
                    <th>Nama Bulan / Periode</th>
                    <th>Tahun</th>
                    <th>Target Nominal</th>
                    <th>Total Pembayar</th>
                    <th>Keterangan</th>
                    <th width="120" class="text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <?php $no = 1; foreach ($list_bulan as $b): ?>
                <tr>
                    <td><?= $no++; ?></td>
                    <td class="fw-bold text-dark">
                        <i class="bi bi-calendar-event me-2 text-primary"></i><?= htmlspecialchars($b['nama_bulan']); ?>
                    </td>
                    <td><span class="badge bg-secondary-subtle text-secondary"><?= $b['tahun']; ?></span></td>
                    <td class="fw-semibold text-success"><?= format_rupiah($b['nominal_target']); ?></td>
                    <td>
                        <span class="badge bg-<?= $b['total_transaksi'] > 0 ? 'info' : 'warning'; ?>-subtle text-<?= $b['total_transaksi'] > 0 ? 'info' : 'warning'; ?>">
                            <i class="bi bi-people me-1"></i><?= $b['total_transaksi']; ?> Transaksi
                        </span>
                    </td>
                    <td class="text-muted small"><?= htmlspecialchars($b['keterangan'] ?: '-'); ?></td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-light border text-primary me-1" data-bs-toggle="modal" data-bs-target="#modalEditBulan<?= $b['id']; ?>">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <a href="bulan.php?action=delete&id=<?= $b['id']; ?>" class="btn btn-sm btn-light border text-danger" onclick="return confirm('Apakah Anda yakin ingin menghapus bulan ini?')">
                            <i class="bi bi-trash-fill"></i>
                        </a>
                    </td>
                </tr>

                <!-- Modal Edit Bulan -->
                <div class="modal fade" id="modalEditBulan<?= $b['id']; ?>" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content border-0 shadow rounded-4">
                            <div class="modal-header border-bottom-0">
                                <h5 class="modal-title fw-bold text-primary">Edit Bulan Pembayaran</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <form action="" method="POST">
                                <div class="modal-body">
                                    <input type="hidden" name="id" value="<?= $b['id']; ?>">
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Nama Bulan / Periode</label>
                                        <input type="text" name="nama_bulan" class="form-control" value="<?= htmlspecialchars($b['nama_bulan']); ?>" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Tahun</label>
                                        <input type="number" name="tahun" class="form-control" value="<?= $b['tahun']; ?>" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Nominal Target (Rp)</label>
                                        <input type="number" name="nominal_target" class="form-control" value="<?= $b['nominal_target']; ?>" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Urutan Tampil</label>
                                        <input type="number" name="urutan" class="form-control" value="<?= $b['urutan']; ?>">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Keterangan</label>
                                        <input type="text" name="keterangan" class="form-control" value="<?= htmlspecialchars($b['keterangan']); ?>">
                                    </div>
                                </div>
                                <div class="modal-footer border-top-0">
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                                    <button type="submit" name="edit_bulan" class="btn btn-primary">Simpan Perubahan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>

                <?php if (empty($list_bulan)): ?>
                <tr><td colspan="7" class="text-center text-muted py-4">Belum ada data bulan pembayaran.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Tambah Bulan -->
<div class="modal fade" id="modalTambahBulan" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content border-0 shadow rounded-4">
            <div class="modal-header border-bottom-0">
                <h5 class="modal-title fw-bold text-primary"><i class="bi bi-calendar-plus me-2"></i>Tambah Bulan Pembayaran</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="" method="POST">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Nama Bulan / Periode</label>
                        <input type="text" name="nama_bulan" class="form-control" placeholder="Contoh: Juli 2026" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Tahun</label>
                        <input type="number" name="tahun" class="form-control" value="<?= date('Y'); ?>" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Nominal Target per Siswa (Rp)</label>
                        <input type="number" name="nominal_target" class="form-control" value="20000" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Urutan Urut</label>
                        <input type="number" name="urutan" class="form-control" value="1">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Keterangan Opsional</label>
                        <input type="text" name="keterangan" class="form-control" placeholder="Contoh: Pembayaran Uang Kas Bulan Pertama">
                    </div>
                </div>
                <div class="modal-footer border-top-0">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" name="tambah_bulan" class="btn btn-primary">Simpan Bulan</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
