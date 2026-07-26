<?php
require_once '../includes/header.php';
require_once '../includes/sidebar.php';
require_once '../includes/navbar.php';

// 1. TAMBAH PENGELUARAN
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['tambah_pengeluaran'])) {
    $judul      = trim($_POST['judul']);
    $kategori   = trim($_POST['kategori']);
    $nominal    = (float)$_POST['nominal'];
    $tanggal    = $_POST['tanggal'];
    $keterangan = trim($_POST['keterangan']);

    if (empty($judul) || empty($nominal) || empty($tanggal)) {
        set_flash('error', 'Judul, Nominal, dan Tanggal pengeluaran wajib diisi!');
    } else {
        $stmt = $pdo->prepare("INSERT INTO pengeluaran_kas (judul, kategori, nominal, tanggal, keterangan, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$judul, $kategori, $nominal, $tanggal, $keterangan, $_SESSION['username'] ?? 'Bendahara']);
        set_flash('success', 'Pengeluaran kas berhasil dicatat!');
        header("Location: pengeluaran.php");
        exit;
    }
}

// 2. EDIT PENGELUARAN
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['edit_pengeluaran'])) {
    $id         = (int)$_POST['id'];
    $judul      = trim($_POST['judul']);
    $kategori   = trim($_POST['kategori']);
    $nominal    = (float)$_POST['nominal'];
    $tanggal    = $_POST['tanggal'];
    $keterangan = trim($_POST['keterangan']);

    $stmt = $pdo->prepare("UPDATE pengeluaran_kas SET judul = ?, kategori = ?, nominal = ?, tanggal = ?, keterangan = ? WHERE id = ?");
    $stmt->execute([$judul, $kategori, $nominal, $tanggal, $keterangan, $id]);
    set_flash('success', 'Data pengeluaran berhasil diperbarui!');
    header("Location: pengeluaran.php");
    exit;
}

// 3. HAPUS PENGELUARAN
if (isset($_GET['action']) && $_GET['action'] === 'delete') {
    $id = (int)$_GET['id'];
    $stmt = $pdo->prepare("DELETE FROM pengeluaran_kas WHERE id = ?");
    $stmt->execute([$id]);
    set_flash('success', 'Data pengeluaran berhasil dihapus!');
    header("Location: pengeluaran.php");
    exit;
}

// SEARCH
$search = trim($_GET['search'] ?? '');
if (!empty($search)) {
    $stmt = $pdo->prepare("SELECT * FROM pengeluaran_kas WHERE judul LIKE ? OR kategori LIKE ? OR keterangan LIKE ? ORDER BY tanggal DESC, id DESC");
    $stmt->execute(["%$search%", "%$search%", "%$search%"]);
} else {
    $stmt = $pdo->query("SELECT * FROM pengeluaran_kas ORDER BY tanggal DESC, id DESC");
}
$list_pengeluaran = $stmt->fetchAll();

// Total Pengeluaran Overall
$stmt_tot = $pdo->query("SELECT COALESCE(SUM(nominal), 0) AS total FROM pengeluaran_kas");
$total_out = $stmt_tot->fetch()['total'];
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
    <div>
        <h4 class="fw-bold mb-1 text-danger"><i class="bi bi-receipt-cutoff me-2"></i>Pengeluaran Uang Kas</h4>
        <p class="text-muted small mb-0">Catat dan pantau seluruh alokasi belanja kas kelas</p>
    </div>
    <div>
        <button type="button" class="btn btn-danger btn-sm rounded-3 shadow-sm px-3 py-2" data-bs-toggle="modal" data-bs-target="#modalTambahKeluar">
            <i class="bi bi-plus-circle-fill me-1"></i>Tambah Pengeluaran
        </button>
    </div>
</div>

