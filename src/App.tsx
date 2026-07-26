import React, { useState, useEffect } from 'react';
import { User, Siswa, BulanPembayaran, PembayaranKas, PengeluaranKas, PengaturanKelas, ThemeColor, ThemeMode } from './types';
import { initialUsers, initialSiswa, initialBulan, initialPembayaran, initialPengeluaran, initialPengaturan } from './data/initialData';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SiswaView } from './components/SiswaView';
import { BulanView } from './components/BulanView';
import { PembayaranView } from './components/PembayaranView';
import { PengeluaranView } from './components/PengeluaranView';
import { LaporanView } from './components/LaporanView';
import { PengaturanView } from './components/PengaturanView';
import { AuthView } from './components/AuthView';
import { PhpExporterModal } from './components/PhpExporterModal';

export default function App() {
  // Theme state
  const [themeColor, setThemeColor] = useState<ThemeColor>('blue');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('kas_current_user');
      if (saved && saved !== 'null' && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return null; // Require login/register by default
  });

  // App Data States
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('kas_users');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialUsers;
  });

  const [siswa, setSiswa] = useState<Siswa[]>(() => {
    try {
      const saved = localStorage.getItem('kas_siswa');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialSiswa;
  });

  const [bulan, setBulan] = useState<BulanPembayaran[]>(() => {
    try {
      const saved = localStorage.getItem('kas_bulan');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialBulan;
  });

  const [pembayaran, setPembayaran] = useState<PembayaranKas[]>(() => {
    try {
      const saved = localStorage.getItem('kas_pembayaran');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialPembayaran;
  });

  const [pengeluaran, setPengeluaran] = useState<PengeluaranKas[]>(() => {
    try {
      const saved = localStorage.getItem('kas_pengeluaran');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialPengeluaran;
  });

  const [pengaturan, setPengaturan] = useState<PengaturanKelas>(() => {
    try {
      const saved = localStorage.getItem('kas_pengaturan');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.nama_kelas) {
          return { ...initialPengaturan, ...parsed };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return initialPengaturan;
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal PHP Source Exporter
  const [isPhpModalOpen, setIsPhpModalOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('kas_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kas_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('kas_siswa', JSON.stringify(siswa));
  }, [siswa]);

  useEffect(() => {
    localStorage.setItem('kas_bulan', JSON.stringify(bulan));
  }, [bulan]);

  useEffect(() => {
    localStorage.setItem('kas_pembayaran', JSON.stringify(pembayaran));
  }, [pembayaran]);

  useEffect(() => {
    localStorage.setItem('kas_pengeluaran', JSON.stringify(pengeluaran));
  }, [pengeluaran]);

  useEffect(() => {
    localStorage.setItem('kas_pengaturan', JSON.stringify(pengaturan));
  }, [pengaturan]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('kas_current_user');
    setCurrentUser(null);
  };

  // Theme color mapping
  const themeHexMap: Record<ThemeColor, string> = {
    blue: '#2563eb',
    emerald: '#059669',
    purple: '#7c3aed',
    sunset: '#ea580c',
    crimson: '#e11d48'
  };

  if (!currentUser) {
    return <AuthView users={users} setUsers={setUsers} onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div className={`app-root ${themeMode === 'dark' ? 'dark-mode bg-dark text-light' : 'bg-light text-dark'}`} style={{ minHeight: '100vh' }}>
      {/* Theme Variable Style Override */}
      <style>{`
        :root {
          --bs-primary: ${themeHexMap[themeColor]};
          --bs-primary-rgb: ${themeColor === 'blue' ? '37, 99, 235' : themeColor === 'emerald' ? '5, 150, 105' : themeColor === 'purple' ? '124, 58, 237' : themeColor === 'sunset' ? '234, 88, 12' : '225, 29, 72'};
        }
        .btn-primary-custom {
          background-color: ${themeHexMap[themeColor]} !important;
          border-color: ${themeHexMap[themeColor]} !important;
          color: #ffffff !important;
        }
        .btn-primary-custom:hover {
          filter: brightness(0.9);
        }
        .text-primary {
          color: ${themeHexMap[themeColor]} !important;
        }
        .bg-primary {
          background-color: ${themeHexMap[themeColor]} !important;
        }
      `}</style>

      <div className="d-flex min-vh-100">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          pengaturan={pengaturan}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-grow-1 d-flex flex-column min-vh-100 overflow-x-hidden">
          {/* Top Navbar */}
          <Navbar
            currentUser={currentUser}
            pengaturan={pengaturan}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            themeColor={themeColor}
            setThemeColor={setThemeColor}
            onOpenPhpModal={() => setIsPhpModalOpen(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />

          {/* Body Content */}
          <main className="container-fluid px-3 px-md-4 pb-5 flex-grow-1">
            {activeTab === 'dashboard' && (
              <DashboardView
                siswa={siswa}
                bulan={bulan}
                pembayaran={pembayaran}
                pengeluaran={pengeluaran}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'siswa' && (
              <SiswaView
                siswa={siswa}
                setSiswa={setSiswa}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'bulan' && (
              <BulanView
                bulan={bulan}
                setBulan={setBulan}
                pembayaran={pembayaran}
              />
            )}

            {activeTab === 'pembayaran' && (
              <PembayaranView
                siswa={siswa}
                bulan={bulan}
                pembayaran={pembayaran}
                setPembayaran={setPembayaran}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'pengeluaran' && (
              <PengeluaranView
                pengeluaran={pengeluaran}
                setPengeluaran={setPengeluaran}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'laporan' && (
              <LaporanView
                siswa={siswa}
                bulan={bulan}
                pembayaran={pembayaran}
                pengeluaran={pengeluaran}
                pengaturan={pengaturan}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'pengaturan' && (
              <PengaturanView
                pengaturan={pengaturan}
                setPengaturan={setPengaturan}
                users={users}
                setUsers={setUsers}
                currentUser={currentUser}
              />
            )}
          </main>
        </div>
      </div>

      {/* Exporter Modal */}
      <PhpExporterModal isOpen={isPhpModalOpen} onClose={() => setIsPhpModalOpen(false)} />
    </div>
  );
}
