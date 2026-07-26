import React, { useState } from 'react';
import { PengeluaranKas, User } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface PengeluaranViewProps {
  pengeluaran: PengeluaranKas[];
  setPengeluaran: React.Dispatch<React.SetStateAction<PengeluaranKas[]>>;
  currentUser: User | null;
}

export const PengeluaranView: React.FC<PengeluaranViewProps> = ({
  pengeluaran,
  setPengeluaran,
  currentUser
}) => {
  const [search, setSearch] = useState('');
  const [editingOut, setEditingOut] = useState<PengeluaranKas | null>(null);

  // Form states
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('Alat Tulis');
  const [nominal, setNominal] = useState<number>(0);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');

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

  const filteredPengeluaran = pengeluaran.filter(p =>
    p.judul.toLowerCase().includes(search.toLowerCase()) ||
    p.kategori.toLowerCase().includes(search.toLowerCase()) ||
    p.keterangan?.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutSum = pengeluaran.reduce((acc, curr) => acc + curr.nominal, 0);

  // 1. TAMBAH PENGELUARAN
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !nominal || !tanggal) {
      showAlert('danger', 'Judul, Nominal, dan Tanggal pengeluaran wajib diisi!');
      return;
    }

    const newExpense: PengeluaranKas = {
      id: Date.now(),
      judul: judul.trim(),
      kategori,
      nominal: Number(nominal),
      tanggal,
      keterangan: keterangan.trim(),
      created_by: currentUser?.username || 'Bendahara',
      created_at: new Date().toISOString().split('T')[0]
    };

    setPengeluaran([newExpense, ...pengeluaran]);
    setJudul('');
    setNominal(0);
    setKeterangan('');
    showAlert('success', 'Catatan pengeluaran kas berhasil ditambahkan!');

    const modalEl = document.getElementById('modalTambahKeluar');
    if (modalEl) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modalEl);
      bsModal?.hide();
    }
  };

  // 2. EDIT PENGELUARAN
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOut) return;

    setPengeluaran(pengeluaran.map(p => p.id === editingOut.id ? editingOut : p));
    showAlert('success', 'Data pengeluaran berhasil diperbarui!');
    setEditingOut(null);

    const modalEl = document.getElementById('modalEditKeluar');
    if (modalEl) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modalEl);
      bsModal?.hide();
    }
  };

  // 3. HAPUS PENGELUARAN
  const handleDeleteExpense = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Catatan Pengeluaran',
      message: 'Apakah Anda yakin ingin menghapus catatan pengeluaran kas ini?',
      onConfirm: () => {
        setPengeluaran(prev => prev.filter(p => p.id !== id));
        showAlert('success', 'Catatan pengeluaran telah dihapus.');
      }
    });
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-danger">
            <i className="bi bi-receipt-cutoff me-2"></i>Pengeluaran Uang Kas
          </h4>
          <p className="text-muted small mb-0">Catat dan pantau seluruh penggunaan uang kas kelas</p>
        </div>
        <div>
          <button
            className="btn btn-danger btn-sm rounded-3 shadow-sm px-3 py-2 fw-semibold"
            data-bs-toggle="modal"
            data-bs-target="#modalTambahKeluar"
          >
            <i className="bi bi-plus-circle-fill me-1.5"></i>Tambah Pengeluaran
          </button>
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

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white">
        <div className="row justify-content-between align-items-center mb-3 g-2">
          <div className="col-12 col-md-5">
            <div className="bg-danger-subtle text-danger px-3 py-2 rounded-3 fw-bold small border border-danger-subtle">
              <i className="bi bi-wallet2 me-2"></i>Total Seluruh Pengeluaran: Rp {totalOutSum.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Cari judul / kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
            <thead className="table-light">
              <tr>
                <th width="50">No</th>
                <th>Judul Pengeluaran</th>
                <th>Kategori</th>
                <th>Nominal</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th width="120" className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPengeluaran.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td className="fw-bold text-dark">{p.judul}</td>
                  <td>
                    <span className="badge bg-secondary-subtle text-secondary">{p.kategori}</span>
                  </td>
                  <td className="fw-bold text-danger">-Rp {p.nominal.toLocaleString('id-ID')}</td>
                  <td className="text-muted">{p.tanggal}</td>
                  <td className="text-muted small">{p.keterangan || '-'}</td>
                  <td className="text-center">
                    <button
                      onClick={() => setEditingOut(p)}
                      className="btn btn-sm btn-light border text-primary me-1"
                      data-bs-toggle="modal"
                      data-bs-target="#modalEditKeluar"
                      title="Edit Pengeluaran"
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(p.id)}
                      className="btn btn-sm btn-light border text-danger"
                      title="Hapus Pengeluaran"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPengeluaran.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    <i className="bi bi-receipt-cutoff fs-2 d-block mb-2 text-secondary opacity-50"></i>
                    Belum ada catatan pengeluaran kas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pengeluaran */}
      <div className="modal fade" id="modalTambahKeluar" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-danger"><i className="bi bi-plus-circle-fill me-2"></i>Catat Pengeluaran Kas</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Judul Pengeluaran</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Beli Kertas HVS & Map A4"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Kategori Pengeluaran</label>
                  <select className="form-select" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                    <option value="Alat Tulis">Alat Tulis & Kebersihan</option>
                    <option value="Foto Copy">Foto Copy & Cetak</option>
                    <option value="Konsumsi">Konsumsi Rapat / Acara</option>
                    <option value="Kegiatan">Kegiatan Classmeeting / Lomba</option>
                    <option value="Sosial">Dana Sosial / Jenguk Teman</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Nominal Pengeluaran (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Contoh: 15000"
                    value={nominal || ''}
                    onChange={(e) => setNominal(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Tanggal</label>
                  <input
                    type="date"
                    className="form-control"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Keterangan Opsional</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Rincian barang atau keperluan..."
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button type="submit" className="btn btn-danger px-4">Simpan Pengeluaran</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Edit Pengeluaran */}
      <div className="modal fade" id="modalEditKeluar" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-danger"><i className="bi bi-pencil-square me-2"></i>Edit Pengeluaran</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            {editingOut && (
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Judul Pengeluaran</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingOut.judul}
                      onChange={(e) => setEditingOut({ ...editingOut, judul: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Kategori</label>
                    <select
                      className="form-select"
                      value={editingOut.kategori}
                      onChange={(e) => setEditingOut({ ...editingOut, kategori: e.target.value })}
                    >
                      <option value="Alat Tulis">Alat Tulis & Kebersihan</option>
                      <option value="Foto Copy">Foto Copy & Cetak</option>
                      <option value="Konsumsi">Konsumsi Rapat / Acara</option>
                      <option value="Kegiatan">Kegiatan Classmeeting / Lomba</option>
                      <option value="Sosial">Dana Sosial / Jenguk Teman</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nominal (Rp)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editingOut.nominal}
                      onChange={(e) => setEditingOut({ ...editingOut, nominal: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Tanggal</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editingOut.tanggal}
                      onChange={(e) => setEditingOut({ ...editingOut, tanggal: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Keterangan</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={editingOut.keterangan || ''}
                      onChange={(e) => setEditingOut({ ...editingOut, keterangan: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                  <button type="submit" className="btn btn-danger px-4">Simpan Perubahan</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

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
