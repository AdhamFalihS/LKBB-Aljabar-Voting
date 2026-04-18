-- ============================================================
-- SUPABASE DATABASE SCHEMA — PASUGAMA VOTING PAYMENT SYSTEM
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ─── 1. TABEL PAYMENT TRANSACTIONS ──────────────────────────
-- Menyimpan setiap transaksi pembayaran yang dibuat
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id              TEXT UNIQUE NOT NULL,       -- ID unik dari sistem kita (PASUGAMA-xxx)
    voter_name            TEXT NOT NULL,              -- Nama voter
    school_id             INTEGER NOT NULL REFERENCES schools(id),
    vote_count            INTEGER NOT NULL CHECK (vote_count >= 1 AND vote_count <= 1000),
    gross_amount          INTEGER NOT NULL,           -- Total harga dalam rupiah
    status                TEXT NOT NULL DEFAULT 'pending' 
                          CHECK (status IN ('pending', 'settlement', 'capture', 'cancel', 'deny', 'expire', 'fraud')),
    midtrans_token        TEXT,                       -- Snap token dari Midtrans
    midtrans_notification JSONB,                      -- Raw webhook data dari Midtrans
    vote_processed        BOOLEAN DEFAULT FALSE,      -- Apakah vote sudah diproses?
    expires_at            TIMESTAMPTZ NOT NULL,       -- Waktu kadaluarsa transaksi
    paid_at               TIMESTAMPTZ,               -- Waktu pembayaran berhasil
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query performa
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_voter_name ON payment_transactions(voter_name);
CREATE INDEX idx_payment_transactions_expires_at ON payment_transactions(expires_at);

-- ─── 2. TABEL VOTES (tambahkan kolom payment_order_id) ───────
-- Jika tabel votes sudah ada, tambahkan kolom ini:
ALTER TABLE public.votes 
  ADD COLUMN IF NOT EXISTS payment_order_id TEXT REFERENCES payment_transactions(order_id);

-- ─── 3. PASTIKAN TABEL VOTERS ADA ────────────────────────────
CREATE TABLE IF NOT EXISTS public.voters (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name          TEXT UNIQUE NOT NULL,
    total_votes   INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. RPC FUNCTION: increment_vote (atomic update) ─────────
-- Mencegah race condition saat banyak vote masuk bersamaan
CREATE OR REPLACE FUNCTION increment_vote(school_id INTEGER, increment_by INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE schools
  SET total_votes = total_votes + increment_by
  WHERE id = school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 5. RPC FUNCTION: expire_old_transactions ─────────────────
-- Jalankan via Supabase cron / pg_cron untuk auto-expire
CREATE OR REPLACE FUNCTION expire_old_transactions()
RETURNS void AS $$
BEGIN
  UPDATE payment_transactions
  SET status = 'expire'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 6. ROW LEVEL SECURITY (RLS) ─────────────────────────────
-- payment_transactions: hanya backend (service_role) yang bisa akses
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Anon user TIDAK BISA akses payment_transactions langsung (harus lewat API)
-- Hanya service_role yang bisa (backend webhook & API)
CREATE POLICY "No public access to transactions"
  ON payment_transactions
  FOR ALL
  TO anon
  USING (false);

-- ─── 7. GRANTS ───────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON payment_transactions TO service_role;
GRANT ALL ON voters TO service_role;
GRANT ALL ON votes TO service_role;
GRANT ALL ON schools TO service_role;
GRANT EXECUTE ON FUNCTION increment_vote TO service_role;
GRANT EXECUTE ON FUNCTION expire_old_transactions TO service_role;

-- ─── 8. OPTIONAL: pg_cron untuk auto expire setiap 5 menit ───
-- Aktifkan pg_cron extension di Supabase Dashboard terlebih dulu
-- SELECT cron.schedule('expire-transactions', '*/5 * * * *', 'SELECT expire_old_transactions()');

-- ─── CONTOH DATA UNTUK TESTING ────────────────────────────────
-- SELECT * FROM payment_transactions ORDER BY created_at DESC;
-- SELECT * FROM votes ORDER BY created_at DESC;
