<?php
require_once '../includes/header.php';
require_once '../includes/sidebar.php';
require_once '../includes/navbar.php';

// UPDATE PENGATURAN KELAS
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_pengaturan'])) {
    if (!is_admin() && $_SESSION['user_role'] !== 'Bendahara') {
        set_flash('error', 'Akses ditolak!');
    } else {
        $nama_kelas           = trim($_POST['nama_kelas']);
        $nominal_kas_mingguan = (float)$_POST['nominal_kas_mingguan'];
        $tahun_ajaran         = trim($_POST['tahun_ajaran']);
        $nama_wali_kelas      = trim($_POST['nama_wali_kelas']);
        $nama_bendahara       = trim($_POST['nama_bendahara']);

        $stmt = $pdo->prepare("UPDATE pengaturan SET nama_kelas = ?, nominal_kas_mingguan = ?, tahun_ajaran = ?, nama_wali_kelas = ?, nama_bendahara = ? WHERE id = 1");
        $stmt->execute([$nama_kelas, $nominal_kas_mingguan, $tahun_ajaran, $nama_wali_kelas, $nama_bendahara]);
        set_flash('success', 'Pengaturan kelas berhasil disimpan!');
        header("Location: pengaturan.php");
        exit;
    }
}

// TAMBAH USER AKUN (HANYA ADMIN)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['tambah_user'])) {
    if (!is_admin()) {
        set_flash('error', 'Hanya Admin yang diizinkan menambah akun petugas!');
    } else {
        $username     = trim($_POST['username']);
        $nama_lengkap = trim($_POST['nama_lengkap']);
        $role         = $_POST['role'];
        $password     = trim($_POST['password']);

        $stmt_check = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt_check->execute([$username]);
        if ($stmt_check->rowCount() > 0) {
            set_flash('error', 'Username sudah digunakan!');
        } else {
            $pass_hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, nama_lengkap, role, password, created_at) VALUES (?, ?, ?, ?, NOW())");
            $stmt->execute([$username, $nama_lengkap, $role, $pass_hash]);
            set_flash('success', 'Akun petugas baru berhasil dibuat!');
            header("Location: pengaturan.php");
            exit;
        }
    }
}

// Fetch list users
$stmt_users = $pdo->query("SELECT id, username, nama_lengkap, role, created_at FROM users ORDER BY role ASC, id ASC");
$users = $stmt_users->fetchAll();
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h4 class="fw-bold mb-1 text-primary"><i class="bi bi-gear-fill me-2"></i>Pengaturan Sistem &amp; Akses</h4>
        <p class="text-muted small mb-0">Ubah identitas kelas, nominal kas standar, dan kelola akun pengguna</p>
    </div>
</div>

<div class="row g-4">
    <!-- Form Pengaturan Kelas -->
    <div class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 class="fw-bold text-dark mb-3"><i class="bi bi-sliders me-2 text-primary"></i>Identitas Kelas &amp; Kas</h5>
            <form action="" method="POST">
                <div class="mb-3">
                    <label class="form-label small fw-semibold">Nama Kelas</label>
                    <input type="text" name="nama_kelas" class="form-control" value="<?= htmlspecialchars($setting['nama_kelas']); ?>" required>
                </div>
                <div class="mb-3">
                    <label class="form-label small fw-semibold">Nominal Kas Standar (Rp)</label>
                    <input type="number" name="nominal_kas_mingguan" class="form-control" value="<?= $setting['nominal_kas_mingguan']; ?>" required>
                </div>
                <div class="mb-3">
                    <label class="form-label small fw-semibold">Tahun Ajaran</label>
                    <input type="text" name="tahun_ajaran" class="form-control" value="<?= htmlspecialchars($setting['tahun_ajaran']); ?>" required>
                </div>
                <div class="mb-3">
                    <label class="form-label small fw-semibold">Nama Wali Kelas</label>
                    <input type="text" name="nama_wali_kelas" class="form-control" value="<?= htmlspecialchars($setting['nama_wali_kelas'] ?? ''); ?>">
                </div>
                <div class="mb-4">
                    <label class="form-label small fw-semibold">Nama Bendahara Utama</label>
                    <input type="text" name="nama_bendahara" class="form-control" value="<?= htmlspecialchars($setting['nama_bendahara'] ?? ''); ?>">
                </div>
                <button type="submit" name="save_pengaturan" class="btn btn-primary w-100 py-2 fw-semibold">
                    <i class="bi bi-save me-1"></i>Simpan Pengaturan Kelas
                </button>
            </form>
        </div>
    </div>

    <!-- Manajemen User Accounts -->
    <div class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0"><i class="bi bi-shield-lock-fill me-2 text-primary"></i>Hak Akses &amp; Petugas</h5>
                <?php if (is_admin()): ?>
                <button type="button" class="btn btn-sm btn-outline-primary rounded-pill" data-bs-toggle="modal" data-bs-target="#modalTambahUser">
                    <i class="bi bi-person-plus me-1"></i>Tambah Petugas
                </button>
                <?php endif; ?>
            </div>

            <?php if (!is_admin()): ?>
            <div class="alert alert-info py-2 small mb-3">
                <i class="bi bi-info-circle me-1"></i>Anda bertindak sebagai <strong>Bendahara</strong>. Pengelolaan akun Admin dibatasi.
            </div>
            <?php endif; ?>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" style="font-size: 13px;">
                    <thead class="table-light">
                        <tr>
                            <th>Username</th>
                            <th>Nama Lengkap</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $u): ?>
                        <tr>
                            <td class="fw-semibold text-primary"><?= htmlspecialchars($u['username']); ?></td>
                            <td><?= htmlspecialchars($u['nama_lengkap']); ?></td>
                            <td>
                                <span class="badge bg-<?= $u['role'] == 'Admin' ? 'primary' : 'success'; ?>-subtle text-<?= $u['role'] == 'Admin' ? 'primary' : 'success'; ?>">
                                    <?= $u['role']; ?>
                                </span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Modal Tambah User -->
<?php if (is_admin()): ?>
<div class="modal fade" id="modalTambahUser" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content border-0 shadow rounded-4">
            <div class="modal-header border-bottom-0">
                <h5 class="modal-title fw-bold text-primary"><i class="bi bi-person-plus-fill me-2"></i>Tambah Petugas Baru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="" method="POST">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Nama Lengkap</label>
                        <input type="text" name="nama_lengkap" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Username</label>
                        <input type="text" name="username" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Role Hak Akses</label>
                        <select name="role" class="form-select">
                            <option value="Bendahara">Bendahara</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Password</label>
                        <input type="password" name="password" class="form-control" required>
                    </div>
                </div>
                <div class="modal-footer border-top-0">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" name="tambah_user" class="btn btn-primary">Buat Akun</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php endif; ?>

<?php require_once '../includes/footer.php'; ?>