<div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
    <div class="row justify-content-between align-items-center mb-3 g-2">
        <div class="col-12 col-md-4">
            <div class="bg-danger-subtle text-danger px-3 py-2 rounded-3 fw-bold small">
                <i class="bi bi-wallet2 me-2"></i>Total Pengeluaran: <?= format_rupiah($total_out); ?>
            </div>
        </div>
        <div class="col-12 col-md-4 ms-auto">
            <form action="" method="GET">
                <div class="input-group input-group-sm">
                    <input type="text" name="search" class="form-control" placeholder="Cari judul / kategori..." value="<?= htmlspecialchars($search); ?>">
                    <button class="btn btn-outline-danger" type="submit"><i class="bi bi-search"></i></button>
                </div>
            </form>
        </div>
    </div>

    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="font-size: 13.5px;">
            <thead class="table-light">
                <tr>
                    <th width="50">No</th>
                    <th>Judul Pengeluaran</th>
                    <th>Kategori</th>
                    <th>Nominal</th>
                    <th>Tanggal</th>
                    <th>Keterangan</th>
                    <th width="100" class="text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <?php $no = 1; foreach ($list_pengeluaran as $p): ?>
                <tr>
                    <td><?= $no++; ?></td>
                    <td class="fw-bold text-dark"><?= htmlspecialchars($p['judul']); ?></td>
                    <td><span class="badge bg-secondary-subtle text-secondary"><?= htmlspecialchars($p['kategori']); ?></span></td>
                    <td class="fw-bold text-danger">-<?= format_rupiah($p['nominal']); ?></td>
                    <td class="text-muted"><?= format_tanggal_indo($p['tanggal']); ?></td>
                    <td class="text-muted small"><?= htmlspecialchars($p['keterangan'] ?: '-'); ?></td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-light border text-primary me-1" data-bs-toggle="modal" data-bs-target="#modalEditKeluar<?= $p['id']; ?>">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <a href="pengeluaran.php?action=delete&id=<?= $p['id']; ?>" class="btn btn-sm btn-light border text-danger" onclick="return confirm('Hapus data pengeluaran ini?')">
                            <i class="bi bi-trash-fill"></i>
                        </a>
                    </td>
                </tr>

                <!-- Modal Edit Pengeluaran -->
                <div class="modal fade" id="modalEditKeluar<?= $p['id']; ?>" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content border-0 shadow rounded-4">
                            <div class="modal-header border-bottom-0">
                                <h5 class="modal-title fw-bold text-danger">Edit Data Pengeluaran</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <form action="" method="POST">
                                <div class="modal-body">
                                    <input type="hidden" name="id" value="<?= $p['id']; ?>">
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Judul Pengeluaran</label>
                                        <input type="text" name="judul" class="form-control" value="<?= htmlspecialchars($p['judul']); ?>" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Kategori</label>
                                        <select name="kategori" class="form-select">
                                            <option value="Alat Tulis" <?= $p['kategori'] == 'Alat Tulis' ? 'selected' : ''; ?>>Alat Tulis & Kebersihan</option>
                                            <option value="Foto Copy" <?= $p['kategori'] == 'Foto Copy' ? 'selected' : ''; ?>>Foto Copy & Cetak</option>
                                            <option value="Konsumsi" <?= $p['kategori'] == 'Konsumsi' ? 'selected' : ''; ?>>Konsumsi Rapat / Acara</option>
                                            <option value="Kegiatan" <?= $p['kategori'] == 'Kegiatan' ? 'selected' : ''; ?>>Kegiatan Classmeeting / Lomba</option>
                                            <option value="Sosial" <?= $p['kategori'] == 'Sosial' ? 'selected' : ''; ?>>Dana Sosial / Jenguk Teman</option>
                                            <option value="Lainnya" <?= $p['kategori'] == 'Lainnya' ? 'selected' : ''; ?>>Lainnya</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Nominal (Rp)</label>
                                        <input type="number" name="nominal" class="form-control" value="<?= $p['nominal']; ?>" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Tanggal</label>
                                        <input type="date" name="tanggal" class="form-control" value="<?= $p['tanggal']; ?>" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Keterangan Opsional</label>
                                        <textarea name="keterangan" class="form-control" rows="2"><?= htmlspecialchars($p['keterangan']); ?></textarea>
                                    </div>
                                </div>
                                <div class="modal-footer border-top-0">
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                                    <button type="submit" name="edit_pengeluaran" class="btn btn-danger">Simpan Perubahan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>

                <?php if (empty($list_pengeluaran)): ?>
                <tr><td colspan="7" class="text-center text-muted py-4">Belum ada catatan pengeluaran kas.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Tambah Pengeluaran -->
<div class="modal fade" id="modalTambahKeluar" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content border-0 shadow rounded-4">
            <div class="modal-header border-bottom-0">
                <h5 class="modal-title fw-bold text-danger"><i class="bi bi-plus-circle-fill me-2"></i>Catat Pengeluaran Kas</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="" method="POST">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Judul Pengeluaran</label>
                        <input type="text" name="judul" class="form-control" placeholder="Contoh: Beli Kertas HVS & Map" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Kategori Pengeluaran</label>
                        <select name="kategori" class="form-select">
                            <option value="Alat Tulis">Alat Tulis & Kebersihan</option>
                            <option value="Foto Copy">Foto Copy & Cetak</option>
                            <option value="Konsumsi">Konsumsi Rapat / Acara</option>
                            <option value="Kegiatan">Kegiatan Classmeeting / Lomba</option>
                            <option value="Sosial">Dana Sosial / Jenguk Teman</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Nominal Pengeluaran (Rp)</label>
                        <input type="number" name="nominal" class="form-control" placeholder="Contoh: 15000" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Tanggal</label>
                        <input type="date" name="tanggal" class="form-control" value="<?= date('Y-m-d'); ?>" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Keterangan Rincian</label>
                        <textarea name="keterangan" class="form-control" rows="2" placeholder="Detail nota atau keperluan..."></textarea>
                    </div>
                </div>
                <div class="modal-footer border-top-0">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" name="tambah_pengeluaran" class="btn btn-danger">Simpan Pengeluaran</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
