import React, { useState } from 'react';
import { User, UserRole, Siswa } from '../types';

interface AuthViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  siswaList?: Siswa[];
  setSiswaList?: React.Dispatch<React.SetStateAction<Siswa[]>>;
  onLoginSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  users,
  setUsers,
  siswaList = [],
  setSiswaList,
  onLoginSuccess
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [role, setRole] = useState<UserRole>('Siswa');
  const [nis, setNis] = useState('');
  const [selectedSiswaId, setSelectedSiswaId] = useState<number>(0);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick Demo Login Handler
  const handleQuickLogin = (uname: string) => {
    const found = users.find(u => u.username === uname);
    if (found) {
      onLoginSuccess(found);
    } else if (uname === 'siswa_ahmad') {
      // Fallback demo user for Ahmad Rizky
      const demoSiswa: User = {
        id: 3,
        username: 'siswa_ahmad',
        nama_lengkap: 'Ahmad Rizky Pratama',
        role: 'Siswa',
        siswa_id: 1,
        nis: '1001',
        created_at: new Date().toISOString()
      };
      onLoginSuccess(demoSiswa);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan password wajib diisi!');
      return;
    }

    const found = users.find(u => u.username === username.trim().toLowerCase());
    if (found) {
      onLoginSuccess(found);
    } else {
      setErrorMsg('Username atau password tidak cocok!');
    }
  };

  const handleSelectExistingSiswa = (sId: number) => {
    setSelectedSiswaId(sId);
    const found = siswaList.find(s => s.id === sId);
    if (found) {
      setNamaLengkap(found.nama);
      setNis(found.nis);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !namaLengkap.trim() || !password.trim()) {
      setErrorMsg('Semua kolom pendaftaran wajib diisi!');
      return;
    }

    if (users.some(u => u.username === username.trim().toLowerCase())) {
      setErrorMsg('Username sudah terdaftar! Gunakan username lain.');
      return;
    }

    let linkedSiswaId = selectedSiswaId;
    let finalNis = nis.trim();

    // If registering as Siswa and student not yet in system
    if (role === 'Siswa' && !linkedSiswaId) {
      if (!finalNis) {
        finalNis = Math.floor(1000 + Math.random() * 9000).toString();
      }

      const existingSiswa = siswaList.find(s => s.nis === finalNis || s.nama.toLowerCase() === namaLengkap.trim().toLowerCase());
      if (existingSiswa) {
        linkedSiswaId = existingSiswa.id;
        finalNis = existingSiswa.nis;
      } else {
        // Create new Siswa profile automatically
        const newSiswa: Siswa = {
          id: Date.now(),
          nis: finalNis,
          nama: namaLengkap.trim(),
          jenis_kelamin: 'L',
          no_hp: '',
          status: 'Aktif',
          created_at: new Date().toISOString().split('T')[0]
        };
        linkedSiswaId = newSiswa.id;
        if (setSiswaList) {
          setSiswaList(prev => [newSiswa, ...prev]);
        }
      }
    }

    const newUser: User = {
      id: Date.now(),
      username: username.trim().toLowerCase(),
      nama_lengkap: namaLengkap.trim(),
      role,
      siswa_id: role === 'Siswa' ? linkedSiswaId : undefined,
      nis: role === 'Siswa' ? finalNis : undefined,
      created_at: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    onLoginSuccess(newUser);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
      <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white" style={{ maxWidth: 460, width: '100%' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: 64, height: 64 }}>
            <i className="bi bi-wallet2 fs-2"></i>
          </div>
          <h4 className="fw-extrabold text-dark mb-1">Kas Kelas App</h4>
          <p className="text-muted small mb-0">Sistem Kas Kelas dengan QRIS &amp; Portal Siswa</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-danger alert-dismissible fade show rounded-3 small py-2 px-3 mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errorMsg}
            <button type="button" className="btn-close" onClick={() => setErrorMsg('')}></button>
          </div>
        )}

        {/* Quick Demo Login Presets */}
        {!isRegister && (
          <div className="bg-light p-2.5 rounded-3 border mb-4">
            <div className="fw-bold text-secondary mb-1.5" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              ⚡ DEMO LOGIN CEPAT:
            </div>
            <div className="row g-1.5">
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="btn btn-sm btn-primary-custom w-100 rounded-2 py-1.5"
                  style={{ fontSize: '11px' }}
                >
                  <i className="bi bi-shield-fill me-1"></i>Admin
                </button>
              </div>
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('bendahara')}
                  className="btn btn-sm btn-success w-100 rounded-2 py-1.5"
                  style={{ fontSize: '11px' }}
                >
                  <i className="bi bi-wallet-fill me-1"></i>Bendahara
                </button>
              </div>
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('siswa_ahmad')}
                  className="btn btn-sm btn-warning text-dark fw-bold w-100 rounded-2 py-1.5"
                  style={{ fontSize: '11px' }}
                >
                  <i className="bi bi-person-fill me-1"></i>Siswa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Login / Register */}
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Daftar Sebagai Role</label>
              <select
                className="form-select bg-light"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="Siswa">Siswa Kelas (Bayar Kas QRIS/Cash &amp; Cek Status)</option>
                <option value="Bendahara">Bendahara (Kelola &amp; Catat Kas)</option>
                <option value="Admin">Admin (Akses Penuh Pengaturan)</option>
              </select>
            </div>
          )}

          {isRegister && role === 'Siswa' && siswaList.length > 0 && (
            <div className="mb-3 p-2.5 bg-primary-subtle border border-primary-subtle rounded-3">
              <label className="form-label small fw-bold text-primary mb-1">
                Pilih Nama Siswa dari Daftar Kelas
              </label>
              <select
                className="form-select form-select-sm"
                value={selectedSiswaId}
                onChange={(e) => handleSelectExistingSiswa(Number(e.target.value))}
              >
                <option value={0}>-- Buat Siswa Baru / Nama Tidak Ada --</option>
                {siswaList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nama} (NIS: {s.nis})
                  </option>
                ))}
              </select>
            </div>
          )}

          {isRegister && (
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Nama Lengkap</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-person"></i></span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Contoh: Ahmad Rizky"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {isRegister && role === 'Siswa' && (
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">NIS (Nomor Induk Siswa)</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-card-heading"></i></span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Contoh: 1001"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-at"></i></span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Masukkan username (contoh: ahmad123)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-key"></i></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control bg-light border-start-0 border-end-0"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-group-text bg-light border-start-0 text-muted"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary-custom w-100 py-2.5 fw-semibold rounded-3 mb-3 shadow-sm">
            <i className={`bi bi-${isRegister ? 'person-plus-fill' : 'box-arrow-in-right'} me-2`}></i>
            {isRegister ? 'Daftar Akun Baru' : 'Masuk Ke Aplikasi'}
          </button>
        </form>

        <div className="text-center small text-muted">
          {isRegister ? (
            <span>
              Sudah punya akun?{' '}
              <button onClick={() => { setIsRegister(false); setErrorMsg(''); }} className="btn btn-link text-primary p-0 fw-semibold text-decoration-none">
                Login di sini
              </button>
            </span>
          ) : (
            <span>
              Belum punya akun?{' '}
              <button onClick={() => { setIsRegister(true); setErrorMsg(''); }} className="btn btn-link text-primary p-0 fw-semibold text-decoration-none">
                Daftar Akun Baru
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
