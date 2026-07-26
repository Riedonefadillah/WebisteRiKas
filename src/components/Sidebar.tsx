import React from 'react';
import { User, PengaturanKelas } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  pengaturan: PengaturanKelas;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  pengaturan,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
    { id: 'siswa', label: 'Data Siswa', icon: 'bi-people-fill' },
    { id: 'bulan', label: 'Manajemen Bulan', icon: 'bi-calendar-check-fill' },
    { id: 'pembayaran', label: 'Pembayaran Kas', icon: 'bi-wallet-fill' },
    { id: 'pengeluaran', label: 'Pengeluaran Kas', icon: 'bi-receipt-cutoff' },
    { id: 'laporan', label: 'Laporan Kas', icon: 'bi-file-earmark-bar-graph-fill' },
    { id: 'pengaturan', label: 'Pengaturan', icon: 'bi-gear-fill' },
  ];

  return (
    <aside className="app-sidebar p-3 d-none d-md-flex flex-column no-print">
      {/* Brand Header */}
      <div className="d-flex align-items-center gap-3 mb-4 px-2 pt-2">
        <div className="bg-primary text-white rounded-4 p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 44, height: 44 }}>
          <i className="bi bi-wallet2 fs-4"></i>
        </div>
        <div>
          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '15px' }}>{pengaturan?.nama_kelas || 'XII RPL 1'}</h6>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '10px' }}>
            T.A {pengaturan?.tahun_ajaran || '2026/2027'}
          </span>
        </div>
      </div>

      <div className="text-uppercase text-muted px-3 mb-2" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px' }}>
        Menu Utama
      </div>

      {/* Nav Menu */}
      <nav className="nav nav-pills flex-column gap-1 mb-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-link text-start border-0 d-flex align-items-center gap-2 py-2 px-3 rounded-3 transition-all ${
                isActive
                  ? 'btn-primary-custom fw-semibold shadow-sm'
                  : 'text-secondary hover:bg-light'
              }`}
              style={{ fontSize: '14px' }}
            >
              <i className={`bi ${item.icon} fs-5 ${isActive ? 'text-white' : 'text-primary'}`}></i>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <hr className="my-3 text-secondary opacity-25" />

      {/* User Info & Logout */}
      <div className="px-1">
        <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-light border">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 36, height: 36, fontSize: '14px' }}>
            {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden" style={{ flex: 1 }}>
            <div className="fw-bold text-truncate text-dark" style={{ fontSize: '13px' }}>
              {currentUser?.nama_lengkap || 'User'}
            </div>
            <span className={`badge ${currentUser?.role === 'Admin' ? 'bg-primary' : 'bg-success'} style-badge`} style={{ fontSize: '10px' }}>
              {currentUser?.role || 'Bendahara'}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="btn btn-outline-danger btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-1 rounded-3"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
};
