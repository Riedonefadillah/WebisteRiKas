import React, { useState } from 'react';
import { Siswa, BulanPembayaran, PembayaranKas, User, MetodePembayaran } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface PembayaranViewProps {
  siswa: Siswa[];
  bulan: BulanPembayaran[];
  pembayaran: PembayaranKas[];
  setPembayaran: React.Dispatch<React.SetStateAction<PembayaranKas[]>>;
  currentUser: User | null;
}

export const PembayaranView: React.FC<PembayaranViewProps> = ({
  siswa,
  bulan,
  pembayaran,
  setPembayaran,
  currentUser
}) => {
  const [search, setSearch] = useState('');
  const [filterBulanId, setFilterBulanId] = useState<number>(0);
  const [filterStatusKonfirmasi, setFilterStatusKonfirmasi] = useState<string>('semua');
  const [editingPay, setEditingPay] = useState<PembayaranKas | null>(null);
  const [historySiswa, setHistorySiswa] = useState<Siswa | null>(null);
  const [viewProofPay, setViewProofPay] = useState<PembayaranKas | null>(null);

  // Form states
  const [siswaId, setSiswaId] = useState<number>(0);
  const [bulanId, setBulanId] = useState<number>(0);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [nominal, setNominal] = useState<number>(20000);
  const [status, setStatus] = useState<'Lunas' | 'Belum Lunas'>('Lunas');
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran>('Tunai');
  const [nomorReferensi, setNomorReferensi] = useState('');
  const [catatan, setCatatan] = useState('');

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

  // When month is selected, auto fill target nominal
  const handleBulanChange = (bId: number) => {
    setBulanId(bId);
    const selectedB = bulan.find(x => x.id === bId);
    if (selectedB) {
      setNominal(selectedB.nominal_target);
    }
  };

  // Filtered payments
  const filteredPembayaran = pembayaran.filter(p => {
    const s = siswa.find(x => x.id === p.siswa_id);
    const matchesSearch =
      !search ||
      s?.nama.toLowerCase().includes(search.toLowerCase()) ||
      s?.nis.toLowerCase().includes(search.toLowerCase()) ||
      p.catatan?.toLowerCase().includes(search.toLowerCase()) ||
      p.nomor_referensi?.toLowerCase().includes(search.toLowerCase());

    const matchesBulan = filterBulanId === 0 || p.bulan_id === filterBulanId;
    const matchesKonfirmasi =
      filterStatusKonfirmasi === 'semua' ||
      (filterStatusKonfirmasi === 'pending' && p.status_konfirmasi === 'Menunggu Konfirmasi') ||
      (filterStatusKonfirmasi === 'disetujui' && p.status_konfirmasi === 'Disetujui');

    return matchesSearch && matchesBulan && matchesKonfirmasi;
  });

  const pendingCount = pembayaran.filter(p => p.status_konfirmasi === 'Menunggu Konfirmasi').length;

  // 1. TAMBAH PEMBAYARAN
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswaId || !bulanId || !nominal) {
      showAlert('danger', 'Silakan pilih Siswa, Bulan, dan isi Nominal!');
      return;
    }

    // Check duplicate
    const exists = pembayaran.some(p => p.siswa_id === siswaId && p.bulan_id === bulanId);
    if (exists) {
      showAlert('danger', 'Siswa ini sudah memiliki catatan pembayaran untuk bulan yang dipilih!');
      return;
    }

    const newPay: PembayaranKas = {
      id: Date.now(),
      siswa_id: Number(siswaId),
      bulan_id: Number(bulanId),
      tanggal,
      nominal: Number(nominal),
      status,
      metode_pembayaran: metodePembayaran,
      status_konfirmasi: 'Disetujui',
      nomor_referensi: nomorReferensi.trim() || undefined,
      catatan: catatan.trim(),
      created_by: currentUser?.username || 'Bendahara',
      created_at: new Date().toISOString().split('T')[0]
    };

    setPembayaran([newPay, ...pembayaran]);
    setSiswaId(0);
    setBulanId(0);
    setNomorReferensi('');
    setCatatan('');
    showAlert('success', 'Transaksi pembayaran berhasil dicatat!');

    const modalEl = document.getElementById('modalTambahBayar');
    if (modalEl) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modalEl);
      bsModal?.hide();
    }
  };

  // 2. EDIT PEMBAYARAN
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPay) return;

    setPembayaran(pembayaran.map(p => p.id === editingPay.id ? editingPay : p));
    showAlert('success', 'Transaksi pembayaran berhasil diperbarui!');
    setEditingPay(null);

    const modalEl = document.getElementById('modalEditBayar');
    if (modalEl) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modalEl);
      bsModal?.hide();
    }
  };

  // Approve or Reject Student Payment
  const handleApprovePayment = (id: number) => {
    setPembayaran(pembayaran.map(p => p.id === id ? { ...p, status: 'Lunas', status_konfirmasi: 'Disetujui' } : p));
    showAlert('success', 'Pembayaran kas berhasil disetujui (Lunas)!');
  };

  const handleRejectPayment = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Tolak Pembayaran',
      message: 'Apakah Anda yakin ingin menolak transaksi pembayaran ini?',
      onConfirm: () => {
        setPembayaran(pembayaran.map(p => p.id === id ? { ...p, status: 'Belum Lunas', status_konfirmasi: 'Ditolak' } : p));
        showAlert('danger', 'Transaksi pembayaran ditolak.');
      }
    });
  };

  // 3. HAPUS PEMBAYARAN
  const handleDeletePayment = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Transaksi Pembayaran',
      message: 'Apakah Anda yakin ingin menghapus catatan transaksi pembayaran kas ini?',
      onConfirm: () => {
        setPembayaran(prev => prev.filter(p => p.id !== id));
        showAlert('success', 'Transaksi pembayaran telah dihapus.');
      }
    });
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-primary">
            <i className="bi bi-wallet-fill me-2"></i>Pembayaran Uang Kas
          </h4>
          <p className="text-muted small mb-0">Kelola transaksi iuran kas siswa via Tunai, QRIS, &amp; E-Wallet</p>
        </div>
        <div className="d-flex gap-2">
          {pendingCount > 0 && (
            <button
              onClick={() => setFilterStatusKonfirmasi('pending')}
              className="btn btn-warning btn-sm rounded-3 fw-bold shadow-sm px-3 py-2 animate-bounce"
            >
              <i className="bi bi-bell-fill me-1"></i>
              Konfirmasi QRIS/Cash ({pendingCount})
            </button>
          )}
          <button
            className="btn btn-primary-custom btn-sm rounded-3 shadow-sm px-3 py-2 fw-semibold"
            data-bs-toggle="modal"
            data-bs-target="#modalTambahBayar"
          >
            <i className="bi bi-plus-circle-fill me-1.5"></i>Catat Pembayaran Baru
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
        <div className="row g-2 mb-3 justify-content-between align-items-center">
          <div className="col-12 col-sm-6 col-md-5 d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={filterBulanId}
              onChange={(e) => setFilterBulanId(Number(e.target.value))}
            >
              <option value={0}>-- Semua Periode Bulan --</option>
              {bulan.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nama_bulan} (Target: Rp {b.nominal_target.toLocaleString('id-ID')})
                </option>
              ))}
            </select>

            <select
              className="form-select form-select-sm"
              value={filterStatusKonfirmasi}
              onChange={(e) => setFilterStatusKonfirmasi(e.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="disetujui">Lunas / Disetujui</option>
              <option value="pending">Menunggu Konfirmasi ({pendingCount})</option>
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Cari nama siswa / NIS / Ref..."
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
                <th>NIS</th>
                <th>Nama Siswa</th>
                <th>Periode Bulan</th>
                <th>Nominal</th>
                <th>Metode</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th width="140" className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPembayaran.map((p, index) => {
                const s = siswa.find(x => x.id === p.siswa_id);
                const b = bulan.find(x => x.id === p.bulan_id);
                const isPending = p.status_konfirmasi === 'Menunggu Konfirmasi';

                return (
                  <tr key={p.id} className={isPending ? 'table-warning-subtle' : ''}>
                    <td>{index + 1}</td>
                    <td className="text-secondary fw-semibold">{s?.nis || '-'}</td>
                    <td className="fw-bold text-dark">
                      <button
                        onClick={() => setHistorySiswa(s || null)}
                        className="btn btn-link text-decoration-none p-0 fw-bold text-dark text-start"
                        data-bs-toggle="modal"
                        data-bs-target="#modalHistorySiswa"
                        title="Klik untuk melihat riwayat pembayaran siswa ini"
                      >
                        {s?.nama || 'Siswa'} <i className="bi bi-info-circle text-primary ms-1 small"></i>
                      </button>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                        {b?.nama_bulan || 'Bulan'}
                      </span>
                    </td>
                    <td className="fw-bold text-success">Rp {p.nominal.toLocaleString('id-ID')}</td>
                    <td>
                      <span className={`badge ${
                        p.metode_pembayaran === 'QRIS' ? 'bg-danger text-white' :
                        p.metode_pembayaran === 'E-Wallet' ? 'bg-info text-dark' :
                        p.metode_pembayaran === 'Transfer' ? 'bg-primary text-white' :
                        'bg-secondary text-white'
                      }`}>
                        {p.metode_pembayaran || 'Tunai'}
                      </span>
                      {p.nomor_referensi && (
                        <div className="text-muted font-monospace" style={{ fontSize: '10px' }}>
                          {p.nomor_referensi}
                        </div>
                      )}
                    </td>
                    <td className="text-muted small">{p.tanggal}</td>
                    <td>
                      {p.status_konfirmasi === 'Menunggu Konfirmasi' ? (
                        <span className="badge bg-warning text-dark border">
                          <i className="bi bi-clock-history me-1"></i>Pending
                        </span>
                      ) : p.status_konfirmasi === 'Ditolak' ? (
                        <span className="badge bg-danger text-white">
                          <i className="bi bi-x-circle me-1"></i>Ditolak
                        </span>
                      ) : (
                        <span className={`badge bg-${p.status === 'Lunas' ? 'success' : 'warning'}-subtle text-${p.status === 'Lunas' ? 'success' : 'warning'}`}>
                          <i className={`bi bi-${p.status === 'Lunas' ? 'check-circle' : 'clock'} me-1`}></i>
                          {p.status}
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {isPending ? (
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => handleApprovePayment(p.id)}
                            className="btn btn-success fw-bold"
                            title="Setujui Pembayaran"
                          >
                            <i className="bi bi-check-lg me-1"></i>Setujui
                          </button>
                          <button
                            onClick={() => handleRejectPayment(p.id)}
                            className="btn btn-outline-danger"
                            title="Tolak Pembayaran"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      ) : (
                        <>
                          {p.bukti_pembayaran && (
                            <button
                              onClick={() => setViewProofPay(p)}
                              className="btn btn-sm btn-light border text-info me-1"
                              data-bs-toggle="modal"
                              data-bs-target="#modalViewProof"
                              title="Lihat Bukti Foto"
                            >
                              <i className="bi bi-image"></i>
                            </button>
                          )}
                          <button
                            onClick={() => setEditingPay(p)}
                            className="btn btn-sm btn-light border text-primary me-1"
                            data-bs-toggle="modal"
                            data-bs-target="#modalEditBayar"
                            title="Edit Pembayaran"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button
                            onClick={() => handleDeletePayment(p.id)}
                            className="btn btn-sm btn-light border text-danger"
                            title="Hapus Pembayaran"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredPembayaran.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-5">
                    <i className="bi bi-receipt fs-2 d-block mb-2 text-secondary opacity-50"></i>
                    Belum ada catatan transaksi pembayaran kas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pembayaran */}
      <div className="modal fade" id="modalTambahBayar" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-primary"><i className="bi bi-plus-circle-fill me-2"></i>Catat Pembayaran Kas</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleAddPayment}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Pilih Siswa</label>
                  <select
                    className="form-select"
                    value={siswaId}
                    onChange={(e) => setSiswaId(Number(e.target.value))}
                    required
                  >
                    <option value={0}>-- Pilih Siswa --</option>
                    {siswa.filter(s => s.status === 'Aktif').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} (NIS: {s.nis})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Pilih Bulan Pembayaran</label>
                  <select
                    className="form-select"
                    value={bulanId}
                    onChange={(e) => handleBulanChange(Number(e.target.value))}
                    required
                  >
                    <option value={0}>-- Pilih Bulan --</option>
                    {bulan.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nama_bulan} — Target: Rp {b.nominal_target.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Metode Pembayaran</label>
                  <select
                    className="form-select"
                    value={metodePembayaran}
                    onChange={(e) => setMetodePembayaran(e.target.value as MetodePembayaran)}
                  >
                    <option value="Tunai">Tunai (Cash)</option>
                    <option value="QRIS">QRIS National Standard</option>
                    <option value="E-Wallet">E-Wallet (GoPay, DANA, OVO, ShopeePay)</option>
                    <option value="Transfer">Transfer Bank</option>
                  </select>
                </div>

                {(metodePembayaran === 'QRIS' || metodePembayaran === 'E-Wallet' || metodePembayaran === 'Transfer') && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nomor Referensi Transaksi / Kode</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: QRIS-992019 / REF-102"
                      value={nomorReferensi}
                      onChange={(e) => setNomorReferensi(e.target.value)}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Tanggal Pembayaran</label>
                  <input
                    type="date"
                    className="form-control"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Nominal Pembayaran (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={nominal}
                    onChange={(e) => setNominal(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Status Pembayaran</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Lunas' | 'Belum Lunas')}
                  >
                    <option value="Lunas">Lunas</option>
                    <option value="Belum Lunas">Belum Lunas</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Catatan / Keterangan</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Pembayaran tunai via ketua kelas"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button type="submit" className="btn btn-primary-custom px-4">Simpan Transaksi</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Edit Pembayaran */}
      <div className="modal fade" id="modalEditBayar" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-primary"><i className="bi bi-pencil-square me-2"></i>Edit Transaksi Pembayaran</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            {editingPay && (
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Pilih Siswa</label>
                    <select
                      className="form-select"
                      value={editingPay.siswa_id}
                      onChange={(e) => setEditingPay({ ...editingPay, siswa_id: Number(e.target.value) })}
                      required
                    >
                      {siswa.map((s) => (
                        <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Pilih Bulan Pembayaran</label>
                    <select
                      className="form-select"
                      value={editingPay.bulan_id}
                      onChange={(e) => setEditingPay({ ...editingPay, bulan_id: Number(e.target.value) })}
                      required
                    >
                      {bulan.map((b) => (
                        <option key={b.id} value={b.id}>{b.nama_bulan}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Metode Pembayaran</label>
                    <select
                      className="form-select"
                      value={editingPay.metode_pembayaran || 'Tunai'}
                      onChange={(e) => setEditingPay({ ...editingPay, metode_pembayaran: e.target.value as MetodePembayaran })}
                    >
                      <option value="Tunai">Tunai</option>
                      <option value="QRIS">QRIS</option>
                      <option value="E-Wallet">E-Wallet</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Tanggal</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editingPay.tanggal}
                      onChange={(e) => setEditingPay({ ...editingPay, tanggal: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nominal (Rp)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editingPay.nominal}
                      onChange={(e) => setEditingPay({ ...editingPay, nominal: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={editingPay.status}
                      onChange={(e) => setEditingPay({ ...editingPay, status: e.target.value as 'Lunas' | 'Belum Lunas' })}
                    >
                      <option value="Lunas">Lunas</option>
                      <option value="Belum Lunas">Belum Lunas</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Catatan</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingPay.catatan || ''}
                      onChange={(e) => setEditingPay({ ...editingPay, catatan: e.target.value })}
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

      {/* Modal View Proof Image */}
      <div className="modal fade" id="modalViewProof" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 text-center">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title fw-bold text-primary"><i className="bi bi-image me-2"></i>Bukti Pembayaran</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-4">
              {viewProofPay?.bukti_pembayaran ? (
                <img src={viewProofPay.bukti_pembayaran} alt="Bukti" className="img-fluid rounded-3 border shadow-sm" />
              ) : (
                <p className="text-muted">Tidak ada gambar bukti yang diunggah.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal History Pembayaran Siswa */}
      <div className="modal fade" id="modalHistorySiswa" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title fw-bold text-primary">
                <i className="bi bi-clock-history me-2"></i>
                Riwayat Pembayaran: {historySiswa?.nama} (NIS: {historySiswa?.nis})
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-4">
              {historySiswa && (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle mb-0" style={{ fontSize: '13px' }}>
                    <thead className="table-light">
                      <tr>
                        <th>Bulan Periode</th>
                        <th>Target Nominal</th>
                        <th>Metode</th>
                        <th>Tanggal Bayar</th>
                        <th>Nominal Dibayar</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulan.map((b) => {
                        const payRecord = pembayaran.find(p => p.siswa_id === historySiswa.id && p.bulan_id === b.id);
                        return (
                          <tr key={b.id}>
                            <td className="fw-bold text-dark">{b.nama_bulan}</td>
                            <td>Rp {b.nominal_target.toLocaleString('id-ID')}</td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {payRecord?.metode_pembayaran || 'Tunai'}
                              </span>
                            </td>
                            <td>{payRecord ? payRecord.tanggal : '-'}</td>
                            <td className={`fw-bold ${payRecord ? 'text-success' : 'text-muted'}`}>
                              {payRecord ? `Rp ${payRecord.nominal.toLocaleString('id-ID')}` : 'Rp 0'}
                            </td>
                            <td>
                              {payRecord ? (
                                <span className={`badge bg-${payRecord.status === 'Lunas' ? 'success' : 'warning'}-subtle text-${payRecord.status === 'Lunas' ? 'success' : 'warning'}`}>
                                  {payRecord.status}
                                </span>
                              ) : (
                                <span className="badge bg-danger-subtle text-danger">Belum Bayar</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer border-top-0">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
            </div>
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
