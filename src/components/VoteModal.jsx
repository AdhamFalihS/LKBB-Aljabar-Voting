import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

function VoteModal({ school, onClose, onSuccess }) {
  const [voterName, setVoterName] = useState('');
  const [voteCount, setVoteCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async () => {
    if (!voterName.trim()) return alert("PLEASE ENTER YOUR NAME!");
    setIsSubmitting(true);

    try {
      // --- LANGKAH 1: UPDATE/INSERT KE TABEL VOTERS DULU ---
      // Karena tabel 'votes' Anda butuh 'voter_id', kita harus cari/buat ID-nya dulu.
      let { data: voter, error: voterError } = await supabase
        .from('voters')
        .select('id, total_votes')
        .eq('name', voterName.trim())
        .maybeSingle();

      let currentVoterId;

      if (voter) {
        // Jika sudah ada, update total votes-nya
        currentVoterId = voter.id;
        await supabase
          .from('voters')
          .update({ total_votes: voter.total_votes + voteCount })
          .eq('id', voter.id);
      } else {
        // Jika belum ada, buat baru dan ambil ID-nya
        const { data: newVoter, error: insError } = await supabase
          .from('voters')
          .insert([{ name: voterName.trim(), total_votes: voteCount }])
          .select()
          .single();
        
        if (insError) throw new Error("Gagal membuat data voter baru.");
        currentVoterId = newVoter.id;
      }

      // --- LANGKAH 2: CATAT KE TABEL VOTES ---
      // Sekarang kita gunakan 'voter_id' dan 'vote_count' sesuai gambar dashboard Anda
      const { error: logError } = await supabase
        .from('votes')
        .insert([
          { 
            voter_id: currentVoterId, // Sesuaikan dengan gambar
            school_id: school.id,     // Sesuaikan dengan gambar
            vote_count: voteCount     // Sesuaikan dengan gambar (bukan 'amount')
          }
        ]);
      
      if (logError) {
        console.error("Detail Error Log:", logError);
        throw new Error("Gagal mencatat riwayat vote. Periksa apakah voter_id valid.");
      }

      // --- LANGKAH 3: UPDATE SEKOLAH (RPC) ---
      const { error: schoolError } = await supabase.rpc('increment_vote', { 
        school_id: school.id, 
        increment_by: voteCount 
      });
      
      if (schoolError) throw new Error("Gagal memperbarui total vote sekolah.");

      alert(`Sukses! Berhasil melakukan ${voteCount} vote.`);
      onSuccess();
      onClose();

    } catch (err) {
      console.error("Full Error Object:", err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#3b2a1a] border-4 border-yellow-500 rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-yellow-500 text-2xl font-bold">✕</button>
        <h2 className="text-center text-3xl font-black text-yellow-500 italic mb-6 uppercase tracking-tighter">WANTED</h2>
        
        <div className="bg-[#f7e6c4] p-4 rounded-xl border-2 border-yellow-600 mb-6 text-center text-[#3b2a1a]">
          <h3 className="font-black text-xl uppercase">{school.name}</h3>
        </div>

        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="ENTER YOUR NAME"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            className="w-full p-3 bg-[#1a110a] border-2 border-yellow-600 text-yellow-400 font-bold outline-none rounded-lg uppercase"
          />

          <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-yellow-600/30">
            <button onClick={() => setVoteCount(v => v > 1 ? v - 1 : 1)} className="text-3xl font-black text-red-500 px-4">-</button>
            <div className="text-center">
              <span className="text-4xl font-black text-yellow-400 block leading-none">{voteCount}</span>
              <span className="text-[10px] text-yellow-100/50 font-bold uppercase">Amount</span>
            </div>
            <button onClick={() => setVoteCount(v => v + 1)} className="text-3xl font-black text-green-500 px-4">+</button>
          </div>

          <p className="text-center text-yellow-100/60 font-bold">Total: Rp {(voteCount * 1000).toLocaleString()}</p>

          <button 
            onClick={handleVote}
            disabled={isSubmitting}
            className={`w-full bg-yellow-500 hover:bg-yellow-400 text-[#3b2a1a] font-black py-4 rounded-xl border-b-4 border-yellow-700 active:translate-y-1 transition-all uppercase ${isSubmitting ? 'opacity-50' : ''}`}
          >
            {isSubmitting ? "PROCESSING..." : "⚡ CAST VOTE! ⚡"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoteModal;