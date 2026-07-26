import React, { useState } from 'react';
import { Siswa, BulanPembayaran, PembayaranKas, PengeluaranKas, PengaturanKelas, User } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LaporanViewProps {
  siswa: Siswa[];
  bulan: BulanPembayaran[];
  pembayaran: PembayaranKas[];
  pengeluaran: PengeluaranKas[];
  pengaturan: PengaturanKelas;
  currentUser: User | null;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  siswa,
  bulan,
  pembayaran,
  pengeluaran,
  pengaturan,
  currentUser
}) => {
  const [filterBulanId, setFilterBulanId] = useState<number>(0);
  const [filterTahun, setFilterTahun] = useState<number>(new Date().getFullYear());

  // Filtered income
  const filteredIncome = pembayaran.filter(p => {
    const matchesBulan = filterBulanId === 0 || p.bulan_id === filterBulanId;
    const matchesTahun = !filterTahun || p.tanggal.startsWith(filterTahun.toString());
    return matchesBulan && matchesTahun;
  });

  // Filtered expense
  const filteredExpense = pengeluaran.filter(p => {
    const matchesTahun = !filterTahun || p.tanggal.startsWith(filterTahun.toString());
    return matchesTahun;
  });

  // Summary Totals
  const totalIncomeSum = filteredIncome.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalExpenseSum = filteredExpense.reduce((acc, curr) => acc + curr.nominal, 0);
  const saldoAkhir = totalIncomeSum - totalExpenseSum;

  const selectedBulanObj = bulan.find(b => b.id === filterBulanId);

  // Generate & Download PDF Report
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN REKAPITULASI UANG KAS KELAS', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    const kelasNama = (pengaturan?.nama_kelas || 'XII RPL 1').toUpperCase();
    const tahunAjar = pengaturan?.tahun_ajaran || '2026/2027';
    doc.text(`KELAS ${kelasNama} — T.A ${tahunAjar}`, 105, 22, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Periode Filter: ${selectedBulanObj ? selectedBulanObj.nama_bulan : 'Semua Bulan'} | Tahun ${filterTahun}`, 105, 28, { align: 'center' });
    doc.text(`Dicetak Pada: ${new Date().toLocaleDateString('id-ID')} Oleh: ${currentUser?.nama_lengkap || 'Bendahara'}`, 105, 33, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 37, 196, 37);

    // Summary Box
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Pemasukan: Rp ${totalIncomeSum.toLocaleString('id-ID')}`, 14, 45);
    doc.text(`Total Pengeluaran: Rp ${totalExpenseSum.toLocaleString('id-ID')}`, 80, 45);
    doc.text(`Saldo Akhir: Rp ${saldoAkhir.toLocaleString('id-ID')}`, 150, 45);

    // Income Table
    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105);
    doc.text('1. Rincian Pemasukan Kas', 14, 55);

    const incomeRows = filteredIncome.map((p, index) => {
      const s = siswa.find(x => x.id === p.siswa_id);
      const b = bulan.find(x => x.id === p.bulan_id);
      return [
        (index + 1).toString(),
        s?.nis || '-',
        s?.nama || 'Siswa',
        b?.nama_bulan || '-',
        p.tanggal,
        `Rp ${p.nominal.toLocaleString('id-ID')}`
      ];
    });

    autoTable(doc, {
      startY: 58,
      head: [['No', 'NIS', 'Nama Siswa', 'Bulan', 'Tanggal', 'Nominal']],
      body: incomeRows.length > 0 ? incomeRows : [['-', '-', 'Belum ada data pemasukan', '-', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105] },
      styles: { fontSize: 8 }
    });

    // Expense Table
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(11);
    doc.setTextColor(225, 29, 72);
    doc.text('2. Rincian Pengeluaran Kas', 14, finalY + 12);

    const expenseRows = filteredExpense.map((p, index) => [
      (index + 1).toString(),
      p.judul,
      p.kategori,
      p.tanggal,
      `Rp ${p.nominal.toLocaleString('id-ID')}`
    ]);

    autoTable(doc, {
      startY: finalY + 15,
      head: [['No', 'Judul Pengeluaran', 'Kategori', 'Tanggal', 'Nominal']],
      body: expenseRows.length > 0 ? expenseRows : [['-', 'Belum ada data pengeluaran', '-', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: [225, 29, 72] },
      styles: { fontSize: 8 }
    });

    // Signatures
    const sigY = (doc as any).lastAutoTable.finalY + 20;
    if (sigY < 250) {
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      doc.text('Mengetahui,', 40, sigY);
      doc.text('Wali Kelas', 40, sigY + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(pengaturan?.nama_wali_kelas || 'Dra. Endang Susilowati', 40, sigY + 25);

      doc.setFont('helvetica', 'normal');
      doc.text('Mengetahui,', 140, sigY);
      doc.text('Bendahara Kelas', 140, sigY + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(pengaturan?.nama_bendahara || 'Siti Rahma', 140, sigY + 25);
    }

    doc.save(`Laporan_Kas_${pengaturan?.nama_kelas || 'Kelas'}_${filterTahun}.pdf`);
  };

  return (
    <div className="animate-fadeIn">
      {/* Top Bar Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 no-print">
        <div>
          <h4 className="fw-bold mb-1 text-primary">
            <i className="bi bi-file-earmark-bar-graph-fill me-2"></i>Laporan Rekapitulasi Kas
          </h4>
          <p className="text-muted small mb-0">Rincian lengkap pemasukan, pengeluaran, dan saldo akhir kas kelas</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={handleExportPDF} className="btn btn-primary-custom btn-sm rounded-3 shadow-sm px-3 py-2 fw-semibold">
            <i className="bi bi-file-earmark-pdf-fill me-1.5"></i>Cetak Ke PDF
          </button>
          <button onClick={() => window.print()} className="btn btn-dark btn-sm rounded-3 px-3 py-2 fw-semibold">
            <i className="bi bi-printer-fill me-1.5"></i>Cetak Halaman (Print)
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white mb-4 no-print">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <label className="form-label small fw-semibold text-secondary">Filter Periode Bulan</label>
            <select
              className="form-select form-select-sm"
              value={filterBulanId}
              onChange={(e) => setFilterBulanId(Number(e.target.value))}
            >
              <option value={0}>-- Semua Periode Bulan --</option>
              {bulan.map((b) => (
                <option key={b.id} value={b.id}>{b.nama_bulan}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-secondary">Filter Tahun</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={filterTahun}
              onChange={(e) => setFilterTahun(Number(e.target.value))}
            />
          </div>

          <div className="col-12 col-md-3 d-flex align-items-end">
            <button
              onClick={() => { setFilterBulanId(0); setFilterTahun(new Date().getFullYear()); }}
              className="btn btn-outline-secondary btn-sm w-100"
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i>Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Print View Title Banner */}
      <div className="d-none d-print-block text-center mb-4">
        <h3 className="fw-bold mb-0 text-dark">LAPORAN REKAPITULASI UANG KAS KELAS</h3>
        <h5 className="fw-bold text-primary mb-1">KELAS {pengaturan?.nama_kelas || 'XII RPL 1'} — T.A {pengaturan?.tahun_ajaran || '2026/2027'}</h5>
        <p className="small text-muted mb-0">
          Tanggal Cetak: {new Date().toLocaleDateString('id-ID')} | Oleh: {currentUser?.nama_lengkap || 'Bendahara'}
        </p>
        <hr className="my-3" />
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-success text-white">
            <span className="small text-white-50 font-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Pemasukan</span>
            <h4 className="fw-extrabold mb-0 mt-1">Rp {totalIncomeSum.toLocaleString('id-ID')}</h4>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-danger text-white">
            <span className="small text-white-50 font-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Pengeluaran</span>
            <h4 className="fw-extrabold mb-0 mt-1">Rp {totalExpenseSum.toLocaleString('id-ID')}</h4>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-primary text-white">
            <span className="small text-white-50 font-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Saldo Akhir Kas</span>
            <h4 className="fw-extrabold mb-0 mt-1">Rp {saldoAkhir.toLocaleString('id-ID')}</h4>
          </div>
        </div>
      </div>

      {/* Rincian Pemasukan Table */}
      <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white mb-4">
        <h6 className="fw-bold text-success mb-3">
          <i className="bi bi-arrow-down-left-circle-fill me-2"></i>1. Rincian Pemasukan Kas
        </h6>
        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead className="table-light">
              <tr>
                <th width="40">No</th>
                <th>NIS</th>
                <th>Nama Siswa</th>
                <th>Periode Bulan</th>
                <th>Tanggal Bayar</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncome.map((p, index) => {
                const s = siswa.find(x => x.id === p.siswa_id);
                const b = bulan.find(x => x.id === p.bulan_id);
                return (
                  <tr key={p.id}>
                    <td>{index + 1}</td>
                    <td>{s?.nis || '-'}</td>
                    <td className="fw-bold text-dark">{s?.nama || 'Siswa'}</td>
                    <td>{b?.nama_bulan || '-'}</td>
                    <td>{p.tanggal}</td>
                    <td className="fw-bold text-success">+Rp {p.nominal.toLocaleString('id-ID')}</td>
                  </tr>
                );
              })}
              {filteredIncome.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-3">Tidak ada data pemasukan untuk filter ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rincian Pengeluaran Table */}
      <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white mb-4">
        <h6 className="fw-bold text-danger mb-3">
          <i className="bi bi-arrow-up-right-circle-fill me-2"></i>2. Rincian Pengeluaran Kas
        </h6>
        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead className="table-light">
              <tr>
                <th width="40">No</th>
                <th>Judul Pengeluaran</th>
                <th>Kategori</th>
                <th>Tanggal</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpense.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td className="fw-bold text-dark">{p.judul}</td>
                  <td>{p.kategori}</td>
                  <td>{p.tanggal}</td>
                  <td className="fw-bold text-danger">-Rp {p.nominal.toLocaleString('id-ID')}</td>
                </tr>
              ))}
              {filteredExpense.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-3">Tidak ada data pengeluaran untuk filter ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signatures for Print */}
      <div className="d-none d-print-block mt-5 pt-4">
        <div className="row text-center">
          <div className="col-6">
            <p className="mb-5">Mengetahui,<br /><strong>Wali Kelas</strong></p>
            <p className="fw-bold text-decoration-underline mb-0">{pengaturan.nama_wali_kelas || 'Dra. Endang Susilowati'}</p>
          </div>
          <div className="col-6">
            <p className="mb-5">Mengetahui,<br /><strong>Bendahara Kelas</strong></p>
            <p className="fw-bold text-decoration-underline mb-0">{pengaturan.nama_bendahara || 'Siti Rahma'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
