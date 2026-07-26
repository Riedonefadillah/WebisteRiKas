<?php
require_once '../includes/header.php';
require_once '../includes/sidebar.php';
require_once '../includes/navbar.php';

// Action Handler
$action = $_GET['action'] ?? '';

// 1. TAMBAH SISWA
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['tambah_siswa'])) {
    $nis           = trim($_POST['nis']);
    $nama          = trim($_POST['nama']);
    $jenis_kelamin = $_POST['jenis_kelamin'];
    $no_hp         = trim($_POST['no_hp']);

    if (empty($nis) || empty($nama)) {
        set_flash('error', 'NIS dan Nama Siswa wajib diisi!');
    } else {
        $stmt_check = $pdo->prepare("SELECT id FROM siswa WHERE nis = ?");
        $stmt_check->execute([$nis]);
        if ($stmt_check->rowCount() > 0) {
            set_flash('error', 'NIS sudah terdaftar!');
        } else {
            $stmt = $pdo->prepare("INSERT INTO siswa (nis, nama, jenis_kelamin, no_hp, status, created_at) VALUES (?, ?, ?, ?, 'Aktif', NOW())");
            $stmt->execute([$nis, $nama, $jenis_kelamin, $no_hp]);
            set_flash('success', 'Data siswa berhasil ditambahkan!');
            header("Location: siswa.php");
            exit;
        }
    }
}

// 2. EDIT SISWA
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['edit_siswa'])) {
    $id            = (int)$_POST['id'];
    $nis           = trim($_POST['nis']);
    $nama          = trim($_POST['nama']);
    $jenis_kelamin = $_POST['jenis_kelamin'];
    $no_hp         = trim($_POST['no_hp']);
    $status        = $_POST['status'];

    $stmt = $pdo->prepare("UPDATE siswa SET nis = ?, nama = ?, jenis_kelamin = ?, no_hp = ?, status = ? WHERE id = ?");
    $stmt->execute([$nis, $nama, $jenis_kelamin, $no_hp, $status, $id]);
    set_flash('success', 'Data siswa berhasil diperbarui!');
    header("Location: siswa.php");
    exit;
}

// 3. HAPUS SATU SISWA
if ($action === 'delete') {
    $id = (int)$_GET['id'];
    $stmt = $pdo->prepare("DELETE FROM siswa WHERE id = ?");
    $stmt->execute([$id]);
    set_flash('success', 'Data siswa berhasil dihapus!');
    header("Location: siswa.php");
    exit;
}

// 4. BULK DELETE (HAPUS BEBERAPA SISWA)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['bulk_delete'])) {
    $selected_ids = $_POST['siswa_ids'] ?? [];
    if (!empty($selected_ids)) {
        $in = implode(',', array_map('intval', $selected_ids));
        $pdo->query("DELETE FROM siswa WHERE id IN ($in)");
        set_flash('success', count($selected_ids) . ' Data siswa berhasil dihapus!');
    } else {
        set_flash('error', 'Pilih minimal satu siswa untuk dihapus.');
    }
    header("Location: siswa.php");
    exit;
}

// 5. HAPUS SEMUA SISWA
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_all'])) {
    $pdo->query("DELETE FROM siswa");
    set_flash('success', 'Seluruh data siswa berhasil dihapus!');
    header("Location: siswa.php");
    exit;
}

// SEARCH
$search = trim($_GET['search'] ?? '');
if (!empty($search)) {
    $stmt = $pdo->prepare("SELECT * FROM siswa WHERE nama LIKE ? OR nis LIKE ? ORDER BY nama ASC");
    $stmt->execute(["%$search%", "%$search%"]);
} else {
    $stmt = $pdo->query("SELECT * FROM siswa ORDER BY nama ASC");
}
$list_siswa = $stmt->fetchAll();
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
    <div>
        <h4 class="fw-bold mb-1 text-primary"><i class="bi bi-people-fill me-2"></i>Data Siswa Kelas</h4>
        <p class="text-muted small mb-0">Kelola daftar seluruh siswa kelas dan status keaktifan</p>
    </div>
    <div class="d-flex gap-2">
        <button type="button" class="btn btn-primary btn-sm rounded-3 shadow-sm px-3 py-2" data-bs-toggle="modal" data-bs-target="#modalTambahSiswa">
            <i class="bi bi-person-plus-fill me-1"></i>Tambah Siswa
        </button>
        <?php if (is_admin()): ?>
        <button type="button" class="btn btn-outline-danger btn-sm rounded-3 px-3 py-2" data-bs-toggle="modal" data-bs-target="#modalDeleteAll">
            <i class="bi bi-trash3-fill me-1"></i>Hapus Semua
        </button>
        <?php endif; ?>
    </div>
</div>

<!-- Card Table -->
<div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
    <form action="" method="POST" id="formBulkDelete">
        <div class="row g-3 justify-content-between align-items-center mb-3">
            <div class="col-12 col-md-6 d-flex gap-2">
                <button type="submit" name="bulk_delete" class="btn btn-sm btn-danger rounded-3" onclick="return confirm('Yakin ingin menghapus siswa yang dipilih?')" id="btnBulkDelete" disabled>
                    <i class="bi bi-trash me-1"></i>Hapus Terpilih
                </button>
            </div>
            <div class="col-12 col-md-4">
                <form action="" method="GET">
                    <div class="input-group">
                        <input type="text" name="search" class="form-control form-control-sm" placeholder="Cari NIS atau Nama..." value="<?= htmlspecialchars($search); ?>">
                        <button class="btn btn-outline-primary btn-sm" type="submit"><i class="bi bi-search"></i></button>
                    </div>
                </form>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="font-size: 13.5px;">
                <thead class="table-light">
                    <tr>
                        <th width="40"><input type="checkbox" id="checkAll" class="form-check-input"></th>
                        <th width="50">No</th>
                        <th>NIS</th>
                        <th>Nama Siswa</th>
                        <th>L/P</th>
                        <th>No HP</th>
                        <th>Status</th>
                        <th width="120" class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <?php $no = 1; foreach ($list_siswa as $s): ?>
                    <tr>
                        <td><input type="checkbox" name="siswa_ids[]" value="<?= $s['id']; ?>" class="form-check-input checkItem"></td>
                        <td><?= $no++; ?></td>
                        <td class="fw-semibold text-secondary"><?= htmlspecialchars($s['nis']); ?></td>
                        <td class="fw-bold text-dark"><?= htmlspecialchars($s['nama']); ?></td>
                        <td>
                            <span class="badge bg-<?= $s['jenis_kelamin'] == 'L' ? 'info' : 'danger'; ?>-subtle text-<?= $s['jenis_kelamin'] == 'L' ? 'info' : 'danger'; ?>">
                                <?= $s['jenis_kelamin'] == 'L' ? 'Laki-Laki' : 'Perempuan'; ?>
                            </span>
                        </td>
                        <td><?= htmlspecialchars($s['no_hp'] ?: '-'); ?></td>
                        <td>
                            <span class="badge bg-<?= $s['status'] == 'Aktif' ? 'success' : 'secondary'; ?>-subtle text-<?= $s['status'] == 'Aktif' ? 'success' : 'secondary'; ?>">
                                <?= htmlspecialchars($s['status']); ?>
                            </span>
                        </td>
                        <td class="text-center">
                            <button type="button" class="btn btn-sm btn-light border text-primary me-1" data-bs-toggle="modal" data-bs-target="#modalEditSiswa<?= $s['id']; ?>">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <a href="siswa.php?action=delete&id=<?= $s['id']; ?>" class="btn btn-sm btn-light border text-danger" onclick="return confirm('Yakin hapus data siswa ini?')">
                                <i class="bi bi-trash-fill"></i>
                            </a>
                        </td>
                    </tr>

                    <!-- Modal Edit Siswa -->
                    <div class="modal fade" id="modalEditSiswa<?= $s['id']; ?>" tabindex="-1">
                        <div class="modal-dialog">
                            <div class="modal-content border-0 shadow rounded-4">
                                <div class="modal-header border-bottom-0">
                                    <h5 class="modal-title fw-bold text-primary">Edit Data Siswa</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <form action="" method="POST">
                                    <div class="modal-body">
                                        <input type="hidden" name="id" value="<?= $s['id']; ?>">
                                        <div class="mb-3">
                                            <label class="form-label small fw-semibold">NIS</label>
                                            <input type="text" name="nis" class="form-control" value="<?= htmlspecialchars($s['nis']); ?>" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label small fw-semibold">Nama Siswa</label>
                                            <input type="text" name="nama" class="form-control" value="<?= htmlspecialchars($s['nama']); ?>" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label small fw-semibold">Jenis Kelamin</label>
                                            <select name="jenis_kelamin" class="form-select">
                                                <option value="L" <?= $s['jenis_kelamin'] == 'L' ? 'selected' : ''; ?>>Laki-Laki</option>
                                                <option value="P" <?= $s['jenis_kelamin'] == 'P' ? 'selected' : ''; ?>>Perempuan</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label small fw-semibold">No HP</label>
                                            <input type="text" name="no_hp" class="form-control" value="<?= htmlspecialchars($s['no_hp']); ?>">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label small fw-semibold">Status Keaktifan</label>
                                            <select name="status" class="form-select">
                                                <option value="Aktif" <?= $s['status'] == 'Aktif' ? 'selected' : ''; ?>>Aktif</option>
                                                <option value="Non-Aktif" <?= $s['status'] == 'Non-Aktif' ? 'selected' : ''; ?>>Non-Aktif</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="modal-footer border-top-0">
                                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                                        <button type="submit" name="edit_siswa" class="btn btn-primary">Simpan Perubahan</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>

                    <?php if (empty($list_siswa)): ?>
                    <tr><td colspan="8" class="text-center text-muted py-4">Tidak ada data siswa ditemukan.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </form>
</div>

<!-- Modal Tambah Siswa -->
<div class="modal fade" id="modalTambahSiswa" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content border-0 shadow rounded-4">
            <div class="modal-header border-bottom-0">
                <h5 class="modal-title fw-bold text-primary"><i class="bi bi-person-plus-fill me-2"></i>Tambah Siswa Baru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="" method="POST">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">NIS (Nomor Induk Siswa)</label>
                        <input type="text" name="nis" class="form-control" placeholder="Contoh: 1009" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Nama Lengkap Siswa</label>
                        <input type="text" name="nama" class="form-control" placeholder="Contoh: Hendra Wijaya" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Jenis Kelamin</label>
                        <select name="jenis_kelamin" class="form-select">
                            <option value="L">Laki-Laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">No HP / WhatsApp (Opsional)</label>
                        <input type="text" name="no_hp" class="form-control" placeholder="Contoh: 081234567890">
                    </div>
                </div>
                <div class="modal-footer border-top-0">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" name="tambah_siswa" class="btn btn-primary">Simpan Siswa</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal Delete All -->
<div class="modal fade" id="modalDeleteAll" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content border-0 shadow rounded-4">
            <div class="modal-header border-bottom-0 bg-danger text-white rounded-top-4">
                <h5 class="modal-title fw-bold"><i class="bi bi-exclamation-triangle-fill me-2"></i>Konfirmasi Hapus Semua</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form action="" method="POST">
                <div class="modal-body py-4 text-center">
                    <i class="bi bi-trash3 text-danger display-3"></i>
                    <h5 class="fw-bold mt-3 text-dark">Apakah Anda Yakin?</h5>
                    <p class="text-muted small mb-0">Tindakan ini akan menghapus <strong>SELURUH DATA SISWA</strong> beserta riwayat transaksi pembayarannya. Data tidak dapat dikembalikan!</p>
                </div>
                <div class="modal-footer border-top-0 justify-content-center">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" name="delete_all" class="btn btn-danger px-4">Ya, Hapus Semua Data</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    const checkAll = document.getElementById('checkAll');
    const checkItems = document.querySelectorAll('.checkItem');
    const btnBulkDelete = document.getElementById('btnBulkDelete');

    function toggleBulkBtn() {
        let checkedCount = document.querySelectorAll('.checkItem:checked').length;
        btnBulkDelete.disabled = checkedCount === 0;
    }

    if (checkAll) {
        checkAll.addEventListener('change', function() {
            checkItems.forEach(item => item.checked = checkAll.checked);
            toggleBulkBtn();
        });
    }

    checkItems.forEach(item => {
        item.addEventListener('change', toggleBulkBtn);
    });
</script>

<?php require_once '../includes/footer.php'; ?>
