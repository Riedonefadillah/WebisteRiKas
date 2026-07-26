import React, { useState } from 'react';
import { Siswa, BulanPembayaran, PembayaranKas, PengeluaranKas, PengaturanKelas, User, MetodePembayaran } from '../types';
import { QrisDisplayCard } from './QrisDisplayCard';

interface SiswaPortalViewProps {
  currentUser: User;
  siswaList: Siswa[];
  bulanList: BulanPembayaran[];
  pembayaranList: PembayaranKas[];
  setPembayaranList: React.Dispatch<React.SetStateAction<PembayaranKas[]>>;
  pengeluaranList: PengeluaranKas[];
  pengaturan: PengaturanKelas;
}

export const SiswaPortalView: React.FC<SiswaPortalViewProps> = ({
  currentUser,
  siswaList,
  bulanList,
  pembayaranList,
  setPembayaranList,
  pengeluaranList,
  pengaturan
}) => {
  // Find current student profile
  const currentSiswa = siswaList.find(s => s.id === currentUser.siswa_id || s.nis === currentUser.nis) || {
    id: currentUser.siswa_id || 1,
    nis: currentUser.nis || '1001',
    nama: currentUser.nama_lengkap,
    jenis_kelamin: 'L',
    no_hp: '',
    status: 'Aktif',
    created_at: new Date().toISOString()
  };

  // State for Payment Modal
  const [selectedBulanForPay, setSelectedBulanForPay] = useState<BulanPembayaran | null>(null);
  const [payMethod, setPayMethod] = useState<MetodePembayaran>('QRIS');
  const [refNumber, setRefNumber] = useState('');
  const [catatan, setCatatan] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const showAlert = (type: 'success' | 'danger', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Calculate student payment statistics
  const studentPayments = pembayaranList.filter(p => p.siswa_id === currentSiswa.id);
  const lunasCount = studentPayments.filter(p => p.status === 'Lunas').length;
  const pendingCount = studentPayments.filter(p => p.status_konfirmasi === 'Menunggu Konfirmasi').length;
  const totalPaid = studentPayments.reduce((sum, p) => p.status === 'Lunas' ? sum + p.nominal : sum, 0);

  const totalTargetAllBulan = bulanList.reduce((sum, b) => sum + b.nominal_target, 0);
  const tunggakanNominal = Math.max(0, totalTargetAllBulan - totalPaid);

  // Handle Image Proof Upload
  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert('danger', 'Ukuran foto bukti transfer maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Student Payment Request
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBulanForPay) return;

    // Check if payment already exists
    const existing = pembayaranList.find(p => p.siswa_id === currentSiswa.id && p.bulan_id === selectedBulanForPay.id);
    if (existing && existing.status === 'Lunas') {
      showAlert('danger', 'Anda sudah melunasi kas untuk bulan ini!');
      return;
    }

    const newPayment: PembayaranKas = {
      id: Date.now(),
      siswa_id: currentSiswa.id,
      bulan_id: selectedBulanForPay.id,
      tanggal: new Date().toISOString().split('T')[0],
      nominal: selectedBulanForPay.nominal_target,
      status: payMethod === 'Tunai' ? 'Belum Lunas' : 'Lunas', // Direct approval for demo/online, or pending if unverified
      metode_pembayaran: payMethod,
      status_konfirmasi: payMethod === 'Tunai' ? 'Menunggu Konfirmasi' : 'Disetujui',
      nomor_referensi: refNumber.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      bukti_pembayaran: proofImage || undefined,
      catatan: catatan.trim() || `Pembayaran ${payMethod} oleh Siswa (${currentSiswa.nama})`,
      created_by: currentUser.username,
      created_at: new Date().toISOString().split('T')[0]
    };

    if (existing) {
      setPembayaranList(pembayaranList.map(p => p.id === existing.id ? newPayment : p));
    } else {
      setPembayaranList([newPayment, ...pembayaranList]);
    }

    showAlert(
      'success',
      payMethod === 'Tunai'
        ? 'Permintaan pembayaran Tunai dikirim ke Bendahara! Berikan uang cash ke Bendahara untuk dikonfirmasi.'
        : `Pembayaran via ${payMethod} berhasil dicatat & disetujui! Terima kasih telah membayar uang kas.`
    );

    setSelectedBulanForPay(null);
    setRefNumber('');
    setCatatan('');
    setProofImage(null);

    const modalEl = document.getElementById('modalBayarSiswa');
    if (modalEl) {
      const bsModal = (window as any).bootstrap?.Modal?.getInstance(modalEl);
      bsModal?.hide();
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Welcome Banner */}
      <div className="card border-0 shadow-sm rounded-4 bg-primary text-white p-4 mb-4 position-relative overflow-hidden">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 z-1">
          <div>
            <div className="badge bg-white text-primary fw-bold mb-2 px-3 py-1.5 rounded-pill">
              <i className="bi bi-person-badge-fill me-1.5"></i>Portal Siswa Kas Kelas
            </div>
            <h3 className="fw-extrabold mb-1">{currentSiswa.nama}</h3>
            <p className="text-white-50 mb-0 small">
              NIS: <strong>{currentSiswa.nis}</strong> | Kelas: <strong>{pengaturan.nama_kelas}</strong> | TA: {pengaturan.tahun_ajaran}
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                const unpaid = bulanList.find(b => {
                  const pay = pembayaranList.find(p => p.siswa_id === currentSiswa.id && p.bulan_id === b.id);
                  return !pay || pay.status !== 'Lunas';
                });
                if (unpaid) {
                  setSelectedBulanForPay(unpaid);
                } else if (bulanList.length > 0) {
                  setSelectedBulanForPay(bulanList[0]);
                }
              }}
              className="btn btn-light text-primary btn-lg rounded-3 fw-bold shadow px-4 py-2.5"
              data-bs-toggle="modal"
              data-bs-target="#modalBayarSiswa"
            >
              <i className="bi bi-qr-code-scan me-2 text-danger fs-5 align-middle"></i>
              Bayar Kas Sekarang (QRIS)
            </button>
          </div>
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

      {/* Stat Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white card-stat">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Status Pembayaran</span>
              <div className="bg-success-subtle text-success p-2 rounded-3">
                <i className="bi bi-check-circle-fill fs-5"></i>
              </div>
            </div>
            <h4 className="fw-extrabold text-dark mb-0">
              {lunasCount} / {bulanList.length} <span className="fs-6 fw-normal text-muted">Bulan</span>
            </h4>
            <div className="text-muted small mt-1" style={{ fontSize: '11px' }}>
              {lunasCount === bulanList.length ? '✓ Bebas Tunggakan Kas' : 'Terdapat bulan yang belum lunas'}
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white card-stat">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Total Terbayar</span>
              <div className="bg-primary-subtle text-primary p-2 rounded-3">
                <i className="bi bi-wallet2 fs-5"></i>
              </div>
            </div>
            <h4 className="fw-extrabold text-primary mb-0">
              Rp {totalPaid.toLocaleString('id-ID')}
            </h4>
            <div className="text-muted small mt-1" style={{ fontSize: '11px' }}>
              Iuran kas terkonfirmasi
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white card-stat">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Sisa Tunggakan</span>
              <div className="bg-danger-subtle text-danger p-2 rounded-3">
                <i className="bi bi-exclamation-circle-fill fs-5"></i>
              </div>
            </div>
            <h4 className={`fw-extrabold mb-0 ${tunggakanNominal > 0 ? 'text-danger' : 'text-success'}`}>
              Rp {tunggakanNominal.toLocaleString('id-ID')}
            </h4>
            <div className="text-muted small mt-1" style={{ fontSize: '11px' }}>
              {tunggakanNominal > 0 ? 'Segera lunasi iuran kas' : '✓ Tidak ada tunggakan'}
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white card-stat">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Metode Pembayaran</span>
              <div className="bg-warning-subtle text-warning p-2 rounded-3">
                <i className="bi bi-qr-code fs-5"></i>
              </div>
            </div>
            <h6 className="fw-bold text-dark mb-0">QRIS / E-Wallet / Cash</h6>
            <div className="text-muted small mt-1" style={{ fontSize: '11px' }}>
              GoPay, DANA, OVO, ShopeePay &amp; Tunai
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: List Periode Bulan & Status Pembayaran Siswa */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-calendar-check-fill text-primary me-2"></i>
                Status Pembayaran Kas Per Bulan
              </h5>
              <span className="badge bg-light text-secondary border">Total {bulanList.length} Periode</span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
                <thead className="table-light">
                  <tr>
                    <th>No</th>
                    <th>Periode Bulan</th>
                    <th>Nominal Target</th>
                    <th>Status Kas Saya</th>
                    <th>Metode / Ref</th>
                    <th className="text-center" width="130">Aksi Pembayaran</th>
                  </tr>
                </thead>
                <tbody>
                  {bulanList.map((b, index) => {
                    const payRecord = pembayaranList.find(p => p.siswa_id === currentSiswa.id && p.bulan_id === b.id);
                    const isLunas = payRecord?.status === 'Lunas';
                    const isPending = payRecord?.status_konfirmasi === 'Menunggu Konfirmasi';

                    return (
                      <tr key={b.id}>
                        <td>{index + 1}</td>
                        <td className="fw-bold text-dark">{b.nama_bulan}</td>
                        <td className="fw-semibold text-secondary">Rp {b.nominal_target.toLocaleString('id-ID')}</td>
                        <td>
                          {isLunas ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1">
                              <i className="bi bi-check-circle-fill me-1"></i>Lunas
                            </span>
                          ) : isPending ? (
                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1">
                              <i className="bi bi-clock-history me-1"></i>Verifikasi Cash
                            </span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1">
                              <i className="bi bi-x-circle me-1"></i>Belum Bayar
                            </span>
                          )}
                        </td>
                        <td>
                          {payRecord ? (
                            <div>
                              <span className="badge bg-light text-dark border me-1">
                                {payRecord.metode_pembayaran || 'Tunai'}
                              </span>
                              <span className="text-muted small font-monospace d-block text-truncate" style={{ maxWidth: 100 }}>
                                {payRecord.nomor_referensi || payRecord.tanggal}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                        <td className="text-center">
                          {isLunas ? (
                            <span className="text-success small fw-semibold">
                              <i className="bi bi-shield-check me-1"></i>Terverifikasi
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedBulanForPay(b)}
                              className="btn btn-sm btn-primary-custom rounded-3 px-3 py-1.5 fw-semibold"
                              data-bs-toggle="modal"
                              data-bs-target="#modalBayarSiswa"
                            >
                              <i className="bi bi-qr-code me-1"></i>Bayar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {bulanList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        Belum ada periode bulan yang diatur oleh Bendahara.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* QRIS Quick Card Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <h6 className="fw-bold text-dark mb-3 px-2">
              <i className="bi bi-qr-code-scan text-danger me-2"></i>QRIS Kas Kelas
            </h6>
            <QrisDisplayCard
              pengaturan={pengaturan}
              nominal={pengaturan.nominal_kas_mingguan * 4 || 20000}
              siswaNama={currentSiswa.nama}
            />
          </div>
        </div>
      </div>

      {/* Modal Bayar Uang Kas Siswa */}
      <div className="modal fade" id="modalBayarSiswa" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-primary">
                <i className="bi bi-wallet-fill me-2"></i>
                Form Pembayaran Uang Kas Siswa
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmitPayment}>
              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Form Side */}
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Pilih Bulan Pembayaran</label>
                      <select
                        className="form-select"
                        value={selectedBulanForPay?.id || 0}
                        onChange={(e) => {
                          const found = bulanList.find(b => b.id === Number(e.target.value));
                          setSelectedBulanForPay(found || null);
                        }}
                        required
                      >
                        <option value={0}>-- Pilih Periode Bulan --</option>
                        {bulanList.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.nama_bulan} (Rp {b.nominal_target.toLocaleString('id-ID')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Metode Pembayaran</label>
                      <div className="row g-2">
                        {(['QRIS', 'E-Wallet', 'Transfer', 'Tunai'] as MetodePembayaran[]).map((m) => (
                          <div key={m} className="col-6">
                            <button
                              type="button"
                              onClick={() => setPayMethod(m)}
                              className={`btn w-100 py-2.5 rounded-3 border d-flex align-items-center justify-content-center gap-2 ${
                                payMethod === m
                                  ? 'btn-primary-custom fw-bold shadow-sm'
                                  : 'btn-light text-dark'
                              }`}
                              style={{ fontSize: '13px' }}
                            >
                              <i className={`bi bi-${
                                m === 'QRIS' ? 'qr-code' :
                                m === 'E-Wallet' ? 'phone-fill' :
                                m === 'Transfer' ? 'bank' : 'cash-stack'
                              }`}></i>
                              {m}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Nominal yang Dibayar</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light fw-bold text-muted">Rp</span>
                        <input
                          type="text"
                          className="form-control fw-bold fs-5 text-success bg-light"
                          value={(selectedBulanForPay?.nominal_target || 20000).toLocaleString('id-ID')}
                          readOnly
                        />
                      </div>
                    </div>

                    {(payMethod === 'QRIS' || payMethod === 'E-Wallet' || payMethod === 'Transfer') && (
                      <>
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-secondary">Nomor Referensi / Kode Transaksi (Opsional)</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Contoh: QRIS-992019 / TRX-88201"
                            value={refNumber}
                            onChange={(e) => setRefNumber(e.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-secondary">Upload Bukti Transfer / Screenshot (Opsional)</label>
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleProofUpload}
                          />
                          {proofImage && (
                            <div className="mt-2 text-center bg-light p-2 rounded border">
                              <img src={proofImage} alt="Bukti Transfer" style={{ maxHeight: 100, objectFit: 'contain' }} className="rounded" />
                              <span className="d-block small text-success mt-1">✓ Foto bukti siap dikirim</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {payMethod === 'Tunai' && (
                      <div className="alert alert-warning small rounded-3 mb-3">
                        <i className="bi bi-info-circle-fill me-1.5"></i>
                        Pembayaran Tunai akan dikonfirmasi oleh Bendahara setelah Anda menyerahkan uang tunai secara langsung.
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Catatan Tambahan</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Contoh: Bayar via GoPay a.n Budi"
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* QRIS Display Side */}
                  <div className="col-12 col-md-6 bg-light p-3 rounded-4 border d-flex flex-column align-items-center justify-content-center">
                    {payMethod === 'QRIS' || payMethod === 'E-Wallet' || payMethod === 'Transfer' ? (
                      <QrisDisplayCard
                        pengaturan={pengaturan}
                        nominal={selectedBulanForPay?.nominal_target || 20000}
                        bulanNama={selectedBulanForPay?.nama_bulan}
                        siswaNama={currentSiswa.nama}
                      />
                    ) : (
                      <div className="text-center py-5 px-3">
                        <i className="bi bi-cash-coin text-success fs-1 mb-2 d-block"></i>
                        <h6 className="fw-bold text-dark">Pembayaran Tunai (Cash)</h6>
                        <p className="text-muted small">
                          Silakan berikan uang tunai sebesar <strong>Rp {(selectedBulanForPay?.nominal_target || 20000).toLocaleString('id-ID')}</strong> langsung kepada Bendahara (<strong>{pengaturan.nama_bendahara}</strong>).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top-0">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button type="submit" className="btn btn-primary-custom px-4 fw-bold">
                  <i className="bi bi-check-circle-fill me-1.5"></i>
                  {payMethod === 'Tunai' ? 'Kirim Permintaan Cash' : 'Selesaikan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
