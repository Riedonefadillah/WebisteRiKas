import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AuthViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onLoginSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ users, setUsers, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [role, setRole] = useState<UserRole>('Bendahara');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Preset demo login helper
  const handleQuickLogin = (uname: string) => {
    const found = users.find(u => u.username === uname);
    if (found) {
      onLoginSuccess(found);
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

    const newUser: User = {
      id: Date.now(),
      username: username.trim().toLowerCase(),
      nama_lengkap: namaLengkap.trim(),
      role,
      created_at: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    onLoginSuccess(newUser);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
      <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white" style={{ maxWidth: 440, width: '100%' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: 64, height: 64 }}>
            <i className="bi bi-wallet2 fs-2"></i>
          </div>
          <h4 className="fw-extrabold text-dark mb-1">Kas Kelas App</h4>
          <p className="text-muted small mb-0">Sistem Pengelolaan Uang Kas Kelas Modern</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-danger alert-dismissible fade show rounded-3 small py-2 px-3 mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errorMsg}
            <button type="button" className="btn-close" onClick={() => setErrorMsg('')}></button>
          </div>
        )}

        {/* Demo Preset Buttons */}
        {!isRegister && (
          <div className="bg-light p-2.5 rounded-3 border mb-4">
            <div className="fw-bold text-secondary mb-1.5" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              ⚡ DEMO LOGIN CEPAT:
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="btn btn-sm btn-primary-custom flex-grow-1 rounded-2 py-1.5"
                style={{ fontSize: '12px' }}
              >
                <i className="bi bi-shield-lock-fill me-1"></i>Login Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('bendahara')}
                className="btn btn-sm btn-success flex-grow-1 rounded-2 py-1.5"
                style={{ fontSize: '12px' }}
              >
                <i className="bi bi-wallet-fill me-1"></i>Login Bendahara
              </button>
            </div>
          </div>
        )}

        {/* Form Login / Register */}
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Nama Lengkap</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-person"></i></span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Contoh: Budi Santoso"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  required
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
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Role Hak Akses</label>
              <select
                className="form-select bg-light"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="Bendahara">Bendahara (Kelola Kas)</option>
                <option value="Admin">Admin (Full Control)</option>
              </select>
            </div>
          )}

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
