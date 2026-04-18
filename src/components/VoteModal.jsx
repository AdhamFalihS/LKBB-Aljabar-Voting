// VoteModal.jsx — Terintegrasi dengan Midtrans QRIS Payment
// Alur: Input → Buat Transaksi → Tampil QRIS → Polling Status → Konfirmasi Vote

import { useState, useEffect, useRef } from 'react';

function sanitizeEnvValue(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const commentIndex = value.search(/\s+#/);
  const cleanedValue = commentIndex >= 0 ? value.slice(0, commentIndex) : value;
  return cleanedValue.trim();
}

const configuredApiBaseUrl = sanitizeEnvValue(import.meta.env.VITE_API_BASE_URL);

const API_BASE_URL = import.meta.env.PROD
  ? (configuredApiBaseUrl || 'https://lkbb-aljabar-voting.vercel.app/api')
  : (configuredApiBaseUrl || '/api');

// ─── STEP ENUM ─────────────────────────────────────────────
const STEP = {
  INPUT: 'input',       // User isi nama & jumlah vote
  LOADING: 'loading',   // Sedang buat transaksi ke Midtrans
  PAYMENT: 'payment',   // Tampil QRIS, polling status
  SUCCESS: 'success',   // Pembayaran berhasil
  EXPIRED: 'expired',   // Transaksi kadaluarsa
  ERROR: 'error'        // Error umum
};

const MAX_VOTES = 1000;
const PRICE_PER_VOTE = 1000;
const POLL_INTERVAL_MS = 4000; // Polling setiap 4 detik

async function parseApiResponse(res) {
  const raw = await res.text();

  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    if (!res.ok) {
      throw new Error(raw || 'Server mengembalikan respons yang tidak valid.');
    }

    throw new Error('Server mengembalikan respons yang tidak valid.');
  }
}

function VoteModal({ school, onClose, onSuccess }) {
  const [step, setStep] = useState(STEP.INPUT);
  const [voterName, setVoterName] = useState('');
  const [voteCount, setVoteCount] = useState(1);
  const [transaction, setTransaction] = useState(null); // { order_id, snap_token, expires_at, gross_amount }
  const [snapToken, setSnapToken] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // sisa detik
  const [errorMsg, setErrorMsg] = useState('');

  const pollRef = useRef(null);
  const countdownRef = useRef(null);

  // ─── Cleanup saat unmount ─────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(pollRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  // ─── Countdown timer ──────────────────────────────────────
  useEffect(() => {
    if (!transaction?.expires_at || step !== STEP.PAYMENT) return;

    const updateCountdown = () => {
      const diff = Math.floor((new Date(transaction.expires_at) - new Date()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        setStep(STEP.EXPIRED);
        clearInterval(countdownRef.current);
        clearInterval(pollRef.current);
      } else {
        setTimeLeft(diff);
      }
    };

    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);
    return () => clearInterval(countdownRef.current);
  }, [transaction, step]);

  // ─── Polling status pembayaran ────────────────────────────
  useEffect(() => {
    if (!transaction?.order_id || step !== STEP.PAYMENT) return;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/check-payment?order_id=${transaction.order_id}`);
        const data = await parseApiResponse(res);

        if (data.status === 'settlement' && data.vote_processed) {
          clearInterval(pollRef.current);
          clearInterval(countdownRef.current);
          setStep(STEP.SUCCESS);
        } else if (['expire', 'cancel', 'deny', 'fraud'].includes(data.status)) {
          clearInterval(pollRef.current);
          clearInterval(countdownRef.current);
          setStep(data.status === 'expire' ? STEP.EXPIRED : STEP.ERROR);
          setErrorMsg(data.message || 'Transaksi gagal.');
        }
      } catch (err) {
        console.error('[polling] error:', err);
      }
    };

    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    poll(); // Langsung cek sekali
    return () => clearInterval(pollRef.current);
  }, [transaction, step]);

  // ─── Submit: Buat transaksi ke backend ───────────────────
  const handleCreateTransaction = async () => {
    if (!voterName.trim() || voterName.trim().length < 2) {
      alert('⚠️ Masukkan nama lengkap Anda (minimal 2 karakter)!');
      return;
    }
    if (voteCount < 1 || voteCount > MAX_VOTES) {
      alert(`⚠️ Jumlah vote harus antara 1 - ${MAX_VOTES}!`);
      return;
    }

    setStep(STEP.LOADING);

    try {
      const res = await fetch(`${API_BASE_URL}/create-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter_name: voterName.trim(),
          school_id: school.id,
          vote_count: voteCount
        })
      });

      const data = await parseApiResponse(res);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat transaksi');
      }

      setTransaction(data);
      setSnapToken(data.snap_token);
      setStep(STEP.PAYMENT);

    } catch (err) {
      setErrorMsg(err.message);
      setStep(STEP.ERROR);
    }
  };

  // ─── Buka Midtrans Snap popup (opsional, sebagai alternatif QRIS) ─
  const handleOpenSnap = () => {
    if (!snapToken || !window.snap) {
      alert('Midtrans Snap belum dimuat. Pastikan script Midtrans sudah di-include.');
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: () => {
        clearInterval(pollRef.current);
        clearInterval(countdownRef.current);
        setStep(STEP.SUCCESS);
      },
      onPending: () => {
        setStep(STEP.PAYMENT);
      },
      onError: (err) => {
        setErrorMsg('Pembayaran gagal: ' + JSON.stringify(err));
        setStep(STEP.ERROR);
      },
      onClose: () => {
        // User menutup popup, kembali ke payment step (polling tetap jalan)
      }
    });
  };

  // ─── Format waktu tersisa ──────────────────────────────────
  const formatTimeLeft = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleVoteCountChange = (e) => {
    const val = e.target.value;
    if (val === '') { setVoteCount(''); return; }
    let n = parseInt(val);
    if (!isNaN(n)) {
      if (n > MAX_VOTES) n = parseInt(String(n).substring(0, 3));
      if (n < 1) n = 1;
      setVoteCount(n);
    }
  };

  // ──────────────────────────────────────────────────────────
  //  RENDER
  // ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-red-600 rounded-2xl w-full max-w-md shadow-2xl relative animate-slideUp max-h-[90vh] overflow-y-auto">

        {/* Close button (hanya saat INPUT atau ERROR/EXPIRED) */}
        {[STEP.INPUT, STEP.ERROR, STEP.EXPIRED, STEP.SUCCESS].includes(step) && (
          <button
            onClick={() => {
              if (step === STEP.SUCCESS) onSuccess?.();
              onClose();
            }}
            className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-black text-xl shadow-lg transition-all hover:scale-110 border-4 border-white z-10"
          >✕</button>
        )}

        {/* ─── HEADER ─── */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-t-xl p-4 border-b-4 border-red-800">
          <h2 className="text-center text-xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
            <span className="text-2xl">🗳️</span>
            <span>
              {step === STEP.INPUT && 'FORM VOTING'}
              {step === STEP.LOADING && 'MEMPROSES...'}
              {step === STEP.PAYMENT && 'SCAN QRIS'}
              {step === STEP.SUCCESS && 'VOTE BERHASIL!'}
              {step === STEP.EXPIRED && 'WAKTU HABIS'}
              {step === STEP.ERROR && 'TERJADI ERROR'}
            </span>
          </h2>
        </div>

        <div className="p-5">

          {/* ═══════════════════════════════════════
              STEP: INPUT
          ═══════════════════════════════════════ */}
          {step === STEP.INPUT && (
            <>
              {/* School info */}
              <div className="bg-white p-4 rounded-xl border-4 border-amber-200 mb-4 shadow-lg">
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">TARGET</div>
                <div className="text-center mt-1">
                  <h3 className="font-black text-lg text-red-700 uppercase leading-tight">{school.name}</h3>
                  <p className="text-amber-700 font-bold text-sm mt-1">🏆 {school.total_votes || 0} Total Vote</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Nama voter */}
                <div>
                  <label className="block text-red-700 font-black mb-1.5 text-xs uppercase tracking-wide">👤 Nama Anda</label>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border-3 border-amber-300 text-amber-900 font-bold outline-none rounded-lg focus:border-red-400 focus:ring-4 focus:ring-red-200/50 transition-all shadow-md text-sm"
                  />
                </div>

                {/* Jumlah vote */}
                <div>
                  <label className="block text-red-700 font-black mb-1.5 text-xs uppercase tracking-wide">
                    🎯 Jumlah Vote <span className="text-amber-600 normal-case">(Max: {MAX_VOTES})</span>
                  </label>
                  <div className="bg-gradient-to-br from-red-50 to-amber-50 p-3 rounded-xl border-3 border-red-300 shadow-lg">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button
                        onClick={() => setVoteCount(v => Math.max(1, (v || 1) - 1))}
                        className="bg-red-600 hover:bg-red-700 text-white font-black text-xl w-11 h-11 rounded-lg shadow-lg transition-all hover:scale-110 active:scale-95 border-b-4 border-red-800 flex-shrink-0"
                      >−</button>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={voteCount}
                          onChange={handleVoteCountChange}
                          onBlur={() => { if (!voteCount || voteCount < 1) setVoteCount(1); }}
                          min="1" max={MAX_VOTES}
                          className="w-full text-center text-3xl font-black text-red-700 bg-transparent outline-none border-2 border-dashed border-red-300 rounded-lg py-1.5 focus:border-red-500 transition-all"
                          style={{ MozAppearance: 'textfield' }}
                        />
                        <div className="text-xs text-amber-700 font-bold uppercase tracking-wider text-center mt-0.5">Vote</div>
                      </div>
                      <button
                        onClick={() => setVoteCount(v => Math.min(MAX_VOTES, (v || 1) + 1))}
                        disabled={voteCount >= MAX_VOTES}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-xl w-11 h-11 rounded-lg shadow-lg transition-all hover:scale-110 active:scale-95 border-b-4 border-green-800 flex-shrink-0"
                      >+</button>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 border-2 border-amber-300 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-800 font-bold text-xs">Total Pembayaran:</span>
                        <span className="text-red-700 font-black text-lg">Rp {((voteCount || 0) * PRICE_PER_VOTE).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol bayar */}
                <button
                  onClick={handleCreateTransaction}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-3.5 rounded-xl border-b-4 border-red-900 shadow-2xl transition-all uppercase text-sm tracking-wide hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">💳</span>
                    BAYAR VIA QRIS
                    <span className="text-lg">💳</span>
                  </span>
                </button>

                <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-2.5">
                  <p className="text-xs text-amber-800 font-semibold text-center leading-relaxed">
                    💡 Setiap vote = <span className="text-red-600 font-black">Rp 1.000</span>.
                    Bayar via QRIS → Vote langsung masuk!
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════
              STEP: LOADING
          ═══════════════════════════════════════ */}
          {step === STEP.LOADING && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent"></div>
              <p className="text-red-700 font-bold text-base animate-pulse">Membuat transaksi...</p>
              <p className="text-amber-600 text-sm text-center">Menghubungi server pembayaran, harap tunggu...</p>
            </div>
          )}

          {/* ═══════════════════════════════════════
              STEP: PAYMENT (QRIS)
          ═══════════════════════════════════════ */}
          {step === STEP.PAYMENT && transaction && (
            <div className="space-y-4">
              {/* Info pembayaran */}
              <div className="bg-white rounded-xl border-2 border-amber-200 p-3 text-center">
                <p className="text-xs text-amber-700 font-bold uppercase mb-1">Total Pembayaran</p>
                <p className="text-3xl font-black text-red-700">
                  Rp {transaction.gross_amount?.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {transaction.vote_count} vote untuk {school.name}
                </p>
              </div>

              {/* Timer */}
              <div className={`rounded-xl p-3 text-center border-2 ${
                timeLeft < 60 ? 'bg-red-50 border-red-400' : 'bg-amber-50 border-amber-300'
              }`}>
                <p className="text-xs font-bold uppercase mb-1 text-amber-700">⏳ Waktu Tersisa</p>
                <p className={`text-4xl font-black tabular-nums ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-amber-800'}`}>
                  {formatTimeLeft(timeLeft)}
                </p>
                <p className="text-xs text-amber-600 mt-1">Scan sebelum waktu habis!</p>
              </div>

              {/* QRIS via Midtrans Snap */}
              <div className="bg-white rounded-xl border-4 border-dashed border-amber-400 p-4 text-center">
                <p className="text-sm font-black text-red-700 mb-3 uppercase">Scan QRIS untuk Membayar</p>

                {/* QRIS Placeholder — Midtrans Snap akan render QR-nya */}
                <div className="bg-gray-50 rounded-lg p-4 mb-3 flex flex-col items-center justify-center min-h-[180px] border-2 border-gray-200">
                  <div className="text-5xl mb-3">📱</div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Klik tombol di bawah untuk membuka</p>
                  <p className="text-sm font-black text-red-700">Halaman Pembayaran QRIS</p>
                  <p className="text-xs text-gray-400 mt-2">(Akan membuka popup Midtrans)</p>
                </div>

                <button
                  onClick={handleOpenSnap}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black py-3 rounded-xl border-b-4 border-blue-900 shadow-xl transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-wide"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>🔲</span>
                    BUKA HALAMAN QRIS
                  </span>
                </button>
              </div>

              {/* Polling indicator */}
              <div className="flex items-center justify-center gap-2 text-xs text-amber-600 font-bold">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Menunggu konfirmasi pembayaran...</span>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2.5">
                <p className="text-xs text-blue-800 font-semibold text-center leading-relaxed">
                  ✅ Setelah bayar, vote otomatis masuk dalam beberapa detik.
                  Jangan tutup halaman ini!
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              STEP: SUCCESS
          ═══════════════════════════════════════ */}
          {step === STEP.SUCCESS && (
            <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
              <div className="text-7xl animate-bounce">🎉</div>
              <h3 className="text-2xl font-black text-green-700 uppercase">Vote Berhasil!</h3>
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 w-full">
                <p className="text-green-800 font-bold text-sm">
                  <span className="text-2xl font-black text-green-700">{transaction?.vote_count}</span> vote berhasil dikirim untuk
                </p>
                <p className="text-green-900 font-black text-lg mt-1">{school.name}</p>
                <p className="text-green-600 text-xs mt-2">Order: {transaction?.order_id}</p>
              </div>
              <button
                onClick={() => { onSuccess?.(); onClose(); }}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-black py-3 rounded-xl border-b-4 border-green-900 shadow-xl transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-wide"
              >
                Lihat Hasil Voting 🏆
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════
              STEP: EXPIRED
          ═══════════════════════════════════════ */}
          {step === STEP.EXPIRED && (
            <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
              <div className="text-6xl">⏰</div>
              <h3 className="text-xl font-black text-red-700 uppercase">Waktu Habis!</h3>
              <p className="text-amber-700 text-sm font-semibold">
                Transaksi sudah kadaluarsa. Silakan buat transaksi baru.
              </p>
              <button
                onClick={() => { setStep(STEP.INPUT); setTransaction(null); setTimeLeft(null); }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-black py-3 rounded-xl border-b-4 border-red-900 shadow-xl transition-all hover:scale-105 active:scale-95 text-sm uppercase"
              >
                🔄 Coba Lagi
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════
              STEP: ERROR
          ═══════════════════════════════════════ */}
          {step === STEP.ERROR && (
            <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
              <div className="text-6xl">❌</div>
              <h3 className="text-xl font-black text-red-700 uppercase">Terjadi Error</h3>
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 w-full">
                <p className="text-red-700 text-sm font-semibold">{errorMsg || 'Transaksi gagal diproses.'}</p>
              </div>
              <button
                onClick={() => { setStep(STEP.INPUT); setErrorMsg(''); setTransaction(null); }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-black py-3 rounded-xl border-b-4 border-red-900 shadow-xl transition-all hover:scale-105 active:scale-95 text-sm uppercase"
              >
                🔄 Coba Lagi
              </button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}

export default VoteModal;
