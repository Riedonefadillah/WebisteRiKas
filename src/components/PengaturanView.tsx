import React, { useState } from 'react';
import { PengaturanKelas, User } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface PengaturanViewProps {
  pengaturan: PengaturanKelas;
  setPengaturan: React.Dispatch<React.SetStateAction<PengaturanKelas>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User | null;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  pengaturan,
  setPengaturan,
  users,
  setUsers,
  currentUser
}) => {
  const [namaKelas, setNamaKelas] = useState(pengaturan?.nama_kelas || 'XII RPL 1');
  const [nominalFee, setNominalFee] = useState<number>(pengaturan?.nominal_kas_mingguan ?? 5000);
  const [tahunAjaran, setTahunAjaran] = useState(pengaturan?.tahun_ajaran || '2026/2027');
  const [namaWaliKelas, setNamaWaliKelas] = useState(pengaturan?.nama_wali_kelas || 'Dra. Endang Susilowati');
  const [namaBendahara, setNamaBendahara] = useState(pengaturan?.nama_bendahara || 'Siti Rahma');

  // New User Form States (Admin Only)
  const [newUsername, setNewUsername] = useState('');
  const [newNamaLengkap, setNewNamaLengkap] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Bendahara'>('Bendahara');
  const [newPassword, setNewPassword] = useState('');

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showAlert = (type: 'success' | 'danger', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setPengaturan({
      nama_kelas: namaKelas.trim(),
      nominal_kas_mingguan: Number(nominalFee),
      tahun_ajaran: tahunAjaran.trim(),
      nama_wali_kelas: namaWaliKelas.trim(),
      nama_bendahara: namaBendahara.trim()
    });
    showAlert('success', 'Pengaturan identitas kelas berhasil disimpan!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'Admin') {
      showAlert('danger', 'Hanya Admin yang memiliki hak akses membuat akun petugas!');
      return;
    }

    if (!newUsername.trim() || !newNamaLengkap.trim() || !newPassword.trim()) {
      showAlert('danger', 'Seluruh kolom pendaftaran user wajib diisi!');
      return;
    }

    if (users.some(u => u.username === newUsername.trim())) {
      showAlert('danger', 'Username sudah terpakai!');
      return;
    }

    const newUserObj: User = {
      id: Date.now(),
      username: newUsername.trim(),
      nama_lengkap: newNamaLengkap.trim(),
      role: newRole,
      created_at: new Date().toISOString()
    };

    setUsers([...users, newUserObj]);
    setNewUsername('');
    setNewNamaLengkap('');
    setNewPassword('');
    showAlert('success', `Akun petugas ${newUserObj.nama_lengkap} (${newUserObj.role}) berhasil dibuat!`);

    const modalEl = document.getElementById('modalTambahUser');
    if (modalEl) {
      const bsModal = (window as any).bootstrap?.Modal?.getInstance(modalEl);
      bsModal?.hide();
    }
  };

  const handleDeleteUser = (u: User) => {
    if (u.id === currentUser?.id) {
      showAlert('danger', 'Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan!');
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Akun Petugas',
      message: `Apakah Anda yakin ingin menghapus akun petugas "${u.nama_lengkap}" (${u.username})?`,
      onConfirm: () => {
        setUsers(prev => prev.filter(x => x.id !== u.id));
        showAlert('success', `Akun ${u.nama_lengkap} berhasil dihapus.`);
      }
    });
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-primary">
            <i className="bi bi-gear-fill me-2"></i>Pengaturan Sistem &amp; Hak Akses
          </h4>
          <p className="text-muted small mb-0">Ubah identitas kelas, standar nominal iuran, dan kelola akun pengguna</p>
        </div>
      </div>

      {/* Alert */}
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show rounded-3 shadow-sm mb-4`} role="alert">
          <i className={`bi bi-${alertMsg.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2`}></i>
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Identitas Kelas Form */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-sliders me-2 text-primary"></i>Identitas Kelas &amp; Standar Kas
            </h5>
            <form onSubmit={handleSaveSettings}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Nama Kelas</label>
                <input
                  type="text"
                  className="form-control"
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Nominal Kas Standar (Rp)</label>
                <input
                  type="number"
                  className="form-control"
                  value={nominalFee}
                  onChange={(e) => setNominalFee(Number(e.target.value))}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Tahun Ajaran</label>
                <input
                  type="text"
                  className="form-control"
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Nama Wali Kelas</label>
                <input
                  type="text"
                  className="form-control"
                  value={namaWaliKelas}
                  onChange={(e) => setNamaWaliKelas(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Nama Bendahara Utama</label>
                <input
                  type="text"
                  className="form-control"
                  value={namaBendahara}
                  onChange={(e) => setNamaBendahara(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary-custom w-100 py-2.5 fw-semibold rounded-3">
                <i className="bi bi-save me-1.5"></i>Simpan Pengaturan Kelas
              </button>
            </form>
          </div>
        </div>

        {/* User Account Management & Role Restriction */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-shield-lock-fill me-2 text-primary"></i>Hak Akses &amp; Akun Petugas
              </h5>
              {currentUser?.role === 'Admin' && (
                <button
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                  data-bs-toggle="modal"
                  data-bs-target="#modalTambahUser"
                >
                  <i className="bi bi-person-plus me-1"></i>Tambah Petugas
                </button>
              )}
            </div>

            {currentUser?.role !== 'Admin' && (
              <div className="alert alert-info py-2 px-3 small rounded-3 mb-3">
                <i className="bi bi-info-circle me-1.5"></i>
                Anda masuk sebagai <strong>Bendahara</strong>. Pengelolaan akun Admin hanya dapat dilakukan oleh Admin.
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                <thead className="table-light">
                  <tr>
                    <th>Username</th>
                    <th>Nama Lengkap</th>
                    <th>Role</th>
                    {currentUser?.role === 'Admin' && <th className="text-center" width="80">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-semibold text-primary">{u.username}</td>
                      <td className="text-dark">{u.nama_lengkap}</td>
                      <td>
                        <span className={`badge bg-${u.role === 'Admin' ? 'primary' : 'success'}-subtle text-${u.role === 'Admin' ? 'primary' : 'success'}`}>
                          {u.role}
                        </span>
                      </td>
                      {currentUser?.role === 'Admin' && (
                        <td className="text-center">
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="btn btn-sm btn-light border text-danger"
                            title="Hapus Akun"
                            disabled={u.id === currentUser.id}
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah User (Admin Only) */}
      {currentUser?.role === 'Admin' && (
        <div className="modal fade" id="modalTambahUser" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-primary"><i className="bi bi-person-plus-fill me-2"></i>Tambah Petugas Baru</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nama Lengkap</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Rina Amalia"
                      value={newNamaLengkap}
                      onChange={(e) => setNewNamaLengkap(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: rina123"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Role Hak Akses</label>
                    <select
                      className="form-select"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'Admin' | 'Bendahara')}
                    >
                      <option value="Bendahara">Bendahara (Mengelola Kas)</option>
                      <option value="Admin">Admin (Akses Penuh)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Masukkan password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                  <button type="submit" className="btn btn-primary-custom px-4">Buat Akun</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
