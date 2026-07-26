import React from 'react';
import { Siswa, BulanPembayaran, PembayaranKas, PengeluaranKas } from '../types';

interface DashboardViewProps {
  siswa: Siswa[];
  bulan: BulanPembayaran[];
  pembayaran: PembayaranKas[];
  pengeluaran: PengeluaranKas[];
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  siswa,
  bulan,
  pembayaran,
  pengeluaran,
  onNavigate
}) => {
  // Format currency
  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  // Format Date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${parts[2]} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
  };

  // Calculations
  const totalPemasukan = pembayaran.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalPengeluaran = pengeluaran.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalSaldo = totalPemasukan - totalPengeluaran;

  const totalSiswaAktif = siswa.filter(s => s.status === 'Aktif').length;
  
  // Paid students count
  const paidStudentIds = new Set(pembayaran.filter(p => p.status === 'Lunas').map(p => p.siswa_id));
  const jumlahSudahBayar = paidStudentIds.size;
  const jumlahBelumBayar = Math.max(0, totalSiswaAktif - jumlahSudahBayar);

  // Recent 5 income
  const recentIncome = [...pembayaran]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)
    .map(p => {
      const s = siswa.find(x => x.id === p.siswa_id);
      const b = bulan.find(x => x.id === p.bulan_id);
      return { ...p, nama_siswa: s?.nama || 'Siswa', nama_bulan: b?.nama_bulan || '-' };
    });

  // Recent 5 expenses
  const recentExpenses = [...pengeluaran]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <div className="animate-fadeIn">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1 text-dark">
            <i className="bi bi-grid-1x2-fill text-primary me-2"></i>Dashboard Uang Kas
          </h4>
          <p className="text-muted small mb-0">Ringkasan statistik saldo, pemasukan, pengeluaran, dan partisipasi siswa</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => onNavigate('pembayaran')} className="btn btn-primary-custom btn-sm rounded-3 px-3 py-2 shadow-sm fw-semibold">
            <i className="bi bi-plus-circle me-1.5"></i>Catat Kas Masuk
          </button>
          <button onClick={() => onNavigate('pengeluaran')} className="btn btn-outline-danger btn-sm rounded-3 px-3 py-2 fw-semibold">
            <i className="bi bi-dash-circle me-1.5"></i>Catat Pengeluaran
          </button>
        </div>
      </div>

      {/* 6 Statistik Cards */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Saldo */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card card-stat bg-primary text-white p-3.5">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Saldo Kas</span>
                <h3 className="fw-extrabold mb-0 mt-1">{formatRupiah(totalSaldo)}</h3>
              </div>
              <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
                <i className="bi bi-wallet2 fs-3 text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card card-stat bg-success text-white p-3.5">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Pemasukan</span>
                <h3 className="fw-extrabold mb-0 mt-1">{formatRupiah(totalPemasukan)}</h3>
              </div>
              <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
                <i className="bi bi-arrow-down-left-circle fs-3 text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card card-stat bg-danger text-white p-3.5">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Pengeluaran</span>
                <h3 className="fw-extrabold mb-0 mt-1">{formatRupiah(totalPengeluaran)}</h3>
              </div>
              <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
                <i className="bi bi-arrow-up-right-circle fs-3 text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Jumlah Siswa */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card card-stat bg-info text-white p-3.5" style={{ backgroundColor: '#0284c7' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Siswa Aktif</span>
                <h3 className="fw-extrabold mb-0 mt-1">{totalSiswaAktif} Siswa</h3>
              </div>
              <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
                <i className="bi bi-people fs-3 text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Siswa Sudah Membayar */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card card-stat text-white p-3.5" style={{ backgroundColor: '#0d9488' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Sudah Membayar</span>
                <h3 className="fw-extrabold mb-0 mt-1">{jumlahSudahBayar} Siswa</h3>
              </div>
              <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
                <i className="bi bi-check-circle fs-3 text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 6: Siswa Belum Membayar */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card card-stat bg-warning text-dark p-3.5" style={{ backgroundColor: '#f59e0b' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-dark-50 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Belum Membayar</span>
                <h3 className="fw-extrabold mb-0 mt-1">{jumlahBelumBayar} Siswa</h3>
              </div>
              <div className="bg-dark bg-opacity-10 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
                <i className="bi bi-exclamation-circle fs-3 text-dark"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Partisipasi */}
      <div className="card border-0 shadow-sm rounded-4 p-3.5 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold text-dark small"><i className="bi bi-bar-chart-fill text-primary me-2"></i>Persentase Partisipasi Siswa Membayar</span>
          <span className="fw-bold text-primary small">
            {totalSiswaAktif > 0 ? Math.round((jumlahSudahBayar / totalSiswaAktif) * 100) : 0}% ({jumlahSudahBayar} dari {totalSiswaAktif})
          </span>
        </div>
        <div className="progress rounded-pill" style={{ height: 10 }}>
          <div
            className="progress-bar bg-success progress-bar-striped progress-bar-animated"
            role="progressbar"
            style={{ width: `${totalSiswaAktif > 0 ? (jumlahSudahBayar / totalSiswaAktif) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="row g-4">
        {/* Table Transaksi Pemasukan Terbaru */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-primary mb-0">
                <i className="bi bi-arrow-down-left-circle-fill me-2"></i>Pemasukan Terakhir
              </h6>
              <button onClick={() => onNavigate('pembayaran')} className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 text-nowrap" style={{ fontSize: '12px' }}>
                Lihat Semua
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                <thead className="table-light">
                  <tr>
                    <th>Siswa</th>
                    <th>Bulan</th>
                    <th>Nominal</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIncome.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-semibold text-dark">{row.nama_siswa}</td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '11px' }}>
                          {row.nama_bulan}
                        </span>
                      </td>
                      <td className="text-success fw-bold">+{formatRupiah(row.nominal)}</td>
                      <td className="text-muted small">{formatDate(row.tanggal)}</td>
                    </tr>
                  ))}
                  {recentIncome.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">Belum ada transaksi kas masuk.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Table Transaksi Pengeluaran Terbaru */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-danger mb-0">
                <i className="bi bi-arrow-up-right-circle-fill me-2"></i>Pengeluaran Terakhir
              </h6>
              <button onClick={() => onNavigate('pengeluaran')} className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 text-nowrap" style={{ fontSize: '12px' }}>
                Lihat Semua
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                <thead className="table-light">
                  <tr>
                    <th>Judul Pengeluaran</th>
                    <th>Kategori</th>
                    <th>Nominal</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-semibold text-dark">{row.judul}</td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '11px' }}>
                          {row.kategori}
                        </span>
                      </td>
                      <td className="text-danger fw-bold">-{formatRupiah(row.nominal)}</td>
                      <td className="text-muted small">{formatDate(row.tanggal)}</td>
                    </tr>
                  ))}
                  {recentExpenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">Belum ada catatan pengeluaran.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
