import React, { useState } from 'react';
import { PengaturanKelas } from '../types';

interface QrisDisplayCardProps {
  pengaturan: PengaturanKelas;
  nominal: number;
  bulanNama?: string;
  siswaNama?: string;
}

export const QrisDisplayCard: React.FC<QrisDisplayCardProps> = ({
  pengaturan,
  nominal,
  bulanNama,
  siswaNama
}) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const merchantName = pengaturan.qris_merchant_name || `KAS KELAS ${pengaturan.nama_kelas || 'XII RPL 1'}`;

  return (
    <div className="qris-card-wrapper mx-auto" style={{ maxWidth: 380 }}>
      {/* Official QRIS Card Header */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white text-dark">
        {/* QRIS Top Banner */}
        <div className="bg-danger px-4 py-2.5 d-flex align-items-center justify-content-between text-white">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-black fs-5 tracking-wider font-monospace">QRIS</span>
            <span className="badge bg-white text-danger fw-bold rounded-1 px-1.5 py-0.5" style={{ fontSize: '9px' }}>
              NATIONAL QR
            </span>
          </div>
          <span className="small text-white-50 font-monospace" style={{ fontSize: '11px' }}>GPN / ASPI</span>
        </div>

        {/* Merchant Info */}
        <div className="p-3 text-center bg-light border-bottom">
          <div className="fw-extrabold text-dark fs-6 text-uppercase tracking-wide">{merchantName}</div>
          <div className="text-muted small" style={{ fontSize: '11px' }}>
            NMID: ID102490182910 | A.N. BENDAHARA KELAS
          </div>
          {bulanNama && (
            <div className="badge bg-primary-subtle text-primary border border-primary-subtle mt-1 px-2.5 py-1">
              Kas Bulan: {bulanNama} {siswaNama ? `(${siswaNama})` : ''}
            </div>
          )}
        </div>

        {/* Dynamic QR Code Canvas Box */}
        <div className="p-4 text-center bg-white d-flex flex-column align-items-center">
          <div className="p-3 border border-2 border-danger rounded-4 bg-white shadow-sm d-inline-block position-relative">
            <svg
              width="210"
              height="210"
              viewBox="0 0 200 200"
              className="d-block mx-auto"
            >
              {/* QR Code Background */}
              <rect width="200" height="200" fill="#ffffff" />
              
              {/* Outer Position Detection Patterns */}
              {/* Top Left */}
              <rect x="10" y="10" width="50" height="50" fill="#000" rx="6" />
              <rect x="18" y="18" width="34" height="34" fill="#fff" rx="3" />
              <rect x="26" y="26" width="18" height="18" fill="#000" rx="2" />

              {/* Top Right */}
              <rect x="140" y="10" width="50" height="50" fill="#000" rx="6" />
              <rect x="148" y="18" width="34" height="34" fill="#fff" rx="3" />
              <rect x="156" y="26" width="18" height="18" fill="#000" rx="2" />

              {/* Bottom Left */}
              <rect x="10" y="140" width="50" height="50" fill="#000" rx="6" />
              <rect x="18" y="148" width="34" height="34" fill="#fff" rx="3" />
              <rect x="26" y="156" width="18" height="18" fill="#000" rx="2" />

              {/* QR Data Pattern Matrix */}
              <path
                d="M 70,10 H 130 V 20 H 70 Z
                   M 70,30 H 110 V 40 H 80 Z
                   M 120,30 H 130 V 60 H 120 Z
                   M 70,50 H 90 V 70 H 70 Z
                   M 100,50 H 110 V 80 H 100 Z
                   M 10,70 H 60 V 80 H 10 Z
                   M 140,70 H 190 V 80 H 140 Z
                   M 20,90 H 50 V 100 H 20 Z
                   M 70,90 H 130 V 110 H 70 Z
                   M 150,90 H 180 V 100 H 150 Z
                   M 10,110 H 40 V 130 H 10 Z
                   M 140,110 H 190 V 120 H 140 Z
                   M 70,120 H 100 V 130 H 70 Z
                   M 120,120 H 130 V 150 H 120 Z
                   M 70,140 H 90 V 170 H 70 Z
                   M 100,140 H 130 V 150 H 100 Z
                   M 140,140 H 160 V 180 H 140 Z
                   M 170,150 H 190 V 190 H 170 Z
                   M 70,180 H 130 V 190 H 70 Z"
                fill="#1e293b"
              />

              {/* Center Logo Badge */}
              <circle cx="100" cy="100" r="22" fill="#dc2626" />
              <circle cx="100" cy="100" r="19" fill="#ffffff" />
              <text x="100" y="104" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="900" fontFamily="sans-serif">
                KAS
              </text>
            </svg>
          </div>

          {/* Nominal Display */}
          <div className="mt-3 w-100">
            <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>NOMINAL PEMBAYARAN KAS:</div>
            <div className="d-flex align-items-center justify-content-center gap-2 mt-1">
              <span className="fs-3 fw-extrabold text-danger">
                Rp {nominal.toLocaleString('id-ID')}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(nominal.toString(), 'Nominal')}
                className="btn btn-sm btn-outline-danger py-1 px-2 rounded-2"
                title="Salin Nominal"
              >
                <i className="bi bi-copy"></i>
              </button>
            </div>
            {copiedAccount === 'Nominal' && (
              <div className="text-success small fw-semibold mt-1">✓ Nominal disalin!</div>
            )}
          </div>

          <p className="text-muted small mt-2 mb-0" style={{ fontSize: '11.5px' }}>
            <i className="bi bi-qr-code-scan me-1 text-danger"></i>
            Buka aplikasi BCA, GoPay, DANA, OVO, ShopeePay, LinkAja, atau Mobile Banking &amp; scan QRIS di atas.
          </p>
        </div>

        {/* E-Wallet Alternative Numbers */}
        <div className="p-3 bg-light border-top">
          <div className="fw-bold text-dark small mb-2 d-flex align-items-center justify-content-between">
            <span><i className="bi bi-wallet2 text-primary me-1.5"></i>Atau Transfer E-Wallet / Bank:</span>
          </div>
          <div className="d-flex flex-column gap-1.5" style={{ fontSize: '12px' }}>
            {pengaturan.gopay_number && (
              <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded border">
                <span className="fw-semibold text-primary"><i className="bi bi-app me-1"></i>GoPay / DANA:</span>
                <div className="d-flex align-items-center gap-1">
                  <span className="fw-bold text-dark">{pengaturan.gopay_number}</span>
                  <button
                    onClick={() => copyToClipboard(pengaturan.gopay_number || '', 'E-Wallet')}
                    className="btn btn-xs btn-light border p-1"
                    title="Salin Nomor"
                  >
                    <i className="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
            )}

            {pengaturan.bank_account && (
              <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded border">
                <span className="fw-semibold text-primary"><i className="bi bi-bank me-1"></i>Bank:</span>
                <div className="d-flex align-items-center gap-1">
                  <span className="fw-bold text-dark">{pengaturan.bank_account}</span>
                  <button
                    onClick={() => copyToClipboard(pengaturan.bank_account || '', 'Bank')}
                    className="btn btn-xs btn-light border p-1"
                    title="Salin Rekening"
                  >
                    <i className="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
