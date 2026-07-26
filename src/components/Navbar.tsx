import React from 'react';
import { User, ThemeColor, ThemeMode, PengaturanKelas } from '../types';

interface NavbarProps {
  currentUser: User | null;
  pengaturan: PengaturanKelas;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  onOpenPhpModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  pengaturan,
  themeMode,
  setThemeMode,
  themeColor,
  setThemeColor,
  onOpenPhpModal,
  activeTab,
  setActiveTab,
  onLogout
}) => {
  const themes: { id: ThemeColor; label: string; bg: string }[] = [
    { id: 'blue', label: 'Biru Ocean', bg: '#2563eb' },
    { id: 'emerald', label: 'Hijau Emerald', bg: '#059669' },
    { id: 'purple', label: 'Ungu Royal', bg: '#7c3aed' },
    { id: 'sunset', label: 'Oranye Sunset', bg: '#ea580c' },
    { id: 'crimson', label: 'Merah Crimson', bg: '#e11d48' },
  ];

  return (
    <header className="app-navbar bg-white border-bottom shadow-sm px-3 px-md-4 py-2.5 mb-4 no-print sticky-top">
      <div className="d-flex align-items-center justify-content-between">
        {/* Left Info */}
        <div className="d-flex align-items-center gap-2">
          <div className="d-md-none bg-primary text-white rounded-3 p-1.5 me-1">
            <i className="bi bi-wallet2 fs-5"></i>
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '15px' }}>
              Uang Kas {pengaturan?.nama_kelas || 'XII RPL 1'}
            </h6>
            <span className="text-muted d-none d-sm-inline" style={{ fontSize: '11px' }}>
              Sistem Pengelolaan Kas Kelas Terintegrasi
            </span>
          </div>
        </div>

        {/* Right Tools */}
        <div className="d-flex align-items-center gap-2">
          {/* PHP Code Exporter Modal Button */}
          <button
            onClick={onOpenPhpModal}
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5 rounded-3 px-2.5 py-1.5 fw-semibold"
            title="Lihat Kode PHP Native & Export SQL"
          >
            <i className="bi bi-filetype-php fs-6"></i>
            <span className="d-none d-sm-inline">Source PHP & SQL</span>
          </button>

          {/* Color Theme Selector Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-sm btn-light border dropdown-toggle d-flex align-items-center gap-1 rounded-3 px-2 py-1.5"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              title="Kustomisasi Warna Tema"
            >
              <span
                className="rounded-circle d-inline-block"
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: themes.find((t) => t.id === themeColor)?.bg || '#2563eb',
                }}
              ></span>
              <span className="d-none d-md-inline small">Tema</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 p-2" style={{ minWidth: 160 }}>
              <li className="dropdown-header small text-muted px-2 py-1">Pilih Warna Aksen:</li>
              {themes.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setThemeColor(t.id)}
                    className={`dropdown-item rounded-2 d-flex align-items-center gap-2 py-1.5 px-2 small ${
                      themeColor === t.id ? 'active fw-bold' : ''
                    }`}
                  >
                    <span className="rounded-circle d-inline-block" style={{ width: 12, height: 12, backgroundColor: t.bg }}></span>
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            className="btn btn-sm btn-light border d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 34, height: 34 }}
            title={themeMode === 'light' ? 'Aktifkan Mode Gelap' : 'Aktifkan Mode Terang'}
          >
            {themeMode === 'light' ? (
              <i className="bi bi-moon-stars-fill text-warning"></i>
            ) : (
              <i className="bi bi-sun-fill text-warning"></i>
            )}
          </button>

          {/* User Role Badge & Logout */}
          <span className={`badge ${currentUser?.role === 'Admin' ? 'bg-primary' : 'bg-success'} px-2.5 py-1.5 rounded-pill small d-none d-sm-inline`}>
            <i className="bi bi-person-badge me-1"></i>
            {currentUser?.role || 'Bendahara'}
          </span>

          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 rounded-3 px-2.5 py-1"
              title="Keluar (Logout)"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline small">Keluar</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="d-md-none d-flex overflow-x-auto gap-1 pt-2 mt-2 border-top">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
          { id: 'siswa', label: 'Siswa', icon: 'bi-people-fill' },
          { id: 'bulan', label: 'Bulan', icon: 'bi-calendar-check-fill' },
          { id: 'pembayaran', label: 'Kas Masuk', icon: 'bi-wallet-fill' },
          { id: 'pengeluaran', label: 'Pengeluaran', icon: 'bi-receipt-cutoff' },
          { id: 'laporan', label: 'Laporan', icon: 'bi-file-earmark-bar-graph-fill' },
          { id: 'pengaturan', label: 'Pengaturan', icon: 'bi-gear-fill' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveTab(m.id)}
            className={`btn btn-sm text-nowrap rounded-3 py-1 px-2.5 d-flex align-items-center gap-1 ${
              activeTab === m.id ? 'btn-primary-custom text-white' : 'btn-light border text-secondary'
            }`}
            style={{ fontSize: '12px' }}
          >
            <i className={`bi ${m.icon}`}></i>
            {m.label}
          </button>
        ))}
      </div>
    </header>
  );
};
