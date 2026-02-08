// VoteModal.jsx
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

function VoteModal({ school, onClose, onSuccess }) {
  const [voterName, setVoterName] = useState('');
  const [voteCount, setVoteCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_VOTES = 1000; // Batas maksimal vote

  const handleVote = async () => {
    if (!voterName.trim()) {
      alert("⚠️ Mohon masukkan nama Anda!");
      return;
    }
    
    if (voteCount < 1) {
      alert("⚠️ Jumlah vote minimal 1!");
      return;
    }

    if (voteCount > MAX_VOTES) {
      alert(`⚠️ Jumlah vote maksimal ${MAX_VOTES}!`);
      return;
    }
    
    setIsSubmitting(true);

    try {
      let { data: voter, error: voterError } = await supabase
        .from('voters')
        .select('id, total_votes')
        .eq('name', voterName.trim())
        .maybeSingle();

      let currentVoterId;

      if (voter) {
        currentVoterId = voter.id;
        await supabase
          .from('voters')
          .update({ total_votes: voter.total_votes + voteCount })
          .eq('id', voter.id);
      } else {
        const { data: newVoter, error: insError } = await supabase
          .from('voters')
          .insert([{ name: voterName.trim(), total_votes: voteCount }])
          .select()
          .single();
        
        if (insError) throw new Error("Gagal membuat data voter baru.");
        currentVoterId = newVoter.id;
      }

      const { error: logError } = await supabase
        .from('votes')
        .insert([
          { 
            voter_id: currentVoterId,
            school_id: school.id,
            vote_count: voteCount
          }
        ]);
      
      if (logError) {
        console.error("Detail Error Log:", logError);
        throw new Error("Gagal mencatat riwayat vote.");
      }

      const { error: schoolError } = await supabase.rpc('increment_vote', { 
        school_id: school.id, 
        increment_by: voteCount 
      });
      
      if (schoolError) throw new Error("Gagal memperbarui total vote sekolah.");

      alert(`✅ Sukses! ${voteCount} vote berhasil dikirim untuk ${school.name}!`);
      onSuccess();
      onClose();

    } catch (err) {
      console.error("Full Error Object:", err);
      alert("❌ " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler untuk input angka langsung - AMBIL 3 DIGIT PERTAMA SAJA
  const handleVoteCountChange = (e) => {
    const value = e.target.value;
    
    // Izinkan string kosong untuk sementara (saat user menghapus)
    if (value === '') {
      setVoteCount('');
      return;
    }
    
    // Parse ke number
    let numValue = parseInt(value);
    
    // Validasi: harus angka positif
    if (!isNaN(numValue)) {
      // Jika lebih dari 1000, ambil 3 digit pertama
      if (numValue > MAX_VOTES) {
        const strValue = numValue.toString();
        numValue = parseInt(strValue.substring(0, 3));
      }
      
      // Set minimal 1
      if (numValue < 1) {
        numValue = 1;
      }
      
      setVoteCount(numValue);
    }
  };

  // Handler untuk blur (ketika user keluar dari input)
  const handleVoteCountBlur = () => {
    // Jika kosong atau invalid, set ke 1
    if (voteCount === '' || voteCount < 1) {
      setVoteCount(1);
    }
    // Jika lebih dari max, ambil 3 digit pertama
    if (voteCount > MAX_VOTES) {
      const strValue = voteCount.toString();
      setVoteCount(parseInt(strValue.substring(0, 3)));
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-red-600 rounded-2xl w-full max-w-md shadow-2xl relative animate-slideUp">
        
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-black text-xl shadow-lg transition-all hover:scale-110 active:scale-95 border-4 border-white z-10"
        >
          ✕
        </button>

        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-t-xl p-4 border-b-4 border-red-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" 
                 style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "15px 15px"}}>
            </div>
          </div>
          <h2 className="relative text-center text-xl font-black text-white uppercase tracking-tight drop-shadow-lg flex items-center justify-center gap-2">
            <span className="text-2xl">🗳️</span>
            <span>FORM VOTING</span>
          </h2>
        </div>

        <div className="p-5">
          <div className="bg-white p-4 rounded-xl border-4 border-amber-200 mb-4 shadow-lg relative overflow-hidden group hover:border-red-300 transition-all">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md">
              TARGET
            </div>
            <div className="text-center mt-2">
              <h3 className="font-black text-lg text-red-700 uppercase mb-1 leading-tight">
                {school.name}
              </h3>
              <div className="flex items-center justify-center gap-2 text-amber-700">
                <span className="text-base">🏆</span>
                <span className="font-bold text-sm">
                  {school.total_votes || 0} Total Vote
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-red-700 font-black mb-1.5 text-xs uppercase tracking-wide flex items-center gap-2">
                <span>👤</span> Nama Anda
              </label>
              <input 
                type="text" 
                placeholder="Masukkan nama lengkap"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border-3 border-amber-300 text-amber-900 font-bold outline-none rounded-lg focus:border-red-400 focus:ring-4 focus:ring-red-200/50 transition-all shadow-md text-sm"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-red-700 font-black mb-1.5 text-xs uppercase tracking-wide flex items-center gap-2">
                <span>🎯</span> Jumlah Vote <span className="text-amber-600 text-xs normal-case">(Max: {MAX_VOTES})</span>
              </label>
              <div className="bg-gradient-to-br from-red-50 to-amber-50 p-3 rounded-xl border-3 border-red-300 shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <button 
                    onClick={() => setVoteCount(v => Math.max(1, (v || 1) - 1))} 
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xl w-11 h-11 rounded-lg shadow-lg transition-all hover:scale-110 active:scale-95 border-b-4 border-red-800 flex-shrink-0"
                  >
                    −
                  </button>
                  
                  <div className="flex-1">
                    <input
                      type="number"
                      value={voteCount}
                      onChange={handleVoteCountChange}
                      onBlur={handleVoteCountBlur}
                      min="1"
                      max={MAX_VOTES}
                      disabled={isSubmitting}
                      className="w-full text-center text-3xl font-black text-red-700 bg-transparent outline-none border-2 border-dashed border-red-300 rounded-lg py-1.5 focus:border-red-500 transition-all"
                    />
                    <div className="text-xs text-amber-700 font-bold uppercase tracking-wider text-center mt-0.5">
                      Vote
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setVoteCount(v => Math.min(MAX_VOTES, (v || 1) + 1))} 
                    disabled={isSubmitting || voteCount >= MAX_VOTES}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xl w-11 h-11 rounded-lg shadow-lg transition-all hover:scale-110 active:scale-95 border-b-4 border-green-800 flex-shrink-0"
                  >
                    +
                  </button>
                </div>

                <div className="bg-white rounded-lg p-2.5 border-2 border-amber-300 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800 font-bold text-xs">
                      Total Donasi:
                    </span>
                    <span className="text-red-700 font-black text-lg">
                      Rp {((voteCount || 0) * 1000).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {voteCount >= MAX_VOTES && (
                  <div className="mt-2 bg-orange-100 border-2 border-orange-300 rounded-lg p-1.5 text-center">
                    <p className="text-xs text-orange-700 font-bold">
                      ⚠️ Batas maksimal tercapai!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleVote}
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-3.5 rounded-xl border-b-4 border-red-900 shadow-2xl transition-all uppercase text-sm tracking-wide ${
                isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105 active:scale-95 hover:shadow-3xl'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Mengirim Vote...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">⚡</span>
                  KIRIM VOTE SEKARANG!
                  <span className="text-lg">⚡</span>
                </span>
              )}
            </button>

            <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-2.5">
              <p className="text-xs text-amber-800 font-semibold text-center leading-relaxed">
                💡 Setiap vote = <span className="text-red-600 font-black">Rp 1.000</span>. 
                Maksimal <span className="text-red-600 font-black">{MAX_VOTES} vote</span> per transaksi.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        
        /* Hide number input arrows */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}

export default VoteModal;