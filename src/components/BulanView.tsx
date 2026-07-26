import React, { useState } from 'react';
import { BulanPembayaran, PembayaranKas } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface BulanViewProps {
  bulan: BulanPembayaran[];
  setBulan: React.Dispatch<React.SetStateAction<BulanPembayaran[]>>;
  pembayaran: PembayaranKas[];
}

export const BulanView: React.FC<BulanViewProps> = ({ bulan, setBulan, pembayaran }) => {
  const [search, setSearch] = useState('');
  const [editingBulan, setEditingBulan] = useState<BulanPembayaran | null>(null);

  // Form states
  const [namaBulan, setNamaBulan] = useState('');
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [nominalTarget, setNominalTarget] = useState<number>(20000);
  const [urutan, setUrutan] = useState<number>(1);
  const [keterangan, setKeterangan] = useState('');

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger' | 'warning'; text: string } | null>(null);

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

  const showAlert = (type: 'success' | 'danger' | 'warning', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const filteredBulan = bulan.filter(b =>
    b.nama_bulan.toLowerCase().includes(search.toLowerCase()) ||
    b.tahun.toString().includes(search)
  );

  // Count payments in a month
  const getPaymentCount = (bulanId: number) => {
    return pembayaran.filter(p => p.bulan_id === bulanId).length;
  };

  // 1. TAMBAH BULAN
  const handleAddBulan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBulan.trim()) {
      showAlert('danger', 'Nama Bulan / Periode wajib diisi!');
      return;
    }

    const newBulan: BulanPembayaran = {
      id: Date.now(),
      nama_bulan: namaBulan.trim(),
      tahun: Number(tahun) || new Date().getFullYear(),
      nominal_target: Number(nominalTarget) || 20000,
      urutan: Number(urutan) || 1,
      keterangan: keterangan.trim(),
      created_at: new Date().toISOString().split('T')[0]
    };

    setBulan([...bulan, newBulan]);
    setNamaBulan('');
    setKeterangan('');
    showAlert('success', `Bulan pembayaran ${newBulan.nama_bulan} berhasil ditambahkan!`);

    const modalEl = document.getElementById('modalTambahBulan');
    if (modalEl) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modalEl);
      bsModal?.hide();
    }
  };

  // 2. EDIT BULAN
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBulan) return;

    setBulan(bulan.map(b => b.id === editingBulan.id ? editingBulan : b));
    showAlert('success', `Periode ${editingBulan.nama_bulan} berhasil diperbarui!`);
    setEditingBulan(null);

    const modalEl = document.getElementById('modalEditBulan');
    if (modalEl) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modalEl);
      bsModal?.hide();
    }
  };

  // 3. HAPUS BULAN (DENGAN CONSTRAIN PERINGATAN BILA MEMILIKI DATA PEMBAYARAN)
  const handleDeleteBulan = (b: BulanPembayaran) => {
    const paymentCount = getPaymentCount(b.id);
    if (paymentCount > 0) {
      showAlert(
        'warning',
        `⚠️ Dilarang Hapus! Bulan "${b.nama_bulan}" masih memiliki ${paymentCount} transaksi pembayaran kas. Pindahkan atau hapus transaksi tersebut terlebih dahulu!`
      );
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Periode Pembayaran',
      message: `Apakah Anda yakin ingin menghapus bulan "${b.nama_bulan}"?`,
      onConfirm: () => {
        setBulan(prev => prev.filter(x => x.id !== b.id));
        showAlert('success', `Bulan "${b.nama_bulan}" berhasil dihapus.`);
      }
    });
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-primary">
            <i className="bi bi-calendar-check-fill me-2"></i>Manajemen Bulan Pembayaran
          </h4>
          <p className="text-muted small mb-0">Kelola daftar bulan/periode kas kelas secara dinamis dan fleksibel</p>
        </div>
        <div>
          <button
            className="btn btn-primary-custom btn-sm rounded-3 shadow-sm px-3 py-2 fw-semibold"
            data-bs-toggle="modal"
            data-bs-target="#modalTambahBulan"
          >
            <i className="bi bi-calendar-plus me-1.5"></i>Tambah Bulan Baru
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

      {/* Table Card */}
      <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white">
        <div className="row g-3 justify-content-between align-items-center mb-3">
          <div className="col-12 col-md-4">
            <span className="text-muted small">Total Periode: {filteredBulan.length} Bulan</span>
          </div>
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Cari bulan atau tahun..."
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
                <th>Nama Bulan / Periode</th>
                <th>Tahun</th>
                <th>Nominal Target per Siswa</th>
                <th>Jumlah Pembayar</th>
                <th>Keterangan</th>
                <th width="120" className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBulan.map((b, index) => {
                const count = getPaymentCount(b.id);
                return (
                  <tr key={b.id}>
                    <td>{index + 1}</td>
                    <td className="fw-bold text-dark">
                      <i className="bi bi-calendar-event me-2 text-primary"></i>
                      {b.nama_bulan}
                    </td>
                    <td><span className="badge bg-secondary-subtle text-secondary">{b.tahun}</span></td>
                    <td className="fw-bold text-success">Rp {b.nominal_target.toLocaleString('id-ID')}</td>
                    <td>
                      <span className={`badge bg-${count > 0 ? 'info' : 'warning'}-subtle text-${count > 0 ? 'info' : 'warning'}`}>
                        <i className="bi bi-people me-1"></i>{count} Transaksi
                      </span>
                    </td>
                    <td className="text-muted small">{b.keterangan || '-'}</td>
                    <td className="text-center">
                      <button
                        onClick={() => setEditingBulan(b)}
                        className="btn btn-sm btn-light border text-primary me-1"
                        data-bs-toggle="modal"
                        data-bs-target="#modalEditBulan"
                        title="Edit Bulan"
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteBulan(b)}
                        className="btn btn-sm btn-light border text-danger"
                        title="Hapus Bulan"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredBulan.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    <i className="bi bi-calendar-x fs-2 d-block mb-2 text-secondary opacity-50"></i>
                    Belum ada data bulan pembayaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Bulan */}
      <div className="modal fade" id="modalTambahBulan" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-primary"><i className="bi bi-calendar-plus me-2"></i>Tambah Bulan Pembayaran</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleAddBulan}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Nama Bulan / Periode</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Juli 2026"
                    value={namaBulan}
                    onChange={(e) => setNamaBulan(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Tahun</label>
                  <input
                    type="number"
                    className="form-control"
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Nominal Target per Siswa (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={nominalTarget}
                    onChange={(e) => setNominalTarget(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Urutan Urut</label>
                  <input
                    type="number"
                    className="form-control"
                    value={urutan}
                    onChange={(e) => setUrutan(Number(e.target.value))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Keterangan Opsional</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Uang Kas Bulan Pertama TA 2026/2027"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button type="submit" className="btn btn-primary-custom px-4">Simpan Bulan</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Edit Bulan */}
      <div className="modal fade" id="modalEditBulan" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-primary"><i className="bi bi-pencil-square me-2"></i>Edit Bulan Pembayaran</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            {editingBulan && (
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nama Bulan / Periode</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingBulan.nama_bulan}
                      onChange={(e) => setEditingBulan({ ...editingBulan, nama_bulan: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Tahun</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editingBulan.tahun}
                      onChange={(e) => setEditingBulan({ ...editingBulan, tahun: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nominal Target (Rp)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editingBulan.nominal_target}
                      onChange={(e) => setEditingBulan({ ...editingBulan, nominal_target: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Urutan</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editingBulan.urutan}
                      onChange={(e) => setEditingBulan({ ...editingBulan, urutan: Number(e.target.value) })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Keterangan</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingBulan.keterangan || ''}
                      onChange={(e) => setEditingBulan({ ...editingBulan, keterangan: e.target.value })}
                    />
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
