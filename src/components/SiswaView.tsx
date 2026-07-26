import React, { useState } from 'react';
import { Siswa, User } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface SiswaViewProps {
  siswa: Siswa[];
  setSiswa: React.Dispatch<React.SetStateAction<Siswa[]>>;
  currentUser: User | null;
}

export const SiswaView: React.FC<SiswaViewProps> = ({ siswa, setSiswa, currentUser }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);

  // Form states
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [noHp, setNoHp] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Non-Aktif'>('Aktif');

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Confirmation modal state
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

  // Filtered list
  const filteredSiswa = siswa.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.nis.toLowerCase().includes(search.toLowerCase())
  );

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredSiswa.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 1. TAMBAH SISWA
  const handleAddSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim() || !nama.trim()) {
      showAlert('danger', 'NIS dan Nama Siswa wajib diisi!');
      return;
    }
    if (siswa.some(s => s.nis === nis.trim())) {
      showAlert('danger', 'NIS tersebut sudah terdaftar!');
      return;
    }

    const newSiswaItem: Siswa = {
      id: Date.now(),
      nis: nis.trim(),
      nama: nama.trim(),
      jenis_kelamin: jenisKelamin,
      no_hp: noHp.trim(),
      status: 'Aktif',
      created_at: new Date().toISOString().split('T')[0]
    };

    setSiswa([newSiswaItem, ...siswa]);
    setNis('');
    setNama('');
    setNoHp('');
    showAlert('success', `Data siswa ${newSiswaItem.nama} berhasil ditambahkan!`);

    // Close modal
    const modalEl = document.getElementById('modalTambahSiswa');
    if (modalEl) {
      const bsModal = (window as any).bootstrap?.Modal?.getInstance(modalEl);
      bsModal?.hide();
    }
  };

  // 2. EDIT SISWA
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSiswa) return;

    setSiswa(siswa.map(s => s.id === editingSiswa.id ? editingSiswa : s));
    showAlert('success', `Data siswa ${editingSiswa.nama} berhasil diperbarui!`);
    setEditingSiswa(null);

    const modalEl = document.getElementById('modalEditSiswa');
    if (modalEl) {
      const bsModal = (window as any).bootstrap?.Modal?.getInstance(modalEl);
      bsModal?.hide();
    }
  };

  // 3. HAPUS SATU SISWA
  const handleDeleteOne = (id: number, namaSiswa: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Data Siswa',
      message: `Apakah Anda yakin ingin menghapus data siswa "${namaSiswa}"?`,
      onConfirm: () => {
        setSiswa(prev => prev.filter(s => s.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        showAlert('success', `Data siswa ${namaSiswa} telah dihapus.`);
      }
    });
  };

  // 4. BULK DELETE
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Siswa Terpilih',
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa yang dipilih?`,
      onConfirm: () => {
        setSiswa(prev => prev.filter(s => !selectedIds.includes(s.id)));
        setSelectedIds([]);
        showAlert('success', `${selectedIds.length} Data siswa berhasil dihapus.`);
      }
    });
  };

  // 5. HAPUS SEMUA SISWA
  const handleDeleteAll = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Seluruh Data Siswa',
      message: 'Apakah Anda yakin ingin menghapus SELURUH data siswa? Tindakan ini akan menghapus semua siswa dan riwayatnya.',
      onConfirm: () => {
        setSiswa([]);
        setSelectedIds([]);
        showAlert('success', 'Seluruh data siswa berhasil dihapus!');
      }
    });
  };

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-primary">
            <i className="bi bi-people-fill me-2"></i>Data Siswa Kelas
          </h4>
          <p className="text-muted small mb-0">Kelola daftar seluruh siswa kelas dan keaktifan</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary-custom btn-sm rounded-3 shadow-sm px-3 py-2 fw-semibold"
            data-bs-toggle="modal"
            data-bs-target="#modalTambahSiswa"
          >
            <i className="bi bi-person-plus-fill me-1.5"></i>Tambah Siswa Baru
          </button>
          {currentUser?.role === 'Admin' && (
            <button
              onClick={handleDeleteAll}
              className="btn btn-outline-danger btn-sm rounded-3 px-3 py-2 fw-semibold"
            >
              <i className="bi bi-trash3-fill me-1.5"></i>Hapus Semua Siswa
            </button>
          )}
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

      {/* Main Card Table */}
      <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white">
        <div className="row g-3 justify-content-between align-items-center mb-3">
          <div className="col-12 col-md-6 d-flex align-items-center gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="btn btn-sm btn-danger rounded-3 d-flex align-items-center gap-1.5"
            >
              <i className="bi bi-trash"></i>
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>
            <span className="text-muted small">Total: {filteredSiswa.length} Siswa</span>
          </div>
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Cari NIS atau Nama Siswa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="btn btn-outline-secondary" onClick={() => setSearch('')}>
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
            <thead className="table-light">
              <tr>
                <th width="40">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={filteredSiswa.length > 0 && selectedIds.length === filteredSiswa.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th width="50">No</th>
                <th>NIS</th>
                <th>Nama Lengkap Siswa</th>
                <th>L/P</th>
                <th>No HP / WhatsApp</th>
                <th>Status</th>
                <th width="120" className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSiswa.map((s, index) => (
                <tr key={s.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => handleSelectOne(s.id)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td className="fw-semibold text-secondary">{s.nis}</td>
                  <td className="fw-bold text-dark">{s.nama}</td>
                  <td>
                    <span className={`badge bg-${s.jenis_kelamin === 'L' ? 'info' : 'danger'}-subtle text-${s.jenis_kelamin === 'L' ? 'info' : 'danger'}`}>
                      {s.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                    </span>
                  </td>
                  <td>{s.no_hp || '-'}</td>
                  <td>
                    <span className={`badge bg-${s.status === 'Aktif' ? 'success' : 'secondary'}-subtle text-${s.status === 'Aktif' ? 'success' : 'secondary'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setEditingSiswa(s)}
                      className="btn btn-sm btn-light border text-primary me-1"
                      data-bs-toggle="modal"
                      data-bs-target="#modalEditSiswa"
                      title="Edit Siswa"
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteOne(s.id, s.nama)}
                      className="btn btn-sm btn-light border text-danger"
                      title="Hapus Siswa"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSiswa.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-5">
                    <i className="bi bi-people fs-2 d-block mb-2 text-secondary opacity-50"></i>
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Siswa */}
      <div className="modal fade" id="modalTambahSiswa" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-primary"><i className="bi bi-person-plus-fill me-2"></i>Tambah Siswa Baru</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleAddSiswa}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-semibold">NIS (Nomor Induk Siswa)</label>
                  <input type="text" className="form-control" placeholder="Contoh: 1009" value={nis} onChange={(e) => setNis(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Nama Lengkap Siswa</label>
                  <input type="text" className="form-control" placeholder="Contoh: Hendra Wijaya" value={nama} onChange={(e) => setNama(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Jenis Kelamin</label>
                  <select className="form-select" value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}>
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">No HP / WhatsApp (Opsional)</label>
                  <input type="text" className="form-control" placeholder="Contoh: 081234567890" value={noHp} onChange={(e) => setNoHp(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button type="submit" className="btn btn-primary-custom px-4">Simpan Siswa</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Edit Siswa */}
      <div className="modal fade" id="modalEditSiswa" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-primary"><i className="bi bi-pencil-square me-2"></i>Edit Data Siswa</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            {editingSiswa && (
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">NIS</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingSiswa.nis}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, nis: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nama Siswa</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingSiswa.nama}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, nama: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Jenis Kelamin</label>
                    <select
                      className="form-select"
                      value={editingSiswa.jenis_kelamin}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, jenis_kelamin: e.target.value as 'L' | 'P' })}
                    >
                      <option value="L">Laki-Laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">No HP</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingSiswa.no_hp}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, no_hp: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={editingSiswa.status}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, status: e.target.value as 'Aktif' | 'Non-Aktif' })}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Non-Aktif">Non-Aktif</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                  <button type="submit" className="btn btn-primary-custom px-4">Simpan Perubahan</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
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
